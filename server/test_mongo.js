import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testConn = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('FAILURE: Could not connect to MongoDB:', err.message);
    process.exit(1);
  }
};

testConn();
