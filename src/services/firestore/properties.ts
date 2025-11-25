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
        if (import.meta.env.DEV) {
          console.log('Fetching properties with filters:', filters);
        }
        
        // Try optimized query first (if indexes exist)
        try {
          let q = query(collection(db, COLLECTION_NAME));

        // Apply simple filters that work well with indexes
        if (filters?.type && filters.type !== 'all') {
          q = query(q, where('type', '==', filters.type));
        }
        if (filters?.status && filters.status !== 'all') {
          q = query(q, where('status', '==', filters.status));
        }
        if (filters?.featured !== undefined) {
          q = query(q, where('featured', '==', filters.featured));
        }

        // Try to apply sorting if we have minimal filters
        if (filters?.sortBy && (!filters?.type || filters.type === 'all') && (!filters?.status || filters.status === 'all')) {
          const sortOrder = filters.order === 'desc' ? 'desc' : 'asc';
          q = query(q, orderBy(filters.sortBy, sortOrder));
        } else if (filters?.sortBy) {
          // If we have filters, try orderBy on createdAt (most common index)
          q = query(q, orderBy('createdAt', 'desc'));
        }

        // Apply pagination
        if (filters?.limit) {
          q = query(q, limit(filters.limit * 2)); // Get more to account for client-side filtering
        }

          const querySnapshot = await getDocs(q);
          let properties = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Ensure images array is properly set
              images: data.images || (data.image ? [data.image] : []),
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
            };
          }) as Property[];

          if (import.meta.env.DEV) {
            console.log(`Fetched ${properties.length} properties from Firestore`);
            if (properties.length > 0) {
              const sample = properties[0];
              console.log('Sample property structure:', {
                id: sample.id,
                title: sample.title,
                images: sample.images,
                image: sample.image,
                hasImages: !!sample.images && sample.images.length > 0
              });
            }
          }

          // Apply remaining filters client-side
          properties = this.applyClientSideFilters(properties, filters);

        // Apply pagination after filtering
        if (filters?.page && filters?.limit) {
          const startIndex = (filters.page - 1) * filters.limit;
          properties = properties.slice(startIndex, startIndex + filters.limit);
        }

        return properties;
      } catch (indexError: any) {
        // If composite index is missing, fetch all and filter/order client-side
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Firestore composite index missing, filtering client-side:', indexError.message);
          const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
          let properties = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Ensure images array is properly set
              images: data.images || (data.image ? [data.image] : []),
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
            };
          }) as Property[];

          if (import.meta.env.DEV) {
            console.log(`Fetched ${properties.length} properties from Firestore (fallback mode)`);
            if (properties.length > 0) {
              const sample = properties[0];
              console.log('Sample property structure (fallback):', {
                id: sample.id,
                title: sample.title,
                images: sample.images,
                image: sample.image,
                hasImages: !!sample.images && sample.images.length > 0
              });
            }
          }

          // Apply all filters and sorting client-side
          properties = this.applyClientSideFilters(properties, filters);

          // Apply pagination
          if (filters?.page && filters?.limit) {
            const startIndex = (filters.page - 1) * filters.limit;
            properties = properties.slice(startIndex, startIndex + filters.limit);
          }

          return properties;
        }
        throw indexError;
      }
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      
      // Provide helpful error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules allow read access to the "properties" collection.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore is unavailable. Please check your internet connection and Firebase configuration.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('Authentication required. Please check Firebase Auth configuration.');
      }
      
      throw error;
    }
  },

  // Helper method to apply client-side filters
  applyClientSideFilters(properties: Property[], filters?: {
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
  }): Property[] {
    let filtered = [...properties];

    // Apply type filter (only if specified and not 'all')
    if (filters?.type && filters.type !== 'all' && filters.type !== undefined) {
      filtered = filtered.filter(p => p.type === filters.type);
    }

    // Apply status filter (only if specified and not 'all')
    if (filters?.status && filters.status !== 'all' && filters.status !== undefined) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    // Apply featured filter
    if (filters?.featured !== undefined) {
      filtered = filtered.filter(p => p.featured === filters.featured);
    }

    // Apply price filters (only if specified)
    if (filters?.minPrice !== undefined && filters.minPrice > 0) {
      filtered = filtered.filter(p => {
        const price = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
        return price >= filters.minPrice!;
      });
    }
    if (filters?.maxPrice !== undefined && filters.maxPrice < 500000000) {
      filtered = filtered.filter(p => {
        const price = typeof p.price === 'number' ? p.price : parseFloat(String(p.price).replace(/[^0-9.]/g, '')) || 0;
        return price <= filters.maxPrice!;
      });
    }

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchLower) ||
        p.location?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply location filter
    if (filters?.location && filters.location !== 'all') {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(p => 
        p.location?.toLowerCase().includes(locationLower)
      );
    }

    // Apply bedrooms filter
    if (filters?.bedrooms && filters.bedrooms !== 'all') {
      filtered = filtered.filter(p => p.bedrooms === parseInt(filters.bedrooms!));
    }

    // Apply completion filter
    if (filters?.completion && filters.completion !== 'all') {
      filtered = filtered.filter(p => 
        (p.projectStage || p.completion || '').toLowerCase() === filters.completion!.toLowerCase()
      );
    }

    // Apply sorting
    if (filters?.sortBy) {
      const sortOrder = filters.order === 'desc' ? 'desc' : 'asc';
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (filters.sortBy === 'price') {
          aValue = typeof a.price === 'number' ? a.price : parseFloat(String(a.price).replace(/[^0-9.]/g, '')) || 0;
          bValue = typeof b.price === 'number' ? b.price : parseFloat(String(b.price).replace(/[^0-9.]/g, '')) || 0;
        } else if (filters.sortBy === 'createdAt') {
          aValue = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()) : 0;
          bValue = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()) : 0;
        } else {
          aValue = (a as any)[filters.sortBy] || '';
          bValue = (b as any)[filters.sortBy] || '';
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sort by createdAt descending
      filtered.sort((a, b) => {
        const aDate = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()) : 0;
        const bDate = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()) : 0;
        return bDate - aDate;
      });
    }

    return filtered;
  },

  // Get single property
  async getById(id: string): Promise<Property | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const property = {
          id: docSnap.id,
          ...data,
          // Ensure images array is properly set
          images: data.images || (data.image ? [data.image] : []),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Property;
        
        if (import.meta.env.DEV) {
          console.log('Property fetched by ID:', {
            id: property.id,
            title: property.title,
            images: property.images,
            image: property.image,
            hasImages: !!property.images && property.images.length > 0
          });
        }
        
        return property;
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
      // Ensure images array is properly set
      const imagesArray = property.images && property.images.length > 0 
        ? property.images 
        : property.image 
        ? [property.image] 
        : [];
      
      const propertyData = {
        ...property,
        images: imagesArray, // Store images array
        image: imagesArray[0] || "", // Store first image as main image for backward compatibility
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      if (import.meta.env.DEV) {
        console.log('Creating property with data:', propertyData);
        if (imagesArray.length > 0) {
          console.log('Property images (Cloudinary URLs):', imagesArray);
        }
      }
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), propertyData);
      const createdProperty = { id: docRef.id, ...propertyData };
      
      if (import.meta.env.DEV) {
        console.log('Property created successfully with ID:', docRef.id);
        console.log('Images stored:', createdProperty.images);
      }
      
      return createdProperty;
    } catch (error: any) {
      console.error('Error creating property:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore is unavailable. Please check your internet connection.');
      }
      throw error;
    }
  },

  // Update property
  async update(id: string, updates: Partial<Property>) {
    try {
      // Verify authentication before attempting update
      const { auth } = await import('@/lib/firebase');
      if (!auth.currentUser) {
        console.error('❌ No authenticated user found');
        throw new Error('You must be logged in to update properties. Please log in again.');
      }
      
      console.log('✅ User authenticated:', {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
      });
      
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Prepare update data - remove Date objects and id field, convert to Firestore-compatible format
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
      };
      
      // Remove fields that shouldn't be updated
      delete updateData.id;
      delete updateData.createdAt; // Don't update createdAt
      
      // Ensure images is always an array
      if (updateData.images && !Array.isArray(updateData.images)) {
        updateData.images = [updateData.images];
      }
      
      // Convert any Date objects to Timestamps (if any exist)
      Object.keys(updateData).forEach(key => {
        if (updateData[key] instanceof Date) {
          updateData[key] = Timestamp.fromDate(updateData[key]);
        }
      });
      
      console.log('🔄 Attempting Firestore update:', {
        id,
        hasAuth: !!auth.currentUser,
        updateFields: Object.keys(updateData),
      });
      
      await updateDoc(docRef, updateData);
      
      console.log('✅ Property updated successfully:', id);
      
      return await this.getById(id);
    } catch (error: any) {
      // Always log errors for debugging in production
      console.error('❌ Error updating property:', {
        id,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error,
        updateData: Object.keys(updateData),
      });
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check Firestore security rules. You may need to log in again.');
      } else if (error.code === 'not-found') {
        throw new Error('Property not found. It may have been deleted.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firestore is temporarily unavailable. Please try again.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('You must be logged in to update properties. Please log in again.');
      } else if (error.code === 'failed-precondition') {
        throw new Error('Update failed. The property may have been modified by another user.');
      }
      
      // For unknown errors, include the error code if available
      const errorMessage = error?.message || 'Failed to update property';
      throw new Error(`${errorMessage}${error?.code ? ` (${error.code})` : ''}`);
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

