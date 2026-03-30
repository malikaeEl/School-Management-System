import express from 'express';
import multer from 'multer';
import path from 'path';
import { getSubjects, createSubject, updateSubject, deleteSubject, uploadMaterial, deleteMaterial } from '../controllers/subjectController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  }
});
const upload = multer({ storage });

router.route('/')
  .get(protect, getSubjects) // Teachers/Students/Admins can view subjects
  .post(protect, adminOnly, createSubject);

router.route('/:id')
  .put(protect, updateSubject)
  .delete(protect, adminOnly, deleteSubject);

router.post('/:id/materials', protect, upload.single('document'), uploadMaterial);
router.delete('/:id/materials/:materialId', protect, deleteMaterial);

export default router;
