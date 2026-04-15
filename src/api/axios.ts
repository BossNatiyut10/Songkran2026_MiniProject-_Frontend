import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // proxied to http://localhost:5000 via vite.config.ts
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
