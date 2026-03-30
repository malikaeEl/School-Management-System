import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subject from './models/Subject.js';
import User from './models/User.js';

dotenv.config();

const testProgress = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const subject = await Subject.findOne();
        if (!subject) return console.log('No subject found');
        console.log('Subject found:', subject._id);
        const teacher = await User.findById(subject.teacher);
        console.log('Teacher id:', teacher._id);
        
        console.log('Does teacher string match?', subject.teacher.toString() === teacher._id.toString());
        
        subject.progress = 55;
        await subject.save();
        console.log('Successfully saved subject locally');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
};
testProgress();
