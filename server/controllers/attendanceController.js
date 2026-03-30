import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// ── GET /api/attendance — list attendance records (filtered) ────────────────
export const getAttendance = async (req, res) => {
  try {
    const { timetableSlotId, grade, date } = req.query;
    const filter = {};
    if (timetableSlotId) filter.timetableSlot = timetableSlotId;
    if (grade) filter.grade = grade;
    if (date) {
      const start = new Date(date);
      start.setHours(0,0,0,0);
      const end = new Date(date);
      end.setHours(23,59,59,999);
      filter.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(filter)
      .populate('teacher', 'firstName lastName subject')
      .populate('students.student', 'firstName lastName grade')
      .sort({ date: -1 });
      
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/attendance — record attendance ───────────────────────────────
export const recordAttendance = async (req, res) => {
  try {
    const { timetableSlotId, subjectName, grade, students, date } = req.body;
    const teacherId = req.user._id;

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(12, 0, 0, 0);

    const start = new Date(attendanceDate); start.setHours(0,0,0,0);
    const end   = new Date(attendanceDate); end.setHours(23,59,59,999);

    // Upsert: delete existing record for the same slot+date
    await Attendance.deleteMany({
      timetableSlot: timetableSlotId || null,
      grade,
      date: { $gte: start, $lte: end }
    });

    const record = await Attendance.create({
      timetableSlot: timetableSlotId || null,
      subjectName,
      grade,
      teacher: teacherId,
      date: attendanceDate,
      students: students.map(s => ({ student: s.studentId, status: s.status }))
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/attendance/stats/:studentId ───────────────────────────────────
export const getStudentStats = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const records = await Attendance.find({ 'students.student': studentId });
    
    let total = 0, present = 0, absent = 0;
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
