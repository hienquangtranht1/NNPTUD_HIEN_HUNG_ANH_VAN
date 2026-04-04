# 🚀 Hướng dẫn Test API Quản lý Công việc (Postman)

Hệ thống đã kết nối MongoDB và đang chạy tại: `http://localhost:3000`

---

## 🛠️ Bước 1: Khởi tạo Dữ liệu Nền (Mồi)
Vì hệ thống yêu cầu phân quyền, bạn cần tạo Role trước khi đăng ký User.

### 1.1. Tạo Role ADMIN
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/roles`
- **Body** (JSON):
```json
{
  "name": "ADMIN",
  "description": "Quản trị viên toàn quyền"
}
```
> **Lưu ý**: Copy `_id` của Role ADMIN vừa tạo để dùng ở bước tiếp theo.

### 1.2. Đăng ký Tài khoản (Register)
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/auth/register`
- **Body** (JSON):
```json
{
  "username": "anh_admin",
  "password": "Password123",
  "email": "anh@gmail.com",
  "fullName": "Nguyen Hoang Anh",
  "role": "ID_ROLE_ADMIN_VUA_COPY"
}
```

---

## 🔐 Bước 2: Đăng nhập & Lấy Token
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/auth/login`
- **Body** (JSON):
```json
{
  "username": "anh_admin",
  "password": "Password123"
}
```
> **QUAN TRỌNG**: Sau khi Login thành công, copy `token`.
> Trong các Request tiếp theo: Tab **Auth** -> Chọn **Bearer Token** -> Dán token vào.

---

## 🏗️ Bước 3: Tạo Dự án (Projects)
Trước khi tạo Task, bạn cần có ít nhất 1 dự án.

### 3.1. Tạo Dự án mới
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/projects`
- **Body** (JSON):
```json
{
  "name": "Dự án Quản lý Task Nodejs",
  "description": "Dự án thực tập backend",
  "status": "PLANNING"
}
```
> **Lưu ý**: Copy `_id` của Project vừa tạo để dùng làm `projectId` cho các bước sau.

---

## 🏷️ Bước 4: Quản lý Nhãn (Tags)
### 4.1. Tạo Nhãn mới
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/tags`
- **Body** (JSON):
```json
{
  "name": "Bug",
  "colorCode": "#e74c3c"
}
```
*(Lặp lại để tạo thêm nhãn: Feature, Urgent...)*

---

## 📝 Bước 5: Quản lý Công việc (Tasks)
### 5.1. Tạo Task mới
- **Method**: `POST`
- **URL**: `http://localhost:3000/api/v1/tasks`
- **Body** (JSON):
```json
  {
    "title": "Sửa lỗi giao diện",
    "description": "Fix bug CSS trên trang chủ",
    "projectId": "ID_PROJECT_VUA_COPY_O_BUOC_3",
    "dueDate": "2024-12-31",
    "status": "TODO"
  }
```

### 5.2. Gán Nhãn cho Task
- **Method**: `PUT`
- **URL**: `http://localhost:3000/api/v1/tasks/ID_TASK_CUA_BAN/tags`
- **Body** (JSON):
```json
{
  "tags": ["ID_TAG_1", "ID_TAG_2"]
}
```

### 5.3. Cập nhật trạng thái (Để tạo lịch sử)
- **Method**: `PUT`
- **URL**: `http://localhost:3000/api/v1/tasks/ID_TASK_CUA_BAN`
- **Body** (JSON):
```json
{
  "status": "IN_PROGRESS"
}
```

---

## 📜 Bước 6: Kiểm tra
### 6.1. Xem lịch sử thay đổi Task
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/v1/taskHistories?taskId=ID_TASK_CUA_BAN`

### 6.2. Danh sách Task (Lọc)
- **Method**: `GET`
- **URL**: `http://localhost:3000/api/v1/tasks?status=IN_PROGRESS`
