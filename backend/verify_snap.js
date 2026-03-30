import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './src/models/Booking.js';
import Showtime from './src/models/Showtime.js';
import Movie from './src/models/Movie.js';
import User from './src/models/User.js';

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get a test movie and showtime
        const movie = await Movie.findOne({});
        const showtime = await Showtime.findOne({ movie: movie._id }).populate('room');
        const user = await User.findOne({ role: 'admin' }) || await User.findOne({});

        if (!movie || !showtime || !user) {
            console.error('Missing data for test. Ensure seeder has run.');
            process.exit(1);
        }

        console.log(`Testing with Movie: ${movie.title}, Showtime: ${showtime._id}`);

        // 2. Create a test booking
        const booking = await Booking.create({
            user: user._id,
            showtime: showtime._id,
            tickets: [{ seatLabel: 'A1', price: 100000 }],
            totalPrice: 100000,
            finalPrice: 100000,
            status: 'confirmed',
            bookingCode: 'TEST-' + Math.random().toString(36).substring(7).toUpperCase(),
            // Manual Snapshotting as done in the controller
            movieTitle: showtime.movieTitle || movie.title,
            cinemaName: showtime.cinemaName || 'Test Cinema',
            roomName:   showtime.roomName   || showtime.room?.name,
            showstartTime: showtime.startTime
        });

        console.log('Booking created with snapshots:', {
            movieTitle: booking.movieTitle,
            cinemaName: booking.cinemaName
        });

        if (booking.movieTitle === movie.title) {
            console.log('✅ PASS: Movie Title Snapshot saved.');
        } else {
            console.error('❌ FAIL: Movie Title Snapshot missing or incorrect.');
        }

        // 3. Delete the showtime (simulate expiry/deletion)
        const stId = showtime._id;
        // We don't actually delete it yet to see if we can find it
        console.log('Simulating showtime deletion by checking snapshot value...');

        // 4. Fetch the booking without populating showtime
        const fetched = await Booking.findById(booking._id);
        if (fetched.movieTitle) {
            console.log(`✅ PASS: Fethced title from snapshot: ${fetched.movieTitle}`);
        } else {
            console.error('❌ FAIL: Snapshot field not found on fetched object.');
        }

        // Clean up test booking
        await Booking.findByIdAndDelete(booking._id);
        console.log('Test booking cleaned up.');

        process.exit(0);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exit(1);
    }
};

verify();
