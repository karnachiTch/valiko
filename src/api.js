// نقطة موحدة لطلبات API
import axios from 'axios';

// استخدم متغير البيئة العام المناسب في مشاريع Vercel/Next.js (يجب أن يبدأ بـ NEXT_PUBLIC)
const resolvedBase =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE) ||
  localStorage.getItem('API_BASE') ||
  'http://localhost:8000';

const api = axios.create({
  baseURL: resolvedBase, // FastAPI backend (يتم ضبطه عبر متغير بيئة أو localStorage)
});

// لا تقم بتغيير Content-Type افتراضياً على مستوى global إلا إذا كان ذلك ضرورياً لحل مشكلة محددة
// الأفضل ترك Content-Type ليتم ضبطه تلقائياً بناءً على نوع البيانات المرسلة

// إضافة الهيدر Authorization تلقائياً في جميع الطلبات فيما عدا تسجيل الدخول
api.interceptors.request.use(
  (config) => {
    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    if (fullUrl.includes('/api/auth/login')) {
      // عدم إضافة Authorization في طلب الدخول
      return config;
    }
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
