const admin = require('firebase-admin');
const db = admin.firestore();
const badgesRef = db.collection('badges');

class Badge {
  static async create(data) {
    try {
      this.validateBadge(data);
      const docRef = await badgesRef.add({
        ...data,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error creating badge: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const snapshot = await badgesRef.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching badges: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const doc = await badgesRef.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching badge: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      this.validateBadge(data);
      const docRef = badgesRef.doc(id);
      await docRef.update({
        ...data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const updated = await docRef.get();
      return { id: updated.id, ...updated.data() };
    } catch (error) {
      throw new Error(`Error updating badge: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await badgesRef.doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting badge: ${error.message}`);
    }
  }

  static validateBadge(data) {
    const requiredFields = ['badge_id', 'title', 'description', 'icon_url', 'unlock_criteria'];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    return true;
  }
}

module.exports = Badge; 