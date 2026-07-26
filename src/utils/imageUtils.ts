/**
 * Image utility functions for Cloudinary
 */

const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/';

const isHeicUrl = (url: string): boolean => /\.heic($|\?)/i.test(url) || /\.heif($|\?)/i.test(url);

const hasCloudinaryTransformations = (pathAfterUpload: string): boolean => {
  const firstSegment = pathAfterUpload.split('/')[0] ?? '';
  return firstSegment.includes(',') || firstSegment.includes('_');
};

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
  if (!url || url.startsWith('/') || !url.includes('cloudinary.com')) {
    return url;
  }

  const uploadIndex = url.indexOf(CLOUDINARY_UPLOAD_SEGMENT);
  if (uploadIndex === -1) {
    return url;
  }

  const base = url.slice(0, uploadIndex + CLOUDINARY_UPLOAD_SEGMENT.length);
  const pathAfterUpload = url.slice(uploadIndex + CLOUDINARY_UPLOAD_SEGMENT.length);

  if (hasCloudinaryTransformations(pathAfterUpload)) {
    return url;
  }

  const transformations: string[] = ['c_limit'];

  if (width) transformations.unshift(`w_${width}`);
  if (height) transformations.unshift(`h_${height}`);

  // HEIC/HEIF is not supported in browsers — force JPEG delivery from Cloudinary
  if (isHeicUrl(url)) {
    transformations.push('f_jpg');
  } else {
    transformations.push('f_auto');
  }

  transformations.push(quality ? `q_${quality}` : 'q_auto');

  return `${base}${transformations.join(',')}/${pathAfterUpload}`;
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

/** Resolve a property image URL for display (handles HEIC via Cloudinary transforms). */
export const getPropertyImageUrl = (
  url: string,
  size: 'thumbnail' | 'card' | 'full' = 'card'
): string => {
  const widths = { thumbnail: 400, card: 800, full: 1600 };
  return getOptimizedImageUrl(url, widths[size]);
};

