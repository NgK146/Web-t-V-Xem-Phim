import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema({
  code:         { type: String, required: true, unique: true, uppercase: true },
  type:         { type: String, enum: ['percent', 'fixed'], required: true },
  value:        { type: Number, required: true },
  minOrder:     { type: Number, default: 0 },
  maxDiscount:  { type: Number },
  usageLimit:   { type: Number },
  usedCount:    { type: Number, default: 0 },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Discount', discountSchema);
