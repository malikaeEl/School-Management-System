import express from 'express';
import { getAdmissions, submitAdmission, updateAdmissionStatus, deleteAdmission } from '../controllers/admissionController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for landing page
router.post('/submit', submitAdmission);

// Protected admin routes
router.use(protect);
router.use(adminOnly);

router.route('/')
  .get(getAdmissions);

router.route('/:id')
  .put(updateAdmissionStatus)
  .delete(deleteAdmission);

export default router;
