import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const fixIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    try {
        await User.collection.dropIndex('email_1');
        console.log('Dropped old email_1 index correctly!');
    } catch (e) {
        if (e.codeName === 'IndexNotFound') {
            console.log('Index email_1 not found, continuing...');
        } else {
            throw e;
        }
    }

    await User.syncIndexes();
    console.log('Synced indexes successfully! The sparse unique index is now active.');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing index:', err);
    process.exit(1);
  }
};

fixIndex();
