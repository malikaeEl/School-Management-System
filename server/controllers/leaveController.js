import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';

// ── GET /api/leaves — List leave requests (Admin: all, Teacher: own) ──────
export const getLeaves = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'teacher') {
      filter.teacher = req.user.id;
    }
    
    const requests = await LeaveRequest.find(filter)
      .populate('teacher', 'firstName lastName email subject')
      .sort({ createdAt: -1 });
      
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/leaves — Teacher submits a request ─────────────────────────
export const submitLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'La date de début doit être avant la date de fin.' });
    }

    const request = await LeaveRequest.create({
      teacher: req.user.id,
      type,
      startDate,
      endDate,
      reason
    });
    
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── PUT /api/leaves/:id — Admin updates status ────────────────────────────
export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    
    const request = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminComment },
      { new: true }
    ).populate('teacher', 'firstName lastName email');
    
    if (!request) return res.status(404).json({ message: 'Demande introuvable.' });
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/leaves/:id — Teacher cancels pending request ──────────────
export const deleteLeaveRequest = async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Demande introuvable.' });
    
    if (request.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé.' });
    }
    
    if (request.status !== 'Pending' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Impossible de supprimer une demande déjà traitée.' });
    }
    
    await request.deleteOne();
    res.json({ message: 'Demande supprimée.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
