/**
 * Image utility functions for Cloudinary
 */

/**
 * Get optimized Cloudinary image URL
 * @param url - Original image URL (Cloudinary or other)
 * @param width - Desired width (optional)
 * @param height - Desired height (optional)
 * @param quality - Image quality 1-100 (optional, default: auto)
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  // If it's a Cloudinary URL, add transformation parameters
  if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
    const parts = url.split('/image/upload/');
    if (parts.length === 2) {
      const transformations: string[] = [];
      
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      if (quality) transformations.push(`q_${quality}`);
      
      // Add auto format and quality optimization
      transformations.push('f_auto', 'c_limit');
      
      const transformString = transformations.join(',');
      return `${parts[0]}/image/upload/${transformString}/${parts[1]}`;
    }
  }
  
  // Return original URL if not Cloudinary
  return url;
};

/**
 * Check if URL is a Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('cloudinary.com') && url.includes('/image/upload/');
};

/**
 * Get thumbnail URL from Cloudinary
 */
export const getThumbnailUrl = (url: string, size: number = 300): string => {
  return getOptimizedImageUrl(url, size, size, 75);
};

