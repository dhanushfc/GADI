const admin = require('firebase-admin');
const db = admin.firestore();
const questsRef = db.collection('quests');

class Quest {
  static async create(data) {
    try {
      this.validateQuest(data);
      const docRef = await questsRef.add({
        ...data,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error creating quest: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const snapshot = await questsRef.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching quests: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const doc = await questsRef.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching quest: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      this.validateQuest(data);
      const docRef = questsRef.doc(id);
      await docRef.update({
        ...data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const updated = await docRef.get();
      return { id: updated.id, ...updated.data() };
    } catch (error) {
      throw new Error(`Error updating quest: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await questsRef.doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting quest: ${error.message}`);
    }
  }

  static validateQuest(data) {
    const requiredFields = ['quest_id', 'title', 'description', 'type', 'reward_points', 'status'];
    const validTypes = ['Daily', 'Weekly', 'Special'];
    const validStatus = ['Active', 'expired', 'upcoming'];
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    if (!validTypes.includes(data.type)) {
      throw new Error(`Invalid quest type. Must be one of: ${validTypes.join(', ')}`);
    }
    if (!validStatus.includes(data.status)) {
      throw new Error(`Invalid quest status. Must be one of: ${validStatus.join(', ')}`);
    }
    return true;
  }
}

module.exports = Quest; 