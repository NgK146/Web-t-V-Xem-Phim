import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './backend/src/models/Booking.js';
import Showtime from './backend/src/models/Showtime.js';

dotenv.config({ path: './backend/.env' });

const cleanup = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for cleanup');

        // 1. Delete all bookings
        const bResult = await Booking.deleteMany({});
        console.log(`Deleted ${bResult.deletedCount} bookings.`);

        // 2. Reset all showtime seats to available
        const showtimes = await Showtime.find({});
        for (const st of showtimes) {
            st.seats.forEach(s => {
                s.status = 'available';
                s.lockedBy = undefined;
                s.lockedAt = undefined;
            });
            await st.save();
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
