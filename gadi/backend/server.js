const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const serviceAccount = require('./firebase-service-account.json');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
try {
  console.log('Loading service account...');
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      projectId: serviceAccount.project_id
    });
  }
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const moduleRoutes = require('./routes/modules');
const quizRoutes = require('./routes/quizzes');
const badgeRoutes = require('./routes/badges');
const questsRoutes = require('./routes/quests');
const userProgressRoutes = require('./routes/userProgress');

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/user', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/quests', questsRoutes);
app.use('/api/user-progress', userProgressRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
