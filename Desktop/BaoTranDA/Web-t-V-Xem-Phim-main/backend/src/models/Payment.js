import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  booking:       { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount:        { type: Number, required: true },
  method:        { type: String, enum: ['vnpay', 'stripe', 'cash'], required: true },
  status:        { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String },
  paymentData:   { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
