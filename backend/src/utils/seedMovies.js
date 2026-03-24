import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const movies = [
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
    poster: 'https://image.tmdb.org/t/p/original/8uO0Bbx9jhmS0qQ9Dworkspaceh0.jpg',
    genre: ['Hành động', 'Viễn tưởng'],
    duration: 166,
    releaseDate: new Date('2024-03-01'),
    status: 'now_showing',
    rated: 'T13'
  },
  {
    title: 'Kung Fu Panda 4',
    description: 'After Po is tapped to become the Spiritual Leader of the Valley of Peace, he needs to find and train a new Dragon Warrior.',
    poster: 'https://image.tmdb.org/t/p/original/kDp1vUBnM08R1SKyD1R36p3ofE9.jpg',
    genre: ['Hoạt hình', 'Hài hước'],
    duration: 94,
    releaseDate: new Date('2024-03-08'),
    status: 'now_showing',
    rated: 'P'
  },
  {
    title: 'Godzilla x Kong: The New Empire',
    description: 'Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins.',
    poster: 'https://image.tmdb.org/t/p/original/tMefBv7RtmYpSfsTSO9AbvZOS0N.jpg',
    genre: ['Hành động', 'Phiêu lưu'],
    duration: 115,
    releaseDate: new Date('2024-03-29'),
    status: 'coming_soon',
    rated: 'K'
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/movie_booking';
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    
    // Force seed: clear collection first
    console.log('Clearing existing movies...');
    await Movie.deleteMany({});
    
    await Movie.insertMany(movies);
    console.log('Seeded 3 movies successfully!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
