import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '@/lib/firebase';
import { imageHosting } from './imageHosting';
import { CLOUDINARY_CONFIG } from '@/config/constants';
import { prepareImageFile, prepareImageFiles } from '@/utils/imageUtils';

// Use Cloudinary for image hosting (free tier, no backend needed)
const useCloudinary = (): boolean => {
  return !!(CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.uploadPreset);
};

export const firebaseStorage = {
  // Upload a file - uses Cloudinary if configured, otherwise Firebase Storage
  async uploadFile(file: File, path: string): Promise<string> {
    const processedFile = await prepareImageFile(file);

    // Use Cloudinary if configured
    if (useCloudinary()) {
      console.log('Using Cloudinary for file upload');
      try {
        return await imageHosting.uploadImage(processedFile);
      } catch (error: any) {
        console.error('Cloudinary upload failed, falling back to Firebase:', error);
      }
    } else {
      console.log('Cloudinary not configured, using Firebase Storage');
    }

    // Fallback to Firebase Storage
    try {
      if (!auth.currentUser) {
        throw new Error('You must be logged in to upload files');
      }

      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, processedFile);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading file:', error);

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
    const processedFiles = await prepareImageFiles(files);

    // Use Cloudinary if configured
    if (useCloudinary()) {
      console.log(`Using Cloudinary for batch upload of ${processedFiles.length} files`);
      try {
        return await imageHosting.uploadImages(processedFiles);
      } catch (error: any) {
        console.error('Cloudinary upload failed, falling back to Firebase:', error);
      }
    } else {
      console.log('Cloudinary not configured, using Firebase Storage for batch upload');
    }

    // Fallback to Firebase Storage
    try {
      if (!auth.currentUser) {
        throw new Error('You must be logged in to upload files');
      }

      const uploadPromises = processedFiles.map((file, index) => {
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

