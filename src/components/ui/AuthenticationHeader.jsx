import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';

const AuthenticationHeader = ({ showLanguageToggle = false }) => {
  const [currentLanguage, setCurrentLanguage] = React.useState('EN');

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'EN' ? 'ES' : 'EN';
    setCurrentLanguage(newLanguage);
    localStorage.setItem('preferred-language', newLanguage);
  };

  return (
    <header className="w-full bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Globe" size={20} color="white" />
            </div>
            <span className="text-2xl font-semibold text-foreground">
              Valikoo
            </span>
          </Link>

          {/* Language Toggle */}
          {showLanguageToggle && (
            <button
              onClick={handleLanguageToggle}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-smooth"
            >
              <Icon name="Languages" size={16} />
              <span className="text-sm font-medium">{currentLanguage}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AuthenticationHeader;