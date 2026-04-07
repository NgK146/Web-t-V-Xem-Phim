import { ApiError } from '../utils/ApiError.js';
import fs from 'fs';

/**
 * Xử lý lỗi Mongoose CastError (Ví dụ ID sai định dạng)
 */
const handleCastErrorDB = (err) => {
  const message = `Không tìm thấy tài nguyên. Đầu vào không hợp lệ: ${err.path}: ${err.value}`;
  return new ApiError(400, message);
};

/**
 * Xử lý lỗi Mongoose Duplicate Fields (Ví dụ Trùng email)
 */
const handleDuplicateFieldsDB = (err) => {
  // Lấy giá trị bị trùng tự động từ object (error.keyValue)
  const value = Object.values(err.keyValue)[0];
  const message = `Giá trị "${value}" đã tồn tại trong hệ thống. Vui lòng sử dụng giá trị khác!`;
  return new ApiError(400, message);
};

/**
 * Xử lý lỗi Mongoose Validation (Ví dụ Thiếu trường bắt buộc)
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Dữ liệu đầu vào không hợp lệ. ${errors.join('. ')}`;
  return new ApiError(400, message);
};

/**
 * Xử lý lỗi xác thực JWT
 */
const handleJWTError = () => new ApiError(401, 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!');

/**
 * Xử lý lỗi JWT hết hạn
 */
const handleJWTExpiredError = () => new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');

/**
 * Gửi Lỗi theo định dạng Môi trường Phát triển (Development)
 */
const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors || undefined,
    stack: err.stack,
    error: err
  });
};

/**
 * Gửi Lỗi siêu gọn và bảo mật theo định dạng Môi trường Thực tế (Production)
 */
const sendErrorProd = (err, req, res) => {
  // Lỗi do chúng ta tự bắt (ApiError) hoặc lỗi đã dự tính được
  if (err.isOperational) {
    fs.appendFileSync('error_log.txt', JSON.stringify({ time: new Date(), route: req.originalUrl, status: err.statusCode, message: err.message, err: err }) + '\n');
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }
  
  // A. Lỗi không lường trước (Lỗi cú pháp Code, Lỗi Thư viện bên thứ 3)
  // 1. Log lỗi ra thiết bị ghi chuyên dụng (nếu có hệ thống cloud logging) thay vì trả cho Frontend
  console.error('ERROR 💥', err);

  // 2. Trả về thông báo lỗi chung cực kì an toàn
  return res.status(500).json({
    success: false,
    message: 'Oh oh! Đã xảy ra lỗi hệ thống cục bộ!'
  });
};

/**
 * Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    // Copy biến lỗi lại để tránh tham chiếu đến tham số ban đầu của NodeJS
    let error = { ...err };
    error.message = err.message;
    error.name = err.name; // Copy tên Lỗi để dễ dàng xử lý

    // Định dạng lại các lỗi Mongoose xấu xí
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
