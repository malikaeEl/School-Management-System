import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@atlas.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('Admin already exists! Resetting password to: admin123');
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      console.log('Admin password reset. Email: admin@atlas.com, Password: admin123');
    } else {
      console.log('Creating new admin user...');
      await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email,
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('Admin created successfully! Email: admin@atlas.com, Password: admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error connecting to DB or creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
