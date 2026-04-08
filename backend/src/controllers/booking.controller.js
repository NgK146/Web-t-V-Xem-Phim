import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
import Discount from '../models/Discount.js';
import Food from '../models/Food.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { generateQRCode } from '../services/qr.service.js';
import { sendEmail } from '../services/email.service.js';
import { generateBookingCode } from '../utils/helpers.js';
import { buildPagination } from '../utils/pagination.js';
import { io } from '../app.js';

/**
 * @desc  Đặt vé xem phim
 * @route POST /api/bookings
 * @access Private
 */
export const createBooking = async (req, res, next) => {
  try {
    const { showtimeId, seatIds, discountCode, foods = [] } = req.body;

    const showtime = await Showtime.findById(showtimeId)
      .populate('movie room');
    if (!showtime) throw new ApiError(404, 'Suất chiếu không tồn tại');
    if (showtime.status !== 'scheduled') {
      throw new ApiError(400, 'Suất chiếu này không còn khả dụng');
    }

    // Kiểm tra ghế
    const tickets = [];
    let totalPrice = 0;

    for (const seatId of seatIds) {
      const seatIndex = showtime.seats.findIndex(
        s => s.seat.toString() === seatId
      );
      if (seatIndex === -1) throw new ApiError(400, 'Ghế không tồn tại');

      const seat = showtime.seats[seatIndex];
      const now = new Date();
      if (seat.status === 'booked') {
        throw new ApiError(400, `Ghế đã được đặt`);
      }

      if (seat.status === 'locked') {
        const isExpired = seat.lockedAt && now > seat.lockedAt;
        const isMyLock = seat.lockedBy?.toString() === req.user._id.toString();

        if (!isExpired && !isMyLock) {
          throw new ApiError(400, `Ghế đang được người khác giữ`);
        }
        if (isExpired && isMyLock) {
          throw new ApiError(400, `Thời gian giữ ghế đã hết hạn, vui lòng chọn lại`);
        }
      }

      // Tìm thông tin ghế từ room
      const roomSeat = showtime.room.seats.id(seatId);
      const label = roomSeat ? `${roomSeat.row}${roomSeat.number}` : seatId;

      showtime.seats[seatIndex].status = 'booked';
      tickets.push({
        seat: seatId,
        seatLabel: label,
        seatType: roomSeat?.type || 'standard',
        price: seat.price,
      });
      totalPrice += seat.price;
    }

    // Xử lý đồ ăn thức uống (F&B)
    const bookingFoods = [];
    for (const item of foods) {
      if (!item.foodId || !item.quantity || item.quantity <= 0) continue;
      
      const foodDoc = await Food.findById(item.foodId);
      if (!foodDoc || !foodDoc.isActive) {
        throw new ApiError(400, `Món ăn không tồn tại hoặc đã ngừng bán`);
      }
      
      const itemPrice = foodDoc.price * item.quantity;
      bookingFoods.push({
        food: foodDoc._id,
        name: foodDoc.name,
        price: foodDoc.price,
        quantity: item.quantity,
      });
      totalPrice += itemPrice;
    }

    // Áp dụng mã giảm giá
    let finalPrice = totalPrice;
    let discountDoc = null;
    if (discountCode) {
      discountDoc = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate:   { $gte: new Date() },
      });

      if (!discountDoc) throw new ApiError(400, 'Mã giảm giá không hợp lệ');
      if (discountDoc.usageLimit && discountDoc.usedCount >= discountDoc.usageLimit) {
        throw new ApiError(400, 'Mã giảm giá đã hết lượt sử dụng');
      }
      if (totalPrice < discountDoc.minOrder) {
        throw new ApiError(400, `Đơn hàng tối thiểu ${discountDoc.minOrder.toLocaleString()}đ`);
      }

      const discountAmount = discountDoc.type === 'percent'
        ? Math.min(totalPrice * discountDoc.value / 100, discountDoc.maxDiscount || Infinity)
        : discountDoc.value;

      finalPrice = Math.max(0, totalPrice - discountAmount);
      discountDoc.usedCount += 1;
      await discountDoc.save();
    }

    // Lưu trạng thái ghế TRƯỚC khi tạo booking để đảm bảo tính nhất quán
    await showtime.save();

    const bookingCode = generateBookingCode();
    const booking = await Booking.create([{
      user: req.user._id,
      showtime: showtimeId,
      tickets,
      foods: bookingFoods,
      totalPrice,
      discount: discountDoc?._id,
      finalPrice,
      status: 'pending',  // Initial state is pending until PayOS confirms via Webhook
      bookingCode,
      // Store snapshot for long-term history reliability
      movieTitle:    showtime.movieTitle || showtime.movie?.title,
      cinemaName:    showtime.cinemaName || showtime.room?.cinema?.name,
      roomName:      showtime.roomName   || showtime.room?.name,
      showstartTime: showtime.startTime,
    }]);

    // Tạo QR code
    const qrCode = await generateQRCode(booking[0].bookingCode);
    booking[0].qrCode = qrCode;
    await booking[0].save();

    // Populate để trả về
    await booking[0].populate('showtime user');

    // Gửi email xác nhận
    sendEmail({
      to: req.user.email,
      subject: `Xác nhận đặt vé - ${booking[0].bookingCode}`,
      template: 'bookingConfirm',
      data: { booking: booking[0], user: req.user },
    }).catch(console.error);

    // Thông báo real-time cập nhật ghế
    io.to(showtimeId).emit('seats_updated', {
      showtimeId,
      seats: seatIds.map(id => ({ id, status: 'booked' })),
    });

    res.status(201).json(
      new ApiResponse(201, booking[0], 'Đặt vé thành công')
    );
  } catch (err) {
    next(err);
  }
};

