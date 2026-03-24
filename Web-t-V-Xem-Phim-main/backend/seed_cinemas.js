import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from './src/config/db.js';
import Movie from './src/models/Movie.js';
import Cinema from './src/models/Cinema.js';
import Room from './src/models/Room.js';
import Showtime from './src/models/Showtime.js';

const cinemasData = [
  { name: 'CGV Vincom Bà Triệu', address: '191 Bà Triệu, Hai Bà Trưng', city: 'Hà Nội' },
  { name: 'CGV Aeon Mall Long Biên', address: '27 Cổ Linh, Long Biên', city: 'Hà Nội' },
  { name: 'Lotte Cinema Landmark', address: 'Tầng 5 Keangnam, Nam Từ Liêm', city: 'Hà Nội' },
  { name: 'BHD Star Phạm Ngọc Thạch', address: 'Tầng 8 Vincom Phạm Ngọc Thạch', city: 'Hà Nội' },
  { name: 'CGV Sư Vạn Hạnh', address: '11 Sư Vạn Hạnh, Quận 10', city: 'Hồ Chí Minh' },
  { name: 'Galaxy Nguyễn Du', address: '116 Nguyễn Du, Quận 1', city: 'Hồ Chí Minh' }
];

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
    console.log('Clearing old cinemas and rooms (except the ones with bookings)...');
    
    // Create Cinemas
    const cinemas = [];
    for (const data of cinemasData) {
      // Check if exists
      let cinema = await Cinema.findOne({ name: data.name });
      if (!cinema) {
        cinema = await Cinema.create(data);
      }
      cinemas.push(cinema);
    }
    console.log(`Ensured ${cinemas.length} cinemas exist.`);

    // Create Rooms for each cinema
    const allRooms = [];
    for (let i = 0; i < cinemas.length; i++) {
      const cinema = cinemas[i];
      
      // Check if this cinema already has rooms
      const existingRooms = await Room.find({ cinema: cinema._id });
      if (existingRooms.length === 0) {
        // Add 3 rooms per cinema (2 small, 1 large)
        const room1 = await Room.create({
          cinema: cinema._id,
          name: 'Phòng 01 (2D)',
          type: '2D',
          totalSeats: smallRoomSeats.length,
          seats: smallRoomSeats
        });
        const room2 = await Room.create({
          cinema: cinema._id,
          name: 'Phòng 02 (3D)',
          type: '3D',
          totalSeats: smallRoomSeats.length,
          seats: smallRoomSeats
        });
        const room3 = await Room.create({
          cinema: cinema._id,
          name: 'Phòng 03 (IMAX)',
          type: 'IMAX',
          totalSeats: largeRoomSeats.length,
          seats: largeRoomSeats
        });
        allRooms.push(room1, room2, room3);
      } else {
        allRooms.push(...existingRooms);
      }
    }
    console.log(`Ensured ${allRooms.length} rooms exist for those cinemas.`);

    // Add Showtimes for all movies!
    const movies = await Movie.find({ status: { $in: ['now_showing', 'coming_soon'] } });
    if (movies.length > 0 && allRooms.length > 0) {
      console.log(`Generating random showtimes for ${movies.length} movies...`);
      let count = 0;
      
      for (const movie of movies) {
        // Just pick 2 random rooms for each movie to generate showtimes
        const roomIdx1 = Math.floor(Math.random() * allRooms.length);
        const roomIdx2 = (roomIdx1 + 1) % allRooms.length;
        
        const selectedRooms = [allRooms[roomIdx1], allRooms[roomIdx2]];
        
        for (const room of selectedRooms) {
          // Check if showtimes already exist
          const existingShowtimes = await Showtime.countDocuments({ movie: movie._id, room: room._id });
          if (existingShowtimes > 0) continue;

          // Create 1-2 showtimes for tomorrow
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(18, 0, 0, 0); // 6 PM
          
          const endTime = new Date(tomorrow);
          endTime.setHours(endTime.getHours() + 2);

          const showtimeSeats = room.seats.map(s => ({
            seat: s._id,
            status: 'available',
            price: s.type === 'vip' ? 100000 : (s.type === 'couple' ? 150000 : 80000)
          }));

          await Showtime.create({
            movie: movie._id,
            room: room._id,
            startTime: tomorrow,
            endTime: endTime,
            basePrice: 80000,
            seats: showtimeSeats,
            status: 'scheduled'
          });
          count++;
        }
      }
      console.log(`Created ${count} new showtimes.`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
