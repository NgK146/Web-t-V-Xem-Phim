import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import User from './src/models/User.js';
import { updateMembership } from './src/services/loyalty.service.js';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find();
        console.log(`Found ${users.length} users to backfill.`);
        for (const u of users) {
            u.totalAccumulatedPoints = Math.floor((u.totalSpent || 0) / 1000);
            
            // Just in case membership was accidentally dropped because of the old redeem bug
            u.membership = updateMembership(u.totalAccumulatedPoints);
            await u.save();
        }
        console.log('Backfill complete!');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
