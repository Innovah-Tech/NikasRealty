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
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COLLECTION_NAME = 'properties';

export interface Property {
  id?: string;
  title: string;
  description: string;
  type: string;
  price: number | string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: string;
  status: string;
  image?: string;
  images?: string[];
  gallery?: string[];
  featured?: boolean;
  completion?: string;
  projectStage?: string;
  features?: string[];
  paymentOptions?: string[];
  completionDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const propertiesService = {
  // Get all properties with optional filters
  async getAll(filters?: {
    search?: string;
    type?: string;
    status?: string;
    location?: string;
    bedrooms?: string;
    completion?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    try {
      let q = query(collection(db, COLLECTION_NAME));

      // Apply filters
      if (filters?.type && filters.type !== 'all') {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters?.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.featured !== undefined) {
        q = query(q, where('featured', '==', filters.featured));
      }
      if (filters?.minPrice) {
        q = query(q, where('price', '>=', filters.minPrice));
      }
      if (filters?.maxPrice) {
        q = query(q, where('price', '<=', filters.maxPrice));
      }

      // Apply sorting
      if (filters?.sortBy) {
        const sortOrder = filters.order === 'desc' ? 'desc' : 'asc';
        q = query(q, orderBy(filters.sortBy, sortOrder));
      }

      // Apply pagination
      if (filters?.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      let properties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Property[];

      // Apply search filter (client-side for text search)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        properties = properties.filter(p => 
          p.title?.toLowerCase().includes(searchLower) ||
          p.location?.toLowerCase().includes(searchLower)
        );
      }

      // Apply location filter (client-side for partial matching)
      if (filters?.location && filters.location !== 'all') {
        const locationLower = filters.location.toLowerCase();
        properties = properties.filter(p => 
          p.location?.toLowerCase().includes(locationLower)
        );
      }

      // Apply bedrooms filter
      if (filters?.bedrooms && filters.bedrooms !== 'all') {
        properties = properties.filter(p => p.bedrooms === parseInt(filters.bedrooms!));
      }

      // Apply completion filter
      if (filters?.completion && filters.completion !== 'all') {
        properties = properties.filter(p => 
          (p.projectStage || p.completion || '').toLowerCase() === filters.completion!.toLowerCase()
        );
      }

      return properties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Get single property
  async getById(id: string): Promise<Property | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as Property;
      }
      return null;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  },

  // Create property
  async create(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const propertyData = {
        ...property,
        image: property.image || property.images?.[0] || "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), propertyData);
      return { id: docRef.id, ...propertyData };
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  // Update property
  async update(id: string, updates: Partial<Property>) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      return await this.getById(id);
    } catch (error) {
      console.error('Error updating property:', error);
      throw error;
    }
  },

  // Delete property
  async delete(id: string) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting property:', error);
      throw error;
    }
  },

  // Get statistics
  async getStats() {
    try {
      const allProperties = await this.getAll();
      const sales = allProperties.filter(p => p.status === 'For Sale' || p.status === 'for-sale').length;
      const rentals = allProperties.filter(p => p.status === 'For Rent' || p.status === 'for-rent').length;
      
      return {
        total: allProperties.length,
        sales,
        rentals,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },
};

