import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  parentName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  message: String,
  status: {
    type: String,
    enum: ['Pending', 'Inquiry', 'Assessment', 'Interview', 'Qualified', 'Rejected'],
    default: 'Pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Admission = mongoose.model('Admission', admissionSchema);
export default Admission;
