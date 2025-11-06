import dotenv from 'dotenv';
dotenv.config();
import './db.js';
import bcrypt from 'bcrypt';
import User from './models/User.js';

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@nikasrealty.co.ke';
  const password = process.env.SEED_ADMIN_PASSWORD || '1250012093AcePortgasNikas';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }
  const hash = await bcrypt.hash(password, 10);
  await User.create({ email, password: hash, role: 'admin' });
  console.log('Admin user created:', email);
  process.exit(0);
}

seedAdmin();


