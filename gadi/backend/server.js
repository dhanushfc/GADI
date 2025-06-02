const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require('dotenv');


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Firebase Admin SDK initialization
const serviceAccount = require('./firebase-service-account.json'); // Make sure this file exists

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log("Firebase Firestore connected successfully");



app.listen(port, () => {
  console.log(`🚀 Server is running on port: ${port}`);
});
