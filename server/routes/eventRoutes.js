import express from 'express';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new event (Admin only - simplified for now, as we'll add middleware later if needed)
router.post('/', async (req, res) => {
  const event = new Event({
    title: req.body.title,
    date: req.body.date,
    time: req.body.time,
    type: req.body.type,
    location: req.body.location
  });

  try {
    const newEvent = await event.save();
    
    // Notify all relevant users
    const users = await User.find({ role: { $in: ['teacher', 'student', 'parent'] } }).select('_id');
    const notifications = users.map(u => ({
      recipient: u._id,
      type: 'event',
      title: 'Nouvel Événement',
      message: `L'événement "${req.body.title}" a été ajouté pour le ${new Date(req.body.date).toLocaleDateString()}.`,
      link: '/events'
    }));
    
    if (notifications.length > 0) {
      // Chunk insertMany if too many users, but for a school it should be fine
      await Notification.insertMany(notifications);
    }
    
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE event (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
