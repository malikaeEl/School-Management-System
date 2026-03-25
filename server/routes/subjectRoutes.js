import express from 'express';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../controllers/subjectController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSubjects) // Teachers/Students/Admins can view subjects
  .post(protect, adminOnly, createSubject);

router.route('/:id')
  .put(protect, adminOnly, updateSubject)
  .delete(protect, adminOnly, deleteSubject);

export default router;
