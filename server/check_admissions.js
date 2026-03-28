import mongoose from 'mongoose';
import Admission from './models/Admission.js';
import dotenv from 'dotenv';
dotenv.config();

const checkAdmissions = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const admissions = await Admission.find().sort({ createdAt: -1 }).limit(5);
  console.log('Recent Admissions:', JSON.stringify(admissions, null, 2));
  process.exit(0);
};

checkAdmissions();
