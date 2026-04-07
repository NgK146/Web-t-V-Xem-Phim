import { ApiError } from '../utils/ApiError.js';

/**
 * Kiểm tra quyền truy cập theo role
 * @param {...string} roles - Danh sách role được phép
 * @returns {import('express').RequestHandler}
 */
export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Bạn không có quyền thực hiện hành động này'));
  }
  next();
};
