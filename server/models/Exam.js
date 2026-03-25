import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: String, // e.g., "2h"
    default: "2h",
  },
  type: {
    type: String,
    enum: ['Contrôle', 'Examen Blanc', 'Examen Final', 'Test'],
    default: 'Contrôle',
  },
  grade: {
    type: String, // Moroccan level like CP, CE1...
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
