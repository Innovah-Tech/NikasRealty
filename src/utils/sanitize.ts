/**
 * Input Sanitization Utilities
 * Protects against XSS attacks by sanitizing user input
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize text input - removes all HTML tags and dangerous content
 * Use for: names, titles, descriptions, messages
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Strip all HTML tags and attributes
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  }).trim();
};

/**
 * Sanitize email - removes HTML but keeps email format
 */
export const sanitizeEmail = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML but allow email characters
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();
  
  // Additional email validation
  return sanitized.toLowerCase();
};

/**
 * Sanitize phone number - removes HTML but keeps phone format
 */
export const sanitizePhone = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML but allow phone characters
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  }).trim();
  
  return sanitized;
};

/**
 * Sanitize rich text content (for blog posts, descriptions)
 * Allows safe HTML tags but removes dangerous ones
 */
export const sanitizeRichText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Allow safe HTML tags for formatting
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize array of strings (for features, tags, etc.)
 */
export const sanitizeArray = (input: string[]): string[] => {
  if (!Array.isArray(input)) return [];
  
  return input
    .map(item => sanitizeText(String(item)))
    .filter(item => item.length > 0);
};

