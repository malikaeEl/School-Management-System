import Transaction from '../models/Transaction.js';
import FeeStructure from '../models/FeeStructure.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

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
      .populate('user', 'firstName lastName role grade')
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
      amount: Number(amount),
      type,
      status: status || 'Pending',
      invoiceNumber
    });
    
    const populated = await transaction.populate('user', 'firstName lastName role grade parentId');
    
    // Notify User and Parent
    const notifications = [];
    notifications.push({
      recipient: populated.user._id,
      type: 'invoice',
      title: 'Nouvelle Facture',
      message: `Une facture ${invoiceNumber} d'un montant de ${amount} MAD a été générée.`,
      link: '/finance'
    });
    
    if (populated.user.parentId) {
      notifications.push({
        recipient: populated.user.parentId,
        type: 'invoice',
        title: 'Facture Enfant',
        message: `Une facture ${invoiceNumber} (${amount} MAD) a été générée pour votre enfant ${populated.user.firstName}.`,
        link: '/parent-dashboard'
      });
    }
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

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

// ── PUT /api/finance/transactions/:id/status — update status ────────────
export const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'firstName lastName role grade');
    
    if (!transaction) return res.status(404).json({ message: 'Transaction non trouvée' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/finance/transactions/:id — update full record ──────────────
export const updateTransaction = async (req, res) => {
  try {
    const { amount, type, status, userId } = req.body;
    const updateData = {};
    if (amount !== undefined) updateData.amount = Number(amount);
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    if (userId) updateData.user = userId;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'firstName lastName role grade');

    if (!transaction) return res.status(404).json({ message: 'Transaction non trouvée' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/finance/transactions/:id — remove record ─────────────────
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction non trouvée' });
    res.json({ message: 'Transaction supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
