import mongoose from 'mongoose';

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  features: [{ type: String }],
  status: { type: String, enum: ['Available', 'Sold'], default: 'Available' },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export default mongoose.model('Property', PropertySchema);


