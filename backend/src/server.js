import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import './db.js';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import teamRoutes from './routes/team.js';
import serviceRoutes from './routes/services.js';
import uploadRoutes from './routes/upload.js';

const app = express();

const ALLOWED_ORIGINS = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/upload', uploadRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API running on :${port}`));


