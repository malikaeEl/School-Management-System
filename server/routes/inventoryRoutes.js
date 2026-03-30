import express from 'express';
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../controllers/inventoryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInventory);
router.post('/', protect, adminOnly, addInventoryItem);
router.put('/:id', protect, adminOnly, updateInventoryItem);
router.delete('/:id', protect, adminOnly, deleteInventoryItem);

export default router;
