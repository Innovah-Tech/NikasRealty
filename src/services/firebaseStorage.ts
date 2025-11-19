import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '@/lib/firebase';
import { imageHosting } from './imageHosting';

// Use Cloudinary for image hosting (free tier, no backend needed)
// SECURITY NOTE: These credentials are public by design for unsigned uploads.
// Security is enforced via Cloudinary upload preset restrictions.
// Ensure proper restrictions are configured in Cloudinary dashboard.
const useCloudinary = (): boolean => {
  const cloudName = 'dc7jf9inl';
  const uploadPreset = 'nikasrealty';
  return !!(cloudName && uploadPreset);
};

export const firebaseStorage = {
  // Upload a file - uses Cloudinary if configured, otherwise Firebase Storage
  async uploadFile(file: File, path: string): Promise<string> {
    // Use Cloudinary if configured
    if (useCloudinary()) {
      try {
        return await imageHosting.uploadImage(file);
      } catch (error: any) {
        console.error('Cloudinary upload failed, falling back to Firebase:', error);
        // Fall through to Firebase Storage
      }
    }

    // Fallback to Firebase Storage
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('You must be logged in to upload files');
      }

      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      // Provide more helpful error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('You do not have permission to upload files. Please check Firebase Storage rules.');
      } else if (error.code === 'storage/canceled') {
        throw new Error('Upload was canceled');
      } else if (error.code === 'storage/unknown') {
        throw new Error('An unknown error occurred. This might be a CORS issue. Please check Firebase Storage CORS configuration.');
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to upload file. Please check your internet connection and try again.');
      }
    }
  },

  // Upload multiple files
  async uploadFiles(files: File[], basePath: string): Promise<string[]> {
    // Use Cloudinary if configured
    if (useCloudinary()) {
      try {
        return await imageHosting.uploadImages(files);
      } catch (error: any) {
        console.error('Cloudinary upload failed, falling back to Firebase:', error);
        // Fall through to Firebase Storage
      }
    }

    // Fallback to Firebase Storage
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('You must be logged in to upload files');
      }

      const uploadPromises = files.map((file, index) => {
        const fileName = `${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const path = `${basePath}/${fileName}`;
        return this.uploadFile(file, path);
      });
      return await Promise.all(uploadPromises);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      throw error;
    }
  },

  // Delete a file from Firebase Storage
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  // Get download URL from path
  async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  },
};

