// نقطة موحدة لطلبات API
import axios from 'axios';

// Resolve API base URL:
// - If VITE_API_BASE is provided at build time (recommended for separated backend), use it.
// - Else if localStorage.API_BASE is present (dev override), use it.
// - Else: in dev builds use localhost:8000, in production default to relative URLs (empty) so requests go to same origin.
let resolvedBase = '';
// Safely read Vite-provided env at build time (may throw in non-bundled contexts)
try {
  const viteBase = import.meta?.env?.VITE_API_BASE || null;
  if (viteBase) resolvedBase = viteBase;
} catch (e) {
  // ignore (import.meta may not be available in some tooling/analysis)
}
try {
  if (!resolvedBase && typeof window !== 'undefined') {
    const stored = localStorage.getItem('API_BASE');
    if (stored) resolvedBase = stored;
  }
} catch (e) {}
if (!resolvedBase) {
  try {
    const isDev = !!(import.meta?.env?.DEV);
    resolvedBase = isDev ? 'http://localhost:8000' : '';
  } catch (e) {
    resolvedBase = '';
  }
}

const api = axios.create({
  baseURL: resolvedBase, // FastAPI backend (configurable via VITE_API_BASE or localStorage.API_BASE). Empty => relative paths.
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
