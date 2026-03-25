import express from 'express';
import { getAttendance, recordAttendance, getStudentStats } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAttendance)
  .post(recordAttendance);

router.get('/student/:studentId', getStudentStats);

export default router;
