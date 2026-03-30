import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  // Store timetable slot ID for reference (optional, not required)
  timetableSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
    default: null,
  },
  // Store subject/grade info as strings directly (no longer depends on Subject model)
  subjectName: { type: String, default: '' },
  grade: { type: String, default: '' },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  students: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Present',
    }
  }],
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
