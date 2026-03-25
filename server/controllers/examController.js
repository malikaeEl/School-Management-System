import Exam from '../models/Exam.js';
import Grade from '../models/Grade.js';
import User from '../models/User.js';

// ── GET /api/exams — list exams ──────────────────────────────────────────
export const getExams = async (req, res) => {
  try {
    const { grade } = req.query;
    const filter = {};
    if (grade) filter.grade = grade;
    
    // If teacher, show their exams or exams of their subjects
    if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
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
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/exams/:id/grades — get student marks for an exam ─────────────
export const getExamGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ exam: req.params.id })
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
