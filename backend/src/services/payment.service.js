const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');

// ==================== STRIPE ====================
const createStripePaymentIntent = async ({ amount, currency = 'usd', bookingId, userId }) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency,
    metadata: { bookingId: bookingId.toString(), userId: userId.toString() },
  });
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

const confirmStripeWebhook = (rawBody, signature) => {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

// ==================== VNPAY ====================
const createVNPayUrl = ({ amount, bookingId, orderInfo, ipAddr }) => {
  const date = moment().format('YYYYMMDDHHmmss');
  const expireDate = moment().add(15, 'minutes').format('YYYYMMDDHHmmss');

  let vnpParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: `${bookingId}_${date}`,
    vnp_OrderInfo: orderInfo || `Thanh toan ve xem phim ${bookingId}`,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100, // VNPay nhân 100
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: date,
    vnp_ExpireDate: expireDate,
  };

  // Sort params alphabetically
  vnpParams = sortObject(vnpParams);
  const signData = querystring.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
  vnpParams['vnp_SecureHash'] = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return `${process.env.VNPAY_URL}?${querystring.stringify(vnpParams, { encode: false })}`;
};

const verifyVNPayReturn = (vnpParams) => {
  const secureHash = vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHashType'];

  const sorted = sortObject(vnpParams);
  const signData = querystring.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac('sha512', process.env.VNPAY_HASH_SECRET);
  const checkHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return {
    isValid: checkHash === secureHash,
    isSuccess: vnpParams['vnp_ResponseCode'] === '00',
    data: vnpParams,
  };
};

const sortObject = (obj) => {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {});
};

module.exports = { createStripePaymentIntent, confirmStripeWebhook, createVNPayUrl, verifyVNPayReturn };