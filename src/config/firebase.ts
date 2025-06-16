import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAVJR1Q9XhG4bSaLCjfCptRU0V8syLRRd8",
  authDomain: "it-dept-letter.firebaseapp.com",
  projectId: "it-dept-letter",
  storageBucket: "it-dept-letter.firebasestorage.app",
  messagingSenderId: "525048594377",
  appId: "1:525048594377:web:a5936a67c3eb70ae06b218",
  measurementId: "G-BK8131QV7M" // Added measurementId
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
let analytics;
// Initialize Analytics only in the browser environment
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}


export { app, auth, db, analytics };
