import heic2any from 'heic2any';

/**
 * Prepares image file for upload.
 * Automatically converts iPhone HEIC/HEIF files to standard JPEG format
 * so that they can be uploaded and rendered across all browsers.
 */
export async function prepareImageFile(file: File): Promise<File> {
  const fileName = file.name || '';
  const fileType = (file.type || '').toLowerCase();
  const isHeic =
    /\.(heic|heif)$/i.test(fileName) ||
    fileType === 'image/heic' ||
    fileType === 'image/heif' ||
    fileType === 'image/heic-sequence' ||
    fileType === 'image/heif-sequence';

  if (!isHeic) {
    return file;
  }

  console.log(`Converting iPhone HEIC image (${fileName}) to JPEG...`);

  try {
    const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.88,
    });

    const blob = Array.isArray(result) ? result[0] : result;
    const cleanName = fileName.replace(/\.(heic|heif)$/i, '');
    const newName = `${cleanName || 'iphone_photo'}.jpg`;

    return new File([blob], newName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('HEIC image conversion failed, proceeding with original file:', error);
    return file;
  }
}

/**
 * Prepares multiple image files (converting any HEIC/HEIF files to JPEG).
 */
export async function prepareImageFiles(files: File[] | FileList): Promise<File[]> {
  const fileArray = Array.from(files);
  return Promise.all(fileArray.map((file) => prepareImageFile(file)));
}

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

/**
 * Resolve a property image URL for display (handles HEIC via Cloudinary transforms).
 */
export const getPropertyImageUrl = (
  url: string,
  size: 'thumbnail' | 'card' | 'full' = 'card'
): string => {
  const widths = { thumbnail: 400, card: 800, full: 1600 };
  return getOptimizedImageUrl(url, widths[size]);
};
