'use client'

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Leaf, Eye, EyeOff, Sprout } from 'lucide-react';
import { useRegister } from '@/app/(auth)/register/use-register';

const TimberRegister: React.FC = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; username?: string; email?: string; password?: string }>({});

  // TanStack Query mutation hook
  const registerMutation = useRegister();

  const validateEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const validateUsername = useCallback((username: string): boolean => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(username)) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscore)';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, username, email, password, validateEmail, validateUsername]);

  const handleRegister = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Call the mutation with registration data
    registerMutation.mutate({ name, username, email, password });
  }, [validateForm, name, username, email, password]);

  const handleFieldChange = useCallback((field: 'name' | 'username' | 'email' | 'password', value: string) => {
    if (field === 'name') {
      setName(value);
      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
    } else if (field === 'username') {
      setUsername(value);
      if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
    } else if (field === 'email') {
      setEmail(value);
      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
    } else {
      setPassword(value);
      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [errors]);

  const isFormValid = useMemo(() => {
    return name.trim().length >= 2 &&
      username.trim().length >= 3 &&
      email.trim().length > 0 &&
      password.length >= 6;
  }, [name, username, email, password]);

  // Use mutation loading state
  const isLoading = registerMutation.isPending;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-zinc-950 dark:via-neutral-950 dark:to-zinc-950">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 xl:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400 dark:bg-emerald-500 rounded-full blur-[128px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-teal-400 dark:bg-teal-500 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full opacity-10 dark:opacity-20 blur-2xl group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-1 rounded-full shadow-2xl">
              <div className="bg-white dark:bg-zinc-950 p-8 xl:p-10 rounded-full">
                <Leaf size={80} strokeWidth={1.5} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              </div>
            </div>
            <div className="absolute -top-4 -right-4 animate-bounce pointer-events-none" style={{ animationDuration: '3s' }}>
              <Sprout size={32} className="text-emerald-600 dark:text-emerald-400 opacity-60" aria-hidden="true" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-7xl xl:text-8xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-500 bg-clip-text text-transparent">
              Timber
            </h1>
            <p className="text-gray-700 dark:text-zinc-400 text-xl font-medium tracking-wide">
              Plant. Connect. Grow.
            </p>
            <p className="text-gray-600 dark:text-zinc-500 text-sm max-w-md mt-4">
              Join a community passionate about sustainability and making the world greener, one tree at a time.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Register Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 lg:px-16 xl:px-20 py-12 relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-full">
              <Leaf size={32} strokeWidth={1.5} className="text-white" aria-hidden="true" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Timber
            </h1>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold mb-2 tracking-tight text-gray-900 dark:text-white">
              Create account
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 text-base sm:text-lg">
              Start your green journey with us today.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <div className="relative group">
                <input
                  id="name"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`w-full px-5 py-3 bg-white dark:bg-zinc-800/60 dark:backdrop-blur-md border-2 ${errors.name
                    ? 'border-red-500 shadow-lg shadow-red-500/20'
                    : focusedField === 'name'
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30'
                      : 'border-gray-300 dark:border-zinc-700'
                    } rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none transition-all duration-300 hover:border-gray-400 dark:hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm autofill:bg-white dark:autofill:bg-zinc-800/60 autofill:text-gray-900 dark:autofill:text-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255_255_255)] dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(39_39_42/0.6)]`}
                />
                {focusedField === 'name' && !errors.name && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-lg -z-10"></div>
                )}
              </div>
              {errors.name && (
                <p id="name-error" className="text-red-500 dark:text-red-400 text-xs mt-2 font-medium">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="relative group">
                <input
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => handleFieldChange('username', e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                  className={`w-full px-5 py-3 bg-white dark:bg-zinc-800/60 dark:backdrop-blur-md border-2 ${errors.username
                    ? 'border-red-500 shadow-lg shadow-red-500/20'
                    : focusedField === 'username'
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30'
                      : 'border-gray-300 dark:border-zinc-700'
                    } rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none transition-all duration-300 hover:border-gray-400 dark:hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm autofill:bg-white dark:autofill:bg-zinc-800/60 autofill:text-gray-900 dark:autofill:text-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255_255_255)] dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(39_39_42/0.6)]`}
                />
                {focusedField === 'username' && !errors.username && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-lg -z-10"></div>
                )}
              </div>
              {errors.username && (
                <p id="username-error" className="text-red-500 dark:text-red-400 text-xs mt-2 font-medium">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full px-5 py-3 bg-white dark:bg-zinc-800/60 dark:backdrop-blur-md border-2 ${errors.email
                    ? 'border-red-500 shadow-lg shadow-red-500/20'
                    : focusedField === 'email'
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30'
                      : 'border-gray-300 dark:border-zinc-700'
                    } rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none transition-all duration-300 hover:border-gray-400 dark:hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm autofill:bg-white dark:autofill:bg-zinc-800/60 autofill:text-gray-900 dark:autofill:text-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255_255_255)] dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(39_39_42/0.6)]`}
                />
                {focusedField === 'email' && !errors.email && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-lg -z-10"></div>
                )}
              </div>
              {errors.email && (
                <p id="email-error" className="text-red-500 dark:text-red-400 text-xs mt-2 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  disabled={isLoading}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full px-5 py-3 bg-white dark:bg-zinc-800/60 dark:backdrop-blur-md border-2 ${errors.password
                    ? 'border-red-500 shadow-lg shadow-red-500/20'
                    : focusedField === 'password'
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30'
                      : 'border-gray-300 dark:border-zinc-700'
                    } rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none transition-all duration-300 hover:border-gray-400 dark:hover:border-zinc-600 pr-12 disabled:opacity-50 disabled:cursor-not-allowed text-sm autofill:bg-white dark:autofill:bg-zinc-800/60 autofill:text-gray-900 dark:autofill:text-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255_255_255)] dark:autofill:shadow-[inset_0_0_0px_1000px_rgb(39_39_42/0.6)] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden [&::-webkit-textfield-decoration-container]:pr-0`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 focus:outline-none focus:text-emerald-600 dark:focus:text-emerald-400 disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {focusedField === 'password' && !errors.password && (
                  <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-lg -z-10"></div>
                )}
              </div>
              {errors.password && (
                <p id="password-error" className="text-red-500 dark:text-red-400 text-xs mt-2 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-semibold rounded-full hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 dark:shadow-emerald-500/25 dark:hover:shadow-emerald-500/40 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-emerald-500/30 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950 text-sm font-bold mt-2"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create account'
                )}
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent"></div>
            <span className="px-4 text-gray-500 dark:text-zinc-600 font-medium text-xs">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-zinc-700 to-transparent"></div>
          </div>

          {/* Sign In Link */}
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 mt-4 bg-white dark:bg-zinc-800/40 border-2 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:border-gray-400 dark:hover:border-zinc-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950 text-sm"
          >
            Already have an account? Sign in
          </button>

          {/* Terms */}
          <p className="text-xs text-gray-500 dark:text-zinc-600 mt-6 text-center leading-relaxed">
            By signing up, you agree to Timber's{' '}
            <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimberRegister;
