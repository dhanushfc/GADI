const admin = require('firebase-admin');
const path = require('path');

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
const modulesRef = db.collection('modules');

// Initial modules data
const modules = [
  {
    module_id: "module_001",
    title: "Introduction to Anti-Doping",
    description: "Learn the fundamental concepts of anti-doping in sports and why it matters for fair competition.",
    content_type: "video",
    content_url: "https://www.youtube.com/embed/1QGQ2A5J5nA",
    estimated_time: 15,
    level_required: 1,
    quiz_id: "quiz_001"
  },
  {
    module_id: "module_002",
    title: "Understanding Prohibited Substances",
    description: "Comprehensive guide to prohibited substances in sports, their effects, and why they're banned.",
    content_type: "interactive",
    content_url: "https://www.globaldro.com/Home",
    estimated_time: 25,
    level_required: 1,
    quiz_id: "quiz_002"
  },
  {
    module_id: "module_003",
    title: "Anti-Doping Rules and Regulations",
    description: "Detailed overview of international anti-doping rules, regulations, and compliance requirements.",
    content_type: "text",
    content_url: "https://www.wada-ama.org/sites/default/files/resources/files/2021_wada_code.pdf",
    estimated_time: 30,
    level_required: 2,
    quiz_id: "quiz_003"
  },
  {
    module_id: "module_004",
    title: "Testing Procedures and Athletes' Rights",
    description: "Learn about doping test procedures, sample collection, and your rights as an athlete.",
    content_type: "video",
    content_url: "https://www.youtube.com/embed/8QnMmpfKWvo",
    estimated_time: 20,
    level_required: 2,
    quiz_id: "quiz_004"
  },
  {
    module_id: "module_005",
    title: "Therapeutic Use Exemptions (TUE)",
    description: "Understanding TUE process, when you need it, and how to apply for it.",
    content_type: "infographic",
    content_url: "https://www.wada-ama.org/sites/default/files/resources/files/tue_process_infographic_en.pdf",
    estimated_time: 15,
    level_required: 3,
    quiz_id: "quiz_005"
  },
  {
    module_id: "module_006",
    title: "Nutritional Supplements Safety",
    description: "Guide to safe use of nutritional supplements and avoiding contaminated products.",
    content_type: "interactive",
    content_url: "https://www.informed-sport.com/",
    estimated_time: 25,
    level_required: 3,
    quiz_id: "quiz_006"
  },
  {
    module_id: "module_007",
    title: "Consequences of Doping",
    description: "Understanding the health risks and career consequences of doping in sports.",
    content_type: "video",
    content_url: "https://www.youtube.com/embed/2QwzYQ6l1kA",
    estimated_time: 20,
    level_required: 4,
    quiz_id: "quiz_007"
  },
  {
    module_id: "module_008",
    title: "Clean Sport Ambassador",
    description: "Learn how to promote clean sport and become an ambassador for anti-doping.",
    content_type: "interactive",
    content_url: "https://www.wada-ama.org/en/what-we-do/education-awareness/athlete-ambassadors",
    estimated_time: 45,
    level_required: 5,
    quiz_id: "quiz_008"
  }
];

// Function to seed modules
async function seedModules() {
  try {
    console.log('Starting to seed modules...');
    
    // Delete existing modules
    const existingModules = await modulesRef.get();
    const batch = db.batch();
    existingModules.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Cleared existing modules');

    // Add new modules
    for (const module of modules) {
      const docRef = await modulesRef.add({
        ...module,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Added module: ${module.title} with ID: ${docRef.id}`);
    }

    console.log('Successfully seeded all modules!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding modules:', error);
    process.exit(1);
  }
}

// Run the seed function
seedModules(); 