/**
 * One-time admin seed script.
 * Run: node seed-admin.js
 * 
 * Creates the admin account if it doesn't exist yet.
 * Only needs to be run once when setting up the system.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const ADMIN = {
  firstName: 'Administrateur',
  lastName: 'Atlas',
  email: 'admin@atlas.academy',
  password: 'AtlasAdmin2024!',  // Change this after first login!
  role: 'admin',
  grade: 'N/A',
};

console.log('Connecting to database...');
await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected.');

const existing = await User.findOne({ email: ADMIN.email });
if (existing) {
  console.log(`✓ Admin account already exists: ${ADMIN.email}`);
} else {
  await User.create(ADMIN);
  console.log(`✓ Admin account created: ${ADMIN.email}`);
  console.log(`  Password: ${ADMIN.password}`);
  console.log(`  ⚠️  Change this password after your first login!`);
}

await mongoose.disconnect();
console.log('Done.');
