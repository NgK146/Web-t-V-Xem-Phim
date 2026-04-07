import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Movie from './src/models/Movie.js';
import Cinema from './src/models/Cinema.js';
import Room from './src/models/Room.js';
import Showtime from './src/models/Showtime.js';
import Discount from './src/models/Discount.js';
import { adminData, moviesData, cinemasData, discountsData } from './src/data/mockData.js';

const generateSeats = (rowsConfig) => {
  const seats = [];
  for (const { row, count, type } of rowsConfig) {
    for (let i = 1; i <= count; i++) {
      seats.push({ row, number: i, type, isActive: true });
    }
  }
  return seats;
};

// Sơ đồ phòng nhỏ (5 x 10)
const smallRoomSeats = generateSeats([
  { row: 'A', count: 10, type: 'standard' },
  { row: 'B', count: 10, type: 'standard' },
  { row: 'C', count: 10, type: 'standard' },
  { row: 'D', count: 10, type: 'vip' },
  { row: 'E', count: 10, type: 'couple' },
]);

// Sơ đồ phòng lớn (8 x 14)
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

const seed = async () => {
  try {
    await connectDB();
    console.log('Seeding database with consolidated mock data...');

    // 1. Create Admin User
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (!existingAdmin) {
      await User.create(adminData);
      console.log(`Admin user created: ${adminData.email} / ${adminData.password}`);
    } else {
      console.log('Admin user already exists.');
    }

    // 2. Create Movies
    const movies = [];
    for (const data of moviesData) {
      let movie = await Movie.findOne({ title: data.title });
      if (!movie) {
        movie = await Movie.create(data);
      }
      movies.push(movie);
    }
    console.log(`Ensured movies exist.`);

    // 3. Create Cinemas and Rooms
    const cinemas = [];
    for (const data of cinemasData) {
      let cinema = await Cinema.findOne({ name: data.name });
      if (!cinema) {
        cinema = await Cinema.create(data);
      }
      cinemas.push(cinema);
    }
    console.log(`Ensured cinemas exist.`);

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
    console.log(`Ensured rooms exist.`);

    // 4. Create Showtimes
    const nowShowingMovies = await Movie.find({ status: 'now_showing' });
    let shCount = 0;
    for (const movie of nowShowingMovies) {
      for (let i = 0; i < 3; i++) {
        const room = allRooms[Math.floor(Math.random() * allRooms.length)];
        const dayOffset = i === 0 ? 0 : 1; 
        const start = new Date();
        start.setDate(start.getDate() + dayOffset);
        start.setHours(14 + (i * 3), 0, 0, 0);
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
        shCount++;
      }
    }
    console.log(`Created ${shCount} showtimes.`);

    // 5. Create Discounts
    for (const disc of discountsData) {
      const exists = await Discount.findOne({ code: disc.code });
      if (!exists) {
        await Discount.create(disc);
        console.log(`Discount code created: ${disc.code}`);
      }
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seed();
