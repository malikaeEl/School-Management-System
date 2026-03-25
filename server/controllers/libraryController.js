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

    // Two weeks due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

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
