import type { Property as FirestoreProperty } from "@/services/firestore/properties";
import { properties as staticProperties, parsePrice } from "@/data/properties";

const mappedFallbackProperties: FirestoreProperty[] = staticProperties.map((property) => ({
  id: `fallback-${property.id}`,
  title: property.title,
  description: property.description,
  type: property.type,
  price: parsePrice(property.price),
  location: property.location,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  size: property.size,
  status: property.status,
  image: property.image,
  images: property.gallery && property.gallery.length > 0 ? property.gallery : [property.image],
  gallery: property.gallery,
  featured: property.featured,
  projectStage: property.projectStage,
  paymentOptions: property.paymentOptions,
  completionDate: property.completionDate,
  features: property.features,
}));

export const getFallbackProperties = (): FirestoreProperty[] => mappedFallbackProperties;

export const findFallbackProperty = (id: string): FirestoreProperty | undefined =>
  mappedFallbackProperties.find((property) => property.id === id);

