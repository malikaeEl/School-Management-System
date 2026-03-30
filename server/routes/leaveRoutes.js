import express from 'express';
import { getLeaves, submitLeave, updateLeaveStatus, deleteLeaveRequest } from '../controllers/leaveController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getLeaves);
router.post('/', protect, submitLeave);
router.put('/:id', protect, adminOnly, updateLeaveStatus);
router.delete('/:id', protect, deleteLeaveRequest);

export default router;
