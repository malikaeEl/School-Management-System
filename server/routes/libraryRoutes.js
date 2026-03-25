import express from 'express';
import { getLibraryOverview, getBooks, addBook, getBorrows, borrowBook } from '../controllers/libraryController.js';
import { protect, staffOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(staffOnly); // Only teachers and admins can manage the library

router.get('/overview', getLibraryOverview);

router.route('/books')
  .get(getBooks)
  .post(addBook);

router.route('/borrows')
  .get(getBorrows)
  .post(borrowBook);

export default router;
