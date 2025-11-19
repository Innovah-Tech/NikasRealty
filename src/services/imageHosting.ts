/**
 * Image hosting service using Cloudinary
 * Free tier: 25GB storage, 25GB bandwidth/month
 * No backend API needed - direct upload from browser
 */

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

// Get Cloudinary config - hardcoded values
const getCloudinaryConfig = (): CloudinaryConfig => {
  const cloudName = 'dc7jf9inl';
  const uploadPreset = 'nikasrealty';
  
  return { cloudName, uploadPreset };
};

export const imageHosting = {
  /**
   * Upload a single image to Cloudinary
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const { cloudName, uploadPreset } = getCloudinaryConfig();
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        let errorMessage = error.error?.message || 'Failed to upload image';
        
        // Provide helpful error messages for common issues
        if (errorMessage.includes('whitelisted') || errorMessage.includes('unsigned')) {
          const uploadPreset = 'nikasrealty';
          errorMessage = `Upload preset must be configured for unsigned uploads. Please check Cloudinary settings: Settings → Upload → Upload presets → Edit "${uploadPreset}" preset → Set Signing mode to "Unsigned"`;
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data.secure_url; // Returns the CDN URL
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  },

  /**
   * Upload multiple images
   */
  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file));
      return await Promise.all(uploadPromises);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      throw error;
    }
  },

  /**
   * Delete an image from Cloudinary (optional - requires signed requests or backend)
   * Note: This requires additional setup with Cloudinary admin API
   */
  async deleteImage(imageUrl: string): Promise<void> {
    // For now, we'll just log - actual deletion requires backend or signed requests
    console.warn('Image deletion not implemented. Images will remain in Cloudinary.');
    // In production, you might want to track image URLs in Firestore
    // and delete them via a Cloud Function or backend
  },
};

