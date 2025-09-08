import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import api from '../../../api';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      // FastAPI expects: username, password (form-data)
      const params = new URLSearchParams();
      params.append('username', formData.email);
      params.append('password', formData.password);
      params.append('remember_me', formData.rememberMe ? 'true' : 'false');
  console.debug('login: posting to', api.defaults.baseURL + '/api/auth/login', params.toString());
  const res = await api.post('/api/auth/login', params);
    const { access_token, role, email, fullName, user } = res.data;
    // prefer explicit user object from response, else build one from returned fields
    const userObj = user || { fullName: fullName || '', email: email || '', role: role || '' };
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userRole', role || userObj.role);
  localStorage.setItem('userEmail', email || userObj.email);
  localStorage.setItem('accessToken', access_token);
  try { localStorage.setItem('user', JSON.stringify(userObj)); } catch (e) {}
      if (formData?.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      // توجيه المستخدم حسب الدور
      if (role === 'traveler') {
        navigate('/traveler-dashboard');
      } else if (role === 'buyer') {
        navigate('/buyer-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-control-panel');
      } else {
        navigate('/');
      }
    } catch (error) {
      setErrors({ general: error?.response?.data?.detail || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // helper to perform login programmatically
  const performLogin = async (email, password, remember = false) => {
    setIsLoading(true);
    setErrors({});
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      params.append('remember_me', remember ? 'true' : 'false');
  console.debug('performLogin: posting to', api.defaults.baseURL + '/api/auth/login', params.toString());
  const res = await api.post('/api/auth/login', params);
  const { access_token, role, email: userEmail, fullName, user } = res.data;
  const userObj = user || { fullName: fullName || '', email: userEmail || '', role: role || '' };
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('userRole', role || userObj.role);
  localStorage.setItem('userEmail', userEmail || userObj.email);
  localStorage.setItem('accessToken', access_token);
  try { localStorage.setItem('user', JSON.stringify(userObj)); } catch (e) {}
      if (remember) localStorage.setItem('rememberMe', 'true');

      if (role === 'traveler') {
        navigate('/traveler-dashboard');
      } else if (role === 'buyer') {
        navigate('/buyer-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-control-panel');
      } else {
        navigate('/');
      }
    } catch (error) {
      setErrors({ general: error?.response?.data?.detail || 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Mock social login
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'traveler');
    localStorage.setItem('socialLogin', provider);
    navigate('/traveler-dashboard');
  };

  return (
    <div className="w-full max-w-md mx-auto">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-semibold"
          >
            <Icon name="Home" size={18} /> Home
          </button>
        </div>
      <div className="bg-card rounded-lg border border-border p-6 shadow-card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500">Login to your account</p>
        </div>

        {errors?.general && (
          <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-error text-sm">{errors?.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData?.email}
            onChange={handleInputChange}
            error={errors?.email}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData?.password}
              onChange={handleInputChange}
              error={errors?.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-smooth"
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              name="rememberMe"
              checked={formData?.rememberMe}
              onChange={handleInputChange}
            />
            
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {errors.form && <p className="text-red-500 text-sm text-center">{errors.form}</p>}

          <Button
            type="submit"
            variant="default"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Quick login buttons for testing */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          <Button
            variant="secondary"
            onClick={() => performLogin('karnachenih@gmail.com', 'Loai4218#', true)}
            fullWidth
          >
            Quick Login: karnachenih@gmail.com
          </Button>
          <Button
            variant="secondary"
            onClick={() => performLogin('hadjmed007@gmail.com', 'Hadj4218@', true)}
            fullWidth
          >
            Quick Login: hadjmed007@gmail.com
          </Button>
        </div>

        

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/registration-screen')}
              className="text-blue-500 hover:underline font-medium transition-smooth"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;