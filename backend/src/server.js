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
import requestRoutes from './routes/requests.js';

const app = express();

// --- Validate env vars ---
const requiredEnv = ['JWT_SECRET'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// --- CORS ---
// Normalize URLs (remove trailing slashes) for consistent matching
const normalizeUrl = (url) => url ? url.replace(/\/$/, '') : null;
const ALLOWED_ORIGINS = [
  normalizeUrl(process.env.FRONTEND_URL),
  normalizeUrl(process.env.ADMIN_URL)
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : 'None configured');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Normalize the incoming origin (remove trailing slash)
    const normalizedOrigin = normalizeUrl(origin);
    
    if (ALLOWED_ORIGINS.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Blocked by CORS: ${origin}`);
      console.warn(`   Allowed origins: ${ALLOWED_ORIGINS.join(', ') || 'None'}`);
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
// Root health check (for Render/load balancers)
app.get('/', (req, res) => res.json({ status: 'ok', message: 'API is running 🚀' }));
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'API is running 🚀' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'API is running 🚀' }));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/requests', requestRoutes);

// --- 404 Handler for unmatched routes ---
app.use('/api/*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  console.log('   Available routes:');
  console.log('   - GET /api/health');
  console.log('   - POST /api/auth/login');
  console.log('   - GET /api/auth/me');
  console.log('   - GET /api/properties/stats');
  console.log('   - GET /api/requests/stats');
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('   Path:', req.originalUrl);
  console.error('   Method:', req.method);
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

// Ensure port is a number
const portNumber = typeof port === 'string' ? parseInt(port, 10) : port;

console.log(`🚀 Starting server on ${host}:${portNumber}`);
console.log(`   PORT environment variable: ${process.env.PORT || 'not set (using default 4000)'}`);
console.log(`   HOST environment variable: ${process.env.HOST || 'not set (using default 0.0.0.0)'}`);

// Start server
const server = app.listen(portNumber, host, async () => {
  console.log(`✅ API running on ${host}:${portNumber}`);
  console.log(`   Server is listening and ready to accept connections`);
  
  // Initialize admin user (don't block server startup if this fails)
  try {
    await initializeAdmin();
  } catch (error) {
    console.error('⚠️ Failed to initialize admin user:', error);
    console.error('   Server will continue running, but admin user may not exist');
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${portNumber} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
