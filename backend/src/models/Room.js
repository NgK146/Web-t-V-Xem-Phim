import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
  row:      { type: String, required: true }, // A, B, C...
  number:   { type: Number, required: true },
  type:     { type: String, enum: ['standard', 'vip', 'couple'], default: 'standard' },
  isActive: { type: Boolean, default: true },
});

const roomSchema = new mongoose.Schema({
  cinema:    { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
  name:      { type: String, required: true },
  type:      { type: String, enum: ['2D', '3D', 'IMAX', '4DX'], default: '2D' },
  totalSeats:{ type: Number, required: true },
  seats:     [seatSchema],
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
