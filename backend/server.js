import 'dotenv/config';

import httpServer from './src/app.js';
import connectDB from './src/config/db.js';
import { seedDatabase } from './src/utils/seeder.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedDatabase();
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
