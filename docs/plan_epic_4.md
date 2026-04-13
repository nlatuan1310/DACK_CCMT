# Kế hoạch chi tiết Epic 4: Jira Board, Kéo thả & Hoàn thành dự án (Ngày 3)

Đây là tài liệu phân rã công việc hỗ trợ việc đồng bộ trực tiếp với các thẻ trên Jira.
*Mục tiêu:* Hoàn thiện bảng quy trình cốt lõi Kanban Board (Kéo thả Issue) và thao tác test/báo cáo.

---

## 📋 STORY 1: Hiển thị và tương tác với Kanban Board

### `[TASK]` Render UI 4 cột trạng thái: Todo, In-progress, Test, Done
- **Hành động:** Khai báo UI cố định thẻ `<BoardColumn />` với design riêng cho tiêu đề cột, đếm số items, css nền xám Jira.

### `[TASK]` Fetch API lấy full mảng Issue từ Backend ném vào 4 cột tương ứng
- **Hành động:** 
  - Tại trang chủ `Board.jsx`, dùng hook `useEffect` chạy lệnh `GET /api/issues` ngay sau khi nạp trang.
  - Tách mảng tổng ra làm 4 mảng con tuỳ theo key `.status` và truyền dữ liệu cho 4 cột tương ứng.

### `[TASK]` Cài gói @hello-pangea/dnd và xử lý animation / API update kéo thả
- **Hành động:** 
  - Chạy cài đặt gói chuyên kéo thả: `npm install @hello-pangea/dnd`.
  - Quấn `BoardColumn` bằng `<Droppable />` và các `IssueCard` bằng `<Draggable />`.
  - Bắt handle `onDragEnd` để biết ID vừa kéo bỏ vào cột nào. Dùng lệnh PATCH API status cho item đó.

---

## 🔎 STORY 2: Tính năng lọc & Rà soát cuối (Merge code)

### `[TASK]` Xây dựng filter Lọc theo Assignee trên giao diện UI Board
- **Hành động:** Thêm thanh công cụ phía trên Board, nếu `select user` biến đổi thì React xử lý lọc data trên client để ẩn bớt thẻ không thuộc về thành viên đó.

### `[TASK]` Test chéo kết hợp merge Pull Request nhánh từ develop lên main để show giảng viên
- **Hành động:** 
  - Kiểm tra thao tác tổng thể, xác nhận nhánh code. 
  - Người nắm Git chính tạo Pull Request cuối, trigger tự động cột Jira chạy sang Done. Hoàn thành dự án xuất sắc.
