import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const email = 'admin@atlas.academy';
    const password = 'AtlasAdmin2024!';

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found!');
      process.exit(1);
    }

    console.log('User found:', user.email);
    console.log('Stored Hashed Password:', user.password);

    const isMatch = await user.comparePassword(password);
    console.log('Password Match Result:', isMatch);

    if (isMatch) {
      console.log('Login simulation SUCCESSFUL');
    } else {
      console.log('Login simulation FAILED');
    }

    process.exit(0);
  } catch (err) {
    console.error('Fatal:', err);
    process.exit(1);
  }
}

testLogin();
