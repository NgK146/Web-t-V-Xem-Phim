import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './src/models/Booking.js';
import Showtime from './src/models/Showtime.js';

dotenv.config();

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for cleanup');

        const bResult = await Booking.deleteMany({});
        console.log(`Deleted ${bResult.deletedCount} bookings.`);

        const showtimes = await Showtime.find({});
        for (const st of showtimes) {
            let changed = false;
            st.seats.forEach(s => {
                if (s.status !== 'available') {
                    s.status = 'available';
                    s.lockedBy = undefined;
                    s.lockedAt = undefined;
                    changed = true;
                }
            });
            if (changed) await st.save();
        }
        console.log(`Reset seats for ${showtimes.length} showtimes.`);

        console.log('Cleanup complete!');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
};

cleanup();
