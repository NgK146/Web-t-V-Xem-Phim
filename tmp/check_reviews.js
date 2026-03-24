import mongoose from 'mongoose';
import Review from './backend/src/models/Review.js';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/movie_booking';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const count = await Review.countDocuments();
    console.log('Total reviews:', count);
    
    const latest = await Review.findOne().sort({ createdAt: -1 }).populate('user', 'name').populate('movie', 'title');
    if (latest) {
      console.log('Latest review:');
      console.log(`- User: ${latest.user?.name}`);
      console.log(`- Movie: ${latest.movie?.title}`);
      console.log(`- Rating: ${latest.rating}`);
      console.log(`- Comment: ${latest.comment}`);
    } else {
      console.log('No reviews found');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
