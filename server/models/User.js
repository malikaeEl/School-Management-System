import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SCHOOL_LEVELS = [
  // Primaire
  'CP', 'CE1', 'CE2', 'CM1', 'CM2',
  // Collège
  '1ère année collège', '2ème année collège', '3ème année collège',
  // Lycée
  'T.C', '1ère année S.M', '1ère année S.Ex',
  '2ème année S.M', '2ème année SVT', '2ème année PC',
  // N/A for staff
  'N/A'
];

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'teacher', 'parent'],
    default: 'student',
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  // For students: their class level
  grade: {
    type: String,
    enum: SCHOOL_LEVELS,
    default: 'N/A',
  },
  // For students: linked parent user ID
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
