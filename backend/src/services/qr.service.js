import QRCode from 'qrcode';

/**
 * Tạo QR code dạng base64 từ booking code
 * @param {string} bookingCode
 * @returns {Promise<string>} Base64 data URL
 */
export const generateQRCode = async (bookingCode) => {
  return QRCode.toDataURL(bookingCode, {
    errorCorrectionLevel: 'H',
    width: 300,
    margin: 2,
  });
};
