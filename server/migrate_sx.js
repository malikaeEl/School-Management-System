import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for migration...');

        const oldGrade = '1ère année S.Ex';
        const newGrade = '1ère année S.X';

        const result = await User.updateMany(
            { grade: oldGrade },
            { $set: { grade: newGrade } }
        );

        console.log(`Migration complete!`);
        console.log(`Matching documents: ${result.matchedCount}`);
        console.log(`Modified documents: ${result.modifiedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