/**
 * @desc  Giữ ghế tạm thời (5 phút)
 * @route POST /api/bookings/lock-seats
 * @access Private
 */
export const lockSeats = async (req, res, next) => {
  try {
    const { showtimeId, seatIds } = req.body;
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) throw new ApiError(404, 'Suất chiếu không tồn tại');

    const lockExpiry = new Date(Date.now() + 5 * 60 * 1000);

    for (const seatId of seatIds) {
      const idx = showtime.seats.findIndex(s => s.seat.toString() === seatId);
      if (idx === -1) throw new ApiError(400, 'Ghế không tồn tại');

      const seat = showtime.seats[idx];
      const now = new Date();
      if (seat.status === 'booked') throw new ApiError(400, 'Ghế đã được đặt');
      if (seat.status === 'locked') {
        const isExpired = seat.lockedAt && now > seat.lockedAt;
        if (!isExpired && seat.lockedBy?.toString() !== req.user._id.toString()) {
          throw new ApiError(400, 'Ghế đang được người khác giữ');
        }
      }

      showtime.seats[idx].status   = 'locked';
      showtime.seats[idx].lockedBy = req.user._id;
      showtime.seats[idx].lockedAt = lockExpiry;
    }

    await showtime.save();

    // Emit real-time
    io.to(showtimeId).emit('seats_updated', {
      showtimeId,
      seats: seatIds.map(id => ({ id, status: 'locked' })),
    });

    // Tự động nhả ghế sau 5 phút nếu chưa thanh toán
    setTimeout(async () => {
      try {
        const currentShowtime = await Showtime.findById(showtimeId);
        if (!currentShowtime) return;

        let changed = false;
        const unlockedSeats = [];
        
        for (const seatId of seatIds) {
          const idx = currentShowtime.seats.findIndex(s => s.seat.toString() === seatId);
          if (idx !== -1) {
            const seat = currentShowtime.seats[idx];
            // Nếu vẫn là locked và đã quá hạn
            if (seat.status === 'locked' && seat.lockedAt && new Date() >= new Date(seat.lockedAt)) {
              currentShowtime.seats[idx].status = 'available';
              currentShowtime.seats[idx].lockedBy = undefined;
              currentShowtime.seats[idx].lockedAt = undefined;
              unlockedSeats.push(seatId);
              changed = true;
            }
          }
        }

        if (changed) {
          await currentShowtime.save();
          io.to(showtimeId).emit('seats_updated', {
            showtimeId,
            seats: unlockedSeats.map(id => ({ id, status: 'available' })),
          });
        }
      } catch (error) {
        console.error('Error auto-unlocking seats:', error);
      }
    }, 5 * 60 * 1000 + 2000); // 5 phút + 2 giây để chắc chắn hết hạn

    res.json(new ApiResponse(200, { lockedUntil: lockExpiry }, 'Ghế đã được giữ trong 5 phút'));
  } catch (err) { next(err); }
};

