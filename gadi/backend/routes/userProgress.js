const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserProgress = require('../models/userProgress.model');

// Get all progress logs for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const logs = await UserProgress.findAllByUser(req.params.userId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get progress log by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const log = await UserProgress.findById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create progress log
router.post('/', auth, async (req, res) => {
  try {
    const log = await UserProgress.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update progress log
router.put('/:id', auth, async (req, res) => {
  try {
    const log = await UserProgress.update(req.params.id, req.body);
    res.json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete progress log
router.delete('/:id', auth, async (req, res) => {
  try {
    await UserProgress.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 