/**
 * Application Configuration
 * Centralized configuration for all hardcoded values
 */

// Theme Configuration
export const THEME_CONFIG = {
  primaryColor: '#DA9100',
  primaryColorHSL: '40 100% 43%',
  gradientGold: 'linear-gradient(135deg, hsl(40 100% 35%), hsl(40 100% 50%))',
  shadowLuxury: '0 10px 40px -10px hsl(40 100% 43% / 0.3)',
} as const;

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'dc7jf9inl',
  uploadPreset: 'nikasrealty',
} as const;

// Firebase Configuration (fallback values - can be overridden by env vars)
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAgnkCrU_CuNP1EtNA9HG7P42uYOx-LeZk',
  authDomain: 'nikas-db432.firebaseapp.com',
  projectId: 'nikas-db432',
  storageBucket: 'nikas-db432.firebasestorage.app',
  messagingSenderId: '31056432402',
  appId: '1:31056432402:web:9c06fabbf234a13509f7cb',
  measurementId: 'G-PERDJVZ0SX',
} as const;

// Application Constants
export const APP_CONFIG = {
  name: 'NikasRealty',
  email: 'nikasrealty@gmail.com',
  blockedAdminEmail: 'admin@nikasrealty.co.ke',
  instagram: '@nikasrealty',
  instagramUrl: 'https://instagram.com/nikasrealty',
  facebook: 'https://www.facebook.com/nikasrealty',
  linkedin: 'https://www.linkedin.com/company/nikasrealty',
  whatsapp: '254710132320',
  whatsappUrl: 'https://wa.me/254710132320',
} as const;

// Property Configuration
export const PROPERTY_CONFIG = {
  maxPrice: 500000000, // 500M
  defaultPriceRange: [0, 500000000] as [number, number],
  propertyTypes: [
    'Apartment',
    'Mansion',
    'Maisonette',
    'Townhouse',
    'Bungalow',
    'Duplex',
    'Triplex',
  ],
  locations: [
    'Langata',
    'Ruiru',
    'Kikuyu',
    'Kilimani',
    'Kileleshwa',
    'Syokimau',
    'Kabete',
    'Muthaiga',
    'Riverside',
    'Kiambu Road',
    'Ngong',
  ],
  statusOptions: ['for-sale', 'for-rent', 'sold'] as const,
} as const;

