# Kế hoạch chi tiết Epic 2: Hệ thống Backend APIs (Ngày 2)

Đây là tài liệu phân rã công việc hỗ trợ việc đồng bộ trực tiếp với các thẻ trên Jira.
*Mục tiêu:* Xây dựng API Server và các tương tác Database CRUD để Frontend gọi. 

---

## 🔌 STORY 1: Viết Backend Core APIs

### `[TASK]` Viết API Create Issue, Update Trạng thái (status)
- Mở rộng thư mục `/backend/src/routes` và `/backend/src/controllers`.
- **Hành động:** 
  - Phương thức `POST /api/issues`: Tạo mới Issue từ body, gọi `prisma.issue.create`.
  - Phương thức `PATCH /api/issues/:id/status`: Nhận ID issue, gọi `prisma.issue.update` để lấy dữ liệu thay đổi Trạng thái sang cột mới lúc kéo thả.

### `[TASK]` Viết API Get List Issue và Users, Fix Bug CORS gộp server
- **Hành động:**
  - Phương thức `GET /api/issues`: Fetch toàn bộ dữ liệu bảng Issue, có kèm lệnh `include` lấy thông tin User (Assignee).
  - Phương thức `GET /api/users`: Trả về danh sách User phục vụ ô dropdown Filter & Assign.
  - *Fix CORS:* Mở quyền cho domain của nhóm frontend (`localhost:5173`) trong phần cài đặt middleware Express bằng `cors()`.
