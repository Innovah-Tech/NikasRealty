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
import blogRoutes from './routes/blogs.js';
import Property from './storage/Property.js';

const app = express();

// --- Validate env vars ---
const requiredEnv = ['JWT_SECRET'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Error: Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// --- CORS ---
// Normalize URLs (remove trailing slashes) for consistent matching
const normalizeUrl = (url) => url ? url.replace(/\/$/, '') : null;
const ALLOWED_ORIGINS = [
  normalizeUrl(process.env.FRONTEND_URL),
  normalizeUrl(process.env.ADMIN_URL)
].filter(Boolean);

console.log('Allowed CORS origins:', ALLOWED_ORIGINS.length > 0 ? ALLOWED_ORIGINS : 'None configured');

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
      console.warn(`Warning: Blocked by CORS: ${origin}`);
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
app.get('/', (req, res) => res.json({ status: 'ok', message: 'API is running' }));
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'API is running' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/blogs', blogRoutes);

// --- 404 Handler for unmatched routes ---
app.use('/api/*', (req, res) => {
  console.log(`Error: 404 - Route not found: ${req.method} ${req.originalUrl}`);
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
  console.error('Error:', err.message);
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
        console.log('Admin user created:', email);
  } else {
        console.log('Admin user already exists:', email);
  }
}

// --- Initialize Properties ---
async function initializeProperties() {
  try {
    const existing = await Property.find({});
    if (existing.length > 0) {
          console.log(`Properties already exist (${existing.length} found).`);
      return;
    }

    const properties = [
      {
        title: "4-Bedroom Luxury Townhouses in Langata",
        description: "Imagine waking up in a modern 4-bedroom all-ensuite townhouse, sipping coffee on your sun-lit terrace, then heading to the gym or pool just a few steps from your door. Perfectly set in Langata, opposite Wilson Airport, this gated community blends convenience, style, and security. Choose between spacious duplexes (2,650 sqft) or grand triplexes (3,750 sqft) — each designed with open-plan layouts, high-gloss kitchens, ensuite bedrooms, sleek finishes, and eco-friendly touches like solar heating. Triplex comes with a family and a study room.",
        price: 35900000,
        images: [
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
        completion: "Offplan",
        projectStage: "Offplan",
        features: [
          "Prime location opposite Wilson Airport",
          "Spacious duplexes (2,650 sqft) and triplexes (3,750 sqft)",
          "High-gloss kitchens with modern appliances",
          "All bedrooms ensuite",
          "Eco-friendly design with solar heating",
          "Triplex includes family room and study"
        ]
      },
      {
        title: "4-Bedroom Maisonettes with DSQ",
        description: "Contemporary 4-Bedroom Maisonettes with DSQ in a Serene Gated Community – Ruiru. Discover a modern lifestyle in this stunning new development located just 800 metres off the Eastern Bypass, Ruiru. This exclusive estate features 18 units in Phase 1 and 19 units in Phase 2, each thoughtfully designed to blend comfort, space, and sophistication. Every home has been tastefully crafted with residents in mind, combining contemporary architecture, generous natural lighting, and elegant finishes for a truly elevated living experience.",
        price: 17500000,
        images: [
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
        bathrooms: 5,
        size: "240 sqm",
        featured: true,
        type: "Maisonette",
        status: "For Sale",
        completion: "Offplan",
        projectStage: "Offplan",
        features: [
          "4 spacious bedrooms (all ensuite)",
          "Detached Servant Quarter (DSQ)",
          "Family room for extra comfort and privacy",
          "Fully fitted kitchen with pantry",
          "Rooftop lounge – perfect for relaxation or entertaining",
          "Elegant pergola design for a touch of outdoor luxury"
        ]
      }
    ];

    for (const propertyData of properties) {
      await Property.create(propertyData);
          console.log(`Seeded property: ${propertyData.title}`);
    }

        console.log(`Successfully seeded ${properties.length} properties!`);
  } catch (error) {
        console.error('Warning: Failed to seed properties:', error);
        console.error('   Server will continue running, but properties may not be seeded');
  }
}

// --- Start Server ---
const port = process.env.PORT || 4000;
const host = process.env.HOST || '0.0.0.0';

// Ensure port is a number
const portNumber = typeof port === 'string' ? parseInt(port, 10) : port;

console.log(`Starting server on ${host}:${portNumber}`);
console.log(`   PORT environment variable: ${process.env.PORT || 'not set (using default 4000)'}`);
console.log(`   HOST environment variable: ${process.env.HOST || 'not set (using default 0.0.0.0)'}`);

// Start server
const server = app.listen(portNumber, host, async () => {
  console.log(`API running on ${host}:${portNumber}`);
  console.log(`   Server is listening and ready to accept connections`);
  
  // Initialize admin user and properties (don't block server startup if this fails)
  try {
    await initializeAdmin();
    await initializeProperties();
  } catch (error) {
        console.error('Warning: Failed to initialize:', error);
        console.error('   Server will continue running, but initialization may be incomplete');
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Error: Port ${portNumber} is already in use`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
