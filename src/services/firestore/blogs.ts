import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_NAME = 'blogs';

export interface Blog {
  id?: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  status: 'draft' | 'published';
  publishedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const blogsService = {
  // Get all blogs with optional filters
  async getAll(filters?: {
    search?: string;
    status?: string;
  }) {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Apply status filter first
      if (filters?.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      // Order by createdAt descending
      // Note: If filtering by status, Firestore requires a composite index
      // If the index doesn't exist, we'll catch the error and filter client-side
      try {
        q = query(q, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        let blogs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          publishedAt: doc.data().publishedAt?.toDate(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Blog[];

        // Apply search filter (client-side)
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          blogs = blogs.filter(b => 
            b.title.toLowerCase().includes(searchLower) ||
            b.summary.toLowerCase().includes(searchLower)
          );
        }

        return blogs;
      } catch (indexError: any) {
        // If composite index is missing, fetch all and filter/order client-side
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Firestore composite index missing, filtering client-side:', indexError.message);
          const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
          let blogs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            publishedAt: doc.data().publishedAt?.toDate(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Blog[];

          // Filter by status (client-side)
          if (filters?.status && filters.status !== 'all') {
            blogs = blogs.filter(b => b.status === filters.status);
          }

          // Sort by createdAt descending (client-side)
          blogs.sort((a, b) => {
            const aDate = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()) : 0;
            const bDate = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()) : 0;
            return bDate - aDate;
          });

          // Apply search filter (client-side)
          if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            blogs = blogs.filter(b => 
              b.title.toLowerCase().includes(searchLower) ||
              b.summary.toLowerCase().includes(searchLower)
            );
          }

          return blogs;
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
    }
  },

  // Get published blogs (public)
  // Always use client-side filtering to ensure reliability regardless of Firestore indexes
  async getPublished() {
    try {
      // Fetch all blogs and filter client-side to avoid index issues
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      let blogs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Blog[];

      // Filter by published status (client-side)
      blogs = blogs.filter(b => b.status === 'published');

      // Sort by createdAt descending (client-side)
      blogs.sort((a, b) => {
        const aDate = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()) : 0;
        const bDate = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()) : 0;
        return bDate - aDate;
      });

      if (import.meta.env.DEV) {
        console.log(`Fetched ${blogs.length} published blogs from Firestore`);
      }

      return blogs;
    } catch (error) {
      console.error('Error fetching published blogs:', error);
      throw error;
    }
  },

  // Get single blog
  async getById(id: string): Promise<Blog | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          publishedAt: docSnap.data().publishedAt?.toDate(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as Blog;
      }
      return null;
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw error;
    }
  },

  // Create blog
  async create(blog: Omit<Blog, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>) {
    try {
      const blogData = {
        ...blog,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        publishedAt: blog.status === 'published' ? Timestamp.now() : null,
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), blogData);
      return { id: docRef.id, ...blogData };
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Update blog
  async update(id: string, updates: Partial<Blog>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      // If status changed to published and publishedAt is not set, set it
      if (updates.status === 'published' && !updates.publishedAt) {
        const currentDoc = await getDoc(docRef);
        if (currentDoc.exists() && !currentDoc.data().publishedAt) {
          updateData.publishedAt = Timestamp.now();
        }
      }
      
      await updateDoc(docRef, updateData);
      return await this.getById(id);
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  },

  // Delete blog
  async delete(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  },

  // Get statistics
  async getStats() {
    try {
      const allBlogs = await this.getAll();
      const published = allBlogs.filter(b => b.status === 'published').length;
      const drafts = allBlogs.filter(b => b.status === 'draft').length;
      
      return {
        total: allBlogs.length,
        published,
        drafts,
      };
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      throw error;
    }
  },
};

