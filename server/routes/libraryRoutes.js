import express from 'express';
import { getLibraryOverview, getBooks, addBook, getBorrows, borrowBook, updateBook, deleteBook, returnBook, updateBorrow, getMyBorrows } from '../controllers/libraryController.js';
import { protect, staffOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Public Library Stats & Books (Accessible to all authenticated users)
router.get('/overview', getLibraryOverview);
router.get('/books', getBooks);

// Student/User Specific (Self-service)
router.get('/borrows/my', getMyBorrows);

// Staff Only Management Routes
router.post('/books', staffOnly, addBook);
router.route('/books/:id')
  .put(staffOnly, updateBook)
  .delete(staffOnly, deleteBook);

router.route('/borrows')
  .get(staffOnly, getBorrows)
  .post(staffOnly, borrowBook);

router.put('/borrows/:id', staffOnly, updateBorrow);
router.post('/borrows/:id/return', staffOnly, returnBook);

export default router;
