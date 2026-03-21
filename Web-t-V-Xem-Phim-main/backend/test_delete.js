// Test script to delete a movie
import mongoose from 'mongoose';
import Movie from './src/models/Movie.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function testDelete() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // Find a movie inserted by seedMovies.js
    const movies = await Movie.find({});
    if (movies.length === 0) {
      console.log('No movies found to delete.');
      process.exit(0);
    }
    const movieToDelete = movies[0];
    console.log('Attempting to delete movie:', movieToDelete._id, movieToDelete.title);

    // Call the same mongoose method used in deleteMovie
    const result = await Movie.findByIdAndDelete(movieToDelete._id);
    console.log('Deletion result:', result !== null);

    // Check if the movie is really deleted
    const countAfter = await Movie.countDocuments({ _id: movieToDelete._id });
    console.log('Movie count in DB after deletion:', countAfter);

    process.exit(0);
  } catch (err) {
    console.error('Error during deletion test:', err);
    process.exit(1);
  }
}

testDelete();
