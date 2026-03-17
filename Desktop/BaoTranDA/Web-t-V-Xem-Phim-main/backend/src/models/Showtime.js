import mongoose from 'mongoose';

const showtimeSeatSchema = new mongoose.Schema({
  seat:   { type: mongoose.Schema.Types.ObjectId },
  status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
  lockedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lockedAt:  { type: Date },
  price:     { type: Number, required: true },
}, { _id: false });

const showtimeSchema = new mongoose.Schema({
  movie:     { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  room:      { type: mongoose.Schema.Types.ObjectId, ref: 'Room',  required: true },
  startTime: { type: Date, required: true },
  endTime:   { type: Date, required: true },
  basePrice: { type: Number, required: true },
  seats:     [showtimeSeatSchema],
  status:    { type: String, enum: ['scheduled', 'ongoing', 'ended', 'cancelled'], default: 'scheduled' },
}, { timestamps: true });

showtimeSchema.index({ movie: 1, startTime: 1 });
showtimeSchema.index({ room: 1, startTime: 1 });

export default mongoose.model('Showtime', showtimeSchema);
