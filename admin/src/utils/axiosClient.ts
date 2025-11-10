import axios from 'axios';

// Update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Log the API URL in development to help with debugging
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
} else {
  // Always log in production for debugging
  console.log('🔗 API Base URL:', API_BASE_URL);
  if (!import.meta.env.VITE_API_URL) {
    console.error('❌ VITE_API_URL is not set! API calls will fail.');
    console.error('Please set VITE_API_URL in your Vercel environment variables.');
    console.error('Go to: Vercel Dashboard → Project → Settings → Environment Variables');
    console.error('Add: VITE_API_URL = https://your-backend.onrender.com/api');
  }
}

// Ensure the URL doesn't have a trailing slash
const cleanBaseURL = API_BASE_URL.replace(/\/$/, '');

export const axiosClient = axios.create({
  baseURL: cleanBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and log requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log the full URL in development or when debugging
    if (import.meta.env.DEV) {
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log(`📤 ${config.method?.toUpperCase()} ${fullUrl}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error logging for 404s
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown URL';
      console.error('❌ Request Failed:', fullUrl);
      console.error('Status:', error.response?.status || 'Network Error');
      console.error('Base URL:', error.config?.baseURL);
      console.error('Request URL:', error.config?.url);
      
      // Check if VITE_API_URL is missing or pointing to localhost
      if (!import.meta.env.VITE_API_URL || API_BASE_URL.includes('localhost')) {
        console.error('⚠️ VITE_API_URL environment variable is not set or is using localhost!');
        console.error('Current API URL:', API_BASE_URL);
        console.error('Please set VITE_API_URL in Vercel: Settings → Environment Variables');
        console.error('Expected format: https://your-backend.onrender.com/api');
        console.error('Steps:');
        console.error('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
        console.error('2. Add: VITE_API_URL = https://your-backend.onrender.com/api');
        console.error('3. Select "Production" environment');
        console.error('4. Redeploy your project');
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
