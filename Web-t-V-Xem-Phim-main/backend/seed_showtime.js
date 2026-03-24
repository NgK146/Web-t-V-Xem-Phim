import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from './src/config/db.js';
import Movie from './src/models/Movie.js';
import Cinema from './src/models/Cinema.js';
import Room from './src/models/Room.js';
import Showtime from './src/models/Showtime.js';

const seed = async () => {
  await connectDB();
  
  const movie = await Movie.findOne();
  if (!movie) {
    console.log('No movies found. Please create a movie in the UI first.');
    process.exit(1);
  }
  
  let cinema = await Cinema.findOne();
  if (!cinema) {
    cinema = await Cinema.create({
      name: 'CGV Test Cinema',
      address: '123 Test Street',
      city: 'Hà Nội'
    });
    console.log('Created test cinema.');
  }

  let room = await Room.findOne();
  if (!room) {
    const rows = ['A', 'B', 'C', 'D'];
    const seatsPerRow = 10;
    const generatedSeats = [];
    for (const row of rows) {
      for (let i = 1; i <= seatsPerRow; i++) {
        generatedSeats.push({ row, number: i, type: 'standard', isActive: true });
      }
    }
    
    room = await Room.create({
      cinema: cinema._id,
      name: 'Room 1',
      totalSeats: 40,
      seats: generatedSeats
    });
    console.log('Created test room with 40 seats.');
  }

  // Create a showtime for the movie
  const startTime = new Date();
  startTime.setHours(startTime.getHours() + 2); // 2 hours from now
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + 2); // 4 hours from now
  
  const showtimeSeats = room.seats.map(s => ({
    seat: s._id,
    status: 'available',
    price: 80000
  }));

  const showtime = await Showtime.create({
    movie: movie._id,
    room: room._id,
    startTime,
    endTime,
    basePrice: 80000,
    seats: showtimeSeats,
    status: 'scheduled'
  });
  
  console.log(`Created showtime for movie: ${movie.title} with ${showtimeSeats.length} seats.`);
  process.exit(0);
};

seed().catch(console.error);
