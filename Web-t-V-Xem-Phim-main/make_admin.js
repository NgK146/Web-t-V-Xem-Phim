import mongoose from 'mongoose';
import User from './backend/src/models/User.js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOneAndUpdate(
      { email: 'duy@example.com' },
      { role: 'admin' },
      { new: true }
    );
    console.log('User updated:', user ? user.role : 'Not found');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
makeAdmin();
