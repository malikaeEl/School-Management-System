import Transaction from '../models/Transaction.js';
import FeeStructure from '../models/FeeStructure.js';
import User from '../models/User.js';

// ── GET /api/finance/overview — financial summary ────────────────────────
export const getFinanceOverview = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    
    const totalRevenue = transactions
      .filter(t => t.status === 'Paid')
      .reduce((acc, t) => acc + t.amount, 0);
      
    const pendingFees = transactions
      .filter(t => t.status === 'Pending')
      .reduce((acc, t) => acc + t.amount, 0);

    // Group by month for stats
    const stats = Array(12).fill(0);
    transactions.forEach(t => {
      if (t.status === 'Paid') {
        const month = new Date(t.date).getMonth();
        stats[month] += t.amount;
      }
    });

    res.json({ totalRevenue, pendingFees, stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/finance/transactions — list all ─────────────────────────────
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'firstName lastName role')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/finance/invoice — generate new record ──────────────────────
export const generateInvoice = async (req, res) => {
  try {
    const { userId, amount, type, status } = req.body;
    const invCount = await Transaction.countDocuments();
    const invoiceNumber = `#INV-${8900 + invCount + 1}`;
    
    const transaction = await Transaction.create({
      user: userId,
      amount,
      type,
      status: status || 'Pending',
      invoiceNumber
    });
    
    const populated = await transaction.populate('user', 'firstName lastName role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/finance/fees — fee structure ────────────────────────────────
export const getFees = async (req, res) => {
  try {
    const fees = await FeeStructure.find();
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/finance/fees/:id — update fee structure ─────────────────────
export const updateFees = async (req, res) => {
  try {
    const { tuition, transport, activities } = req.body;
    const fee = await FeeStructure.findByIdAndUpdate(
      req.params.id,
      { tuition, transport, activities },
      { new: true, upsert: true }
    );
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
