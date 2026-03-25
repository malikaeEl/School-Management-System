import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 20,
  },
  comments: String,
}, { timestamps: true });

// Ensure a student only has one grade per exam
gradeSchema.index({ student: 1, exam: 1 }, { unique: true });

const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;
