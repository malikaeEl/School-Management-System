import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    let admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('No admin found, creating one...');
      admin = new User({
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin@atlasacademy.com',
        role: 'admin',
        password: 'password123',
        isActive: true
      });
      await admin.save();
      console.log('Created new admin!');
    } else {
      console.log('Admin found: ' + admin.email);
      admin.password = 'password123';
      await admin.save();
      console.log('Reset admin password to password123');
    }

    console.log('-----------------------------------');
    console.log('Email: ' + admin.email);
    console.log('Password: password123');
    console.log('-----------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Fatal:', err);
    process.exit(1);
  }
}

resetAdmin();
