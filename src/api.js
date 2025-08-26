// نقطة موحدة لطلبات API
import axios from 'axios';

const resolvedBase = (typeof process !== 'undefined' && process?.env?.VITE_API_BASE) || localStorage.getItem('API_BASE') || 'http://localhost:8000';
const api = axios.create({
  baseURL: resolvedBase, // FastAPI backend (configurable via VITE_API_BASE or localStorage.API_BASE)
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة التوكن تلقائيًا في جميع الطلبات
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
