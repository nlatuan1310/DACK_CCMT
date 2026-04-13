# Kế hoạch chi tiết Epic 3: UI Layout & Quản lý Issue - Frontend (Ngày 2 - Chiều)

Đây là tài liệu phân rã công việc hỗ trợ việc đồng bộ trực tiếp với các thẻ trên Jira.
*Mục tiêu:* Xây dựng cấu trúc HTML/CSS tĩnh và tương tác Form trên giao diện client.

---

## 🖼️ STORY 1: Thiết kế khung Layout

### `[TASK]` Thiết kế Sidebar Navigation và Header Dashboard giống Jira
- Khởi tạo cấu trúc các file trong `/frontend/src/components`.
- **Hành động:**
  - Code `Sidebar.jsx`: Chứa NavLinks. Thiết kế Layout Flex cột cố định (w-64) bên trái.
  - Code `Header.jsx`: Chứa Navbar (breadcrumbs, project name, và User Avatar icon).

---

## 📝 STORY 2: Tính năng tạo và Gửi biểu mẫu Issue

### `[TASK]` Dựng Modal Form Tạo Issue (Epic/Story/Task)
- **Hành động:**
  - Dựng Component `CreateIssueModal.jsx` với bộ design pop-up lơ lửng màn hình.
  - Tổ chức 4 nhóm Input: Tên Issue, Trạng thái (Combo Box), Category (Epic/Story/Task), Người thực hiện (Assignee Dropdown).

### `[TASK]` Thêm Fetch/Axios để Call API POST đẩy data xuống DB thành công
- **Hành động:**
  - Cài npm package `axios` (hoặc xài `fetch` mặc định).
  - Kết nối sự kiện Submbit Form trỏ thẳng đến `POST /api/issues` bên backend (chạy cổng 5000). Hiển thị Toast Message sau khi lưu vào database.
