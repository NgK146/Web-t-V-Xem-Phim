import mongoose from 'mongoose';

const cinemaSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  address: { type: String, required: true },
  city:    { type: String, required: true },
  location: {
    address: String,
    lat: Number,
    lng: Number
  },
  phone:   { type: String },
  image:   { type: String },
  isActive:{ type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Cinema', cinemaSchema);
