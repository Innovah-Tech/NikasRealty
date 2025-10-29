import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String },
  image: { type: String },
  socials: {
    instagram: String,
    linkedin: String,
  },
}, { timestamps: true });

export default mongoose.model('Team', TeamSchema);


