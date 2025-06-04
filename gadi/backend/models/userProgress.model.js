const admin = require('firebase-admin');
const db = admin.firestore();
const progressRef = db.collection('user_progress');

class UserProgress {
  static async create(data) {
    try {
      this.validateLog(data);
      const docRef = await progressRef.add({
        ...data,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error creating user progress log: ${error.message}`);
    }
  }

  static async findAllByUser(user_id) {
    try {
      const snapshot = await progressRef.where('user_id', '==', user_id).orderBy('created_at', 'desc').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching user progress logs: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const doc = await progressRef.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching user progress log: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      this.validateLog(data);
      const docRef = progressRef.doc(id);
      await docRef.update({
        ...data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const updated = await docRef.get();
      return { id: updated.id, ...updated.data() };
    } catch (error) {
      throw new Error(`Error updating user progress log: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await progressRef.doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting user progress log: ${error.message}`);
    }
  }

  static validateLog(data) {
    const requiredFields = ['user_id', 'activity_type', 'related_id'];
    const validTypes = [
      'Module Viewed',
      'Quiz Attempted',
      'Badge Earned',
      'Quests Completed'
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    if (!validTypes.includes(data.activity_type)) {
      throw new Error(`Invalid activity type. Must be one of: ${validTypes.join(', ')}`);
    }
    return true;
  }
}

module.exports = UserProgress; 