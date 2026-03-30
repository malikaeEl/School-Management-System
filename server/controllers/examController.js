import Exam from '../models/Exam.js';
import Grade from '../models/Grade.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// ── GET /api/exams — list exams ──────────────────────────────────────────
export const getExams = async (req, res) => {
  try {
    const { role, _id, grade: studentGrade } = req.user;
    const { grade } = req.query;
    const filter = {};
    
    // Admin: Full access, optional filter
    if (role === 'admin') {
      if (grade) filter.grade = grade;
    }
    // Teacher: Only their exams or exams for their assigned grades (if queried)
    else if (role === 'teacher') {
      filter.teacher = _id;
      if (grade) filter.grade = grade;
    }
    // Student: Hard filter for their own grade only
    else if (role === 'student') {
      filter.grade = studentGrade;
    }
    // Parent: Filter for all children's grades
    else if (role === 'parent') {
      const children = await User.find({ parentId: _id }).select('grade');
      const childrenGrades = [...new Set(children.map(c => c.grade))];
      filter.grade = { $in: childrenGrades };
    }

    const exams = await Exam.find(filter)
      .populate('subject', 'name')
      .populate('teacher', 'firstName lastName')
      .sort({ date: 1 });
      
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/exams — create exam ─────────────────────────────────────────
export const createExam = async (req, res) => {
  try {
    const { subject, title, date, duration, type, grade } = req.body;
    const exam = await Exam.create({
      subject,
      title,
      date,
      duration,
      type,
      grade,
      teacher: req.user._id
    });

    // Notify students and parents
    const studentsInGrade = await User.find({ role: 'student', grade });
    const notifications = [];
    
    for (const student of studentsInGrade) {
      // Notify Student
      notifications.push({
        recipient: student._id,
        type: 'exam',
        title: 'Nouvel Examen',
        message: `${title} (${type}) programmé pour le ${new Date(date).toLocaleDateString()}.`,
        link: '/exams'
      });
      // Notify Parent if exists
      if (student.parentId) {
        notifications.push({
          recipient: student.parentId,
          type: 'exam',
          title: 'Nouvel Examen (Enfant)',
          message: `Un nouvel examen "${title}" a été programmé pour votre enfant ${student.firstName}.`,
          link: '/exams'
        });
      }
    }
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/exams/:id/grades — get student marks for an exam ─────────────
export const getExamGrades = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const filter = { exam: req.params.id };

    if (role === 'student') {
      filter.student = _id;
    } 
    else if (role === 'parent') {
      const children = await User.find({ parentId: _id }).select('_id');
      const childIds = children.map(c => c._id);
      filter.student = { $in: childIds };
    }
    // Admin & Teacher see all grades for the exam

    const grades = await Grade.find(filter)
      .populate('student', 'firstName lastName');
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/exams/:id/grades — record student marks ─────────────────────
export const recordGrades = async (req, res) => {
  try {
    const examId = req.params.id;
    const { marks } = req.body; // [{ studentId, score, comments }]

    const operations = marks.map(m => ({
      updateOne: {
        filter: { exam: examId, student: m.studentId },
        update: { score: m.score, comments: m.comments },
        upsert: true
      }
    }));

    await Grade.bulkWrite(operations);
    res.json({ message: 'Notes enregistrées.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
