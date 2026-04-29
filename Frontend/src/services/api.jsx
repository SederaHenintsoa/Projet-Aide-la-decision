import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Intercepteur pour ajouter le token JWT si présent
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => API.post('/login', credentials),
};

export const diagnosticService = {
  evaluate: (data) => API.post('/evaluate', data),
  getStats: () => API.get('/admin/stats'),
};