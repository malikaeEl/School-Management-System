import Subject from '../models/Subject.js';
import User from '../models/User.js';

// ── GET /api/subjects — list all subjects ─────────────────────────────────
export const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('teacher', 'firstName lastName email').sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/subjects — admin creates a subject ──────────────────────────
export const createSubject = async (req, res) => {
  try {
    const { name, teacherId, grade } = req.body;
    
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Enseignant invalide ou introuvable.' });
    }

    const subject = await Subject.create({
      name,
      teacher: teacherId,
      grade,
    });

    const populated = await subject.populate('teacher', 'firstName lastName email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/subjects/:id — update a subject ──────────────────────────────
export const updateSubject = async (req, res) => {
  try {
    const { name, teacherId, grade, progress, status } = req.body;
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Matière introuvable.' });

    if (teacherId) {
       const teacher = await User.findById(teacherId);
       if (!teacher || teacher.role !== 'teacher') return res.status(400).json({ message: 'Enseignant invalide.' });
       subject.teacher = teacherId;
    }

    subject.name     = name     ?? subject.name;
    subject.grade    = grade    ?? subject.grade;
    subject.progress = progress ?? subject.progress;
    subject.status   = status   ?? subject.status;

    await subject.save();
    const populated = await subject.populate('teacher', 'firstName lastName email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/subjects/:id — remove a subject ───────────────────────────
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Matière introuvable.' });

    await subject.deleteOne();
    res.json({ message: 'Matière supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
