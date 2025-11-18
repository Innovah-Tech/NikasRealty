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
  features?: string[];
  paymentOptions?: string[];
  completionDate?: string;
};

export const properties: Property[] = [
  {
    id: 2,
    title: "4-Bedroom Luxury Townhouses in Langata",
    description: "Imagine waking up in a modern 4-bedroom all-ensuite townhouse, sipping coffee on your sun-lit terrace, then heading to the gym or pool just a few steps from your door. Perfectly set in Langata, opposite Wilson Airport, this gated community blends convenience, style, and security. Choose between spacious duplexes (2,650 sqft) or grand triplexes (3,750 sqft) — each designed with open-plan layouts, high-gloss kitchens, ensuite bedrooms, sleek finishes, and eco-friendly touches like solar heating. Triplex comes with a family and a study room.",
    price: "KES 35.9M",
    image: "/images/langata/1000293347.jpg",
    gallery: [
      "/images/langata/1000293347.jpg",
      "/images/langata/1000293353.jpg",
      "/images/langata/1000293361.jpg",
      "/images/langata/1000293372.jpg",
      "/images/langata/1000293378.jpg",
      "/images/langata/1000293380.jpg",
      "/images/langata/1000293382.jpg",
      "/images/langata/1000293384.jpg"
    ],
    location: "Langata, Nairobi",
    bedrooms: 4,
    bathrooms: 5,
    size: "2,650 - 3,750 sqft",
    featured: true,
    type: "Townhouse",
    status: "For Sale",
    projectStage: "Offplan",
    features: [
      "Prime location opposite Wilson Airport",
      "Spacious duplexes (2,650 sqft) and triplexes (3,750 sqft)",
      "High-gloss kitchens with modern appliances",
      "All bedrooms ensuite",
      "Eco-friendly design with solar heating",
      "Triplex includes family room and study"
    ],
    paymentOptions: [
      "20% deposit and balance till completion",
      "Flexible payment plans available"
    ],
    completionDate: "June 2026"
  },
  {
    id: 1,
    title: "4-Bedroom Maisonettes with DSQ",
    description: "Contemporary 4-Bedroom Maisonettes with DSQ in a Serene Gated Community – Ruiru. Discover a modern lifestyle in this stunning new development located just 800 metres off the Eastern Bypass, Ruiru. This exclusive estate features 18 units in Phase 1 and 19 units in Phase 2, each thoughtfully designed to blend comfort, space, and sophistication. Every home has been tastefully crafted with residents in mind, combining contemporary architecture, generous natural lighting, and elegant finishes for a truly elevated living experience.",
    price: "KES 17.5M",
    image: "/images/ruiru-maisonette/1000297404.jpg",
    gallery: [
      "/images/ruiru-maisonette/1000297404.jpg",
      "/images/ruiru-maisonette/1000297400.jpg",
      "/images/ruiru-maisonette/1000297396.jpg",
      "/images/ruiru-maisonette/1000297392.jpg",
      "/images/ruiru-maisonette/1000297388.jpg",
      "/images/ruiru-maisonette/1000297384.jpg",
      "/images/ruiru-maisonette/1000297380.jpg",
      "/images/ruiru-maisonette/1000297376.jpg"
    ],
    location: "Ruiru, Kenya",
    bedrooms: 4,
    bathrooms: 5, // 4 ensuite + 1 in DSQ
    size: "240 sqm",
    featured: true,
    type: "Maisonette",
    status: "For Sale",
    projectStage: "Offplan",
    features: [
      "4 spacious bedrooms (all ensuite)",
      "Detached Servant Quarter (DSQ)",
      "Family room for extra comfort and privacy",
      "Fully fitted kitchen with pantry",
      "Rooftop lounge – perfect for relaxation or entertaining",
      "Elegant pergola design for a touch of outdoor luxury"
    ],
    paymentOptions: [
      "Off-Plan Purchase: Ksh 17.5M – 60% deposit, 40% upon handover",
      "Installment Plan: Ksh 18M – 30% deposit, balance within 6 months",
      "Mortgage Option: Ksh 18.5M"
    ],
    completionDate: "June 2026"
  }
];

export const parsePrice = (val: string): number => {
  const match = val.replace(/,/g, '').match(/([0-9]+\.?[0-9]*)\s*(M|m)?/);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  return match[2] ? n * 1000000 : n;
};
