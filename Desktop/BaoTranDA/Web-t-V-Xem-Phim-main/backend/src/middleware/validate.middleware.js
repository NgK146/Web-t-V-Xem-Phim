import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * Xử lý kết quả validation từ express-validator
 */
export const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(422, 'Dữ liệu không hợp lệ', errors.array());
  }
  next();
};
