import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { FIREBASE_CONFIG } from '@/config/constants';

/**
 * Firebase configuration
 *
 * SECURITY NOTE: Firebase API keys are public by design for client-side apps.
 * Security is enforced via Firebase Security Rules, NOT the API key.
 * 
 * CRITICAL: Ensure Firebase Security Rules are properly configured:
 * - Firestore: Only authenticated admins can write; public can read published content
 * - Storage: Only authenticated users can upload; public can read
 * - Set up Firebase App Check to prevent abuse
 *
 * We still ship sane defaults so local environments just work out of the box,
 * but any `VITE_FIREBASE_*` env variable will override the defaults. This lets
 * production deployments point to the live Firebase project (with the existing
 * blog data) instead of being locked to the fallback credentials.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || FIREBASE_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || FIREBASE_CONFIG.measurementId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const firebaseAnalytics = analytics;

// Test Firestore connection (works in both dev and production for debugging)
if (typeof window !== 'undefined') {
  import('firebase/firestore').then(({ collection, getDocs }) => {
    getDocs(collection(db, 'properties'))
      .then((snapshot) => {
        console.log(`✅ Firestore connected. Found ${snapshot.size} properties in database.`);
        console.log('🔧 Firebase Config:', {
          projectId: firebaseConfig.projectId,
          authDomain: firebaseConfig.authDomain,
          isProduction: !import.meta.env.DEV,
        });
      })
      .catch((error) => {
        console.error('❌ Firestore connection error:', error);
        if (error.code === 'permission-denied') {
          console.error('⚠️ Permission denied. Please check Firestore security rules.');
        }
      });
  });
}

export default app;

