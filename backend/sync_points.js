import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './src/models/User.js';
import Booking from './src/models/Booking.js';
import PointHistory from './src/models/PointHistory.js';
import { earnPoints } from './src/services/loyalty.service.js';

const syncPoints = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const bookings = await Booking.find({ status: 'confirmed' });
        console.log(`Found ${bookings.length} confirmed bookings.`);

        let syncedCount = 0;
        for (const booking of bookings) {
            if (booking.user) {
                const user = await User.findById(booking.user);
                if (user) {
                    const identifier = booking.bookingCode || booking.orderCode.toString();
                    // Custom check logic since the description may differ
                    // "Thanh toán mã vé X" or something like that.
                    const existingHistory = await PointHistory.findOne({
                        user: user._id, 
                        type: 'EARN',
                        description: { $regex: identifier, $options: 'i' }
                    });

                    if (!existingHistory) {
                        console.log(`Syncing missing points for booking ${identifier}`);
                        await earnPoints(user, booking.finalPrice || booking.totalPrice, `Thanh toán mã vé ${identifier} (Đồng bộ bổ sung)`);
                        syncedCount++;
                    }
                }
            }
        }
        
        console.log(`Synced missing points for ${syncedCount} bookings.`);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
syncPoints();
