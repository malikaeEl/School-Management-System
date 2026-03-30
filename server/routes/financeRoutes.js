import express from 'express';
import { getFinanceOverview, getTransactions, generateInvoice, getFees, updateFees, updateTransactionStatus, updateTransaction, deleteTransaction } from '../controllers/financeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/overview', getFinanceOverview);
router.get('/transactions', getTransactions);
router.post('/invoice', generateInvoice);

router.route('/fees')
  .get(getFees);

router.route('/fees/:id')
  .put(updateFees);

router.route('/transactions/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

router.put('/transactions/:id/status', updateTransactionStatus);

export default router;
