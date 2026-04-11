import express from 'express';
import { sendMessage, getConversations, getMessages } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/:otherUserId', protect, getMessages);

export default router;
