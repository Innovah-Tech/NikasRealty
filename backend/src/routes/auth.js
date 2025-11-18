import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../storage/User.js';

const router = Router();

// Log all requests to auth routes
router.use((req, res, next) => {
  console.log(`Auth route: ${req.method} ${req.path}`);
  console.log('   Full URL:', req.originalUrl);
  next();
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login request received');
    console.log('   Email:', req.body?.email);
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Validate email format
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password is not empty
    if (typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ error: 'Password cannot be empty' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login attempt failed: User not found - ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    if (!user.password) {
      console.error(`Login error: User has no password hash - ${email}`);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log(`Login attempt failed: Invalid password - ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Ensure only admin users can log in
    if (user.role !== 'admin') {
      console.log(`Login attempt failed: Non-admin user - ${email} (role: ${user.role})`);
      return res.status(403).json({ error: 'Access denied. Admin access required.' });
    }
    
    // Generate token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log(`Login successful: ${email} (${user.role})`);
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    
    // Don't expose internal error details to client
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    
    if (!token) {
      console.log('/me request failed: No token provided');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set!');
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        console.log('/me request failed: Token expired');
        return res.status(401).json({ error: 'Token expired' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        console.log('/me request failed: Invalid token');
        return res.status(401).json({ error: 'Invalid token' });
      } else {
        throw jwtError;
      }
    }
    
    if (!payload.id) {
      console.error('/me request failed: Token payload missing id');
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    
    const user = await User.findById(payload.id);
    
    if (!user) {
      console.log(`/me request failed: User not found - ID: ${payload.id}`);
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Transform to match frontend expectations
    const { password, ...userWithoutPassword } = user;
    console.log(`/me request successful: ${user.email}`);
    res.json({ 
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.email.split('@')[0], // Use email prefix as name fallback
      }
    });
  } catch (e) {
    console.error('/me request error:', e);
    console.error('Error stack:', e.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


