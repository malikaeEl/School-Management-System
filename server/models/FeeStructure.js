import mongoose from 'mongoose';

const feeStructureSchema = new mongoose.Schema({
  grade: {
    type: String, // Moroccan level
    required: true,
    unique: true,
  },
  tuition: {
    type: Number,
    required: true,
  },
  transport: {
    type: Number,
    default: 0,
  },
  activities: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
export default FeeStructure;
