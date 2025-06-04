const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Badge = require('../models/badges.model');

// Get all badges
router.get('/', auth, async (req, res) => {
  try {
    const badges = await Badge.findAll();
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get badge by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json(badge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create badge
router.post('/', auth, async (req, res) => {
  try {
    const badge = await Badge.create(req.body);
    res.status(201).json(badge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update badge
router.put('/:id', auth, async (req, res) => {
  try {
    const badge = await Badge.update(req.params.id, req.body);
    res.json(badge);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete badge
router.delete('/:id', auth, async (req, res) => {
  try {
    await Badge.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 