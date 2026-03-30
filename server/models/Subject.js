import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['On Track', 'Ahead', 'Behind', 'Critical'],
    default: 'On Track',
  },
  materials: [{
    title: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
