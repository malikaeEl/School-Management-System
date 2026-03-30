import express from 'express';
import { getAnalytics, updateAnalytics } from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Only logged-in users can see stats

router.get('/', getAnalytics);
router.put('/', adminOnly, updateAnalytics); // Only admins can edit the stats globally

export default router;
