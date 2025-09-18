'use client';

import { useState, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './use-toast';
import { signInUser, registerUser, getUserAndProfile } from '@/app/actions/auth-actions';

// Define types for the hook's state and props
type AuthMode = 'signin' | 'signup';
type UserType = 'client' | 'admin';

interface FormData {
    fullName?: string;
    username?: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phoneNumber?: string;
}

interface FormErrors {
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phoneNumber?: string;
}

export function useAuthForm(mode: AuthMode, userType: UserType = 'client') {
    const [formData, setFormData] = useState<Partial<FormData>>({ email: '', password: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const supabase = useMemo(() => createClient(), []);

    const handleInputChange = (name: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    // --- All validation logic now lives inside the hook ---
    const validateField = (name: keyof FormData, value: string): string | undefined => {
        switch (name) {
            case 'fullName': {
                if (!value || value.trim().length === 0) return 'Full name is required.';
                if (value.trim().length < 2) return 'Full name must be at least 2 characters.';
                return undefined;
            }
            case 'username': {
                if (!value || value.trim().length === 0) return 'Username is required.';
                const username = value.trim();
                if (username.length < 3 || username.length > 20) {
                    return 'Username must be 3-20 characters long.';
                }
                if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                    return 'Username can only contain letters, numbers, and underscores.';
                }
                return undefined;
            }
            case 'email': {
                if (!value || value.trim().length === 0) return 'Email is required.';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
                return undefined;
            }
            case 'password': {
                if (!value) return 'Password is required.';
                if (value.length < 8) return 'Password must be at least 8 characters.';
                // Encourage stronger passwords: at least one letter and one number
                if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
                    return 'Password should include at least one letter and one number.';
                }
                return undefined;
            }
            case 'confirmPassword': {
                const pwd = formData.password || '';
                if (!value) return 'Please confirm your password.';
                if (value !== pwd) return 'Passwords do not match.';
                return undefined;
            }
            case 'phoneNumber': {
                if (!value || value.trim().length === 0) return 'Phone number is required.';
                const digits = value.replace(/\D/g, '');
                if (digits.length < 10 || digits.length > 15) return 'Please enter a valid phone number.';
                return undefined;
            }
            default:
                return undefined;
        }
    };

    const handleBlur = (name: keyof FormData) => {
        if (mode !== 'signup') return;
        const error = validateField(name, formData[name] || '');
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateForm = (): boolean => {
        let fieldsToValidate: (keyof FormData)[] = ['email', 'password'];
        if (mode === 'signup') {
            fieldsToValidate = [
                'fullName',
                'username',
                'email',
                'password',
                'confirmPassword',
                'phoneNumber',
            ];
        }

        const newErrors: FormErrors = {};
        for (const field of fieldsToValidate) {
            if (field in formData || field === 'password' || field === 'email') {
                 const value = (formData[field as keyof typeof formData] as string) || '';
                 const error = validateField(field, value);
                 if (error) newErrors[field] = error;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Submission Handlers ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast({ variant: 'destructive', title: 'Validation Error', description: 'Please fix the errors before submitting.' });
            return;
        }
        setLoading(true);

        const form = new FormData();
        form.append('email', formData.email!);
        form.append('password', formData.password!);
        if (mode === 'signup') {
            form.append('role', userType);
        }

        try {
            if (mode === 'signup') {
                const result = await registerUser(null, form);
                if (!result.success) throw new Error(result.error || 'Sign up failed.');
                toast({ title: 'Account Created', description: 'Please check your email to verify your account.' });
                router.push(`/auth/${userType}/signin`);
            } else { // Signin mode
                const result = await signInUser(null, form);
                if (!result.success || !result.user) throw new Error(result.error || 'Sign in failed.');
                toast({ title: 'Sign In Successful', description: 'Welcome back!' });
                
                // Fetch full user profile to get the role for redirection
                const userResult = await getUserAndProfile(result.user.id);
                if (userResult.success && userResult.user) {
                     router.push(userResult.user.profile?.role === 'admin' ? '/admin' : '/dashboard');
                } else {
                    // Default redirect if profile fails
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            toast({ variant: 'destructive', title: mode === 'signin' ? 'Sign In Failed' : 'Sign Up Failed', description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setGoogleLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        });
        if (error) {
            toast({ variant: 'destructive', title: 'Google Sign In Failed', description: error.message });
            setGoogleLoading(false);
        }
    };

    return {
        formData,
        errors,
        loading,
        googleLoading,
        handleInputChange,
        handleBlur,
        handleSubmit,
        signInWithGoogle,
    };
}
