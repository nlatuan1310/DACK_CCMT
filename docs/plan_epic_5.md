# Kế hoạch chi tiết Epic 5: Phân Quyền Vai Trò (RBAC) & Xác thực Người Dùng

Đây là tài liệu phân rã công việc trong `plan_account.md` hỗ trợ việc đồng bộ trực tiếp với các thẻ trên Jira.
*Mục tiêu:* Thiết lập cơ chế đăng nhập/đăng ký, cơ chế bảo mật xác thực (JWT), và phân quyền Role-Based Access Control (RBAC) ở cấp độ Dự án (ADMIN và USER) từ Backend xuống Frontend.

---

## 📋 STORY 1: Thiết lập CSDL và Xác thực Cơ bản (Auth Foundation)

### `[TASK]` Cập nhật Schema Database (Prisma)
- **Hành động:** 
  - Bổ sung trường `password String` vào model `User` trong `backend/prisma/schema.prisma`.
  - Bổ sung `enum ProjectRole { ADMIN, USER }`.
  - Tạo bảng trung gian `ProjectMember` quản lý quan hệ n-n giữa User và Project với thuộc tính `role ProjectRole @default(USER)` và khóa chính là `@@id([projectId, userId])`.
  - Chạy lệnh `npx prisma db push` hoặc `npx prisma migrate dev` để cập nhật CSDL.

### `[TASK]` Cài đặt thư viện bảo mật và thiết lập Auth Middleware
- **Hành động:** 
  - Cài đặt các gói hỗ trợ: `npm install bcryptjs jsonwebtoken`.
  - Tạo file `backend/src/middlewares/authMiddleware.js` và viết hàm `verifyToken` để đọc và giải mã JWT token từ headers (`Authorization: Bearer <token>`) của request.

### `[TASK]` Xây dựng API Đăng ký & Đăng nhập (Auth Controller)
- **Hành động:** 
  - Tạo file `backend/src/controllers/authController.js` và cấu hình router tương ứng.
  - Khai báo API Đăng ký (`POST /api/auth/register`): Băm chuỗi mật khẩu bằng `bcryptjs` và lưu thông tin User mới vào DB.
  - Khai báo API Đăng nhập (`POST /api/auth/login`): Kiểm tra hash mật khẩu và trả về 1 chuỗi JWT token nếu hợp lệ.
  - Khai báo API Thông tin cá nhân (`GET /api/auth/me`): Trả về thông tin user dựa vào token đẩy lên.

---

## 🔒 STORY 2: Phân quyền cấp độ dự án (Backend API RBAC)

### `[TASK]` Tạo Middleware kiểm tra quyền dự án (Project Role checking)
- **Hành động:** 
  - Trong `authMiddleware.js`, viết thêm hàm `requireProjectRole(allowedRoles)`.
  - Logic hàm: Dùng `req.user.id` (lấy từ verifyToken) truy vấn bảng `ProjectMember` để xem vai trò đang đảm nhận trong `req.params.projectId` (hoặc `req.body.projectId`) có thỏa mãn mảng thư mục không. Nếu sai quyền, ném HTTP 403 Forbidden.

### `[TASK]` Xây dựng API Quản lý Thành viên dự án
- **Hành động:** 
  - Tạo file `backend/src/controllers/projectMemberController.js` và map vào logic route.
  - Khai báo API Xem thành viên (`GET /api/projects/:projectId/members`): Lấy list member kèm quyền (Mở cho cả USER và ADMIN).
  - Khai báo API Mời thành viên bằng mail (`POST /api/projects/:projectId/members`): Add user qua Email vào dự án (Chỉ mở cho ADMIN).
  - Khai báo API Thay đổi Role (`PATCH /api/projects/:projectId/members/:userId/role`): Thăng hoặc hạ quyền (Chỉ mở cho ADMIN).

### `[TASK]` Tự động hóa gán quyền & Ràng buộc API Issue
- **Hành động:** 
  - Cập nhật API `POST /api/projects`: Chỉnh sửa logic DB để ngay khi save dự án thành công, tự động khởi tạo dòng `ProjectMember` gán user tạo proj làm `ADMIN`.
  - Chèn middleware cho API `POST /api/issues`: Khóa luồng tạo Issue, chỉ `ADMIN` được tạo.
  - Chèn bảo mật cho API `PATCH /api/issues/:id/status`: Đảm bảo dù là `USER` có tham gia dự án cũng sửa được (chức năng kéo thả làm việc).

---

## 🎨 STORY 3: Giao diện Auth Flow và Core Context (Frontend)

### `[TASK]` Thiết lập AuthContext Global & cấu hình Axios
- **Hành động:** 
  - Khởi tạo thư mục và file `frontend/src/context/AuthContext.jsx` để lưu và cung cấp object `{ user, token }` toàn project. Xây dựng logic đọc xuất ngược từ `localStorage` khi refresh f5 trình duyệt.
  - Sửa đổi `frontend/src/services/apiClient.js` dùng các [axios interceptors] tự động lấy token bọc lại dưới dạng Header Bearer để truyền xuống Backend tại bất kỳ function call nào.

### `[TASK]` Xây dựng UI Component Đăng nhập & Đăng ký
- **Hành động:** 
  - Viết giao diện chuẩn cho màn hình `frontend/src/pages/Login.jsx` và `frontend/src/pages/Register.jsx`.
  - Đấu nối event submit các form đến endpoint axios sinh ra từ Auth Controller. Trả token về localStorage sau khi Login thành công và điều hướng mạnh vào Dashboard.

### `[TASK]` Bảo vệ mạch định tuyến (Protected Routes System)
- **Hành động:** 
  - Cập nhật router setup ở `frontend/src/App.jsx`. Tách bạch Public Routes (không cần token vào vẫn xem được) và Protected Routes (gặp lỗi hoặc thiếu là push sang `/login`).

---

## 🎭 STORY 4: Hoàn thiện tính năng Căn chỉnh UI theo Quyền (Role-based UI)

### `[TASK]` Triển khai màn hình Quản lý thành viên (Settings)
- **Hành động:** 
  - Tạo giao diện `frontend/src/pages/Settings.jsx`.
  - Chia làm 2 phần tĩnh: 1 dropdown select chọn context Dự án, và phần UI còn lại lấy danh sách thành viên API hiển thị bảng Member của dự án đó.

### `[TASK]` Xử lý logic Ẩn/Hiện Chức năng UI dựa vào biến myRole
- **Hành động:** 
  - Ở màn hình `Settings`: Logic tìm kiếm `myRole` trong mảng thành viên. Nếu là `USER`, sử dụng Conditional Rendering (`isUser === "USER"`) để vô hiệu hóa Input invite Email và ẩn hoặc làm xám (disable) thao tác đổi chức danh đối với member khác trong select dropdown.
  - Ở màn hình Kanban `Board`: Thêm hook/api check chức danh. Nếu là `USER`, ẩn hoàn toàn nút chức năng `[+ Tạo Issue Mới]`. Thẻ Issue chỉ có thể kéo thả chuyển cột thôi.
