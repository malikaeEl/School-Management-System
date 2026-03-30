import Book from '../models/Book.js';
import Borrow from '../models/Borrow.js';

// ── GET /api/library/overview — get library stats ───────────────────────
export const getLibraryOverview = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const activeBorrows = await Borrow.countDocuments({ status: 'Active' });
    const overdueBorrows = await Borrow.find({ status: 'Overdue' });
    
    // Auto-update overdue status based on date
    const now = new Date();
    const activeRecords = await Borrow.find({ status: 'Active', dueDate: { $lt: now } });
    if (activeRecords.length > 0) {
      const updates = activeRecords.map(b => ({
        updateOne: { filter: { _id: b._id }, update: { status: 'Overdue', fine: 25 } }
      }));
      await Borrow.bulkWrite(updates);
    }

    const totalFines = overdueBorrows.reduce((acc, b) => acc + (b.fine || 0), 0);

    res.json({
      totalBooks,
      activeBorrows,
      overdueCount: overdueBorrows.length,
      totalFines
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/library/books — list all books ──────────────────────────────
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/library/books — add a new book ─────────────────────────────
export const addBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/library/books/:id — update a book ───────────────────────────
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/library/books/:id — delete a book ────────────────────────
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.json({ message: 'Livre supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/library/borrows — list borrow records ───────────────────────
export const getBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate('book', 'title author')
      .populate('user', 'firstName lastName')
      .sort({ borrowDate: -1 });
    res.json(borrows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/library/borrows — record a book borrow ─────────────────────
export const borrowBook = async (req, res) => {
  try {
    const { bookId, userId } = req.body;
    
    // Check book availability
    const book = await Book.findById(bookId);
    if (!book || book.status !== 'Disponible') {
      return res.status(400).json({ message: 'Livre non disponible.' });
    }

    // Two weeks due date or custom
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : new Date();
    if (!req.body.dueDate) {
      dueDate.setDate(dueDate.getDate() + 14);
    }

    const borrow = await Borrow.create({
      book: bookId,
      user: userId,
      dueDate
    });

    // Mark book as borrowed
    book.status = 'Emprunté';
    await book.save();

    res.status(201).json(borrow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/library/borrows/:id — update borrow (due date) ──────────────
export const updateBorrow = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ message: 'Emprunt introuvable' });
    
    if (req.body.dueDate) {
      borrow.dueDate = new Date(req.body.dueDate);
      
      // Auto-recalculate status if we extend the date
      if (borrow.status === 'Overdue' && borrow.dueDate > new Date()) {
         borrow.status = 'Active';
         borrow.fine = 0;
      }
      await borrow.save();
    }
    
    res.json(borrow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/library/borrows/:id/return — return a borrowed book ────────
export const returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ message: 'Emprunt introuvable' });
    
    // Update borrow to returned
    borrow.status = 'Returned';
    borrow.returnDate = new Date();
    await borrow.save();

    // Mark book as available
    await Book.findByIdAndUpdate(borrow.book, { status: 'Disponible' });

    res.json(borrow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/library/borrows/my — get loans for current user ──────────────
export const getMyBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user._id })
      .populate('book', 'title author isbn category status')
      .sort({ borrowDate: -1 });
    res.json(borrows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
