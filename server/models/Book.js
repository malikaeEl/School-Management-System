import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    enum: ['Roman', 'Science', 'Histoire', 'Mathématiques', 'Philosophie', 'Informatique', 'Littérature', 'Autre'],
    default: 'Autre',
  },
  status: {
    type: String,
    enum: ['Disponible', 'Emprunté', 'Limité', 'Perdu'],
    default: 'Disponible',
  }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
export default Book;
