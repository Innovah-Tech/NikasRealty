import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration (hardcoded per request)
const firebaseConfig = {
  apiKey: 'AIzaSyAgnkCrU_CuNP1EtNA9HG7P42uYOx-LeZk',
  authDomain: 'nikas-db432.firebaseapp.com',
  projectId: 'nikas-db432',
  storageBucket: 'nikas-db432.firebasestorage.app',
  messagingSenderId: '31056432402',
  appId: '1:31056432402:web:9c06fabbf234a13509f7cb',
  measurementId: 'G-PERDJVZ0SX',
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

