const admin = require('firebase-admin');
const db = admin.firestore();
const modulesRef = db.collection('modules');

class Module {
  static async create(data) {
    try {
      const docRef = await modulesRef.add({
        ...data,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error creating module: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const snapshot = await modulesRef.orderBy('level_required').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching modules: ${error.message}`);
    }
  }

  static async findByLevel(userLevel) {
    try {
      const snapshot = await modulesRef
        .where('level_required', '<=', userLevel)
        .orderBy('level_required')
        .get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching modules by level: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const doc = await modulesRef.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching module: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      const docRef = modulesRef.doc(id);
      await docRef.update({
        ...data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      const updated = await docRef.get();
      return { id: updated.id, ...updated.data() };
    } catch (error) {
      throw new Error(`Error updating module: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await modulesRef.doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting module: ${error.message}`);
    }
  }

  static validateModule(data) {
    const requiredFields = ['title', 'description', 'content_type', 'content_url', 'estimated_time', 'level_required'];
    const validContentTypes = ['video', 'infographic', 'quiz', 'text', 'interactive'];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!validContentTypes.includes(data.content_type)) {
      throw new Error(`Invalid content type. Must be one of: ${validContentTypes.join(', ')}`);
    }

    if (data.estimated_time < 1) {
      throw new Error('Estimated time must be at least 1 minute');
    }

    if (data.level_required < 1) {
      throw new Error('Level required must be at least 1');
    }

    return true;
  }
}

module.exports = Module; 