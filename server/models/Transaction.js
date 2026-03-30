import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['Scolarité', 'Transport', 'Activités', 'Salaire', 'Autre'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue', 'Cancelled'],
    default: 'Pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  invoiceNumber: {
    type: String,
    unique: true,
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
