import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, getUserById, changePassword } from '../controllers/userController.js';
import { upload, uploadDocument, deleteDocument, uploadAvatar, handleAvatarUpload } from '../controllers/documentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Allow admin, finance and teachers to see the user list (filtered by grade/role via query params)
router.get('/', (req, res, next) => {
  if (req.user && ['admin', 'finance', 'teacher'].includes(req.user.role)) {
    return getUsers(req, res);
  }
  res.status(403).json({ message: 'Accès réservé au personnel autorisé.' });
});

router.post('/', adminOnly, createUser);

router.route('/:id')
  .get(getUserById) // Everyone can see a profile if they have the ID (limited by logic inside controller)
  .put(adminOnly, updateUser)
  .delete(adminOnly, deleteUser);

// Document management
router.post('/:id/documents', upload.single('file'), uploadDocument);
router.delete('/:id/documents/:docId', deleteDocument);

// Avatar upload
router.post('/:id/avatar', uploadAvatar, handleAvatarUpload);

// Profile
router.put('/profile/password', changePassword);

export default router;
