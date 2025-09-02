// نقطة موحدة لطلبات API
import axios from 'axios';

// استخدم عنوان API production تلقائياً عند العمل على Vercel
const isVercel = typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app');
const productionApiBase = 'https://api.valiko.vercel.app'; // غيّر هذا إذا كان لديك دومين آخر للـ backend
const resolvedBase =
  (typeof process !== 'undefined' && process?.env?.VITE_API_BASE)
  || localStorage.getItem('API_BASE')
  || (isVercel ? productionApiBase : 'http://localhost:8000');
const api = axios.create({
  baseURL: resolvedBase, // FastAPI backend (configurable via VITE_API_BASE or localStorage.API_BASE)
});

// Safety: ensure axios does not set a default Content-Type globally.
// This prevents form-encoded login requests from becoming non-simple (which triggers preflight).
if (api.defaults && api.defaults.headers) {
  try {
    delete api.defaults.headers['Content-Type'];
  } catch (e) {}
  try {
    if (api.defaults.headers.common) delete api.defaults.headers.common['Content-Type'];
  } catch (e) {}
  try {
    if (api.defaults.headers.post) delete api.defaults.headers.post['Content-Type'];
  } catch (e) {}
}

// إضافة التوكن تلقائيًا في جميع الطلبات
api.interceptors.request.use((config) => {
  // don't attach Authorization header for login route to avoid preflight/405
  const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
  if (fullUrl.includes('/api/auth/login')) {
    return config;
  }
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
