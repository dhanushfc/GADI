const express = require('express');
const router = express.Router();
const { updateUserProgress, getUserRankings } = require('../models/users.model');

// Middleware to verify JWT token
const authenticateToken = require('../middleware/auth');

// Get all users with optional filters
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const { sport, age_group } = req.query;
    const db = require('firebase-admin').firestore();
    let query = db.collection('users');
    
    // Apply filters if provided
    if (sport) {
      query = query.where('sport', '==', sport);
    }
    if (age_group) {
      query = query.where('age_group', '==', age_group);
    }

    const snapshot = await query.get();
    const users = [];

    snapshot.forEach(doc => {
      const userData = doc.data();
      // Remove sensitive information
      delete userData.password;
      users.push({
        id: doc.id,
        ...userData
      });
    });

    res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = require('firebase-admin').firestore();
    const userDoc = await db.collection('users').doc(req.user.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    delete userData.password; // Remove sensitive data

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user progress
router.put('/progress', authenticateToken, async (req, res) => {
  try {
    const { points, badges, level, completed_modules, quiz_scores } = req.body;
    
    const updatedUser = await updateUserProgress(req.user.userId, {
      points,
      badges,
      level,
      completed_modules,
      quiz_scores
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { sport, age_group } = req.query;
    const rankings = await getUserRankings(sport, age_group);
    
    // Remove sensitive information from rankings
    const sanitizedRankings = rankings.map(user => ({
      id: user.id,
      name: user.name,
      rank: user.rank,
      points: user.points,
      level: user.level,
      sport: user.sport,
      age_group: user.age_group
    }));

    res.json(sanitizedRankings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user badges
router.get('/badges', authenticateToken, async (req, res) => {
  try {
    const db = require('firebase-admin').firestore();
    const userDoc = await db.collection('users').doc(req.user.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({ badges: userData.badges || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user quiz scores
router.get('/quiz-scores', authenticateToken, async (req, res) => {
  try {
    const db = require('firebase-admin').firestore();
    const userDoc = await db.collection('users').doc(req.user.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({ quiz_scores: userData.quiz_scores || {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
