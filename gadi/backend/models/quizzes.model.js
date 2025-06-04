const admin = require('firebase-admin');
const db = admin.firestore();
const quizzesRef = db.collection('quizzes');

class Quiz {
  static async create(data) {
    try {
      // Validate quiz data
      this.validateQuiz(data);

      const docRef = await quizzesRef.add({
        ...data,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error creating quiz: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const snapshot = await quizzesRef.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching quizzes: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const doc = await quizzesRef.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching quiz: ${error.message}`);
    }
  }

  static async findByModuleId(moduleId) {
    try {
      const snapshot = await quizzesRef
        .where('module_id', '==', moduleId)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      // Should only be one quiz per module
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching quiz by module: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      // Validate quiz data
      this.validateQuiz(data);

      const docRef = quizzesRef.doc(id);
      await docRef.update({
        ...data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const updated = await docRef.get();
      return { id: updated.id, ...updated.data() };
    } catch (error) {
      throw new Error(`Error updating quiz: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await quizzesRef.doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting quiz: ${error.message}`);
    }
  }

  static validateQuiz(data) {
    // Required fields
    const requiredFields = ['module_id', 'questions', 'passing_score', 'attempt_limit'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate passing score
    if (data.passing_score < 0 || data.passing_score > 100) {
      throw new Error('Passing score must be between 0 and 100');
    }

    // Validate attempt limit
    if (data.attempt_limit < 1) {
      throw new Error('Attempt limit must be at least 1');
    }

    // Validate questions array
    if (!Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error('Questions must be a non-empty array');
    }

    // Validate each question
    data.questions.forEach((question, index) => {
      this.validateQuestion(question, index);
    });

    return true;
  }

  static validateQuestion(question, index) {
    const requiredQuestionFields = ['question_id', 'question_text', 'options', 'correct_option', 'explanation'];
    
    for (const field of requiredQuestionFields) {
      if (!question[field]) {
        throw new Error(`Question ${index + 1} is missing required field: ${field}`);
      }
    }

    // Validate options array
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 options`);
    }

    // Validate correct_option is within range
    if (!question.options.includes(question.correct_option)) {
      throw new Error(`Question ${index + 1} has an invalid correct_option`);
    }

    return true;
  }
}

module.exports = Quiz; 