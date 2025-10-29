import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (email: string, password: string) => api.post('/api/auth/login', { email, password });
export const getMe = () => api.get('/api/auth/me');

export const listProperties = () => api.get('/api/properties');
export const createProperty = (data: any) => api.post('/api/properties', data);
export const updateProperty = (id: string, data: any) => api.put(`/api/properties/${id}`, data);
export const deleteProperty = (id: string) => api.delete(`/api/properties/${id}`);

export const listTeam = () => api.get('/api/team');
export const createTeam = (data: any) => api.post('/api/team', data);
export const updateTeam = (id: string, data: any) => api.put(`/api/team/${id}`, data);
export const deleteTeam = (id: string) => api.delete(`/api/team/${id}`);

export const uploadFile = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' }});
};


