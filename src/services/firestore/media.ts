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
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { extractYouTubeVideoId } from '@/utils/youtubeUtils';

const COLLECTION_NAME = 'media';

export interface PropertyMedia {
  id?: string;
  title: string;
  description?: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice?: number | string;
  propertyLocation?: string;
  propertyBedrooms?: number;
  propertyType?: string;
  category?: string;
  status: 'draft' | 'published';
  publishedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const mapMediaDoc = (docSnap: { id: string; data: () => Record<string, unknown> }): PropertyMedia => {
  const data = docSnap.data();
  const status = data.status ? String(data.status).toLowerCase() : 'draft';
  return {
    id: docSnap.id,
    ...data,
    status: status === 'published' ? 'published' : 'draft',
    publishedAt: (data.publishedAt as { toDate?: () => Date })?.toDate?.(),
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.(),
  } as PropertyMedia;
};

export const mediaService = {
  async getAll(filters?: { search?: string; status?: string }) {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      if (filters?.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }

      try {
        q = query(q, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        let items = snapshot.docs.map(mapMediaDoc);

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          items = items.filter(
            (item) =>
              item.title.toLowerCase().includes(searchLower) ||
              item.propertyTitle?.toLowerCase().includes(searchLower)
          );
        }

        return items;
      } catch (indexError: unknown) {
        const err = indexError as { code?: string; message?: string };
        if (err.code === 'failed-precondition' || err.message?.includes('index')) {
          const snapshot = await getDocs(collection(db, COLLECTION_NAME));
          let items = snapshot.docs.map(mapMediaDoc);

          if (filters?.status && filters.status !== 'all') {
            items = items.filter((item) => item.status === filters.status);
          }

          items.sort((a, b) => {
            const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
            const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
            return bDate - aDate;
          });

          if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            items = items.filter(
              (item) =>
                item.title.toLowerCase().includes(searchLower) ||
                item.propertyTitle?.toLowerCase().includes(searchLower)
            );
          }

          return items;
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  },

  async getPublished() {
    try {
      try {
        const q = query(
          collection(db, COLLECTION_NAME),
          where('status', 'in', ['published', 'Published']),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapMediaDoc);
      } catch (indexError: unknown) {
        const err = indexError as { code?: string; message?: string };
        if (err.code === 'failed-precondition' || err.message?.includes('index')) {
          const q = query(
            collection(db, COLLECTION_NAME),
            where('status', 'in', ['published', 'Published'])
          );
          const snapshot = await getDocs(q);
          const items = snapshot.docs.map(mapMediaDoc);
          return items.sort((a, b) => {
            const aDate = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
            const bDate = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
            return bDate - aDate;
          });
        }
        throw indexError;
      }
    } catch (error) {
      console.error('Error fetching published media:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<PropertyMedia | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return mapMediaDoc(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching media item:', error);
      throw error;
    }
  },

  async create(media: Omit<PropertyMedia, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'youtubeVideoId'> & { youtubeUrl: string }) {
    try {
      const videoId = extractYouTubeVideoId(media.youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL. Please provide a valid YouTube link.');
      }

      const status = media.status?.toLowerCase() === 'published' ? 'published' : 'draft';
      const mediaData = {
        ...media,
        youtubeVideoId: videoId,
        status,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        publishedAt: status === 'published' ? Timestamp.now() : null,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), mediaData);
      return { id: docRef.id, ...mediaData };
    } catch (error) {
      console.error('Error creating media:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<PropertyMedia>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData: Record<string, unknown> = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      delete updateData.id;
      delete updateData.createdAt;

      if (updates.youtubeUrl) {
        const videoId = extractYouTubeVideoId(updates.youtubeUrl);
        if (!videoId) {
          throw new Error('Invalid YouTube URL. Please provide a valid YouTube link.');
        }
        updateData.youtubeVideoId = videoId;
      }

      if (updates.status === 'published') {
        const currentDoc = await getDoc(docRef);
        if (currentDoc.exists() && !currentDoc.data().publishedAt) {
          updateData.publishedAt = Timestamp.now();
        }
      }

      await updateDoc(docRef, updateData);
      return await this.getById(id);
    } catch (error) {
      console.error('Error updating media:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  },

  async getStats() {
    try {
      const all = await this.getAll();
      const published = all.filter((item) => item.status === 'published').length;
      const drafts = all.filter((item) => item.status === 'draft').length;
      return { total: all.length, published, drafts };
    } catch (error) {
      console.error('Error fetching media stats:', error);
      throw error;
    }
  },
};
