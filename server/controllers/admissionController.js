import Admission from '../models/Admission.js';

// ── GET /api/admissions — list all requests (Admin) ────────────────────────
export const getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({ createdAt: -1 });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/admissions — submit a new request (Public) ─────────────────────
export const submitAdmission = async (req, res) => {
  try {
    const { studentName, grade, parentName, email, phone, message } = req.body;
    const admission = await Admission.create({
      studentName,
      grade,
      parentName,
      email,
      phone,
      message
    });
    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/admissions/:id — update status (Admin) ─────────────────────────
export const updateAdmissionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!admission) return res.status(404).json({ message: 'Demande introuvable.' });
    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/admissions/:id — delete a request (Admin) ───────────────────
export const deleteAdmission = async (req, res) => {
  try {
    await Admission.findByIdAndDelete(req.params.id);
    res.json({ message: 'Demande supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
