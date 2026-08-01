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
        let blogs = querySnapshot.docs.map(doc => {
          const data = doc.data();
          // Normalize status field
          const status = data.status ? String(data.status).toLowerCase() : 'draft';
          const normalizedStatus = status === 'published' ? 'published' : 'draft';
          return {
            id: doc.id,
            ...data,
            status: normalizedStatus,
            publishedAt: data.publishedAt?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          };
        }) as Blog[];

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
          let blogs = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Normalize status field
            const status = data.status ? String(data.status).toLowerCase() : 'draft';
            const normalizedStatus = status === 'published' ? 'published' : 'draft';
            return {
              id: doc.id,
              ...data,
              status: normalizedStatus,
              publishedAt: data.publishedAt?.toDate(),
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
            };
          }) as Blog[];

          // Filter by status (client-side) - case insensitive
          if (filters?.status && filters.status !== 'all') {
            const filterStatus = String(filters.status).toLowerCase();
            blogs = blogs.filter(b => String(b.status).toLowerCase() === filterStatus);
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
  // Query by status so Firestore security rules allow unauthenticated reads
  async getPublished() {
    const mapBlogDoc = (docSnap: { id: string; data: () => Record<string, unknown> }): Blog => {
      const data = docSnap.data();
      const status = data.status ? String(data.status).toLowerCase().trim() : 'draft';
      const normalizedStatus = status === 'published' ? 'published' : 'draft';
      return {
        id: docSnap.id,
        ...data,
        status: normalizedStatus,
        publishedAt: (data.publishedAt as { toDate?: () => Date })?.toDate?.(),
        createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.(),
        updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.(),
      } as Blog;
    };

    const sortByCreatedAt = (blogs: Blog[]) =>
      blogs.sort((a, b) => {
        const aDate = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()) : 0;
        const bDate = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()) : 0;
        return bDate - aDate;
      });

    try {
      // Scoped query required for public reads when rules restrict drafts
      try {
        let q = query(
          collection(db, COLLECTION_NAME),
          where('status', 'in', ['published', 'Published']),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const blogs = querySnapshot.docs.map(mapBlogDoc);

        if (import.meta.env.DEV) {
          console.log(`Fetched ${blogs.length} published blogs from Firestore`);
        }

        return blogs;
      } catch (indexError: unknown) {
        const err = indexError as { code?: string; message?: string };
        if (err.code === 'failed-precondition' || err.message?.includes('index')) {
          console.warn('Firestore composite index missing for published blogs, sorting client-side:', err.message);
          const q = query(collection(db, COLLECTION_NAME), where('status', 'in', ['published', 'Published']));
          const querySnapshot = await getDocs(q);
          const blogs = sortByCreatedAt(querySnapshot.docs.map(mapBlogDoc));

          if (import.meta.env.DEV) {
            console.log(`Fetched ${blogs.length} published blogs (fallback query)`);
          }

          return blogs;
        }
        throw indexError;
      }
    } catch (error: any) {
      console.error('Error fetching published blogs:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        name: error?.name
      });
      
      // Provide more helpful error messages
      if (error?.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules allow read access to the "blogs" collection.');
      } else if (error?.code === 'unavailable') {
        throw new Error('Firestore is unavailable. Please check your internet connection and Firebase configuration.');
      }
      
      throw error;
    }
  },

  // Get single blog
  async getById(id: string): Promise<Blog | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Normalize status field
        const status = data.status ? String(data.status).toLowerCase() : 'draft';
        const normalizedStatus = status === 'published' ? 'published' : 'draft';
        
        return {
          id: docSnap.id,
          ...data,
          status: normalizedStatus,
          publishedAt: data.publishedAt?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
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
      // Ensure status is lowercase and valid
      const status = (blog.status || 'draft').toLowerCase() === 'published' ? 'published' : 'draft';
      
      const blogData = {
        ...blog,
        status, // Normalize status to lowercase
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        publishedAt: status === 'published' ? Timestamp.now() : null,
      };
      
      if (import.meta.env.DEV) {
        console.log('Creating blog with data:', {
          title: blogData.title,
          status: blogData.status,
          publishedAt: blogData.publishedAt,
        });
      }
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), blogData);
      
      if (import.meta.env.DEV) {
        console.log('Blog created successfully with ID:', docRef.id);
      }
      
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

