import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Admin-only: create accounts (used internally + by userController)
router.post('/register', protect, adminOnly, registerUser);

export default router;