/**
 * @desc  Nhả khóa các ghế (khi user bỏ chọn hoặc rời trang)
 * @route POST /api/bookings/unlock-seats
 * @access Private
 */
export const unlockSeats = async (req, res, next) => {
  try {
    const { showtimeId, seatIds } = req.body;
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.json(new ApiResponse(200, null, 'OK'));

    let changed = false;
    for (const seatId of seatIds) {
      const idx = showtime.seats.findIndex(s => s.seat.toString() === seatId);
      if (idx === -1) continue;
      const seat = showtime.seats[idx];
      // Chỉ nhả nếu chính user này đang giữ
      if (seat.status === 'locked' && seat.lockedBy?.toString() === req.user._id.toString()) {
        showtime.seats[idx].status   = 'available';
        showtime.seats[idx].lockedBy = undefined;
        showtime.seats[idx].lockedAt = undefined;
        changed = true;
      }
    }

    if (changed) {
      await showtime.save();
      io.to(showtimeId).emit('seats_updated', {
        showtimeId,
        seats: seatIds.map(id => ({ id, status: 'available' })),
      });
    }

    res.json(new ApiResponse(200, null, 'Ghế đã được nhả'));
  } catch (err) { next(err); }
};

/**
 * @desc  Hủy vé đặt
 * @route PATCH /api/bookings/:id/cancel
 * @access Private
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('showtime');
    if (!booking) throw new ApiError(404, 'Không tìm thấy booking');
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new ApiError(403, 'Không có quyền hủy vé này');
    }
    if (booking.status === 'cancelled') throw new ApiError(400, 'Vé đã bị hủy trước đó');

    // Kiểm tra thời gian cho phép hủy (trước suất chiếu 2h)
    const showtime = booking.showtime;
    const twoHoursBefore = new Date(showtime.startTime - 2 * 60 * 60 * 1000);
    if (new Date() > twoHoursBefore && req.user.role !== 'admin') {
      throw new ApiError(400, 'Không thể hủy vé trong vòng 2 giờ trước suất chiếu');
    }

    // Giải phóng ghế
    const seatIds = booking.tickets.map(t => t.seat.toString());
    for (const seatId of seatIds) {
      const idx = showtime.seats.findIndex(s => s.seat.toString() === seatId);
      if (idx !== -1) {
        showtime.seats[idx].status   = 'available';
        showtime.seats[idx].lockedBy = undefined;
        showtime.seats[idx].lockedAt = undefined;
      }
    }
    await showtime.save();

    booking.status       = 'cancelled';
    booking.cancelledAt  = new Date();
    booking.cancelReason = req.body.reason || 'Người dùng hủy';
    await booking.save();

    io.to(showtime._id.toString()).emit('seats_updated', {
      showtimeId: showtime._id,
      seats: seatIds.map(id => ({ id, status: 'available' })),
    });

    res.json(new ApiResponse(200, booking, 'Hủy vé thành công'));
  } catch (err) { next(err); }
};

/**
 * @desc  Lịch sử đặt vé của người dùng
 * @route GET /api/bookings/my-bookings
 * @access Private
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { skip, pagination } = buildPagination(page, limit,
      await Booking.countDocuments({ user: req.user._id }));

    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'showtime',
        populate: [
          { path: 'movie', select: 'title poster genre duration' },
          { path: 'room', populate: { path: 'cinema', select: 'name address location' } }
        ]
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.json(new ApiResponse(200, { bookings, pagination }));
  } catch (err) { next(err); }
};
