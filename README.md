<div align="center">
  <h1>🚀 Task Management System (Backend API & Web)</h1>
  <p><i>Hệ thống quản lý dự án và công việc toàn diện, bảo mật và hiệu quả</i></p>

  <br />

  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="ExpressJS" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</div>

---

## 📖 Giới thiệu dự án

**Manger Task Project** là một ứng dụng web và API hoàn chỉnh dành cho việc quản lý công việc và dự án theo nhóm. Hệ thống cung cấp các giải pháp từ quản lý người dùng, phân quyền vai trò (Roles), cho đến theo dõi tiến độ dự án thông qua Milestones và lịch sử thay đổi công việc.

Dự án được xây dựng với cấu trúc mã nguồn rõ ràng, tích hợp các công nghệ bảo mật hiện đại như mã hóa mật khẩu và xác thực bằng chữ ký số RSA.

---

## ✨ Các tính năng cốt lõi

### 🔐 1. Xác thực & Bảo mật (Auth & Security)
- **Xác thực JWT:** Sử dụng cặp khóa **Private/Public Key (RSA)** để ký và xác thực mã Token, đảm bảo an toàn tuyệt đối.
- **Bảo mật mật khẩu:** Mã hóa mật khẩu người dùng bằng thư viện `bcrypt` trước khi lưu trữ vào cơ sở dữ liệu.

### 🛠️ 2. Quản lý công việc & Dự án
- **Dự án (Projects):** Tạo và quản lý các dự án lớn, chia nhỏ theo các cột mốc (Milestones).
- **Công việc (Tasks):** Phân công công việc, thiết lập mức độ ưu tiên, trạng thái và danh mục (Categories).
- **Lịch sử (Task Histories):** Tự động ghi lại mọi thay đổi trong quá trình thực hiện công việc.

### 💬 3. Tương tác & Cộng tác
- **Hệ thống Chat:** Tích hợp tính năng trò chuyện trực tuyến giữa các thành viên trong nhóm.
- **Bình luận & Đính kèm:** Người dùng có thể bình luận và tải lên các tệp tin đính kèm cho từng công việc cụ thể.
- **Thông báo:** Hệ thống gửi thông báo tự động khi có cập nhật mới.

---

## 💻 Công nghệ sử dụng

| Công nghệ | Mục đích |
| :--- | :--- |
| **Node.js** | Môi trường thực thi JavaScript phía Server. |
| **Express.js** | Framework xử lý HTTP Request và Routing. |
| **MongoDB & Mongoose** | Cơ sở dữ liệu NoSQL và ODM để quản lý dữ liệu. |
| **EJS** | Công cụ render giao diện người dùng phía Server. |
| **Multer** | Xử lý tải lên các tệp tin hình ảnh/tài liệu. |
| **Express Validator** | Kiểm tra và làm sạch dữ liệu đầu vào từ người dùng. |

---

## 📂 Cấu trúc thư mục

```text
├── bin/                 # File thực thi khởi động server
├── controllers/         # Xử lý logic nghiệp vụ cho từng Model
├── public/              # Chứa các tài nguyên tĩnh (CSS, JS, Images)
├── resources/           # Các file giao diện HTML tĩnh
├── routes/              # Định nghĩa các API Endpoints
├── schemas/             # Định nghĩa cấu trúc dữ liệu MongoDB (Mongoose Models)
├── utils/               # Các hàm tiện ích (Auth, Upload, Mail, Chat...)
├── views/               # Giao diện người dùng (EJS Templates)
├── app.js               # Cấu hình chính của ứng dụng Express
├── private.pem          # Khóa bí mật dùng cho JWT RSA
└── public.pem           # Khóa công khai dùng cho JWT RSA
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy
1. Yêu cầu hệ thống
Đã cài đặt Node.js (Phiên bản 14 trở lên).

Đã cài đặt và đang chạy MongoDB.

2. Các bước thực hiện
Clone repository:

Bash
git clone [URL-repository-cua-ban]
cd manger_task_project
Cài đặt các thư viện phụ thuộc:

Bash
npm install
Cấu hình môi trường:

Tạo file .env tại thư mục gốc.

Cấu hình các biến như PORT, MONGODB_URI, và các thông số cho Mailer nếu cần.

Khởi chạy ứng dụng:

Chế độ phát triển (Tự động tải lại khi đổi code):

Bash
npm start
Truy cập giao diện tại: http://localhost:3000

---


## 🔒 Quản lý API
Hệ thống sử dụng các Route riêng biệt cho từng nghiệp vụ:

/auth: Xử lý Đăng ký/Đăng nhập.

/users: Quản lý hồ sơ cá nhân.

/tasks: Các thao tác với công việc.

/projects: Quản lý danh sách dự án.

/messages: API cho hệ thống chat.
