import 'dotenv/config';
import httpServer from './src/app.js';
import connectDB from './src/config/db.js';
console.log('ENV:', process.env.MONGO_URI)

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
