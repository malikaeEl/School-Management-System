import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Subject from './models/Subject.js';
import Timetable from './models/Timetable.js';
import Attendance from './models/Attendance.js';

dotenv.config();

const lastNames = ['Berrada', 'Benjelloun', 'El Fassi', 'Tazi', 'Alaoui', 'Bennani', 'Chraibi', 'Lahlou', 'Guessous', 'Kabbaj', 'Sefrioui', 'Bouabid', 'Mansouri', 'Zniber'];
const firstNamesM = ['Youssef', 'Omar', 'Mehdi', 'Karim', 'Amine', 'Hamza', 'Yassine', 'Ali', 'Hassan', 'Bilal', 'Anas', 'Ilyas'];
const firstNamesF = ['Fatima', 'Kenza', 'Salma', 'Zineb', 'Sara', 'Meryem', 'Hajar', 'Imane', 'Rania', 'Sofia', 'Nada', 'Aya'];

const getRandomElem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomFirstName = () => Math.random() > 0.5 ? getRandomElem(firstNamesM) : getRandomElem(firstNamesF);

const cycles = {
  primaire: {
    levels: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    subjects: ['Arabe', 'Français', 'Maths']
  },
  college: {
    levels: ['1ère année collège', '2ème année collège', '3ème année collège'],
    subjects: ['Arabe', 'Francais', 'Anglais', 'Histoire geo', 'Edication Islamique', 'Maths']
  },
  lycee: {
    levels: ['T.C', '1ère année S.M', '1ère année S.X', '2ème année S.M', '2ème année SVT', '2ème année PC'],
    subjects: ['Arabe', 'Francais', 'Anglais', 'Histoire geo', 'Edication Islamique', 'Maths', 'phylosophie']
  }
};

const allLevels = [...cycles.primaire.levels, ...cycles.college.levels, ...cycles.lycee.levels];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data (except admins)
        console.log('Clearing existing student/teacher/subject/timetable data...');
        await User.deleteMany({ role: { $ne: 'admin' } });
        await Subject.deleteMany({});
        await Timetable.deleteMany({});
        await Attendance.deleteMany({});
        console.log('Cleared existing data (except admins).');

        const password = 'password123';

        // 1. Create Parents
        console.log('Creating 10 parents...');
        const parentDocs = [];
        for (let i = 1; i <= 10; i++) {
            const firstName = getRandomFirstName();
            const lastName = getRandomElem(lastNames);
            parentDocs.push({
                firstName, lastName,
                email: `parent${i}.2025@atlas.com`,
                password,
                role: 'parent',
                phone: `0612${Math.floor(100000 + Math.random() * 900000)}`,
                isActive: true
            });
        }
        const createdParents = await User.create(parentDocs);

        // 2. Create Students (5 per level)
        console.log('Creating 5 students per level...');
        const studentDocs = [];
        for (const level of allLevels) {
            for (let i = 1; i <= 5; i++) {
                const parent = getRandomElem(createdParents);
                const firstName = getRandomFirstName();
                studentDocs.push({
                    firstName,
                    lastName: parent.lastName,
                    email: `${firstName.toLowerCase()}.${parent.lastName.toLowerCase()}.${level.replace(/ /g, '')}.${i}@student.atlas.com`,
                    password,
                    role: 'student',
                    grade: level,
                    parentId: parent._id,
                    isActive: true
                });
            }
        }
        await User.create(studentDocs);
        console.log(`Created ${studentDocs.length} students.`);

        // 3. Create Teachers, Subjects & Timetables
        console.log('Creating teachers and scheduling subjects...');
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const timeSlots = [
            { start: '08:00', end: '10:00' },
            { start: '10:00', end: '12:00' },
            { start: '14:00', end: '16:00' },
            { start: '16:00', end: '17:00' }
        ];

        for (const [cycleKey, cycleInfo] of Object.entries(cycles)) {
            console.log(`Processing ${cycleKey} cycle...`);
            for (const subName of cycleInfo.subjects) {
                // Create 1 teacher per subject per cycle
                const teacher = await User.create({
                    firstName: getRandomFirstName(),
                    lastName: getRandomElem(lastNames),
                    email: `prof.${cycleKey}.${subName.toLowerCase().replace(/[^a-z0-9]/g, '')}@teacher.atlas.com`,
                    password,
                    role: 'teacher',
                    subject: subName,
                    classes: cycleInfo.levels,
                    isActive: true
                });

                // For each level in this cycle, create Subject and Timetable slots
                for (const level of cycleInfo.levels) {
                    // Create Subject document (for progress tracking)
                    await Subject.create({
                        name: subName,
                        teacher: teacher._id,
                        grade: level,
                        progress: Math.floor(Math.random() * 15), // Initial progress
                        status: 'On Track'
                    });

                    // Create 2 timetable slots per week for this subject in this class
                    const usedDays = new Set();
                    for (let k = 0; k < 2; k++) {
                        let day = getRandomElem(days);
                        while(usedDays.has(day)) day = getRandomElem(days);
                        usedDays.add(day);
                        
                        const slot = getRandomElem(timeSlots);
                        await Timetable.create({
                            teacher: teacher._id,
                            grade: level,
                            day,
                            startTime: slot.start,
                            endTime: slot.end,
                            room: `B-${Math.floor(Math.random() * 20) + 1}`
                        });
                    }
                }
            }
        }

        console.log('\n✅ Seeding 2025-2026 data completed successfully!');
        console.log(`- Students: ${studentDocs.length}`);
        console.log(`- Teachers/Subjects created for College & Lycée per request.`);
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Seeding failed:', err);
        process.exit(1);
    }
};

seed();
