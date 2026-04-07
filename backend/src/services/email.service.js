import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

/** @type {Record<string, (data: object) => string>} */
const templates = {
  welcome: ({ name }) => `
    <h2>Xin chào ${name}!</h2>
    <p>Chào mừng bạn đến với CinemaHub. Tận hưởng trải nghiệm xem phim!</p>
  `,
  bookingConfirm: ({ booking, user }) => {
    const seats = booking.tickets.map(t => t.seatLabel).join(', ');
    const showDate = booking.showstartTime
      ? new Date(booking.showstartTime).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' })
      : '';
    return `
    <div style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#111118;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#e50914,#b10710);padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:2px;">CINEBOOKING<span style="opacity:0.7">*</span></div>
          <div style="color:rgba(255,255,255,0.7);margin-top:6px;font-size:13px;letter-spacing:1px;">VÉ XEM PHIM ĐIỆN TỬ</div>
        </div>

        <!-- Content -->
        <div style="padding:36px 40px;">
          <p style="color:#aaa;font-size:15px;margin:0 0 24px;">Xin chào <strong style="color:#fff">${user.name}</strong>,<br>Đặt vé của bạn đã được xác nhận thành công! 🎉</p>

          <!-- Info Grid -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;width:40%">Mã Vé</td><td style="color:#e50914;font-weight:800;font-size:16px;font-family:monospace;letter-spacing:2px;">${booking.bookingCode}</td></tr>
              ${booking.movieTitle ? `<tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Phim</td><td style="color:#fff;font-weight:600;">${booking.movieTitle}</td></tr>` : ''}
              ${booking.cinemaName ? `<tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Rạp</td><td style="color:#fff;">${booking.cinemaName}</td></tr>` : ''}
              ${booking.roomName ? `<tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Phòng</td><td style="color:#fff;">${booking.roomName}</td></tr>` : ''}
              ${showDate ? `<tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Suất chiếu</td><td style="color:#fff;">${showDate}</td></tr>` : ''}
              <tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Ghế</td><td style="color:#fff;font-weight:600;">${seats}</td></tr>
              ${booking.totalPrice !== booking.finalPrice ? `<tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Giá gốc</td><td style="color:#aaa;text-decoration:line-through;">${booking.totalPrice.toLocaleString('vi-VN')}đ</td></tr>` : ''}
              <tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Tổng Tiền</td><td style="color:#4ade80;font-weight:800;font-size:18px;">${booking.finalPrice.toLocaleString('vi-VN')}đ</td></tr>
            </table>
          </div>

          <!-- QR Code -->
          ${booking.qrCode ? `
          <div style="text-align:center;padding:28px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.15);border-radius:12px;">
            <div style="color:#888;font-size:12px;letter-spacing:2px;margin-bottom:16px;text-transform:uppercase;">Xuất Trình QR Tại Rạp</div>
            <img src="${booking.qrCode}" alt="QR Code" style="width:180px;height:180px;border-radius:8px;background:#fff;padding:8px;"/>
            <div style="color:#555;font-size:11px;margin-top:12px;">Quét mã này tại quầy vé để nhận vé</div>
          </div>
          ` : ''}

          <p style="color:#555;font-size:12px;text-align:center;margin-top:24px;">Email này được gửi tự động từ CinemaHub. Vui lòng không trả lời.</p>
        </div>

      </div>
    </div>`;
  },
  resetPassword: ({ name, resetUrl }) => `
    <h2>Đặt lại mật khẩu</h2>
    <p>Xin chào ${name},</p>
    <p><a href="${resetUrl}">Nhấn vào đây để đặt lại mật khẩu</a></p>
    <p>Link có hiệu lực trong 10 phút.</p>
  `,
  reviewNotification: ({ userName, movieTitle, rating, comment }) => `
    <h2>🎬 Đánh giá mới cho phim "${movieTitle}"</h2>
    <p><strong>Người đánh giá:</strong> ${userName}</p>
    <p><strong>Điểm:</strong> ⭐ ${rating}/10</p>
    <p><strong>Nhận xét:</strong> ${comment || '(Không có nhận xét)'}</p>
    <p style="color:#888;font-size:12px">Email này được gửi tự động từ CinemaHub.</p>
  `,
  reminder: ({ booking, user }) => {
    const seats = booking.tickets?.map(t => t.seatLabel).join(', ') || 'N/A';
    const showDate = booking.showstartTime
      ? new Date(booking.showstartTime).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' })
      : '';
    return `
    <div style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#111118;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#facc15,#eab308);padding:32px 40px;text-align:center;">
          <div style="font-size:24px;font-weight:900;color:#000;letter-spacing:1px;">NHẮC NHỞ XEM PHIM</div>
        </div>

        <!-- Content -->
        <div style="padding:36px 40px;">
          <p style="color:#aaa;font-size:15px;margin:0 0 24px;">Chào <strong style="color:#fff">${user?.name || 'Khách hàng'}</strong>,<br>Chỉ còn chưa đầy 2 tiếng nữa là đến suất chiếu của bạn rồi!</p>

          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              ${booking.movieTitle ? `<tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;width:40%">Phim</td><td style="color:#fff;font-weight:600;">${booking.movieTitle}</td></tr>` : ''}
              ${booking.cinemaName ? `<tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Rạp</td><td style="color:#fff;">${booking.cinemaName}</td></tr>` : ''}
              ${booking.roomName ? `<tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Phòng</td><td style="color:#fff;">${booking.roomName}</td></tr>` : ''}
              ${showDate ? `<tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Suất chiếu</td><td style="color:#facc15;font-weight:bold;">${showDate}</td></tr>` : ''}
              <tr><td style="color:#666;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;">Ghế</td><td style="color:#fff;font-weight:600;">${seats}</td></tr>
            </table>
          </div>

          <p style="color:#aaa;font-size:14px;text-align:center;line-height:1.5;">Vui lòng đến rạp trước 15 phút để lấy vé nhé. Chúc bạn có một buổi xem phim vui vẻ! 🍿</p>
        </div>
      </div>
    </div>`;
  }
};

/**
 * Gửi email sử dụng template
 * @param {{ to: string, subject: string, template: string, data: object }} options
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to, subject, template, data, html: customHtml }) => {
  const html = templates[template]?.(data) ?? customHtml ?? '';
  try {
    await transporter.sendMail({
      from: `"CineBooking" <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
  } catch (error) {
    console.error("Lỗi gửi email:", error);
  }
};
