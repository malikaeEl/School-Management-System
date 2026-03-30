import express from 'express';
import { getTimetable, addSlot, deleteSlot, updateSlot } from '../controllers/timetableController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTimetable)
  .post(adminOnly, addSlot);

router.route('/:id')
  .put(adminOnly, updateSlot)
  .delete(adminOnly, deleteSlot);

export default router;
