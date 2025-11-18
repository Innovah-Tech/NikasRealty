import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

/**
 * Firebase configuration
 *
 * We still ship sane defaults so local environments just work out of the box,
 * but any `VITE_FIREBASE_*` env variable will override the defaults. This lets
 * production deployments point to the live Firebase project (with the existing
 * blog data) instead of being locked to the fallback credentials.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAgnkCrU_CuNP1EtNA9HG7P42uYOx-LeZk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'nikas-db432.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'nikas-db432',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'nikas-db432.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '31056432402',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:31056432402:web:9c06fabbf234a13509f7cb',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PERDJVZ0SX',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const firebaseAnalytics = analytics;

export default app;

