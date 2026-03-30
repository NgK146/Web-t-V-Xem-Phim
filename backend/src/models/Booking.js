import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  seat:      { type: mongoose.Schema.Types.ObjectId },
  seatLabel: { type: String }, // "A1", "B5"
  seatType:  { type: String },
  price:     { type: Number },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtime:   { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  tickets:    [ticketSchema],
  totalPrice: { type: Number, required: true },
  discount:   { type: mongoose.Schema.Types.ObjectId, ref: 'Discount' },
  finalPrice: { type: Number, required: true },
  status:     { type: String, enum: ['pending', 'confirmed', 'cancelled', 'refunded'], default: 'pending' },
  // Snapshot fields for history reliability
  movieTitle: { type: String },
  cinemaName: { type: String },
  roomName:   { type: String },
  showstartTime: { type: Date },
  qrCode:     { type: String },
  bookingCode:{ type: String, unique: true },
  cancelledAt:{ type: Date },
  cancelReason:{ type: String },
}, { timestamps: true });

bookingSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
