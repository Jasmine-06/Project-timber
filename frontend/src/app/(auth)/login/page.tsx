'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryState, parseAsStringEnum } from 'nuqs';
import { Leaf, Eye, EyeOff, Sprout, ArrowLeft, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '@/app/(auth)/login/use-login';
import { useForgotPassword } from '@/app/(auth)/login/use-forgot-password';
import { useResetPassword } from '@/app/(auth)/login/use-reset-password';
import { useResendResetCode } from '@/app/(auth)/login/use-resend-reset-code';
import {
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  type ILoginSchema,
  type IForgotPasswordSchema,
  type IResetPasswordSchema
} from '@/schema/auth.schema';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

// type ViewMode = 'login' | 'forgot' | 'reset';

const TimberLogin: React.FC = () => {
  const router = useRouter();
  const [view, setView] = useQueryState("view", parseAsStringEnum(["login", "forgot", "reset"]).withDefault("login"));
  const [resetEmail, setResetEmail] = useQueryState('email', { defaultValue: '' });

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // TanStack Query mutation hooks
  const loginMutation = useLogin();
  const forgotPasswordMutation = useForgotPassword();
  const resetPasswordMutation = useResetPassword();
  const resendCodeMutation = useResendResetCode();

  // Login form
  const loginForm = useForm<ILoginSchema>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  // Forgot password form
  const forgotForm = useForm<IForgotPasswordSchema>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  // Reset password form
  const resetForm = useForm<IResetPasswordSchema>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: resetEmail, verificationCode: '', newPassword: '' },
  });

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Update reset form email when resetEmail changes
  useEffect(() => {
    if (resetEmail) {
      resetForm.setValue('email', resetEmail);
    }
  }, [resetEmail, resetForm]);

  // Update verification code when OTP changes
  useEffect(() => {
    resetForm.setValue('verificationCode', otp, { shouldValidate: true });
  }, [otp, resetForm]);

  // Handle successful password reset
  useEffect(() => {
    if (resetPasswordMutation.isSuccess) {
      setView('login');
      setResetEmail('');
      setOtp('');
      resetForm.reset();
    }
  }, [resetPasswordMutation.isSuccess, setView, setResetEmail, resetForm]);

  const onLoginSubmit = (data: ILoginSchema) => {
    loginMutation.mutate(data);
  };

  const onForgotSubmit = (data: IForgotPasswordSchema) => {
    forgotPasswordMutation.mutate(data, {
      onSuccess: () => {
        setResetEmail(data.email);
        setView('reset');
        setCountdown(60);
      },
    });
  };

  const onResetSubmit = (data: IResetPasswordSchema) => {
    resetPasswordMutation.mutate(data);
  };

  const handleResendCode = () => {
    if (countdown === 0 && resetEmail) {
      resendCodeMutation.mutate({ email: resetEmail });
      setCountdown(60);
    }
  };

  const handleBackToLogin = () => {
    setView('login');
    setResetEmail('');
    setOtp('');
    loginForm.reset();
    forgotForm.reset();
    resetForm.reset();
  };

  const isLoading = loginMutation.isPending || forgotPasswordMutation.isPending || resetPasswordMutation.isPending;

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
              {view === 'login' && 'Join a community passionate about sustainability and making the world greener, one tree at a time.'}
              {view === 'forgot' && "Don't worry! We'll help you reset your password and get back to making the world greener."}
              {view === 'reset' && 'Almost there! Enter the verification code and set your new password.'}
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Forms */}
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
          {/* Back button for forgot/reset views */}
          {view !== 'login' && (
            <button
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 mb-6 group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm font-medium">Back to login</span>
            </button>
          )}

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <>
              <div className="mb-8">
                <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold mb-2 tracking-tight text-gray-900 dark:text-white">
                  Welcome back
                </h2>
                <p className="text-gray-600 dark:text-zinc-400 text-base sm:text-lg">
                  Sign in to continue your green journey.
                </p>
              </div>

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <div className="relative group">
                    <input
                      {...loginForm.register('email')}
                      id="email"
                      type="email"
                      placeholder="Email address"
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={!!loginForm.formState.errors.email}
                      className={`w-full px-5 py-3 bg-white dark:bg-zinc-800/60 dark:backdrop-blur-md border-2 ${loginForm.formState.errors.email
                        ? 'border-red-500 shadow-lg shadow-red-500/20'
                        : focusedField === 'email'
                          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30'
                          : 'border-gray-300 dark:border-zinc-700'
                        } rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none transition-all duration-300 hover:border-gray-400 dark:hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                    />
                    {focusedField === 'email' && !loginForm.formState.errors.email && (
                      <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-lg -z-10"></div>
                    )}
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-2 font-medium">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative group">
                    <input
                      {...loginForm.register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={!!loginForm.formState.errors.password}
                      className={`w-full px-5 py-3 bg-white dark:bg-zinc-800/60 dark:backdrop-blur-md border-2 ${loginForm.formState.errors.password
                        ? 'border-red-500 shadow-lg shadow-red-500/20'
                        : focusedField === 'password'
                          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30'
                          : 'border-gray-300 dark:border-zinc-700'
                        } rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none transition-all duration-300 hover:border-gray-400 dark:hover:border-zinc-600 pr-12 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
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
                    {focusedField === 'password' && !loginForm.formState.errors.password && (
                      <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-lg -z-10"></div>
                    )}
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-2 font-medium">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950 rounded px-2 py-1"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading || !loginForm.formState.isValid}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-semibold rounded-full hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 dark:shadow-emerald-500/25 dark:hover:shadow-emerald-500/40 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-emerald-500/30 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950 text-sm font-bold"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      'Sign in'
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

              {/* Create Account */}
              <button
                onClick={() => router.push('/register')}
                className="w-full py-3 mt-4 bg-white dark:bg-zinc-800/40 border-2 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:border-gray-400 dark:hover:border-zinc-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950 text-sm"
              >
                Create new account
              </button>
            </>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
            <>
              <div className="mb-8">
                <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold mb-2 tracking-tight text-gray-900 dark:text-white">
                  Forgot password?
                </h2>
                <p className="text-gray-600 dark:text-zinc-400 text-base sm:text-lg">
                  Enter your email and we'll send you a verification code.
                </p>
              </div>

              <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="forgot-email" className="sr-only">Email address</label>
                  <div className="relative group">
                    <input
                      {...forgotForm.register('email')}
                      id="forgot-email"
                      type="email"
                      placeholder="Email address"
                      onFocus={() => setFocusedField('forgot-email')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={!!forgotForm.formState.errors.email}
                      className={`w-full px-5 py-3 bg-white dark:bg-zinc-800/60 dark:backdrop-blur-md border-2 ${forgotForm.formState.errors.email
                        ? 'border-red-500 shadow-lg shadow-red-500/20'
                        : focusedField === 'forgot-email'
                          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30'
                          : 'border-gray-300 dark:border-zinc-700'
                        } rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none transition-all duration-300 hover:border-gray-400 dark:hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                    />
                    {focusedField === 'forgot-email' && !forgotForm.formState.errors.email && (
                      <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-lg -z-10"></div>
                    )}
                  </div>
                  {forgotForm.formState.errors.email && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-2 font-medium">
                      {forgotForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Send Code Button */}
                <button
                  type="submit"
                  disabled={isLoading || !forgotForm.formState.isValid}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-semibold rounded-full hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 dark:shadow-emerald-500/25 dark:hover:shadow-emerald-500/40 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-emerald-500/30 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950 text-sm font-bold"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending code...</span>
                      </>
                    ) : (
                      'Send verification code'
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </button>
              </form>
            </>
          )}

          {/* RESET PASSWORD VIEW */}
          {view === 'reset' && (
            <>
              <div className="mb-8">
                <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold mb-2 tracking-tight text-gray-900 dark:text-white">
                  Reset password
                </h2>
                <p className="text-gray-600 dark:text-zinc-400 text-base sm:text-lg">
                  We sent a code to
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Mail size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                    {resetEmail}
                  </p>
                </div>
              </div>

              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
                {/* OTP Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                    Verification Code
                  </label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={isLoading}
                    >
                      <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl font-semibold rounded-lg border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {resetForm.formState.errors.verificationCode && (
                    <p className="text-red-500 dark:text-red-400 text-xs text-center font-medium">
                      {resetForm.formState.errors.verificationCode.message}
                    </p>
                  )}
                </div>

                {/* Resend Code */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-zinc-400">
                    Didn't receive the code?{' '}
                    {countdown === 0 ? (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={resendCodeMutation.isPending}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendCodeMutation.isPending ? 'Sending...' : 'Resend code'}
                      </button>
                    ) : (
                      <span className="text-gray-500 dark:text-zinc-500 font-medium">
                        Resend in {countdown}s
                      </span>
                    )}
                  </p>
                </div>

                {/* New Password Input */}
                <div>
                  <label htmlFor="new-password" className="sr-only">New Password</label>
                  <div className="relative group">
                    <input
                      {...resetForm.register('newPassword')}
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New Password"
                      onFocus={() => setFocusedField('new-password')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isLoading}
                      aria-required="true"
                      aria-invalid={!!resetForm.formState.errors.newPassword}
                      className={`w-full px-5 py-3 bg-white dark:bg-zinc-800/60 dark:backdrop-blur-md border-2 ${resetForm.formState.errors.newPassword
                        ? 'border-red-500 shadow-lg shadow-red-500/20'
                        : focusedField === 'new-password'
                          ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/30'
                          : 'border-gray-300 dark:border-zinc-700'
                        } rounded-full text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none transition-all duration-300 hover:border-gray-400 dark:hover:border-zinc-600 pr-12 disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
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
                    {focusedField === 'new-password' && !resetForm.formState.errors.newPassword && (
                      <div className="absolute inset-0 rounded-full bg-emerald-500/5 blur-lg -z-10"></div>
                    )}
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className="text-red-500 dark:text-red-400 text-xs mt-2 font-medium">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Reset Password Button */}
                <button
                  type="submit"
                  disabled={isLoading || !resetForm.formState.isValid || otp.length !== 6}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-semibold rounded-full hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 dark:shadow-emerald-500/25 dark:hover:shadow-emerald-500/40 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-emerald-500/30 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950 text-sm font-bold"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Resetting password...</span>
                      </>
                    ) : (
                      'Reset password'
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </button>
              </form>
            </>
          )}

          {/* Terms */}
          <p className="text-xs text-gray-500 dark:text-zinc-600 mt-6 text-center leading-relaxed">
            By continuing, you agree to Timber's{' '}
            <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors hover:underline">
              Terms   of Service
            </a>{'   '}
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

export default TimberLogin;