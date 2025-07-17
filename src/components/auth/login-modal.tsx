"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mail, Eye, EyeOff, X, Loader2, AlertTriangle, Chrome, Twitter, Github, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: any) => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  acceptTerms?: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  acceptTerms?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');

  const emailInputRef = useRef<HTMLInputElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Auto-focus first field when modal opens or mode changes
  useEffect(() => {
    if (isOpen && mode === 'login') {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    } else if (isOpen && mode === 'register') {
      setTimeout(() => firstFieldRef.current?.focus(), 100);
    }
  }, [isOpen, mode]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        acceptTerms: false
      });
      setErrors({});
      setGeneralError('');
      setSuccess('');
      setMode('login');
    }
  }, [isOpen]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (mode !== 'forgot') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (mode === 'register' && !validatePassword(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters long';
      }
    }

    // Registration-specific validation
    if (mode === 'register') {
      if (!formData.firstName?.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName?.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Please accept the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (mode === 'login') {
        // Simulate login success
        const user = {
          id: '1',
          email: formData.email,
          firstName: 'John',
          lastName: 'Doe'
        };
        onLoginSuccess?.(user);
        onClose();
      } else if (mode === 'register') {
        // Simulate registration success
        setSuccess('Account created successfully! Please check your email to verify your account.');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 2000);
      } else if (mode === 'forgot') {
        // Simulate password reset
        setSuccess('Password reset instructions sent to your email.');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 2000);
      }
    } catch (error) {
      setGeneralError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setGeneralError('');

    try {
      // Simulate social login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = {
        id: '1',
        email: `user@${provider}.com`,
        firstName: 'Social',
        lastName: 'User'
      };
      onLoginSuccess?.(user);
      onClose();
    } catch (error) {
      setGeneralError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Sign in to your account';
      case 'register':
        return 'Create your account';
      case 'forgot':
        return 'Reset your password';
      default:
        return 'Authentication';
    }
  };

  const getSubmitText = () => {
    switch (mode) {
      case 'login':
        return 'Sign In';
      case 'register':
        return 'Create Account';
      case 'forgot':
        return 'Send Reset Link';
      default:
        return 'Submit';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md max-w-[95%] p-0 gap-0 bg-white border-gray-200"
        onKeyDown={handleKeyDown}
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-description"
      >
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            {mode !== 'login' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode('login')}
                className="p-1 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Back to login"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle 
              id="login-modal-title"
              className={`text-lg font-semibold text-gray-900 ${mode === 'login' ? 'mx-auto' : ''}`}
            >
              {getTitle()}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Error/Success Messages */}
          {generalError && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {generalError}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Social Login (only for login/register) */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  className="w-full h-10 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <Chrome className="w-4 h-4 mr-2 text-gray-600" />
                  Continue with Google
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('twitter')}
                    disabled={isLoading}
                    className="h-10 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <Twitter className="w-4 h-4 mr-1 text-gray-600" />
                    Twitter
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('github')}
                    disabled={isLoading}
                    className="h-10 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <Github className="w-4 h-4 mr-1 text-gray-600" />
                    GitHub
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Separator className="bg-gray-300" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                  or
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Registration Fields */}
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    ref={firstFieldRef}
                    id="firstName"
                    type="text"
                    value={formData.firstName || ''}
                    onChange={handleInputChange('firstName')}
                    className={`h-10 ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                    disabled={isLoading}
                    aria-invalid={errors.firstName ? 'true' : 'false'}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="text-xs text-red-600" role="alert">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName || ''}
                    onChange={handleInputChange('lastName')}
                    className={`h-10 ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                    disabled={isLoading}
                    aria-invalid={errors.lastName ? 'true' : 'false'}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="text-xs text-red-600" role="alert">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={mode === 'login' ? emailInputRef : undefined}
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`h-10 pl-10 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-xs text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    className={`h-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                    placeholder={mode === 'register' ? 'Create a password (8+ characters)' : 'Enter your password'}
                    disabled={isLoading}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-10 w-10 p-0 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-red-600" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            {/* Confirm Password */}
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword || ''}
                    onChange={handleInputChange('confirmPassword')}
                    className={`h-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-500'}`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    autoComplete="new-password"
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-10 w-10 p-0 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p id="confirmPassword-error" className="text-xs text-red-600" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Terms and Conditions */}
            {mode === 'register' && (
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms || false}
                    onChange={handleInputChange('acceptTerms')}
                    className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    disabled={isLoading}
                    aria-invalid={errors.acceptTerms ? 'true' : 'false'}
                    aria-describedby={errors.acceptTerms ? 'terms-error' : undefined}
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="/terms" className="text-orange-600 hover:text-orange-700 underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-orange-600 hover:text-orange-700 underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p id="terms-error" className="text-xs text-red-600" role="alert">
                    {errors.acceptTerms}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                getSubmitText()
              )}
            </Button>

            {/* Footer Links */}
            <div className="space-y-3 pt-2">
              {mode === 'login' && (
                <div className="flex flex-col space-y-2 text-center">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-orange-600 hover:text-orange-700 underline"
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </button>
                  <div className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-orange-600 hover:text-orange-700 underline font-medium"
                      disabled={isLoading}
                    >
                      Create one
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-orange-600 hover:text-orange-700 underline font-medium"
                    disabled={isLoading}
                  >
                    Sign in
                  </button>
                </div>
              )}

              {mode === 'forgot' && (
                <div className="text-center text-sm text-gray-600">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-orange-600 hover:text-orange-700 underline font-medium"
                    disabled={isLoading}
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Footer Note for Review System */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              {mode === 'register' ? 
                'Join MustMe to write reviews, discover great places, and connect with other reviewers.' :
                'Sign in to access your reviews, save favorites, and engage with the MustMe community.'
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};