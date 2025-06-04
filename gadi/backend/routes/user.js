const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const auth = require('../middleware/auth');

const db = admin.firestore();

// Create new user
router.post('/', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      age_group, 
      sport,
      id
    } = req.body;

    // Validate required fields
    const requiredFields = ['name', 'email', 'password', 'age_group', 'sport'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        fields: missingFields 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password
    if (password.length < 5) {
      return res.status(400).json({ error: 'Password must be at least 5 characters long' });
    }

    // Check if user already exists
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .get();

    if (!userSnapshot.empty) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user document
    const userDoc = {
      name,
      email,
      password: hashedPassword,
      age_group,
      sport,
      points: 0,
      badges: [],
      level: 1,
      rank: 0,
      completed_modules: [],
      quiz_scores: {},
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(id).set(userDoc);
    
    // Return success with user data (excluding sensitive information)
    const userData = {
      id,
      name,
      email,
      age_group,
      sport,
      points: 0,
      level: 1,
      rank: 0
    };

    res.status(201).json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Server error during user creation' });
  }
});

// Get user profile
router.get('/profile/:userId', auth, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    delete userData.password;

    res.json({
      id: userDoc.id,
      ...userData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error while fetching profile' });
  }
});

// Update user profile
router.put('/profile/:userId', auth, async (req, res) => {
  try {
    const { name, age_group, sport } = req.body;
    const updates = {
      name,
      age_group,
      sport,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(req.params.userId).update(updates);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error while updating profile' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users')
      .orderBy('points', 'desc')
      .limit(10)
      .get();

    const leaderboard = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      points: doc.data().points,
      level: doc.data().level,
      rank: doc.data().rank
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error while fetching leaderboard' });
  }
});

// Get user progress
router.get('/progress/:userId', auth, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const progress = {
      points: userData.points,
      level: userData.level,
      rank: userData.rank,
      completed_modules: userData.completed_modules || [],
      quiz_scores: userData.quiz_scores || {}
    };

    res.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Server error while fetching progress' });
  }
});

// Update user progress
router.post('/progress/:userId', auth, async (req, res) => {
  try {
    const { moduleId, quizScore, pointsEarned } = req.body;
    const userRef = db.collection('users').doc(req.params.userId);
    
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const newPoints = (userData.points || 0) + pointsEarned;
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      const updates = {
        points: newPoints,
        level: newLevel,
        completed_modules: admin.firestore.FieldValue.arrayUnion(moduleId),
        quiz_scores: admin.firestore.FieldValue.arrayUnion({
          moduleId,
          score: quizScore,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        }),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };

      transaction.update(userRef, updates);
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Server error while updating progress' });
  }
});

module.exports = router; 