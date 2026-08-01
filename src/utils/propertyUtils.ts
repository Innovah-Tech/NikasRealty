import type { Property } from '@/services/firestore/properties';

/**
 * Format a property sale price with optional "From" prefix.
 */
export const formatPropertyPrice = (property: Pick<Property, 'price' | 'priceType' | 'status' | 'priceDaily' | 'priceMonthly'>): string => {
  if ((property.status === 'for-rent' || property.status === 'For Rent') && (property.priceDaily || property.priceMonthly)) {
    if (property.priceMonthly) {
      return `KES ${property.priceMonthly.toLocaleString()}`;
    }
    if (property.priceDaily) {
      return `KES ${property.priceDaily.toLocaleString()}`;
    }
  }

  const prefix = property.priceType === 'from' ? 'From ' : '';
  if (typeof property.price === 'number') {
    return `${prefix}KES ${property.price.toLocaleString()}`;
  }
  return `${prefix}${property.price}`;
};

/**
 * Get amenities array, falling back to legacy features field.
 */
export const getPropertyAmenities = (property: Pick<Property, 'amenities' | 'features'>): string[] =>
  property.amenities?.length ? property.amenities : property.features ?? [];
