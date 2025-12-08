// Import images with correct paths
const property1 = "/images/property1.jpg";
const property2 = "/images/property2.jpg";
const property3 = "/images/property3.jpg";
const property4 = "/images/property4.jpg";
const property5 = "/images/property5.jpg";

export type Property = {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  gallery?: string[];
  location: string;
  bedrooms: number;
  bathrooms: number;
  size: string;
  featured: boolean;
  type: string;
  status: string;
  projectStage?: string;
  offplan?: boolean;
  features?: string[];
  paymentOptions?: string[];
  completionDate?: string;
};

export const properties: Property[] = [];

export const parsePrice = (val: string): number => {
  const match = val.replace(/,/g, '').match(/([0-9]+\.?[0-9]*)\s*(M|m)?/);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  return match[2] ? n * 1000000 : n;
};
