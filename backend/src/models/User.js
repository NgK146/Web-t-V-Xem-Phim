import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String },
  dob: { type: Date },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'staff', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  refreshToken: { type: String, select: false },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isBanned: { type: Boolean, default: false },
  points: { type: Number, default: 0 },
  totalAccumulatedPoints: { type: Number, default: 0 },
  membership: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  totalSpent: { type: Number, default: 0 },
  tier: { type: String, default: 'Member' }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 phút

  return resetToken;
};

export default mongoose.model('User', userSchema);