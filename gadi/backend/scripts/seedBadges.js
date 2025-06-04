const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  const serviceAccount = require('../firebase-service-account.json');
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key
      }),
      projectId: serviceAccount.project_id
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  process.exit(1);
}

const db = admin.firestore();
const badgesRef = db.collection('badges');

// Example badges data
const badges = [
  {
    badge_id: 'badge_001',
    title: 'Clean Sport Champ',
    description: 'Awarded for completing 5 modules',
    icon_url: 'https://example.com/badges/clean-sport-champ.png',
    unlock_criteria: 'Complete 5 modules'
  },
  {
    badge_id: 'badge_002',
    title: 'Quiz Master',
    description: 'Awarded for scoring 100% on any quiz',
    icon_url: 'https://example.com/badges/quiz-master.png',
    unlock_criteria: 'Score 100% on any quiz'
  },
  {
    badge_id: 'badge_003',
    title: 'Streak Starter',
    description: 'Awarded for logging in 7 days in a row',
    icon_url: 'https://example.com/badges/streak-starter.png',
    unlock_criteria: 'Log in 7 days in a row'
  }
];

// Function to seed badges
async function seedBadges() {
  try {
    console.log('Starting to seed badges...');
    // Delete existing badges
    const existingBadges = await badgesRef.get();
    const batch = db.batch();
    existingBadges.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Cleared existing badges');

    // Add new badges
    for (const badge of badges) {
      const docRef = await badgesRef.add({
        ...badge,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Added badge: ${badge.title} with ID: ${docRef.id}`);
    }

    console.log('Successfully seeded all badges!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding badges:', error);
    process.exit(1);
  }
}

// Run the seed function
seedBadges(); 