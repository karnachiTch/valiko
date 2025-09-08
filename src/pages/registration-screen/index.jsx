import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthenticationHeader from '../../components/ui/AuthenticationHeader';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ProgressIndicator from './components/ProgressIndicator';
import BasicInfoStep from './components/BasicInfoStep';
import RoleSelectionStep from './components/RoleSelectionStep';
import RoleDetailsStep from './components/RoleDetailsStep';
import api from '../../api';

const RegistrationScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);


  const totalSteps = 3;

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData?.fullName?.trim()) {
          newErrors.fullName = 'Full name is required';
        }
        if (!formData?.email?.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData?.password) {
          newErrors.password = 'Password is required';
        } else if (formData?.password?.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (!formData?.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData?.password !== formData?.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 2:
        if (!formData?.role) {
          newErrors.role = 'Please select your role';
        }
        break;

      case 3:
        if (formData?.role === 'traveler') {
          if (!formData?.departureCountry) {
            newErrors.departureCountry = 'Please select your departure country';
          }
          if (!formData?.departureAirports?.length) {
            newErrors.departureAirports = 'Please select at least one departure airport';
          }
        } else if (formData?.role === 'buyer') {
          if (!formData?.buyerCountry) {
            newErrors.buyerCountry = 'Please select your country';
          }
          if (!formData?.preferredCategories?.length) {
            newErrors.preferredCategories = 'Please select at least one category';
          }
        }
        
        if (!formData?.agreeToTerms) {
          newErrors.agreeToTerms = 'You must agree to the Terms of Service';
        }
        if (!formData?.agreeToPrivacy) {
          newErrors.agreeToPrivacy = 'You must agree to the Privacy Policy';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      // إرسال البيانات إلى FastAPI
      await api.post('/api/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      // تسجيل الدخول تلقائياً بعد نجاح التسجيل
      const params = new URLSearchParams();
      params.append('username', formData.email);
      params.append('password', formData.password);
      const loginRes = await api.post('/api/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const { access_token, role, email } = loginRes.data;
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('accessToken', access_token);
      const dashboardRoute = role === 'traveler' ? '/traveler-dashboard' : (role === 'buyer' ? '/buyer-dashboard' : '/');
      navigate(dashboardRoute);
    } catch (error) {
      setErrors({ general: error?.response?.data?.detail || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };



  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <RoleSelectionStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case 3:
        return (
          <RoleDetailsStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <div className="absolute inset-0 z-0 bg-[url('/public/assets/images/no_image.png')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-2xl p-8 lg:p-12 backdrop-blur-md border border-gray-200 dark:border-gray-800">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-semibold"
            >
              <Icon name="Home" size={18} /> Home
            </button>
          </div>
          <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />
          <div className="mt-8">
            {renderStepContent()}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? () => navigate('/login-screen') : handleBack}
              className="sm:w-auto px-6 py-3 rounded-lg text-base font-semibold"
            >
              {currentStep === 1 ? 'Back to Login' : 'Previous'}
            </Button>
            <Button
              variant="default"
              onClick={handleNext}
              loading={isLoading}
              disabled={isLoading}
              className="sm:ml-auto sm:w-auto px-8 py-3 rounded-full text-lg font-extrabold shadow-lg bg-gradient-to-r from-blue-500 via-pink-400 to-pink-500 hover:from-pink-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
            >
              <Icon name={currentStep === totalSteps ? 'UserPlus' : 'ArrowRight'} size={20} />
              {currentStep === totalSteps ? 'Create Account' : 'Next'}
            </Button>
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-500 dark:text-gray-400 text-base">
              Already have an account?{' '}
              <Link
                to="/login-screen"
                className="text-primary hover:text-pink-500 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen;