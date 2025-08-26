import { useState, useEffect } from 'react';
import api from '../api';

export default function useAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem('accessToken');
    // If no token, immediately mark unauthenticated
    if (!token) {
      if (mounted) {
        setIsAuthenticated(false);
        setLoading(false);
      }
      return () => { mounted = false; };
    }

    const validate = async () => {
      try {
        const res = await api.get('/api/auth/me');
        if (!mounted) return;
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (e) {
        // token invalid or backend unreachable
        if (!mounted) return;
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    validate();
    return () => { mounted = false; };
  }, []);

  return { loading, isAuthenticated, user };
}
