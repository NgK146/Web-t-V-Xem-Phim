import { PayOS } from '@payos/node';

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

export const createPayOSPaymentLink = async ({ orderCode, amount, bookingId, cancelUrl, returnUrl }) => {
  const body = {
    orderCode: Number(orderCode),
    amount: Math.round(amount),
    description: `Ve ${bookingId}`.substring(0, 25), // max 25 chars for PayOS
    cancelUrl,
    returnUrl
  };
  return await payos.paymentRequests.create(body);
};

export const verifyPayOSWebhookData = (webhookBody) => {
  return payos.webhooks.verify(webhookBody);
};

export const getPayOSPaymentStatus = async (orderCode) => {
  return await payos.paymentRequests.get(Number(orderCode));
};