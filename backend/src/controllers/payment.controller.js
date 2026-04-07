const paymentService = require('../services/payment.service');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// POST /api/payment/stripe/create-intent
exports.createStripeIntent = async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  const result = await paymentService.createStripePaymentIntent({
    amount: booking.totalPrice,
    bookingId,
    userId: req.user._id,
  });
  res.json(result);
};

// POST /api/payment/stripe/webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = paymentService.confirmStripeWebhook(req.rawBody, sig);

  if (event.type === 'payment_intent.succeeded') {
    const { bookingId } = event.data.object.metadata;
    await Booking.findByIdAndUpdate(bookingId, { status: 'confirmed' });
    await Payment.create({ booking: bookingId, method: 'stripe', status: 'success' });
  }
  res.json({ received: true });
};

// POST /api/payment/vnpay/create-url
exports.createVNPayUrl = async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const url = paymentService.createVNPayUrl({
    amount: booking.totalPrice,
    bookingId: booking._id.toString(),
    ipAddr,
  });
  res.json({ paymentUrl: url });
};

// GET /api/payment/vnpay-return
exports.vnpayReturn = async (req, res) => {
  const result = paymentService.verifyVNPayReturn({ ...req.query });
  if (result.isValid && result.isSuccess) {
    const bookingId = result.data.vnp_TxnRef.split('_')[0];
    await Booking.findByIdAndUpdate(bookingId, { status: 'confirmed' });
    await Payment.create({ booking: bookingId, method: 'vnpay', status: 'success' });
    return res.redirect(`${process.env.FRONTEND_URL}/booking/success?id=${bookingId}`);
  }
  res.redirect(`${process.env.FRONTEND_URL}/booking/failed`);
};