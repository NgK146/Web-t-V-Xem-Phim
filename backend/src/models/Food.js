import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Tên món/combo là bắt buộc'] },
  description: { type: String },
  price: { type: Number, required: [true, 'Giá tiền là bắt buộc'], min: 0 },
  image: { type: String }, // Cloudinary URL
  type: { 
    type: String, 
    enum: ['combo', 'snack', 'drink'], 
    default: 'combo' 
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Food', foodSchema);
