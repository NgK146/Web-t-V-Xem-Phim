import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cinema_booking';

const movieSchema = new mongoose.Schema({}, { strict: false });
const Movie = mongoose.model('Movie', movieSchema, 'movies');

async function updateTrailers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Update all movies to have a dummy trailer if they don't have one
    const result = await Movie.updateMany(
      {},
      { $set: { trailer: 'https://www.youtube.com/watch?v=_inKs4eeHiI' } } // Kung Fu Panda 4 trailer URL
    );
    
    console.log(`Updated ${result.modifiedCount} movies.`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateTrailers();
