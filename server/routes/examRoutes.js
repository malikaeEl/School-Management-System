import express from 'express';
import { getExams, createExam, getExamGrades, recordGrades } from '../controllers/examController.js';
import { protect, teacherOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExams)
  .post(teacherOnly, createExam);

router.route('/:id/grades')
  .get(getExamGrades)
  .post(teacherOnly, recordGrades);

export default router;
