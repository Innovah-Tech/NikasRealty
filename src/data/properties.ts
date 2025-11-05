import property1 from "@/assets/images/property1.jpg";
import property2 from "@/assets/images/property2.jpg";
import property3 from "@/assets/images/property3.jpg";
import property4 from "@/assets/images/property4.jpg";
import property5 from "@/assets/images/property5.jpg";

export type Property = {
  id: number;
  title: string;
  description: string;
  price: string;
  image: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  size: string;
  featured: boolean;
  type: string;
  status: string;
  projectStage?: string;
};

export const properties: Property[] = [
  {
    id: 1,
    title: "3 Bedroom All Office Suite",
    description: "Luxury apartment with modern office suite, perfect for professionals",
    price: "KES 14M",
    image: property1,
    location: "Nairobi, Kenya",
    bedrooms: 3,
    bathrooms: 3,
    size: "180 sqm",
    featured: true,
    type: "Modern Apartment",
    status: "For Sale",
    projectStage: "Ready",
  },
  {
    id: 2,
    title: "Luxury 2 & 3 Bedroom Apartments",
    description: "Contemporary living spaces with premium finishes and city views",
    price: "Starting KES 11.7M",
    image: property2,
    location: "Nairobi, Kenya",
    bedrooms: 3,
    bathrooms: 2,
    size: "150 sqm",
    featured: true,
    type: "Premium Maisonette",
    status: "For Sale",
    projectStage: "Offplan",
  },
  {
    id: 3,
    title: "Contemporary Town House",
    description: "Spacious town house with lush garden, suitable for family living.",
    price: "KES 10M",
    image: property3,
    location: "Nairobi, Kenya",
    bedrooms: 4,
    bathrooms: 3,
    size: "220 sqm",
    featured: false,
    type: "Town House",
    status: "For Sale",
    projectStage: "Ready",
  },
  {
    id: 4,
    title: "4 Bedroom Bungalow",
    description: "Elegant bungalow with landscaped garden and modern African architecture",
    price: "KES 14M",
    image: property4,
    location: "Nairobi, Kenya",
    bedrooms: 4,
    bathrooms: 3,
    size: "250 sqm",
    featured: false,
    type: "Executive Bungalow",
    status: "For Sale",
    projectStage: "Ready",
  },
  {
    id: 5,
    title: "Elegant Duplex Home",
    description: "A stylish duplex with a private entrance and rooftop views.",
    price: "KES 18M",
    image: property5,
    location: "Nairobi, Kenya",
    bedrooms: 5,
    bathrooms: 4,
    size: "365 sqm",
    featured: true,
    type: "Duplex",
    status: "For Sale",
    projectStage: "Offplan",
  },
];

export const parsePrice = (val: string): number => {
  const match = val.replace(/,/g, '').match(/([0-9]+\.?[0-9]*)\s*(M|m)?/);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  return match[2] ? n * 1000000 : n;
};
