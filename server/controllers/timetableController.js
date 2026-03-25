import Timetable from '../models/Timetable.js';

// ── GET /api/timetable — list all timetable slots ─────────────────────────
export const getTimetable = async (req, res) => {
  try {
    const { grade } = req.query;
    const filter = {};
    
    const slots = await Timetable.find(filter)
      .populate({
        path: 'subject',
        populate: { path: 'teacher', select: 'firstName lastName' }
      });
      
    // If grade filter is provided, filter manually after population (or use a better query)
    let filtered = slots;
    if (grade) {
      filtered = slots.filter(s => s.subject?.grade === grade);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/timetable — add a slot ──────────────────────────────────────
export const addSlot = async (req, res) => {
  try {
    const { subjectId, day, startTime, endTime, room } = req.body;
    const slot = await Timetable.create({
      subject: subjectId,
      day,
      startTime,
      endTime,
      room
    });
    const populated = await slot.populate({
      path: 'subject',
      populate: { path: 'teacher', select: 'firstName lastName' }
    });
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE /api/timetable/:id — remove a slot ─────────────────────────────
export const deleteSlot = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Créneau supprimé.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
