import axios from 'axios';
import { getApiBaseUrl, isUsingFallbackApiUrl } from '@/config/api';

const rawBaseUrl = getApiBaseUrl();
const cleanBaseURL = rawBaseUrl.replace(/\/$/, '');

if (import.meta.env.DEV) {
  console.log('API Base URL:', cleanBaseURL, isUsingFallbackApiUrl() ? '(fallback)' : '');
} else if (isUsingFallbackApiUrl()) {
  console.warn('Warning: Using fallback API URL in production. Set VITE_API_URL to override.');
}

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
      console.log(`${config.method?.toUpperCase()} ${fullUrl}`);
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
        console.error('Error: Request failed:', fullUrl);
        console.error('Status:', error.response?.status || 'Network Error');
        
        if (isUsingFallbackApiUrl()) {
          console.error('Warning: API request failed while using fallback API URL.');
          console.error('Current API URL:', cleanBaseURL);
        }
      }
    } else {
      // In production, only log critical configuration errors
      if ((error.response?.status === 404 || error.code === 'ERR_NETWORK') && isUsingFallbackApiUrl()) {
        console.error('Error: API request failed while using fallback API URL. Please configure VITE_API_URL.');
      }
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if we're on an admin route
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

