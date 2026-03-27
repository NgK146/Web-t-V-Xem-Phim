import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Cinema from '../models/Cinema.js';
import Room from '../models/Room.js';
import Showtime from '../models/Showtime.js';
import Discount from '../models/Discount.js';
import { adminData, moviesData, cinemasData, discountsData } from '../data/mockData.js';

const generateSeats = (rowsConfig) => {
  const seats = [];
  for (const { row, count, type } of rowsConfig) {
    for (let i = 1; i <= count; i++) {
      seats.push({ row, number: i, type, isActive: true });
    }
  }
  return seats;
};

const smallRoomSeats = generateSeats([
  { row: 'A', count: 10, type: 'standard' },
  { row: 'B', count: 10, type: 'standard' },
  { row: 'C', count: 10, type: 'standard' },
  { row: 'D', count: 10, type: 'vip' },
  { row: 'E', count: 10, type: 'couple' },
]);

const largeRoomSeats = generateSeats([
  { row: 'A', count: 14, type: 'standard' },
  { row: 'B', count: 14, type: 'standard' },
  { row: 'C', count: 14, type: 'standard' },
  { row: 'D', count: 14, type: 'standard' },
  { row: 'E', count: 14, type: 'vip' },
  { row: 'F', count: 14, type: 'vip' },
  { row: 'G', count: 14, type: 'vip' },
  { row: 'H', count: 14, type: 'couple' },
]);

/**
 * Automatically seeds the database with essential data if it doesn't already exist.
 */
export const seedDatabase = async () => {
  try {
    console.log('🚀 Checking database for essential data...');

    // 1. Admin User
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (!existingAdmin) {
      await User.create(adminData);
      console.log(`✅ Admin user created: ${adminData.email}`);
    }

    // 2. Movies
    const movies = [];
    for (const data of moviesData) {
      let movie = await Movie.findOne({ title: data.title });
      if (!movie) {
        movie = await Movie.create(data);
      }
      movies.push(movie);
    }

    // 3. Cinemas and Rooms
    const cinemas = [];
    for (const data of cinemasData) {
      let cinema = await Cinema.findOne({ name: data.name });
      if (!cinema) {
        cinema = await Cinema.create(data);
      }
      cinemas.push(cinema);
    }

    const allRooms = [];
    for (const cinema of cinemas) {
      let existingRooms = await Room.find({ cinema: cinema._id });
      if (existingRooms.length === 0) {
        const room1 = await Room.create({
          cinema: cinema._id,
          name: 'Phòng 01 (2D)',
          type: '2D',
          totalSeats: smallRoomSeats.length,
          seats: smallRoomSeats
        });
        const room2 = await Room.create({
          cinema: cinema._id,
          name: 'Phòng 02 (IMAX)',
          type: 'IMAX',
          totalSeats: largeRoomSeats.length,
          seats: largeRoomSeats
        });
        allRooms.push(room1, room2);
      } else {
        allRooms.push(...existingRooms);
      }
    }

    // 4. Showtimes (Re-seed to ensure display fields are populated)
    await Showtime.deleteMany({}); // Clear to refresh with readable fields
    const nowShowingMovies = await Movie.find({ status: 'now_showing' });
    for (const movie of nowShowingMovies) {
      const room = allRooms[Math.floor(Math.random() * allRooms.length)];
      const start = new Date();
      start.setDate(start.getDate() + 1);
      start.setHours(19, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + movie.duration + 30);

      await Showtime.create({
        movie: movie._id,
        room: room._id,
        startTime: start,
        endTime: end,
        basePrice: 90000,
        seats: room.seats.map(s => ({
          seat: s._id,
          status: 'available',
          price: s.type === 'vip' ? 120000 : (s.type === 'couple' ? 180000 : 90000)
        })),
        status: 'scheduled'
      });
    }
    console.log('✅ Readable showtimes generated.');

    // 5. Discount codes
    for (const disc of discountsData) {
        const exists = await Discount.findOne({ code: disc.code });
        if (!exists) {
            await Discount.create(disc);
            console.log(`✅ Discount code ${disc.code} ensured.`);
        }
    }

    console.log('✨ Database seeding check completed.');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  }
};
