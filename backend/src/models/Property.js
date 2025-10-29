import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true, enum: [
    'Apartment', 'Studio', 'Duplex', 'Triplex', 'Bungalow', 'Townhouse', 'Villa', 'Maisonette'
  ] },
  category: { type: String, enum: [
    'Luxury Villas', 'Luxury Villas & Townhouses', 'Modern Bungalows', 'Apartments & Studios'
  ], default: 'Apartments & Studios' },
  bedrooms: { type: Number, min: 0 },
  bathrooms: { type: Number, min: 0 },
  sqft: { type: Number, min: 0 },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['For Sale', 'For Rent', 'Off-plan'], default: 'For Sale' },
  location: { type: String, required: true },
  completionDate: { type: Date },
  completion: { type: String, enum: ['Ready', 'Under Construction', 'Off-plan'] },
  deposit: { type: String },
  paymentPlan: { type: String },
  description: { type: String },
  features: [{ type: String }],
  images: [{ type: String }],
  instagramUrl: { type: String },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export default mongoose.model('Property', PropertySchema);


