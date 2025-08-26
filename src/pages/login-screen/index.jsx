import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import LoginForm from './components/LoginForm';
import LoginBackground from './components/LoginBackground';
import LanguageToggle from './components/LanguageToggle';

const LoginScreen = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* الشريط العلوي مخفي في صفحة تسجيل الدخول */}
      {/* <header className="w-full bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            {/* <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Globe" size={20} color="white" />
              </div>
              <span className="text-2xl font-semibold text-foreground">
                Valikoo
              </span>
            </Link> */}

            {/* Language Toggle */}
            {/* <LanguageToggle />
          </div>
        </div>
      </header> */}
      {/* Main Content */}
      <main className="flex-1">
        <div className="flex min-h-screen items-center justify-center">
          {/* Login Form Section - Full width, no card */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-lg mx-auto">
              <div className="space-y-8 scale-110">
                <LoginForm />
              </div>
            </div>
          </div>

          {/* Background Section - Desktop Only */}
          <LoginBackground />
        </div>
      </main>
      {/* Mobile Footer */}
      <footer className="lg:hidden bg-card border-t border-border p-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date()?.getFullYear()} Valikoo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginScreen;