import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Exam from '../models/Exam.js';
import Attendance from '../models/Attendance.js';
import Timetable from '../models/Timetable.js';
import Grade from '../models/Grade.js';
import Transaction from '../models/Transaction.js';
import Borrow from '../models/Borrow.js';
import LeaveRequest from '../models/LeaveRequest.js';

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
      
      // Fallback: If no subjects found in Subject model, use teacher's classes from User model
      const teacherGrades = subjects.length > 0 
        ? [...new Set(subjects.map(s => s.grade))] 
        : (req.user.classes || []);
      
      const [students, timetable, leaveRequests, salaryTransactions] = await Promise.all([
        User.find({ role: 'student', grade: { $in: teacherGrades } }).select('firstName lastName grade email phone avatar'),
        Timetable.find({ teacher: req.user._id }).populate('teacher', 'firstName lastName subject'),
        LeaveRequest.find({ teacher: req.user._id }).sort({ createdAt: -1 }).limit(5),
        Transaction.find({ user: req.user._id, type: 'Salaire' }).sort({ date: -1 }).limit(10)
      ]);
      
      data = { 
        profile: req.user,
        subjects, 
        students,
        studentsCount: students.length, 
        timetable,
        leaveRequests,
        salaryTransactions
      };
    }
    else if (role === 'student') {
      const mySubjects = await Subject.find({ grade: req.user.grade }).populate('teacher', 'firstName lastName');
      const subjectIds = mySubjects.map(s => s._id);
      
      const [exams, attendance, timetable, libraryBorrows] = await Promise.all([
        Exam.find({ grade: req.user.grade }).populate('subject', 'name'),
        Attendance.find({ 'students.student': req.user._id }).populate('subject', 'name').sort({ date: -1 }).limit(5),
        Timetable.find({ grade: req.user.grade }).populate('teacher', 'firstName lastName subject'),
        Borrow.find({ user: req.user._id, status: { $ne: 'Returned' } }).populate('book', 'title author')
      ]);

      data = { 
        profile: req.user,
        subjects: mySubjects, 
        exams, 
        attendance, 
        timetable,
        library: {
          activeBorrows: libraryBorrows.length,
          overdueBorrows: libraryBorrows.filter(b => b.status === 'Overdue').length,
          borrows: libraryBorrows
        }
      };
    }
    else if (role === 'parent') {
      const children = await User.find({ parentId: req.user._id }).select('-password');
      const childrenReports = await Promise.all(children.map(async (child) => {
          const subjects = await Subject.find({ grade: child.grade }).populate('teacher', 'firstName lastName');
          const subjectIds = subjects.map(s => s._id);
          const [attendance, allExams, timetable, libraryBorrows] = await Promise.all([
            Attendance.find({ 'students.student': child._id }).populate('subject', 'name').sort({ date: -1 }).limit(5),
            Exam.find({ grade: child.grade }).populate('subject', 'name'),
            Timetable.find({ grade: child.grade }).populate('teacher', 'firstName lastName subject'),
            Borrow.find({ user: child._id, status: { $ne: 'Returned' } }).populate('book', 'title author')
          ]);
          
          const transactions = await Transaction.find({ user: child._id }).sort({ date: -1 });
          
          // Get grades for this student
          const childGrades = await Grade.find({ student: child._id });
          
          const exams = allExams.map(ex => {
            const gradeDoc = childGrades.find(g => g.exam.toString() === ex._id.toString());
            return {
              ...ex.toObject(),
              score: gradeDoc ? gradeDoc.score : null,
              comments: gradeDoc ? gradeDoc.comments : null
            };
          });
          
          return { 
            _id: child._id,
            firstName: child.firstName,
            lastName: child.lastName,
            grade: child.grade,
            subjects, 
            attendance,
            exams,
            transactions,
            timetable,
            library: {
              activeBorrows: libraryBorrows.length,
              overdueBorrows: libraryBorrows.filter(b => b.status === 'Overdue').length,
              borrows: libraryBorrows
            }
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
