const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { creator: req.user.userId },
        { participants: req.user.userId }
      ]
    })
    .populate('creator', 'username profilePicture')
    .populate('participants', 'username profilePicture');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create an event
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, start, end, location, color, participants } = req.body;
    const event = new Event({
      title,
      description,
      start,
      end,
      location,
      color,
      creator: req.user.userId,
      participants: participants || []
    });
    await event.save();
    await event.populate('creator', 'username profilePicture')
      .populate('participants', 'username profilePicture');
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { title, description, start, end, location, color, participants } = req.body;
    event.title = title || event.title;
    event.description = description || event.description;
    event.start = start || event.start;
    event.end = end || event.end;
    event.location = location || event.location;
    event.color = color || event.color;
    event.participants = participants || event.participants;

    await event.save();
    await event.populate('creator', 'username profilePicture')
      .populate('participants', 'username profilePicture');
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.remove();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 