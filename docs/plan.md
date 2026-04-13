# Kế hoạch Jira, Backend & Quy trình Git (Sprint 3 Ngày) + Tự động hóa Jira (Automation)

Tiến trình dự án gói gọn trong 3 ngày với hệ thống cấu trúc Jira phân cấp tiêu chuẩn: **Epic -> Story -> Task**.

## 1. Hướng dẫn Setup Jira Automation Rules (CỰC KỲ QUAN TRỌNG)

Để ghi điểm tuyệt đối, bạn (Người A) hãy vào **Jira > Project Settings > Automation > Create Rule** và thiết lập 2 luật sau:

**Quy tắc 1: Tự nhảy sang cột `Test` khi tạo Pull Request (PR)**
- **Trigger:** Chọn `Pull request created` (Áp dụng khi tạo PR từ nhanh `feature/xxx` vào nhánh `develop`).
- **Condition:** `If Issue matches JQL` -> Nhập JQL: `status != Done`.
- **Action:** Chọn `Transition issue` -> `To:` **`Test`**.

**Quy tắc 2: Tự nhảy sang cột `Done` khi PR đã Merge**
- **Trigger:** Chọn `Pull request merged` (Khi Người A bấm nút Merge PR đó vào nhánh `main` hoặc `develop`).
- **Action:** Chọn `Transition issue` -> `To:` **`Done`**.

> [!TIP]
> Tên nhánh Git báo cáo bắt buộc phải chứa Mã Jira. VD nhánh: `feature/PROJ-5-add-test-column`. Jira sẽ báo tự động sang cột.

---

## 2. Tech Stack (Công nghệ sử dụng)

- **Frontend:** React, Vite, Tailwind CSS. (Thành viên B và C).
- **Backend:** Node.js (Express.js). (Thành viên A).
- **Database:** **PostgreSQL** kết hợp với **Prisma ORM**. (Thành viên A).

---

## 3. Kế hoạch Nội dung trên Jira (Timeline 3 Ngày - Giao việc cụ thể)

Trên Jira, cấu trúc lồng nhau (Sub-task) sẽ được khôi phục. Ở mỗi tính năng lớn (Epic), bạn tạo ra các tính năng người dùng (Story), trong mỗi Story bạn đính kèm các Sub-task chuyên biệt để từng file để lập trình.

### EPIC 1: Infrastructure & Project Setup (Ngày 1)
> **Mục tiêu:** Xây dựng môi trường git, base code và phần khung database.
- **[STORY] Cài đặt Git repo và Source Code:**
  - `[TASK]` Setup Git repo, cấu hình nhánh `main` và `develop`. (Assignee: A)
  - `[TASK]` Dựng Rule Automation Jira nhảy cột tự động. (Assignee: A)
  - `[TASK]` Khởi tạo khung Frontend Vite React + Tailwind đẩy lên Git. (Assignee: A)
  - `[TASK]` Khởi tạo khung Backend Node.js Express. (Assignee: A)
- **[STORY] Thiết kế Cơ sở dữ liệu:**
  - `[TASK]` Lên sơ đồ bảng Prisma (User, Project, Issue). Deploy Database PostgreSQL. (Assignee: A)

### EPIC 2: Hệ thống Backend APIs (Ngày 2 - Buổi Sáng)
> **Mục tiêu:** Xây API và DB CRUD kịp thời cho B và C gọi.
- **[STORY] Viết Backend Core APIs:**
  - `[TASK]` Viết API Create Issue, Update Trạng thái (status). (Assignee: A)
  - `[TASK]` Viết API Get List Issue và Users, Fix Bug CORS gộp server. (Assignee: A)

### EPIC 3: UI Layout & Quản lý Issue - Frontend (Ngày 2 - Buổi Chiều)
> **Mục tiêu:** Xây dựng giao diện UI tĩnh phục vụ luồng tạo / sửa việc.
- **[STORY] Thiết kế khung Layout:**
  - `[TASK]` Thiết kế Sidebar Navigation và Header Dashboard giống Jira. (Assignee: B)
- **[STORY] Tính năng tạo và Gửi biểu mẫu Issue:**
  - `[TASK]` Dựng Modal Form Tạo Issue (Epic/Story/Task). (Assignee: C)
  - `[TASK]` Thêm Fetch/Axios để Call API POST đẩy data xuống DB thành công. (Assignee: C)

### EPIC 4: Jira Board, Kéo thả & Hoàn thành dự án (Ngày 3)
> **Mục tiêu:** Hoàn thiện bảng Kanban, filter và nộp báo cáo đồ án.
- **[STORY] Hiển thị và tương tác với Kanban Board:**
  - `[TASK]` Render UI 4 cột trạng thái: Todo, In-progress, Test, Done. (Assignee: C)
  - `[TASK]` Fetch API lấy full mảng Issue từ Backend ném vào 4 cột tương ứng. (Assignee: B)
  - `[TASK]` Cài gói `@hello-pangea/dnd` và xử lý animation / API update kéo thả. (Assignee: B & C)
- **[STORY] Tính năng lọc & Rà soát cuối (Merge code):**
  - `[TASK]` Xây dựng filter Lọc theo Assignee trên giao diện UI Board. (Assignee: C)
  - `[TASK]` Test chéo kết hợp merge Pull Request nhánh từ develop lên main để show cho Giảng viên. (Assignee: All)
