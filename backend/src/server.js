// server.js

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import './db.js'; // This connects to MongoDB
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import teamRoutes from './routes/team.js';
import serviceRoutes from './routes/services.js';
import uploadRoutes from './routes/upload.js';

const app = express();

// --- Validate env vars ---
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// --- Security Middleware ---
app.use(helmet()); // sets secure HTTP headers

// --- CORS ---
const ALLOWED_ORIGINS = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

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

// --- Start Server ---
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ API running on port ${port}`));
