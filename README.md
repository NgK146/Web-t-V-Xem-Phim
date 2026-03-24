# Cinema Booking System

Dự án này bao gồm hai phần chính: Backend (Node.js/Express) và Frontend (React.js).
Để chạy toàn bộ dự án ở môi trường phát triển (development), bạn cần mở 2 cửa sổ Terminal (hoặc Command Prompt / PowerShell) riêng biệt.

## Yêu cầu môi trường
- Đảm bảo **MongoDB** đang chạy ở cổng `27017` (Mặc định).
- Đảm bảo **Redis** đang chạy ở cổng `6379`.

---

## 🚀 CÁCH CHẠY DỰ ÁN

### 1. Khởi động Backend Server
Mở Terminal **thứ nhất**, di chuyển vào thư mục `backend` và chạy lệnh khởi động:

```bash
cd backend
npm run dev
```

> **Lưu ý:** Lệnh này sử dụng `nodemon`, server sẽ chạy ở cổng `5000` (`http://localhost:5000`) và tự động khởi động lại mỗi khi bạn chỉnh sửa code bên trong thư mục backend. Bạn sẽ thấy thông báo `MongoDB connected` nếu kết nối database thành công.

### 2. Khởi động Frontend Web
Mở Terminal **thứ hai**, di chuyển vào thư mục `frontend` và chạy lệnh:

```bash
cd frontend
npm start
```

> **Lưu ý:** Lệnh này khởi chạy React Development Server. Trình duyệt của bạn sẽ tự động mở lên tại địa chỉ `http://localhost:3000`. Cổng `3000` này cũng đã được cấu hình trong `backend/.env` để cho phép gọi API (CORS).

---

## Các tài khoản mặc định (Nếu có cấu hình)
- TBD

## Xử lý sự cố thường gặp
- **Lỗi `EADDRINUSE: address already in use :::5000`**: Cổng 5000 đã bị chiếm dụng bởi một tiến trình Node.js trước đó. Hãy tắt Terminal cũ đi, hoặc dùng lệnh kill process (trên Windows: `netstat -ano | findstr :5000` sau đó `taskkill /PID <PID> /F`).