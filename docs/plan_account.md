# Kế hoạch Triển khai: Phân Quyền Vai Trò Dự Án & Xác thực Người Dùng

Dựa trên yêu cầu mới nhất, chúng ta không chỉ áp dụng Đăng nhập/Đăng ký mà còn triển khai cơ chế **RBAC (Role-Based Access Control) ở cấp độ Dự án**. Quản lý chặt chẽ hành động của người dùng dựa trên vai trò `ADMIN` và `USER`.

## Rule Phân Quyền Yêu Cầu

1. **Người tạo dự án ban đầu:** Sẽ mặc định nắm quyền `ADMIN`.
2. **Vai trò ADMIN:**
   - Quyền tuyệt đối trong dự án: Có quyền nạp thành viên mới thông qua Email.
   - Được phân quyền (Set quyền) thăng cấp hoặc hạ cấp cho thành viên khác (USER <-> ADMIN).
   - Được Thêm/Sửa/Xóa (Ví dụ: Tạo mới Issue, xóa Issue, sửa tên Project).
3. **Vai trò USER (Người thực thi):**
   - Không thấy/không có quyền mời người mới vào dự án.
   - Ước tính "Chỉ Xem & Thực hiện": Không thể bấm nút tạo Issue mới. Chỉ được phép kéo thả thay đổi trạng thái thẻ Kanban (Thực hiện công việc) và thay đổi Assignee.

---

## Các thay đổi dự kiến (Proposed Changes)

### 1. Tầng Cơ Sở Dữ Liệu (Prisma)

#### [MODIFY] `backend/prisma/schema.prisma`
- Sửa model `User`: Bổ sung `password String`.
- Bổ sung Enum: `enum ProjectRole { ADMIN USER }`
- Tạo model `ProjectMember`:
  - `projectId`, `userId`
  - `role ProjectRole @default(USER)`
  - `@@id([projectId, userId])` liên kết M:N rõ ràng.

---

### 2. Tầng Backend API (Xác thực & Router)

#### [MODIFY] `backend/package.json`
- Cài đặt `bcryptjs`, `jsonwebtoken`.

#### [NEW] `backend/src/middlewares/authMiddleware.js`
- `verifyToken`: Kiểm tra JWT Token xem ai đang đăng nhập.
- `requireProjectRole(allowedRoles)`: Một Middleware cực kỳ quan trọng kiểm tra bảng `ProjectMember`. Nếu `req.user` không phải `ADMIN` của `req.params.projectId`, lập tức văng lỗi HTTP 403 Forbidden.

#### [NEW] `backend/src/controllers/authController.js`
- Đăng ký, Đăng nhập và lấy thông tin user hiện tại (`/api/auth/me`).

#### [NEW] `backend/src/controllers/projectMemberController.js` & `backend/src/routes/projectRoutes.js`
Tất cả các route liên quan đến thêm/sửa/xóa thành viên đều bị khóa bởi Role `ADMIN`:
- `POST /api/projects/:projectId/members`: Mời email vào dự án (Mặc định là USER).
- `PATCH /api/projects/:projectId/members/:userId/role`: Thăng cấp / Hạ cấp quyền của 1 thành viên.
- `GET /api/projects/:projectId/members`: Cho phép cả ADMIN và USER xem danh sách.
- **Tự động hóa:** Khi gọi `POST /api/projects`, người gửi request tự động được gán làm `ProjectMember` với Role `ADMIN`.

#### [MODIFY] `backend/src/controllers/issueController.js`
Kiểm tra chéo trên API Issue:
- Route `POST /api/issues` (Tạo Issue mới): Khóa bằng requireProjectRole(`ADMIN`).
- Route `PATCH /api/issues/:id/status` (Thực hiện kéo thả, chuyển trạng thái vòng đời): Mở cho cả `USER` lẫn `ADMIN`.

---

### 3. Tầng Frontend (Giao diện & Logic State)

Tầng Frontend nay cần nhận diện để ẩn/hiện nút nhấn tùy theo Role của người dùng trong mạch dự án đó.

#### [NEW] `frontend/src/context/AuthContext.jsx`
- State toàn cục chứa thông tin `{ user, token }`. Lưu `token` vào `localStorage`. Các Component Login / Register sẽ đẩy dữ liệu vào đây.

#### [NEW] `frontend/src/pages/Login.jsx` & `frontend/src/pages/Register.jsx`
- Hai màn hình nhập tài khoản chuẩn auth flow chặn trước hệ thống dashboard.

#### [MODIFY] `frontend/src/App.jsx`
- Tách mạch Router: Mạch không bảo vệ (`/login`) và Mạch nội bộ (`/board`) được bọc bảo vệ.

#### [MODIFY] `frontend/src/services/apiClient.js`
- Chèn JWT Token Bearer vào toàn bộ request tiếp theo hướng Backend.

#### [NEW] `frontend/src/pages/Settings.jsx` (Giao diện Quản lý Thành Viên)
- Giao diện có 2 ô: Gọi `GET /api/projects` để chọn dự án. 
- Ngay khi chọn Dự án, hệ thống trả về ds Member và quyền hiện tại (`myRole`).
- **Conditional Rendering UI:** Nếu `myRole === "USER"`, ô nhập Email mời người và tính năng đổi quyền bằng Dropdown (`Manager / Member`) sẽ bị Ẩn / Disabled đi.

#### [MODIFY] `frontend/src/pages/Board.jsx`
- **Conditional Rendering UI:** Nếu `myRole === "USER"`, ẩn nút `[Tạo Issue mới]`. Các thành viên thường chỉ có thể tập trung vào kéo thả và xem thông tin.

---

## Ưu điểm của cấu trúc này

1. **An toàn bảo mật kép:** Không chỉ ẩn nút trên hình (Client-side) mà còn chặn đứng các tool tấn công gọi thẳng API ở Backend (Server-side middleware checking).
2. **Đáp ứng chấm điểm A+ OOP/Software Architecture:** Logic Phân quyền ngang (Horizontal Access Control) ở cấp độ resource thể hiện tư duy thiết kế hệ thống chuyên môn rất cao ở kỳ bảo vệ đồ án.
