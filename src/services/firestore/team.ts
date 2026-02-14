import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_NAME = 'team';

export interface TeamMember {
  id?: string;
  name: string;
  role: string;
  photo?: string;
  email?: string;
  phone?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const teamService = {
  // Get all team members
  async getAll() {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as TeamMember[];
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  // Get single team member
  async getById(id: string): Promise<TeamMember | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as TeamMember;
      }
      return null;
    } catch (error) {
      console.error('Error fetching team member:', error);
      throw error;
    }
  },

  // Create team member
  async create(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      console.log('Creating team member with data:', member);

      // Filter out undefined fields which Firebase doesn't support
      // Using a robust fallback instead of Object.fromEntries if possible
      const cleanedData: Record<string, any> = {};
      Object.entries(member).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedData[key] = value;
        }
      });

      const memberData = {
        ...cleanedData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), memberData);
      return { id: docRef.id, ...memberData };
    } catch (error: any) {
      console.error('Firestore Error details:', {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  },

  // Update team member
  async update(id: string, updates: Partial<TeamMember>) {
    try {
      // Filter out undefined fields
      const cleanedUpdates: Record<string, any> = {};
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          cleanedUpdates[key] = value;
        }
      });

      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...cleanedUpdates,
        updatedAt: Timestamp.now(),
      });
      return await this.getById(id);
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  // Delete team member
  async delete(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  },
};

