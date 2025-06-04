const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const auth = require('../middleware/auth');

const db = admin.firestore();

// Get quiz by module ID
router.get('/module/:moduleId', auth, async (req, res) => {
  try {
    const quizzesSnapshot = await db.collection('quizzes')
      .where('module_id', '==', req.params.moduleId)
      .get();

    if (quizzesSnapshot.empty) {
      return res.status(404).json({ error: 'No quiz found for this module' });
    }

    const quizDoc = quizzesSnapshot.docs[0];
    const quiz = {
      id: quizDoc.id,
      ...quizDoc.data()
    };

    // Remove correct answers before sending to client
    quiz.questions = quiz.questions.map(q => ({
      question_id: q.question_id,
      question_text: q.question_text,
      options: q.options
    }));

    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Server error while fetching quiz' });
  }
});

// Get a specific quiz
router.get('/:id', auth, async (req, res) => {
  try {
    const quizDoc = await admin.firestore()
      .collection('quizzes')
      .doc(req.params.id)
      .get();

    if (!quizDoc.exists) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Don't send correct answers to the client
    const quizData = quizDoc.data();
    const { correctAnswers, ...safeQuizData } = quizData;

    res.json({
      id: quizDoc.id,
      ...safeQuizData
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Submit quiz answers
router.post('/submit/:quizId', auth, async (req, res) => {
  try {
    const { userId, answers } = req.body;
    const quizDoc = await db.collection('quizzes').doc(req.params.quizId).get();

    if (!quizDoc.exists) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizDoc.data();
    let score = 0;
    const totalQuestions = quiz.questions.length;

    // Calculate score
    answers.forEach(answer => {
      const question = quiz.questions.find(q => q.question_id === answer.question_id);
      if (question && question.correct_option === answer.selected_option) {
        score++;
      }
    });

    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= quiz.passing_score;
    const pointsEarned = passed ? 50 : 0;

    // Update user's progress if passed
    if (passed) {
      // Find the module's Firestore document ID using quiz.module_id
      let moduleDocId = null;
      const moduleSnapshot = await db.collection('modules').where('module_id', '==', quiz.module_id).get();
      if (!moduleSnapshot.empty) {
        moduleDocId = moduleSnapshot.docs[0].id;
      }
      const userRef = db.collection('users').doc(userId);
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) return;
        const userData = userDoc.data();
        // Prevent duplicate quiz completions
        let quizScores = userData.quiz_scores || [];
        if (!Array.isArray(quizScores)) quizScores = [];
        const alreadyCompleted = quizScores.some(qs => qs.quiz_id === req.params.quizId && qs.passed);
        if (!alreadyCompleted) {
          const quizScoreObj = {
            quiz_id: req.params.quizId,
            score: percentage,
            passed,
            timestamp: new Date().toISOString()
          };
          // Prepare badge awarding
          let badges = userData.badges || [];
          if (!Array.isArray(badges)) badges = [];
          // Clean Sport Champ: 5 completed modules
          let awardBadges = [];
          if ((userData.completed_modules?.length || 0) + 1 >= 5 && !badges.includes('badge_001')) {
            awardBadges.push('badge_001');
          }
          // Quiz Master: 100% on any quiz
          if (percentage === 100 && !badges.includes('badge_002')) {
            awardBadges.push('badge_002');
          }
          transaction.update(userRef, {
            points: admin.firestore.FieldValue.increment(pointsEarned),
            completed_modules: moduleDocId ? admin.firestore.FieldValue.arrayUnion(moduleDocId) : admin.firestore.FieldValue.arrayUnion(quiz.module_id),
            quiz_scores: admin.firestore.FieldValue.arrayUnion(quizScoreObj),
            badges: awardBadges.length > 0 ? admin.firestore.FieldValue.arrayUnion(...awardBadges) : badges
          });
        }
      });
    }

    res.json({
      score: percentage,
      passed,
      points_earned: pointsEarned
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Server error while submitting quiz' });
  }
});

// Get all quizzes
router.get('/', auth, async (req, res) => {
  try {
    const quizzesSnapshot = await db.collection('quizzes').get();
    const quizzes = quizzesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Server error while fetching quizzes' });
  }
});

// Get quiz by quiz_id field
router.get('/by-quizid/:quizId', auth, async (req, res) => {
  try {
    const quizzesSnapshot = await db.collection('quizzes')
      .where('quiz_id', '==', req.params.quizId)
      .get();

    if (quizzesSnapshot.empty) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const quizDoc = quizzesSnapshot.docs[0];
    const quiz = {
      id: quizDoc.id,
      ...quizDoc.data()
    };

    // Remove correct answers before sending to client
    quiz.questions = quiz.questions.map(q => ({
      question_id: q.question_id,
      question_text: q.question_text,
      options: q.options
    }));

    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz by quiz_id:', error);
    res.status(500).json({ error: 'Server error while fetching quiz' });
  }
});

module.exports = router; 