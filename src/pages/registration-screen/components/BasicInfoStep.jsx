import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const BasicInfoStep = ({ formData, setFormData, errors, setErrors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const minLength = password?.length >= 8;
    const hasUpperCase = /[A-Z]/?.test(password);
    const hasLowerCase = /[a-z]/?.test(password);
    const hasNumbers = /\d/?.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/?.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isStrong: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Real-time password confirmation validation
    if (field === 'confirmPassword' || (field === 'password' && formData?.confirmPassword)) {
      const password = field === 'password' ? value : formData?.password;
      const confirmPassword = field === 'confirmPassword' ? value : formData?.confirmPassword;
      
      if (confirmPassword && password !== confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const passwordStrength = validatePassword(formData?.password || '');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Create Your Account</h2>
        <p className="text-muted-foreground">Enter your basic information to get started</p>
      </div>
      <div className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={formData?.fullName || ''}
          onChange={(e) => handleInputChange('fullName', e?.target?.value)}
          error={errors?.fullName}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={formData?.email || ''}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          description="We'll send a verification email to this address"
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={formData?.password || ''}
            onChange={(e) => handleInputChange('password', e?.target?.value)}
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

        {formData?.password && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium text-foreground">Password Strength:</p>
            <div className="space-y-1">
              {[
                { key: 'minLength', label: 'At least 8 characters' },
                { key: 'hasUpperCase', label: 'One uppercase letter' },
                { key: 'hasLowerCase', label: 'One lowercase letter' },
                { key: 'hasNumbers', label: 'One number' },
                { key: 'hasSpecialChar', label: 'One special character' }
              ]?.map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Icon 
                    name={passwordStrength?.[key] ? 'Check' : 'X'} 
                    size={14} 
                    className={passwordStrength?.[key] ? 'text-success' : 'text-muted-foreground'} 
                  />
                  <span className={`text-sm ${passwordStrength?.[key] ? 'text-success' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData?.confirmPassword || ''}
            onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
            error={errors?.confirmPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;