const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Quest = require('../models/quests.model');

// Get all quests
router.get('/', auth, async (req, res) => {
  try {
    const quests = await Quest.findAll();
    res.json(quests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get quest by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    if (!quest) return res.status(404).json({ error: 'Quest not found' });
    res.json(quest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create quest
router.post('/', auth, async (req, res) => {
  try {
    const quest = await Quest.create(req.body);
    res.status(201).json(quest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update quest
router.put('/:id', auth, async (req, res) => {
  try {
    const quest = await Quest.update(req.params.id, req.body);
    res.json(quest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete quest
router.delete('/:id', auth, async (req, res) => {
  try {
    await Quest.delete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 