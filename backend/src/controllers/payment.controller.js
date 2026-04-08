import Booking from '../models/Booking.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { createPayOSPaymentLink, verifyPayOSWebhookData, getPayOSPaymentStatus } from '../services/payment.service.js';

/**
 * @desc  Tạo Link thanh toán PayOS
 * @route POST /api/payments/payos/create-link
 * @access Private
 */
export const createPayOSPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) throw new ApiError(400, 'Thiếu bookingId');

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, 'Không tìm thấy booking');
    if (booking.user.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Không có quyền thanh toán booking này');
    }
    if (booking.status === 'confirmed') {
      throw new ApiError(400, 'Booking này đã được thanh toán');
    }

    // PayOS requires a unique integer orderCode. Max length 16.
    // Timestamp (13 digits) + Random (3 digits) = 16 digits
    const orderCode = Number(String(Date.now()).slice(-9) + Math.floor(100 + Math.random() * 900));
    
    booking.orderCode = orderCode;
    await booking.save({ validateBeforeSave: false });

    // Ensure frontend port is correctly matched (Assuming React is on port 3000)
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const cancelUrl = `${clientUrl}/payment/cancel`;
    const returnUrl = `${clientUrl}/payment/success?orderCode=${orderCode}`;

    const paymentLinkData = await createPayOSPaymentLink({
      orderCode,
      amount: booking.finalPrice,
      bookingId: booking.bookingCode || bookingId.substring(0, 8),
      cancelUrl,
      returnUrl
    });

    res.json(new ApiResponse(200, { checkoutUrl: paymentLinkData.checkoutUrl }, 'Tạo link thanh toán PayOS thành công'));
  } catch (err) { 
    next(err); 
  }
};

/**
 * @desc  Webhook nhận thông báo thanh toán từ PayOS
 * @route POST /api/payments/payos/webhook
 * @access Public (PayOS Server)
 */
export const payOSWebhook = async (req, res, next) => {
  try {
    const webhookData = verifyPayOSWebhookData(req.body);

    if (webhookData.code === '00' || webhookData.success) {
      const orderCode = webhookData.data.orderCode;
      
      const booking = await Booking.findOne({ orderCode: Number(orderCode) });
      if (booking && booking.status === 'pending') {
        booking.status = 'confirmed';
        booking.paymentMethod = 'payos';
        booking.paidAt = new Date();
        await booking.save();
        
        console.log(`[PayOS Webhook] Bắt được thanh toán thành công: ${orderCode}`);

        // Broadcast to Admin Dashboard safely
        const io = req.app.get('io');
        if (io) {
          io.emit('admin_new_booking', {
            amount: booking.totalPrice,
            ticketCount: booking.seats.length,
            orderCode: booking.orderCode,
          });
        }
      }
    }
    res.json({ success: true, message: 'Webhook received' });
  } catch (err) {
    console.error('PayOS Webhook error:', err);
    res.json({ success: false, message: 'Invalid webhook' });
  }
};

/**
 * @desc  Kiểm tra trạng thái đơn hàng PayOS từ Client
 * @route GET /api/payments/payos/status/:orderCode
 * @access Public
 */
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    if (!orderCode) throw new ApiError(400, 'Thiếu mã đơn hàng');

    const paymentInfo = await getPayOSPaymentStatus(orderCode);
    
    if (paymentInfo && paymentInfo.status === 'PAID') {
      const booking = await Booking.findOne({ orderCode: Number(orderCode) });
      if (booking) {
        const wasPending = booking.status === 'pending';
        if (wasPending) {
          booking.status = 'confirmed';
          booking.paymentMethod = 'payos';
          booking.paidAt = new Date();
          await booking.save();
          
          // Broadcast to Admin Dashboard safely
          const io = req.app.get('io');
          if (io) {
            io.emit('admin_new_booking', {
              amount: booking.totalPrice,
              ticketCount: booking.seats.length,
              orderCode: booking.orderCode,
            });
          }
        }
        res.json(new ApiResponse(200, { status: 'PAID', booking }, 'Thanh toán đã hoàn tất'));
      } else {
        res.json(new ApiResponse(200, { status: 'PENDING' }, 'Không tìm thấy vé'));
      }
    } else {
      res.json(new ApiResponse(200, { status: paymentInfo?.status || 'PENDING' }, 'Đang chờ xử lý'));
    }
  } catch (err) {
    next(err);
  }
};