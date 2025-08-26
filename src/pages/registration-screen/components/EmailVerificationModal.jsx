import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const EmailVerificationModal = ({ isOpen, email, onVerificationComplete, onResendCode }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds?.toString()?.padStart(2, '0')}`;
  };

  const handleVerify = () => {
    if (!verificationCode?.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode?.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    // Mock verification - in real app, this would call an API
    if (verificationCode === '123456') {
      onVerificationComplete();
    } else {
      setError('Invalid verification code. Please try again.');
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    
    // Mock API call
    setTimeout(() => {
      setIsResending(false);
      setTimeLeft(300);
      onResendCode();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-modal max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Mail" size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Verify Your Email</h2>
          <p className="text-muted-foreground text-sm">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-foreground font-medium">{email}</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Verification Code"
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => {
              const value = e?.target?.value?.replace(/\D/g, '')?.slice(0, 6);
              setVerificationCode(value);
              setError('');
            }}
            error={error}
            maxLength={6}
          />

          <Button
            variant="default"
            fullWidth
            onClick={handleVerify}
            disabled={verificationCode?.length !== 6}
          >
            Verify Email
          </Button>

          <div className="text-center space-y-2">
            {timeLeft > 0 ? (
              <p className="text-sm text-muted-foreground">
                Resend code in {formatTime(timeLeft)}
              </p>
            ) : (
              <Button
                variant="ghost"
                onClick={handleResendCode}
                loading={isResending}
                disabled={isResending}
              >
                Resend Code
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-foreground font-medium mb-1">Demo Credentials:</p>
              <p className="text-muted-foreground">Use code: <span className="font-mono font-medium">123456</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;