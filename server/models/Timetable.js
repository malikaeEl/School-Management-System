import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    required: true,
  },
  startTime: {
    type: String, // Format: HH:MM
    required: true,
  },
  endTime: {
    type: String, // Format: HH:MM
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
