import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  signup: (data: any) => api.post('/auth/signup', data),
  login: (data: any) => api.post('/auth/login', data),
};

export const business = {
  onboarding: (data: any) => api.post('/business/onboarding', data),
  dashboard: () => api.get('/business/dashboard'),
};

export const compliance = {
  uploadDocument: (itemId: string, data: any) => 
    api.post(`/compliance/item/${itemId}/upload`, data),
  markComplete: (itemId: string) => 
    api.post(`/compliance/item/${itemId}/complete`),
};

export default api;