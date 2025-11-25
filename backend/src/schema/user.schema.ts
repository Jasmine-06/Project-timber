import { email, z } from "zod";

export const RegistrationSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be less than 30 characters")
        .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    email: z.string().email("Invalid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
});

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"), 
    password: z.string().min(1, "Password is required"), 
});

export const UserProfileUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters").optional(),
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    interests: z.array(z.string()).optional(),
});

export const VerifySchema = z.object({
    email: z.string().email("Invalid email address"),
    verificationCode: z.string().min(6, "Verification code is atleast 6 digits").max(6, "Verification code must be exactly 6 digits"),
});

export const CheckVerificationSchema = z.object({
    email: z.string().email("Invalid email address"),
    verificationCode: z.string().min(6, "Verification code is atleast 6 digits").max(6, "Verification code must be exactly 6 digits"),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address!") 
});

export const ResendVerificationCode = z.object({
    email: z.string().email("Invalid email address!")
});

export const ResetPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
    verificationCode: z.string().min(6, "Verification code is atleast 6 digits").max(6, "Verification code must be exactly 6 digits"),
    newPassword: z.string().min(6, "New password must be atleast 6 characters long")
});
