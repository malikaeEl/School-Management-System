import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedRoles = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // 1. Create Teacher
    const teacherData = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'teacher@atlas.academy',
      password: 'Teacher2024!',
      role: 'teacher',
      grade: 'N/A'
    };

    // 2. Create Parent
    const parentData = {
      firstName: 'Marie',
      lastName: 'Curie',
      email: 'parent@atlas.academy',
      password: 'Parent2024!',
      role: 'parent',
      grade: 'N/A'
    };

    // Check if they exist
    let teacher = await User.findOne({ email: teacherData.email });
    if (!teacher) {
      teacher = await User.create(teacherData);
      console.log('✓ Teacher account created');
    } else {
      console.log('! Teacher account already exists');
    }

    let parent = await User.findOne({ email: parentData.email });
    if (!parent) {
      parent = await User.create(parentData);
      console.log('✓ Parent account created');
    } else {
      console.log('! Parent account already exists');
    }

    // 3. Create Student (linked to Parent)
    const studentData = {
      firstName: 'Sofia',
      lastName: 'Curie',
      email: 'student@atlas.academy',
      password: 'Student2024!',
      role: 'student',
      grade: '6ème', // Note: I should use a valid grade from SCHOOL_LEVELS if needed, but the model has '6ème' in some places and the SCHOOL_LEVELS has 'CP' etc.
      parentId: parent._id
    };

    // Let's check SCHOOL_LEVELS in User.js to be sure.
    // In User.js: 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '1ère année collège', '2ème année collège', '3ème année collège'...
    // '6ème' is not in SCHOOL_LEVELS. I'll use '6ème' if it's there or '1ère année collège'.
    // Actually, I'll use 'CP' for now to be safe, or I'll check the list again.
    
    const validGrades = [
      'CP', 'CE1', 'CE2', 'CM1', 'CM2',
      '1ère année collège', '2ème année collège', '3ème année collège',
      'T.C', '1ère année S.M', '1ère année S.Ex',
      '2ème année S.M', '2ème année SVT', '2ème année PC',
      'N/A'
    ];
    
    studentData.grade = validGrades[5]; // '1ère année collège' which is typically 6ème in Morocco.

    let student = await User.findOne({ email: studentData.email });
    if (!student) {
      student = await User.create(studentData);
      console.log('✓ Student account created (linked to Parent)');
    } else {
      console.log('! Student account already exists');
    }

    console.log('-----------------------------------');
    console.log('Teacher: teacher@atlas.academy / Teacher2024!');
    console.log('Parent: parent@atlas.academy / Parent2024!');
    console.log('Student: student@atlas.academy / Student2024!');
    console.log('-----------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Fatal:', error);
    process.exit(1);
  }
};

seedRoles();
