'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { Leaf, Sprout, ArrowLeft, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVerifyOtp } from '@/app/(auth)/register/use-verify-otp';
import { useResendOtp } from '@/app/(auth)/register/use-resend-otp';
import { VerifySchema, type IVerifySchema } from '@/schema/auth.schema';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyOtpPage: React.FC = () => {
    const router = useRouter();
    const [email] = useQueryState('email', { defaultValue: '' });

    const [otpValue, setOtpValue] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // TanStack Query mutation hooks
    const verifyMutation = useVerifyOtp();
    const resendMutation = useResendOtp();

    // React Hook Form with Zod resolver
    const {
        handleSubmit,
        setValue,
        formState: { errors, isValid },
    } = useForm<IVerifySchema>({
        resolver: zodResolver(VerifySchema),
        mode: 'onChange',
        defaultValues: {
            email: email,
            verificationCode: '',
        },
    });

    // Redirect if no email is provided
    useEffect(() => {
        if (!email) {
            router.push('/register');
        }
    }, [email, router]);

    // Resend timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    // Update form value when OTP changes
    useEffect(() => {
        setValue('verificationCode', otpValue, { shouldValidate: true });
    }, [otpValue, setValue]);

    const onSubmit = (data: IVerifySchema) => {
        verifyMutation.mutate(data);
    };

    const handleResendOtp = () => {
        if (canResend && !resendMutation.isPending) {
            resendMutation.mutate({ email });
            setResendTimer(60);
            setCanResend(false);
        }
    };

    const isLoading = verifyMutation.isPending;

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

            {/* Right Section - OTP Verification Form */}
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
                    {/* Back button */}
                    <button
                        onClick={() => router.push('/register')}
                        className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 mb-6 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="text-sm font-medium">Back to registration</span>
                    </button>

                    <div className="mb-8">
                        <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold mb-2 tracking-tight text-gray-900 dark:text-white">
                            Verify your email
                        </h2>
                        <p className="text-gray-600 dark:text-zinc-400 text-base sm:text-lg">
                            We've sent a verification code to
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <Mail size={16} className="text-emerald-600 dark:text-emerald-400" />
                            <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                                {email}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* OTP Input */}
                        <div className="space-y-3">
                            <label htmlFor="otp-input" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                                Enter verification code
                            </label>
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={otpValue}
                                    onChange={setOtpValue}
                                    disabled={isLoading}
                                    id="otp-input"
                                    aria-invalid={!!errors.verificationCode}
                                    aria-describedby={errors.verificationCode ? 'otp-error' : undefined}
                                >
                                    <InputOTPGroup className="gap-2">
                                        <InputOTPSlot
                                            index={0}
                                            className="w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl font-semibold rounded-lg border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                                        />
                                        <InputOTPSlot
                                            index={1}
                                            className="w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl font-semibold rounded-lg border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                                        />
                                        <InputOTPSlot
                                            index={2}
                                            className="w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl font-semibold rounded-lg border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                                        />
                                        <InputOTPSlot
                                            index={3}
                                            className="w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl font-semibold rounded-lg border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                                        />
                                        <InputOTPSlot
                                            index={4}
                                            className="w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl font-semibold rounded-lg border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                                        />
                                        <InputOTPSlot
                                            index={5}
                                            className="w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl font-semibold rounded-lg border-2 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 text-gray-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200"
                                        />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            {errors.verificationCode && (
                                <p id="otp-error" className="text-red-500 dark:text-red-400 text-xs text-center font-medium">
                                    {errors.verificationCode.message}
                                </p>
                            )}
                        </div>

                        {/* Resend Code */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-zinc-400">
                                Didn't receive the code?{' '}
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={resendMutation.isPending}
                                        className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {resendMutation.isPending ? 'Sending...' : 'Resend code'}
                                    </button>
                                ) : (
                                    <span className="text-gray-500 dark:text-zinc-500 font-medium">
                                        Resend in {resendTimer}s
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Verify Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !isValid || otpValue.length !== 6}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white font-semibold rounded-full hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 dark:shadow-emerald-500/25 dark:hover:shadow-emerald-500/40 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-emerald-500/30 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950 text-sm font-bold mt-2"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    'Verify email'
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
                        Already verified? Sign in
                    </button>

                    {/* Terms */}
                    <p className="text-xs text-gray-500 dark:text-zinc-600 mt-6 text-center leading-relaxed">
                        By verifying your email, you agree to Timber's{' '}
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

export default VerifyOtpPage;
