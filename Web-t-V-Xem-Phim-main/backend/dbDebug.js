import 'dotenv/config';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

async function test() {
  try {
    await connectDB();
    const user = new User({
      name: 'Debug',
      email: 'debug2@example.com',
      password: 'password123'
    });
    await user.save({ validateBeforeSave: false });
    console.log("Success");
  } catch (err) {
    console.error("DB Error:", err);
  }
  process.exit();
}
test();
