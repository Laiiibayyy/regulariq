import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data: { email: string; password: string; businessName: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Business APIs
export const businessAPI = {
  onboarding: (data: any) => api.post('/business/onboarding', data),
  dashboard: () => api.get('/business/dashboard'),
};

// Compliance APIs
export const complianceAPI = {
  markComplete: (itemId: string) => api.post(`/compliance/item/${itemId}/complete`),
  uploadDocument: (itemId: string, data: any) => 
    api.post(`/compliance/item/${itemId}/upload`, data),
};

export default api;