import axios from 'axios';

// Update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Only log API URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
} else if (!import.meta.env.VITE_API_URL) {
  // Only show error if VITE_API_URL is missing in production
  console.error('❌ VITE_API_URL is not set! API calls will fail.');
}

// Ensure the URL doesn't have a trailing slash
const cleanBaseURL = API_BASE_URL.replace(/\/$/, '');

export const axiosClient = axios.create({
  baseURL: cleanBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Only log requests in development
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
    // Only log detailed errors in development
    if (import.meta.env.DEV) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown URL';
        console.error('❌ Request Failed:', fullUrl);
        console.error('Status:', error.response?.status || 'Network Error');
        
        // Check if VITE_API_URL is missing or pointing to localhost
        if (!import.meta.env.VITE_API_URL || API_BASE_URL.includes('localhost')) {
          console.error('⚠️ VITE_API_URL environment variable is not set or is using localhost!');
          console.error('Current API URL:', API_BASE_URL);
        }
      }
    } else {
      // In production, only log critical configuration errors
      if ((error.response?.status === 404 || error.code === 'ERR_NETWORK') && 
          (!import.meta.env.VITE_API_URL || API_BASE_URL.includes('localhost'))) {
        console.error('❌ API configuration error: VITE_API_URL is not set correctly.');
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
