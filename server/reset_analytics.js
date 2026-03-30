import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Analytics from './models/Analytics.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Analytics.deleteMany({});
    console.log('Analytics collection cleared');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
