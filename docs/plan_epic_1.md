# Epic 1: Infrastructure & Project Setup

Epic này nhằm mục đích thiết lập nền tảng cho dự án, bao gồm cấu hình repository, kiến trúc thư mục, môi trường phát triển (frontend & backend) và database schema. Các bước dưới đây được phân chia rõ ràng theo từng Story và Task trên Jira để bạn tiện đánh mã trong Git commit.

## Chú ý & Cần phản hồi (User Review Required)
> [!IMPORTANT]
> - Cần đảm bảo bạn đã cấp quyền để script thiết lập Jira Automation (nếu có, hoặc setup bằng tay trên giao diện Jira theo hướng dẫn trong plan.md).
> - Bạn đã có sẵn thông tin kết nối PostgreSQL (Connection String) chưa? Prisma sẽ cần chèn biến môi trường `DATABASE_URL` vào file `.env`.
> - Việc đẩy lên Git sẽ yêu cầu xác thực tại local của bạn, hãy đảm bảo bạn đã login Git/GitHub.

---

## 🏗️ STORY 1: Cài đặt Git repo và Source Code

### `[TASK]` Setup Git repo, cấu hình nhánh main và develop
*Hành động sửa đổi:* Khởi tạo cấu trúc dự án và repo gốc.
- Tự động tạo thư mục rỗng và init git.
#### [NEW] `/.gitignore`
Template bỏ qua `node_modules`, `.env`, và thư mục không cần thiết.
#### [NEW] `README.md`
Tạo file README mô tả sơ lược cách chạy dự án.

### `[TASK]` Dựng Rule Automation Jira nhảy cột tự động
*Hành động sửa đổi:* Nhiệm vụ này chủ yếu là cấu hình bằng tay trên hệ thống Jira để lắng nghe webhook từ GitHub. Bạn (Người A) tự thực hiện theo hướng dẫn trên `plan.md`.

### `[TASK]` Khởi tạo khung Frontend Vite React + Tailwind đẩy lên Git
*Hành động sửa đổi:* Dựng project phía client dành cho Thành viên B & C.
#### [NEW] `/frontend/package.json`
Chạy `npx create-vite@latest frontend --template react` để tạo dự án React thuần.
#### [NEW] `/frontend/tailwind.config.js` & `postcss.config.js`
Cấu hình chuẩn TailwindCSS sau khi chạy lệnh cài đặt (`npx tailwindcss init -p`).
#### [MODIFY] `/frontend/src/index.css`
Nhúng các directives cơ bản của Tailwind vào dòng đầu tiên: `@tailwind base; @tailwind components; @tailwind utilities;`

### `[TASK]` Khởi tạo khung Backend Node.js Express
*Hành động sửa đổi:* Dựng server backend cơ bản.
#### [NEW] `/backend/package.json`
Khởi tạo từ `npm init -y`, cài các gói phụ thuộc `express`, `cors`, `dotenv`.
#### [NEW] `/backend/src/server.js`
Lên khung server gọi `app.listen()` với các middleware cấu hình sẵn `cors()` và `express.json()`.

---

## 🗄️ STORY 2: Thiết kế Cơ sở dữ liệu

### `[TASK]` Lên sơ đồ bảng Prisma (User, Project, Issue). Deploy Database PostgreSQL
*Hành động sửa đổi:* Mô hình hoá database và thiết lập Prisma ORM.
#### [NEW] `/backend/prisma/schema.prisma`
Khởi tạo Prisma schema và khai báo các Models:
- **User**: Id, Khóa chính, Tên...
- **Project**: Id, Tên mô tả dự án.
- **Issue**: Liên kết (relation) với Project và User (Assignee), trạng thái (Todo, In-progress, Test, Done), loại (Epic, Story, Task).
#### [NEW] `/backend/.env`
Mẫu file biến môi trường để cấp key `DATABASE_URL` kết nối với PostgreSQL.

---

## Các câu hỏi mở (Open Questions)

> [!WARNING]
> - Đối với cơ sở dữ liệu, bạn muốn dựng cấu hình kết nối local (như `postgresql://postgres:password@localhost:5432/jiraclone`) hay bạn đã có sẵn link từ dịch vụ Cloud (Neon/Aiven/Supabase)?
> - Ở bước thao tác git `develop` và `main`, bạn muốn tôi tự động thiết lập nhánh sau khi gen code xong luôn không?

## Kế hoạch kiểm tra (Verification Plan)

### Automated Tests/Script Checks
- Lệnh `npm run dev` ở frontend chạy thành công trang React.
- Lệnh `node src/server.js` (hoặc nodemon) ở backend in ra console đang chạy port `5000`.
- Chạy thử `npx prisma format` và validation để xem schema.prisma đã chuẩn SQL chưa.

### Manual Verification
- Kiểm tra các commit Git có các tiền tố là mã task Jira (VD: `git commit -m "PROJ-1: Khởi tạo frontend Vite"`).
- Kiểm tra Rule Automation trên Jira xem kéo PR sang nhánh thử nghiệm tự động thay đổi cột hay chưa.
