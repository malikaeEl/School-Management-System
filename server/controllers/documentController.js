import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';

// Ensure uploads directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /pdf|png|jpg|jpeg|doc|docx/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) return cb(null, true);
    cb(new Error('Type de fichier non autorisé.'));
  },
});

// POST /api/users/:id/documents
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier envoyé.' });
    const { id } = req.params;
    const docEntry = {
      name: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype,
      uploadedAt: new Date(),
    };
    const user = await User.findByIdAndUpdate(
      id,
      { $push: { documents: docEntry } },
      { new: true, select: 'documents' }
    );
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json(user.documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id/documents/:docId
export const deleteDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const user = await User.findById(id).select('documents');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const doc = user.documents.id(docId);
    if (doc) {
      const filePath = path.resolve(doc.path.replace(/^\//, ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await User.findByIdAndUpdate(id, { $pull: { documents: { _id: docId } } });
    res.json({ message: 'Document supprimé.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/:id/avatar — upload profile photo
export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /png|jpg|jpeg|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Image uniquement (JPG, PNG, WEBP).'));
  },
}).single('avatar');

export const handleAvatarUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucune image envoyée.' });
    const avatarPath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: avatarPath },
      { new: true, select: 'avatar' }
    );
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

