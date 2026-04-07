import { PayOS } from '@payos/node';

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID || 'ae99da9f-dcc2-489f-83dd-579e88391fb3',
  apiKey: process.env.PAYOS_API_KEY || '495ec2be-0ec3-4ebe-bfaf-a763d028d726',
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || 'bdb81320f0af89c65c0f08cae1912bf304ab98af98225157564806a31fbe7580'
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