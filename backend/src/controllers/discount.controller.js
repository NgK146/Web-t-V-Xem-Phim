import Discount from '../models/Discount.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc  Lấy danh sách mã giảm giá (admin)
 * @route GET /api/discounts
 * @access Admin
 */
export const getDiscounts = async (req, res, next) => {
  try {
    const discounts = await Discount.find().sort('-createdAt');
    res.json(new ApiResponse(200, discounts));
  } catch (err) { next(err); }
};

/**
 * @desc  Kiểm tra mã giảm giá (public - khi đặt vé)
 * @route POST /api/discounts/validate
 * @access Public
 */
export const validateDiscount = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const discount = await Discount.findOne({ code: code.toUpperCase(), isActive: true });

    if (!discount) throw new ApiError(404, 'Mã giảm giá không hợp lệ hoặc đã hết hạn');

    const now = new Date();
    if (now < discount.startDate || now > discount.endDate) {
      throw new ApiError(400, 'Mã giảm giá đã hết hạn hoặc chưa đến ngày áp dụng');
    }

    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      throw new ApiError(400, 'Mã giảm giá đã đạt giới hạn sử dụng');
    }

    if (amount < discount.minOrder) {
      throw new ApiError(400, `Đơn hàng tối thiểu để dùng mã này là ${discount.minOrder.toLocaleString('vi-VN')}đ`);
    }

    // Tính số tiền giảm
    let discountAmount = 0;
    if (discount.type === 'percent') {
      discountAmount = (amount * discount.value) / 100;
      if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
    } else {
      discountAmount = discount.value;
    }

    res.json(new ApiResponse(200, {
      discountId: discount._id,
      code: discount.code,
      discountAmount,
      finalAmount: amount - discountAmount
    }, 'Áp dụng mã thành công'));

  } catch (err) { next(err); }
};

/**
 * @desc  Tạo mã giảm giá mới (admin)
 * @route POST /api/discounts
 * @access Admin
 */
export const createDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.create(req.body);
    res.status(201).json(new ApiResponse(201, discount, 'Tạo mã giảm giá thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Cập nhật mã giảm giá (admin)
 * @route PUT /api/discounts/:id
 * @access Admin
 */
export const updateDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!discount) throw new ApiError(404, 'Không tìm thấy mã giảm giá');
    res.json(new ApiResponse(200, discount, 'Cập nhật thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Xoá mã giảm giá (admin)
 * @route DELETE /api/discounts/:id
 * @access Admin
 */
export const deleteDiscount = async (req, res, next) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) throw new ApiError(404, 'Không tìm thấy mã giảm giá');
    res.json(new ApiResponse(200, null, 'Xoá mã giảm giá thành công'));
  } catch (err) { next(err); }
};
