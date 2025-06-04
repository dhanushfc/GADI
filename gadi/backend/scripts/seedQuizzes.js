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
const quizzesRef = db.collection('quizzes');
const modulesRef = db.collection('modules');

// Sample quizzes data matching the modules
const quizzes = [
  {
    quiz_id: "quiz_001",
    module_id: "", // Will be filled with actual module ID
    passing_score: 70,
    attempt_limit: 3,
    questions: [
      {
        question_id: "q1_1",
        question_text: "What is the main purpose of anti-doping regulations in sports?",
        options: [
          "To make sports more entertaining",
          "To protect athletes' health and ensure fair competition",
          "To increase athletic performance",
          "To reduce sports participation"
        ],
        correct_option: "To protect athletes' health and ensure fair competition",
        explanation: "Anti-doping regulations aim to protect athletes' health and maintain fair competition by preventing the use of performance-enhancing substances."
      },
      {
        question_id: "q1_2",
        question_text: "Which organization is responsible for the World Anti-Doping Code?",
        options: [
          "FIFA",
          "IOC",
          "WADA",
          "UEFA"
        ],
        correct_option: "WADA",
        explanation: "The World Anti-Doping Agency (WADA) is responsible for the development and implementation of the World Anti-Doping Code."
      },
      {
        question_id: "q1_3",
        question_text: "What does 'strict liability' mean in anti-doping?",
        options: [
          "Athletes are always guilty",
          "Athletes are responsible for what enters their body",
          "Coaches are responsible for athletes",
          "Teams are responsible for players"
        ],
        correct_option: "Athletes are responsible for what enters their body",
        explanation: "Under strict liability, athletes are responsible for any prohibited substance found in their samples, regardless of how it got there."
      }
    ]
  },
  {
    quiz_id: "quiz_002",
    module_id: "", // Will be filled with actual module ID
    passing_score: 75,
    attempt_limit: 3,
    questions: [
      {
        question_id: "q2_1",
        question_text: "Which of these is NOT a prohibited substance category?",
        options: [
          "Anabolic agents",
          "Vitamins and minerals",
          "Beta-2 agonists",
          "Growth hormones"
        ],
        correct_option: "Vitamins and minerals",
        explanation: "Vitamins and minerals are generally allowed, while the other options are prohibited substance categories."
      },
      {
        question_id: "q2_2",
        question_text: "What is a 'specified substance'?",
        options: [
          "A substance that is always prohibited",
          "A substance that is more likely to have been consumed unintentionally",
          "A substance that enhances performance",
          "A substance that is only banned in competition"
        ],
        correct_option: "A substance that is more likely to have been consumed unintentionally",
        explanation: "Specified substances are those that are more likely to have been consumed for a purpose other than performance enhancement."
      }
    ]
  },
  {
    quiz_id: "quiz_003",
    module_id: "", // Will be filled with actual module ID
    passing_score: 80,
    attempt_limit: 2,
    questions: [
      {
        question_id: "q3_1",
        question_text: "How often must athletes in the registered testing pool provide whereabouts information?",
        options: [
          "Daily",
          "Weekly",
          "Monthly",
          "Quarterly"
        ],
        correct_option: "Quarterly",
        explanation: "Athletes in the registered testing pool must provide whereabouts information every three months (quarterly)."
      }
    ]
  },
  {
    quiz_id: "quiz_004",
    module_id: "", // Will be filled with actual module ID
    passing_score: 70,
    attempt_limit: 3,
    questions: [
      {
        question_id: "q4_1",
        question_text: "What is the first step in a doping control test?",
        options: [
          "Sample collection",
          "Notification of selection",
          "Analysis in the lab",
          "Result management"
        ],
        correct_option: "Notification of selection",
        explanation: "The first step is to notify the athlete that they have been selected for testing."
      },
      {
        question_id: "q4_2",
        question_text: "Who is allowed to accompany an athlete during sample collection?",
        options: [
          "Coach",
          "Chaperone",
          "Parent (if minor)",
          "All of the above"
        ],
        correct_option: "All of the above",
        explanation: "A chaperone, coach, or parent (if the athlete is a minor) may accompany the athlete."
      },
      {
        question_id: "q4_3",
        question_text: "What happens if an athlete refuses to provide a sample?",
        options: [
          "Nothing",
          "They are disqualified",
          "It is considered an anti-doping rule violation",
          "They can reschedule"
        ],
        correct_option: "It is considered an anti-doping rule violation",
        explanation: "Refusing to provide a sample is a violation and may result in sanctions."
      }
    ]
  },
  {
    quiz_id: "quiz_005",
    module_id: "",
    passing_score: 70,
    attempt_limit: 3,
    questions: [
      {
        question_id: "q5_1",
        question_text: "What is a Therapeutic Use Exemption (TUE)?",
        options: [
          "Permission to use a prohibited substance for medical reasons",
          "A type of supplement",
          "A banned practice",
          "A type of test"
        ],
        correct_option: "Permission to use a prohibited substance for medical reasons",
        explanation: "A TUE allows an athlete to use a prohibited substance if medically necessary."
      },
      {
        question_id: "q5_2",
        question_text: "Who grants a TUE?",
        options: [
          "The athlete's coach",
          "The athlete's doctor",
          "The relevant anti-doping organization",
          "The athlete's team"
        ],
        correct_option: "The relevant anti-doping organization",
        explanation: "TUEs are granted by anti-doping organizations, not individual doctors or teams."
      },
      {
        question_id: "q5_3",
        question_text: "How long is a TUE valid?",
        options: [
          "Indefinitely",
          "For the duration specified in the approval",
          "One year",
          "Until the athlete retires"
        ],
        correct_option: "For the duration specified in the approval",
        explanation: "A TUE is valid for the period specified in the approval."
      }
    ]
  },
  {
    quiz_id: "quiz_006",
    module_id: "",
    passing_score: 70,
    attempt_limit: 3,
    questions: [
      {
        question_id: "q6_1",
        question_text: "What is a common risk with nutritional supplements?",
        options: [
          "They are always safe",
          "They may be contaminated with banned substances",
          "They are always effective",
          "They are regulated strictly"
        ],
        correct_option: "They may be contaminated with banned substances",
        explanation: "Supplements may be contaminated, so athletes must be cautious."
      },
      {
        question_id: "q6_2",
        question_text: "Who is responsible for what an athlete consumes?",
        options: [
          "The coach",
          "The athlete",
          "The supplement company",
          "The team doctor"
        ],
        correct_option: "The athlete",
        explanation: "Athletes are responsible for any substance found in their body."
      },
      {
        question_id: "q6_3",
        question_text: "What should athletes check before using a supplement?",
        options: [
          "The label",
          "The batch number",
          "If it is certified by a trusted program",
          "All of the above"
        ],
        correct_option: "All of the above",
        explanation: "Athletes should check all these things to reduce risk."
      }
    ]
  },
  {
    quiz_id: "quiz_007",
    module_id: "",
    passing_score: 70,
    attempt_limit: 3,
    questions: [
      {
        question_id: "q7_1",
        question_text: "What is a possible consequence of doping?",
        options: [
          "Improved health",
          "Suspension from sport",
          "Winning more medals",
          "None of the above"
        ],
        correct_option: "Suspension from sport",
        explanation: "Doping can lead to suspension and other penalties."
      },
      {
        question_id: "q7_2",
        question_text: "Doping can affect which aspect of an athlete's life?",
        options: [
          "Career",
          "Health",
          "Reputation",
          "All of the above"
        ],
        correct_option: "All of the above",
        explanation: "Doping can negatively impact all these areas."
      },
      {
        question_id: "q7_3",
        question_text: "What is the best way to avoid the consequences of doping?",
        options: [
          "Follow anti-doping rules",
          "Ignore the rules",
          "Take risks",
          "Ask teammates for advice"
        ],
        correct_option: "Follow anti-doping rules",
        explanation: "Following the rules is the best way to avoid negative consequences."
      }
    ]
  },
  {
    quiz_id: "quiz_008",
    module_id: "",
    passing_score: 70,
    attempt_limit: 3,
    questions: [
      {
        question_id: "q8_1",
        question_text: "What does it mean to be a Clean Sport Ambassador?",
        options: [
          "Promote fair play and anti-doping",
          "Encourage doping",
          "Ignore the rules",
          "None of the above"
        ],
        correct_option: "Promote fair play and anti-doping",
        explanation: "A Clean Sport Ambassador promotes fair play and anti-doping values."
      },
      {
        question_id: "q8_2",
        question_text: "How can athletes promote clean sport?",
        options: [
          "Educate others",
          "Lead by example",
          "Report doping",
          "All of the above"
        ],
        correct_option: "All of the above",
        explanation: "Athletes can promote clean sport in many ways."
      },
      {
        question_id: "q8_3",
        question_text: "Why is clean sport important?",
        options: [
          "It ensures fair competition",
          "It protects health",
          "It builds trust",
          "All of the above"
        ],
        correct_option: "All of the above",
        explanation: "Clean sport is important for fairness, health, and trust."
      }
    ]
  }
];

// Function to seed quizzes
async function seedQuizzes() {
  try {
    console.log('Starting to seed quizzes...');
    
    // Get all modules to match with quizzes
    const modulesSnapshot = await modulesRef.get();
    const modules = {};
    modulesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.quiz_id) {
        modules[data.quiz_id] = doc.id;
      }
    });

    // Delete existing quizzes
    const existingQuizzes = await quizzesRef.get();
    const batch = db.batch();
    existingQuizzes.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('Cleared existing quizzes');

    // Add new quizzes with corresponding module IDs
    for (const quiz of quizzes) {
      const moduleId = modules[quiz.quiz_id];
      if (!moduleId) {
        console.warn(`No matching module found for quiz ${quiz.quiz_id}`);
        continue;
      }

      quiz.module_id = moduleId;
      const docRef = await quizzesRef.add({
        ...quiz,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Added quiz ${quiz.quiz_id} with ID: ${docRef.id} for module: ${moduleId}`);
    }

    console.log('Successfully seeded all quizzes!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    process.exit(1);
  }
}

// Run the seed function
seedQuizzes(); 