// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - temporary hardcoded values for testing
// IMPORTANT: Replace these with your actual Firebase config values from .env in production
const firebaseConfig = {
  apiKey: "AIzaSyALPl8_zrpBFGgFRuGt4f5xurUNCGxgOKE",
  authDomain: "code-diyers.firebaseapp.com",
  projectId: "code-diyers",
  storageBucket: "code-diyers.firebasestorage.app",
  messagingSenderId: "681061399863",
  appId: "1:681061399863:web:32e7bf03760c2f66c0aeb2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app; 