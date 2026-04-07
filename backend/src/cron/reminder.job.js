import cron from 'node-cron';
import Booking from '../models/Booking.js';
import { sendEmail } from '../services/email.service.js';

// Chạy mỗi 1 phút kiểm tra (để test nhanh)
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  try {
    // Tìm các vé đã xác nhận, chưa gửi nhắc nhở, có giờ chiếu trong khoảng [now, now + 2h]
    const bookings = await Booking.find({
      status: 'confirmed',
      showstartTime: {
        $gte: now,
        $lte: twoHoursLater
      },
      reminderSent: false
    }).populate('user');

    for (const booking of bookings) {
      if (booking.user && booking.user.email) {
        const emailOptions = {
          to: booking.user.email,
          subject: `🎬 Nhắc nhở suất chiếu sắp tới: ${booking.movieTitle}`,
          template: 'reminder',
          data: { booking, user: booking.user }
        };

        // Gửi email
        await sendEmail(emailOptions);

        // Đánh dấu đã gửi
        booking.reminderSent = true;
        await booking.save();
        
        console.log(`[Cron] Đã gửi email nhắc nhở đến: ${booking.user.email}`);
      }
    }

  } catch (error) {
    console.error("[Cron] Lỗi khi chạy nhắc nhở suất chiếu:", error);
  }
});
