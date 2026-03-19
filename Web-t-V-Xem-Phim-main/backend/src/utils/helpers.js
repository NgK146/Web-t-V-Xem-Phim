/**
 * Tạo mã đặt vé ngẫu nhiên dạng CH-XXXXXXXX
 * @returns {string}
 */
export const generateBookingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const code = Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `CH-${code}`;
};
