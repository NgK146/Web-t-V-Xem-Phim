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
  bookingConfirm: ({ booking, user }) => `
    <h2>Xác nhận đặt vé thành công</h2>
    <p>Xin chào ${user.name},</p>
    <p>Mã đặt vé của bạn: <strong>${booking.bookingCode}</strong></p>
    <p>Số ghế: ${booking.tickets.map(t => t.seatLabel).join(', ')}</p>
    <p>Tổng tiền: ${booking.finalPrice.toLocaleString('vi-VN')}đ</p>
    <img src="${booking.qrCode}" alt="QR Code" style="width:200px"/>
  `,
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
};

/**
 * Gửi email sử dụng template
 * @param {{ to: string, subject: string, template: string, data: object }} options
 * @returns {Promise<void>}
 */
export const sendEmail = async ({ to, subject, template, data }) => {
  const html = templates[template]?.(data) ?? '';
  await transporter.sendMail({
    from: `"CinemaHub" <${process.env.EMAIL_USER}>`,
    to, subject, html,
  });
};
