/**
 * Input Validation Utilities
 * Validates user input with length limits and format checks
 */

// Validation limits
export const VALIDATION_LIMITS = {
  name: { min: 1, max: 100 },
  email: { min: 3, max: 254 },
  phone: { min: 10, max: 20 },
  message: { min: 1, max: 5000 },
  title: { min: 1, max: 200 },
  description: { min: 1, max: 10000 },
  bio: { min: 0, max: 1000 },
  role: { min: 1, max: 100 },
  location: { min: 1, max: 200 },
  features: { maxItems: 50, maxItemLength: 200 },
  price: { min: 0, max: 1000000000 }, // 1 billion
  bedrooms: { min: 0, max: 20 },
  bathrooms: { min: 0, max: 20 },
  size: { min: 0, max: 100 },
} as const;

/**
 * Validate name
 */
export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  
  const trimmed = name.trim();
  if (trimmed.length < VALIDATION_LIMITS.name.min) {
    return { valid: false, error: `Name must be at least ${VALIDATION_LIMITS.name.min} character` };
  }
  if (trimmed.length > VALIDATION_LIMITS.name.max) {
    return { valid: false, error: `Name must be less than ${VALIDATION_LIMITS.name.max} characters` };
  }
  
  return { valid: true };
};

/**
 * Validate email
 */
export const validateEmail = (email: string, required: boolean = false): { valid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    if (required) {
      return { valid: false, error: 'Email is required' };
    }
    return { valid: true }; // Optional email
  }
  
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length < VALIDATION_LIMITS.email.min) {
    return { valid: false, error: 'Email is too short' };
  }
  if (trimmed.length > VALIDATION_LIMITS.email.max) {
    return { valid: false, error: 'Email is too long' };
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  
  const trimmed = phone.trim();
  if (trimmed.length < VALIDATION_LIMITS.phone.min) {
    return { valid: false, error: `Phone number must be at least ${VALIDATION_LIMITS.phone.min} digits` };
  }
  if (trimmed.length > VALIDATION_LIMITS.phone.max) {
    return { valid: false, error: `Phone number must be less than ${VALIDATION_LIMITS.phone.max} characters` };
  }
  
  // Allow digits, spaces, dashes, parentheses, and + for international format
  const phoneRegex = /^[\d\s\-()+]+$/;
  if (!phoneRegex.test(trimmed)) {
    return { valid: false, error: 'Phone number contains invalid characters' };
  }
  
  return { valid: true };
};

/**
 * Validate message/text content
 */
export const validateMessage = (message: string, fieldName: string = 'Message'): { valid: boolean; error?: string } => {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  const trimmed = message.trim();
  if (trimmed.length < VALIDATION_LIMITS.message.min) {
    return { valid: false, error: `${fieldName} must be at least ${VALIDATION_LIMITS.message.min} character` };
  }
  if (trimmed.length > VALIDATION_LIMITS.message.max) {
    return { valid: false, error: `${fieldName} must be less than ${VALIDATION_LIMITS.message.max} characters` };
  }
  
  return { valid: true };
};

/**
 * Validate title
 */
export const validateTitle = (title: string): { valid: boolean; error?: string } => {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Title is required' };
  }
  
  const trimmed = title.trim();
  if (trimmed.length < VALIDATION_LIMITS.title.min) {
    return { valid: false, error: `Title must be at least ${VALIDATION_LIMITS.title.min} character` };
  }
  if (trimmed.length > VALIDATION_LIMITS.title.max) {
    return { valid: false, error: `Title must be less than ${VALIDATION_LIMITS.title.max} characters` };
  }
  
  return { valid: true };
};

/**
 * Validate description
 */
export const validateDescription = (description: string): { valid: boolean; error?: string } => {
  if (!description || typeof description !== 'string') {
    return { valid: false, error: 'Description is required' };
  }
  
  const trimmed = description.trim();
  if (trimmed.length < VALIDATION_LIMITS.description.min) {
    return { valid: false, error: `Description must be at least ${VALIDATION_LIMITS.description.min} character` };
  }
  if (trimmed.length > VALIDATION_LIMITS.description.max) {
    return { valid: false, error: `Description must be less than ${VALIDATION_LIMITS.description.max} characters` };
  }
  
  return { valid: true };
};

/**
 * Validate price
 */
export const validatePrice = (price: number | string): { valid: boolean; error?: string } => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return { valid: false, error: 'Price must be a valid number' };
  }
  
  if (numPrice < VALIDATION_LIMITS.price.min) {
    return { valid: false, error: 'Price cannot be negative' };
  }
  if (numPrice > VALIDATION_LIMITS.price.max) {
    return { valid: false, error: `Price cannot exceed ${VALIDATION_LIMITS.price.max.toLocaleString()}` };
  }
  
  return { valid: true };
};

/**
 * Validate features array
 */
export const validateFeatures = (features: string[]): { valid: boolean; error?: string } => {
  if (!Array.isArray(features)) {
    return { valid: false, error: 'Features must be an array' };
  }
  
  if (features.length > VALIDATION_LIMITS.features.maxItems) {
    return { valid: false, error: `Cannot have more than ${VALIDATION_LIMITS.features.maxItems} features` };
  }
  
  for (const feature of features) {
    if (typeof feature !== 'string' || feature.length > VALIDATION_LIMITS.features.maxItemLength) {
      return { valid: false, error: `Each feature must be less than ${VALIDATION_LIMITS.features.maxItemLength} characters` };
    }
  }
  
  return { valid: true };
};

