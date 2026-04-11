import express from 'express';
import { getFinanceOverview, getTransactions, getMyTransactions, getUserTransactions, generateInvoice, getFees, updateFees, updateTransactionStatus, updateTransaction, deleteTransaction } from '../controllers/financeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/my-transactions', getMyTransactions);
router.use(adminOnly);

router.get('/overview', getFinanceOverview);
router.get('/transactions', getTransactions);
router.get('/user-transactions/:userId', getUserTransactions);
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
