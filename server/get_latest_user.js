import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function getLatestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).limit(1);
    
    if (users.length > 0) {
      const u = users[0];
      console.log('--- LATEST USER CREATED ---');
      console.log('Nom: ' + u.firstName + ' ' + u.lastName);
      console.log('Email: ' + u.email);
      console.log('Role: ' + u.role);
      console.log('Grade: ' + u.grade);
      console.log('Hashed Password: ' + u.password);
      console.log('Created At: ' + u.createdAt);
    } else {
      console.log('No non-admin users found.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

getLatestUser();
