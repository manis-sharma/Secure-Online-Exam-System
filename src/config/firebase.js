/**
 * Firebase Configuration
 * 
 * This file initializes Firebase services for the exam application.
 * Ensure environment variables are properly set in .env file.
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore, 
  enableIndexedDbPersistence
} from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Validate configuration
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration:', missingFields.join(', '));
    throw new Error('Firebase configuration incomplete. Check environment variables.');
  }
};

validateConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add school domain restriction if configured
const allowedDomain = process.env.REACT_APP_ALLOWED_DOMAIN;
if (allowedDomain) {
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    hd: allowedDomain  // Restricts to school domain
  });
}

// Set persistence to local (survives browser restart)
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

// Initialize Firestore
const db = getFirestore(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db)
  .catch((error) => {
    if (error.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab
      console.warn('Firestore persistence unavailable: Multiple tabs open');
    } else if (error.code === 'unimplemented') {
      // Browser doesn't support persistence
      console.warn('Firestore persistence unavailable: Not supported in this browser');
    }
  });

// Connect to emulator in development (uncomment if using emulators)
// if (process.env.NODE_ENV === 'development') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
// }

// Exam configuration
export const EXAM_CONFIG = {
  QUESTION_TIME_LIMIT: parseInt(process.env.REACT_APP_QUESTION_TIME_LIMIT) || 30,
  TAB_SWITCH_PENALTY_TIME: parseInt(process.env.REACT_APP_TAB_SWITCH_PENALTY_TIME) || 10,
  MARKS_CORRECT: 1,
  MARKS_WRONG: -1,
  MARKS_UNANSWERED: -1,
  ALLOWED_DOMAIN: allowedDomain || null
};

export { app, auth, db, googleProvider };
