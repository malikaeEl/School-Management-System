import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';

// ── GET /api/attendance — list attendance records (filtered) ────────────────
export const getAttendance = async (req, res) => {
  try {
    const { subjectId, date } = req.query;
    const filter = {};
    if (subjectId) filter.subject = subjectId;
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .populate('subject', 'name grade')
      .populate('teacher', 'firstName lastName')
      .populate('students.student', 'firstName lastName')
      .sort({ date: -1 });
      
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/attendance — record attendance ───────────────────────────────
export const recordAttendance = async (req, res) => {
  try {
    const { subjectId, students } = req.body; // students: [{ studentId, status }]
    const teacherId = req.user._id;

    // Verify subject
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Matière introuvable.' });

    const record = await Attendance.create({
      subject: subjectId,
      teacher: teacherId,
      students: students.map(s => ({ student: s.studentId, status: s.status }))
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/attendance/stats — get student attendance stats ───────────────
export const getStudentStats = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const records = await Attendance.find({ 'students.student': studentId });
    
    let total = 0;
    let present = 0;
    let absent = 0;

    records.forEach(r => {
      const entry = r.students.find(s => s.student.toString() === studentId);
      if (entry) {
        total++;
        if (entry.status === 'Present' || entry.status === 'Late') present++;
        else absent++;
      }
    });

    res.json({ total, present, absent, rate: total ? Math.round((present/total)*100) : 100 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
