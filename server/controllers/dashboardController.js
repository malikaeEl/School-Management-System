import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Exam from '../models/Exam.js';
import Attendance from '../models/Attendance.js';
import Timetable from '../models/Timetable.js';

export const getDashboardData = async (req, res) => {
  try {
    const role = req.user.role;
    let data = {};

    if (role === 'admin') {
      const [students, teachers, parents, subjects] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'teacher' }),
        User.countDocuments({ role: 'parent' }),
        Subject.countDocuments()
      ]);
      data = {
        stats: {
          students,
          teachers,
          parents,
          subjects
        }
      };
    } 
    else if (role === 'teacher') {
      const subjects = await Subject.find({ teacher: req.user._id });
      const subjectIds = subjects.map(s => s._id);
      const grades = [...new Set(subjects.map(s => s.grade))];
      
      const [studentsCount, timetable] = await Promise.all([
        User.countDocuments({ role: 'student', grade: { $in: grades } }),
        Timetable.find({ subject: { $in: subjectIds } }).populate('subject', 'name')
      ]);
      
      data = { 
        profile: req.user,
        subjects, 
        studentsCount, 
        timetable 
      };
    }
    else if (role === 'student') {
      const mySubjects = await Subject.find({ grade: req.user.grade }).populate('teacher', 'firstName lastName');
      const subjectIds = mySubjects.map(s => s._id);
      
      const [exams, attendance, timetable] = await Promise.all([
        Exam.find({ grade: req.user.grade }).populate('subject', 'name'),
        Attendance.find({ 'students.student': req.user._id }).populate('subject', 'name').sort({ date: -1 }).limit(5),
        Timetable.find({ subject: { $in: subjectIds } }).populate('subject', 'name')
      ]);

      data = { 
        profile: req.user,
        subjects: mySubjects, 
        exams, 
        attendance, 
        timetable 
      };
    }
    else if (role === 'parent') {
      const children = await User.find({ parentId: req.user._id }).select('-password');
      const childrenReports = await Promise.all(children.map(async (child) => {
          const subjects = await Subject.find({ grade: child.grade }).populate('teacher', 'firstName lastName');
          const subjectIds = subjects.map(s => s._id);
          const attendance = await Attendance.find({ 'students.student': child._id }).populate('subject', 'name').sort({ date: -1 }).limit(5);
          const exams = await Exam.find({ grade: child.grade }).populate('subject', 'name');
          
          return { 
            _id: child._id,
            firstName: child.firstName,
            lastName: child.lastName,
            grade: child.grade,
            subjects, 
            attendance,
            exams
          };
      }));
      data = { 
        profile: req.user,
        children: childrenReports 
      };
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
