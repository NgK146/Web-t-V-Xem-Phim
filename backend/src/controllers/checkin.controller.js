import Booking from '../models/Booking.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * @desc  Tra cứu booking theo mã đặt vé
 * @route GET /api/checkin/lookup/:bookingCode
 * @access Staff/Admin
 */
export const lookupBooking = async (req, res, next) => {
  try {
    const { bookingCode } = req.params;

    const booking = await Booking.findOne({ bookingCode: bookingCode.toUpperCase() })
      .populate('user', 'name email phone')
      .populate('showtime', 'startTime endTime')
      .populate('checkedInBy', 'name');

    if (!booking) {
      throw new ApiError(404, 'Không tìm thấy vé với mã này');
    }

    res.json(new ApiResponse(200, booking));
  } catch (err) { next(err); }
};

/**
 * @desc  Thực hiện check-in cho booking
 * @route POST /api/checkin/:bookingId
 * @access Staff/Admin
 */
export const performCheckin = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const staffId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Không tìm thấy booking');
    }

    if (booking.status !== 'confirmed') {
      throw new ApiError(400, `Không thể check-in. Trạng thái vé hiện tại: ${booking.status}`);
    }

    if (booking.checkedIn) {
      throw new ApiError(400, 'Vé này đã được check-in trước đó');
    }

    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    booking.checkedInBy = staffId;
    await booking.save();

    // Populate lại để trả response đầy đủ
    await booking.populate('user', 'name email phone');
    await booking.populate('checkedInBy', 'name');

    res.json(new ApiResponse(200, booking, 'Check-in thành công!'));
  } catch (err) { next(err); }
};

/**
 * @desc  Lấy danh sách check-in hôm nay
 * @route GET /api/checkin/today
 * @access Staff/Admin
 */
export const getTodayCheckins = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const checkins = await Booking.find({
      checkedIn: true,
      checkedInAt: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('user', 'name email')
      .populate('checkedInBy', 'name')
      .sort('-checkedInAt')
      .limit(50);

    const totalBookings = await Booking.countDocuments({
      showstartTime: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    });

    const checkedInCount = await Booking.countDocuments({
      checkedIn: true,
      checkedInAt: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    });

    const notCheckedInCount = await Booking.countDocuments({
      checkedIn: false,
      showstartTime: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    });

    res.json(new ApiResponse(200, {
      checkins,
      stats: {
        totalBookings,
        checkedInCount,
        notCheckedInCount
      }
    }));
  } catch (err) { next(err); }
};

/**
 * @desc  Xác nhận trả Combo Bắp Nước cho khách
 * @route POST /api/checkin/:bookingId/fnb
 * @access Staff/Admin
 */
export const serveFoods = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('user', 'name email phone')
      .populate('showtime')
      .populate('checkedInBy', 'name')
      .populate('foodsServedBy', 'name');

    if (!booking) throw new ApiError(404, 'Không tìm thấy vé');

    if (booking.status !== 'confirmed') {
      throw new ApiError(400, 'Vé chưa được thanh toán thành công hoặc đã bị huỷ. Không thể trả bắp nước.');
    }

    if (!booking.foods || booking.foods.length === 0) {
      throw new ApiError(400, 'Vé này không có hóa đơn Combo Bắp Nước.');
    }

    if (booking.foodsServed) {
      throw new ApiError(400, `Combo Bắp Nước của vé này ĐÃ ĐƯỢC NHẬN lúc ${booking.foodsServedAt?.toLocaleString('vi-VN')}`);
    }

    booking.foodsServed = true;
    booking.foodsServedAt = new Date();
    booking.foodsServedBy = req.user._id;
    await booking.save();

    await booking.populate('foodsServedBy', 'name');

    res.json(new ApiResponse(200, booking, 'Đã xác nhận trả bắp nước thành công'));
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Lấy báo cáo kết ca của nhân viên
 * @route GET /api/checkin/my-shift
 * @access Staff/Admin
 */
export const getMyShiftReport = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const checkedInCount = await Booking.countDocuments({
      checkedIn: true,
      checkedInAt: { $gte: startOfDay, $lte: endOfDay },
      checkedInBy: req.user._id
    });

    const foodsServedCount = await Booking.countDocuments({
      foodsServed: true,
      foodsServedAt: { $gte: startOfDay, $lte: endOfDay },
      foodsServedBy: req.user._id
    });

    res.json(new ApiResponse(200, {
      staffName: req.user.name,
      checkedInCount,
      foodsServedCount
    }));
  } catch (err) {
    next(err);
  }
};
