const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const auth = require('../middleware/auth');

const db = admin.firestore();

// Get all modules
router.get('/', auth, async (req, res) => {
  try {
    const modulesSnapshot = await db.collection('modules').get();

    const modules = modulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Server error while fetching modules' });
  }
});

// Get single module by ID
router.get('/:moduleId', auth, async (req, res) => {
  try {
    const moduleDoc = await db.collection('modules').doc(req.params.moduleId).get();
    
    if (!moduleDoc.exists) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json({
      id: moduleDoc.id,
      ...moduleDoc.data()
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ error: 'Server error while fetching module' });
  }
});

// Get module progress for a user
router.get('/progress/:userId', auth, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const progress = {
      completed_modules: userData.completed_modules || [],
      quiz_scores: userData.quiz_scores || []
    };

    res.json(progress);
  } catch (error) {
    console.error('Error fetching module progress:', error);
    res.status(500).json({ error: 'Server error while fetching progress' });
  }
});

module.exports = router; 