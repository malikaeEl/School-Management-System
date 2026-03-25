import express from 'express';
import { getExams, createExam, getExamGrades, recordGrades } from '../controllers/examController.js';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExams)
  .post(teacherOrAdmin, createExam);

router.route('/:id/grades')
  .get(getExamGrades)
  .post(teacherOrAdmin, recordGrades);

export default router;
