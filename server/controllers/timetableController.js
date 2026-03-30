import Timetable from '../models/Timetable.js';

// ── HELPER: Check for overlapping slots ──────────────────────────────────
const checkTimetableConflict = async ({ day, startTime, endTime, grade, teacherId, excludeId = null }) => {
  const query = { day };
  if (excludeId) query._id = { $ne: excludeId };
  
  const existingSlots = await Timetable.find(query).populate('teacher', 'firstName lastName');
  
  for (const slot of existingSlots) {
    // Overlap condition: (StartA < EndB) && (EndA > StartB)
    const isOverlapping = startTime < slot.endTime && endTime > slot.startTime;
    
    if (isOverlapping) {
      if (slot.grade === grade) {
        return `Conflit : La classe ${grade} a déjà un cours prévu de ${slot.startTime} à ${slot.endTime}.`;
      }
      if (slot.teacher._id.toString() === teacherId.toString()) {
        const tName = `${slot.teacher.firstName} ${slot.teacher.lastName}`;
        return `Conflit : L'enseignant ${tName} est déjà occupé de ${slot.startTime} à ${slot.endTime}.`;
      }
    }
  }
  return null;
};

// ── GET /api/timetable — list all timetable slots ─────────────────────────
export const getTimetable = async (req, res) => {
  try {
    const { grade, day, teacherId } = req.query;
    const filter = {};
    if (day) filter.day = day;
    if (grade) filter.grade = grade;
    if (teacherId) filter.teacher = teacherId;
    
    const slots = await Timetable.find(filter)
      .populate('teacher', 'firstName lastName subject _id');
      
    // Sort by startTime so the timeline is chronological
    slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/timetable — add a slot ──────────────────────────────────────
export const addSlot = async (req, res) => {
  try {
    const { teacherId, grade, day, startTime, endTime, room } = req.body;

    if (startTime >= endTime) {
      return res.status(400).json({ message: 'L\'heure de début doit être avant l\'heure de fin.' });
    }

    const conflict = await checkTimetableConflict({ day, startTime, endTime, grade, teacherId });
    if (conflict) {
      return res.status(400).json({ message: conflict });
    }

    const slot = await Timetable.create({
      teacher: teacherId,
      grade,
      day,
      startTime,
      endTime,
      room
    });
    const populated = await slot.populate('teacher', 'firstName lastName subject _id');
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

// ── PUT /api/timetable/:id — update a slot ────────────────────────────────
export const updateSlot = async (req, res) => {
  try {
    const { teacherId, grade, day, startTime, endTime, room } = req.body;

    if (startTime >= endTime) {
      return res.status(400).json({ message: 'L\'heure de début doit être avant l\'heure de fin.' });
    }

    const conflict = await checkTimetableConflict({ day, startTime, endTime, grade, teacherId, excludeId: req.params.id });
    if (conflict) {
      return res.status(400).json({ message: conflict });
    }

    const updated = await Timetable.findByIdAndUpdate(
      req.params.id,
      { teacher: teacherId, grade, day, startTime, endTime, room },
      { new: true }
    ).populate('teacher', 'firstName lastName subject _id');
    if (!updated) return res.status(404).json({ message: 'Créneau introuvable.' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
