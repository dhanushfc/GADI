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
const questsRef = db.collection('quests');

// Example quests data
const quests = [
  {
    quest_id: 'quest_001',
    title: 'Quiz Master',
    description: 'Score 100% on any quiz today.',
    type: 'Daily',
    reward_points: 50,
    badge_reward: 'badge_002',
    status: 'Active'
  },
  {
    quest_id: 'quest_002',
    title: 'Learning Streak',
    description: 'Complete a module every day for 3 days.',
    type: 'Special',
    reward_points: 100,
    badge_reward: 'badge_003',
    status: 'upcoming'
  },
  {
    quest_id: 'quest_003',
    title: 'Weekly Warrior',
    description: 'Finish 5 quizzes this week.',
    type: 'Weekly',
    reward_points: 75,
    badge_reward: '',
    status: 'Active'
  }
];

// Function to seed quests
async function seedQuests() {
  try {
    console.log('Starting to seed quests...');
    // Delete existing quests
    const existingQuests = await questsRef.get();
    const batch = db.batch();
    existingQuests.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Cleared existing quests');

    // Add new quests
    for (const quest of quests) {
      const docRef = await questsRef.add({
        ...quest,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Added quest: ${quest.title} with ID: ${docRef.id}`);
    }

    console.log('Successfully seeded all quests!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quests:', error);
    process.exit(1);
  }
}

// Run the seed function
seedQuests(); 