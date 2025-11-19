import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

// Convert Firebase user to our user format
const mapFirebaseUser = (user: FirebaseUser | null): AuthUser | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || null,
  };
};

export const firebaseAuth = {
  // Login with email and password
  async login(email: string, password: string): Promise<AuthUser> {
    // Block specific email from admin login
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'admin@nikasrealty.co.ke') {
      throw new Error('This email is not authorized for admin access');
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = mapFirebaseUser(userCredential.user);
      if (!user) throw new Error('Failed to get user data');
      return user;
    } catch (error: any) {
      // Only log error code in development, not full error details
      if (import.meta.env.DEV) {
        const errorCode = error?.code || 'unknown';
        console.error('Login error:', errorCode);
      }
      // Map Firebase errors to user-friendly messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email format');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later');
      } else {
        // Don't expose internal error messages
        throw new Error('Login failed. Please try again.');
      }
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      // Only log error code in development
      if (import.meta.env.DEV) {
        const errorCode = error?.code || 'unknown';
        console.error('Logout error:', errorCode);
      }
      // Don't expose error details
      throw new Error('Logout failed');
    }
  },

  // Get current user
  getCurrentUser(): AuthUser | null {
    return mapFirebaseUser(auth.currentUser);
  },

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(mapFirebaseUser(firebaseUser));
    });
  },
};

