import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Subject from './models/Subject.js';
import Timetable from './models/Timetable.js';

dotenv.config();

const lastNames = ['Berrada', 'Benjelloun', 'El Fassi', 'Tazi', 'Alaoui', 'Bennani', 'Chraibi', 'Lahlou', 'Guessous', 'Kabbaj', 'Sefrioui', 'Bouabid', 'Mansouri', 'Zniber'];
const firstNamesM = ['Youssef', 'Omar', 'Mehdi', 'Karim', 'Amine', 'Hamza', 'Yassine', 'Ali', 'Hassan', 'Bilal', 'Anas', 'Ilyas'];
const firstNamesF = ['Fatima', 'Kenza', 'Salma', 'Zineb', 'Sara', 'Meryem', 'Hajar', 'Imane', 'Rania', 'Sofia', 'Nada', 'Aya'];

const getRandomElem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomFirstName = () => Math.random() > 0.5 ? getRandomElem(firstNamesM) : getRandomElem(firstNamesF);

const cycles = {
  primaire: {
    levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    matieres: ['Français', 'Arabe', 'Mathématiques']
  },
  college: {
    levels: ['1ère année collège', '2ème année collège', '3ème année collège'],
    matieres: ['Mathématiques', 'Physique-Chimie', 'SVT', 'Histoire-Géo', 'Arabe', 'Français', 'Anglais']
  },
  lycee: {
    levels: ['T.C', '1ère année S.M', '1ère année S.X', '2ème année S.M', '2ème année SVT', '2ème année PC'],
    matieres: ['Mathématiques', 'Physique-Chimie', 'SVT', 'Histoire-Géo', 'Arabe', 'Français', 'Anglais', 'Philosophie']
  }
};

const allGrades = [...cycles.primaire.levels, ...cycles.college.levels, ...cycles.lycee.levels];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({ role: { $ne: 'admin' } });
    await Subject.deleteMany({});
    await Timetable.deleteMany({});
    console.log('Cleared existing non-admin users, subjects, and timetables');

    const defaultPassword = 'password123';

    // 1. Create Teachers per cycle
    const createdTeachers = {}; // map { "primaire_Arabe": UserDoc }
    
    const createCycleTeachers = async (cycleName, levels, matieres) => {
      for (const mat of matieres) {
        const firstName = getRandomFirstName();
        const lastName = getRandomElem(lastNames);
        const t = await User.create({
          firstName,
          lastName,
          email: `prof.${cycleName}.${mat.toLowerCase().replace(/[^a-z0-9]/g, '')}@atlas.com`,
          password: defaultPassword,
          role: 'teacher',
          subject: mat, // Matière field added previously
          classes: levels, // Assign all classes of the cycle to this teacher
          isActive: true
        });
        createdTeachers[`${cycleName}_${mat}`] = t;
      }
    };

    console.log('Creating specific teachers...');
    await createCycleTeachers('primaire', cycles.primaire.levels, cycles.primaire.matieres);
    await createCycleTeachers('college', cycles.college.levels, cycles.college.matieres);
    await createCycleTeachers('lycee', cycles.lycee.levels, cycles.lycee.matieres);
    console.log(`Created 18 special teachers for cycles`);

    // 2. Create 10 Parents
    console.log('Creating parents...');
    const parents = [];
    for (let i = 1; i <= 10; i++) {
        const firstName = getRandomFirstName();
        const lastName = getRandomElem(lastNames);
        parents.push({
            firstName, lastName,
            email: `parent${i}@gmail.com`,
            password: defaultPassword,
            role: 'parent',
            phone: `0612${Math.floor(100000 + Math.random() * 900000)}`,
            isActive: true
        });
    }
    const createdParents = await User.create(parents);

    // 3. Create exactly 12 Students for EVERY class
    console.log('Creating 12 students per class...');
    const students = [];
    let parentIndex = 0;

    for (const grade of allGrades) {
        for (let j = 1; j <= 12; j++) {
            const firstName = getRandomFirstName();
            const parent = createdParents[parentIndex % createdParents.length];
            students.push({
                firstName,
                lastName: parent.lastName,
                email: `${firstName.toLowerCase()}.${parent.lastName.toLowerCase()}${grade.substring(0,2)}${j}@atlas.com`.replace(/ /g, ''),
                password: defaultPassword,
                role: 'student',
                grade: grade,
                parentId: parent._id,
                isActive: true
            });
            parentIndex++;
        }
    }
    await User.create(students);
    
    // 4. Create Subjects and Timetables
    console.log('Generating Subjects & Timetables...');
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const timeSlots = [
      { start: '08:30', end: '10:30' },
      { start: '10:30', end: '12:30' },
      { start: '14:30', end: '16:30' },
      { start: '16:30', end: '18:30' }
    ];

    const generateSubjectsForCycle = async (cycleName, levels, matieres) => {
      for (const grade of levels) {
        for (const mat of matieres) {
          const teacher = createdTeachers[`${cycleName}_${mat}`];
          
          const subjectEntry = await Subject.create({
            name: mat,
            teacher: teacher._id,
            grade: grade,
            progress: Math.floor(Math.random() * 40) + 10,
            status: 'On Track'
          });

          // Create 2 fake timetables for this subject in this class
          const usedDays = new Set();
          for (let k = 0; k < 2; k++) {
             // pick random day not used
             let day = getRandomElem(days);
             while (usedDays.has(day)) day = getRandomElem(days);
             usedDays.add(day);

             const slot = getRandomElem(timeSlots);
             await Timetable.create({
                subject: subjectEntry._id,
                day: day,
                startTime: slot.start,
                endTime: slot.end,
                room: `Salle ${Math.floor(Math.random() * 20) + 1}`
             });
          }
        }
      }
    };

    await generateSubjectsForCycle('primaire', cycles.primaire.levels, cycles.primaire.matieres);
    await generateSubjectsForCycle('college', cycles.college.levels, cycles.college.matieres);
    await generateSubjectsForCycle('lycee', cycles.lycee.levels, cycles.lycee.matieres);

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
