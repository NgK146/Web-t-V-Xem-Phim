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
 * @desc  Thực hiện check-in cho booking (mỗi mã chỉ check-in được 1 lần duy nhất)
 * @route POST /api/checkin/:bookingId
 * @access Staff/Admin
 */
export const performCheckin = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const staffId = req.user._id;

    // Dùng findOneAndUpdate nguyên tử (atomic) với điều kiện checkedIn: false
    // để đảm bảo chỉ có đúng 1 request thành công, kể cả khi 2 nhân viên bấm cùng lúc
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: 'confirmed',
        checkedIn: false       // CHỈ cập nhật nếu chưa check-in
      },
      {
        $set: {
          checkedIn: true,
          checkedInAt: new Date(),
          checkedInBy: staffId
        }
      },
      { new: true }            // Trả về document sau khi cập nhật
    );

    // Nếu không tìm thấy → hoặc không tồn tại, hoặc đã check-in, hoặc sai trạng thái
    if (!booking) {
      // Truy xuất lại để phân biệt nguyên nhân cụ thể
      const existing = await Booking.findById(bookingId);
      if (!existing) {
        throw new ApiError(404, 'Không tìm thấy booking');
      }
      if (existing.checkedIn) {
        const checkedTime = existing.checkedInAt
          ? new Date(existing.checkedInAt).toLocaleString('vi-VN')
          : 'trước đó';
        throw new ApiError(400, `⛔ Vé này ĐÃ ĐƯỢC CHECK-IN lúc ${checkedTime}. Mỗi mã vé chỉ được sử dụng 1 lần.`);
      }
      throw new ApiError(400, `Không thể check-in. Trạng thái vé hiện tại: ${existing.status}`);
    }

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
 * @desc  Xác nhận trả Combo Bắp Nước cho khách (mỗi mã chỉ trả 1 lần duy nhất)
 * @route POST /api/checkin/:bookingId/fnb
 * @access Staff/Admin
 */
export const serveFoods = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;

    // Kiểm tra trước để trả lỗi rõ ràng
    const existing = await Booking.findById(bookingId);
    if (!existing) throw new ApiError(404, 'Không tìm thấy vé');

    if (existing.status !== 'confirmed') {
      throw new ApiError(400, 'Vé chưa được thanh toán thành công hoặc đã bị huỷ. Không thể trả bắp nước.');
    }

    if (!existing.foods || existing.foods.length === 0) {
      throw new ApiError(400, 'Vé này không có hóa đơn Combo Bắp Nước.');
    }

    if (existing.foodsServed) {
      const servedTime = existing.foodsServedAt
        ? new Date(existing.foodsServedAt).toLocaleString('vi-VN')
        : 'trước đó';
      throw new ApiError(400, `⛔ Combo Bắp Nước của vé này ĐÃ ĐƯỢC NHẬN lúc ${servedTime}. Mỗi mã chỉ được sử dụng 1 lần.`);
    }

    // Dùng findOneAndUpdate nguyên tử để đảm bảo chỉ 1 lần duy nhất
    const booking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        status: 'confirmed',
        foodsServed: false     // CHỈ cập nhật nếu chưa trả bắp nước
      },
      {
        $set: {
          foodsServed: true,
          foodsServedAt: new Date(),
          foodsServedBy: req.user._id
        }
      },
      { new: true }
    );

    if (!booking) {
      throw new ApiError(400, '⛔ Combo Bắp Nước của vé này đã được xử lý bởi nhân viên khác. Mỗi mã chỉ được sử dụng 1 lần.');
    }

    await booking.populate('user', 'name email phone');
    await booking.populate('checkedInBy', 'name');
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
