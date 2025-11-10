// server.js

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import bcrypt from 'bcrypt';
import User from './storage/User.js';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import teamRoutes from './routes/team.js';
import serviceRoutes from './routes/services.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// --- Validate env vars ---
const requiredEnv = ['JWT_SECRET'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// --- CORS ---
const ALLOWED_ORIGINS = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// --- Security Middleware ---
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
})); // sets secure HTTP headers

// --- Middleware ---
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// --- Routes ---
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'API is running 🚀' }));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/upload', uploadRoutes);

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: err.message });
});

// --- Initialize Admin User ---
async function initializeAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@nikasrealty.co.ke';
  const password = process.env.SEED_ADMIN_PASSWORD || '1250012093AcePortgasNikas';
  const existing = await User.findOne({ email });
  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await User.create({ email, password: hash, role: 'admin' });
    console.log('✅ Admin user created:', email);
  } else {
    console.log('✅ Admin user already exists:', email);
  }
}

// --- Start Server ---
const port = process.env.PORT || 4000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, async () => {
  console.log(`✅ API running on ${host}:${port}`);
  await initializeAdmin();
});
