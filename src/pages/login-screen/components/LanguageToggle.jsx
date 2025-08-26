import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const LanguageToggle = () => {
  const [currentLanguage, setCurrentLanguage] = useState('EN');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') || 'EN';
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'EN' ? 'AR' : 'EN';
    setCurrentLanguage(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
    
    // Apply RTL/LTR direction
    document.documentElement.dir = newLanguage === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage === 'AR' ? 'ar' : 'en';
  };

  return (
    <button
      onClick={handleLanguageToggle}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-smooth"
    >
      <Icon name="Languages" size={16} />
      <span className="text-sm font-medium">{currentLanguage}</span>
    </button>
  );
};

export default LanguageToggle;