
'use client';

import { useState, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const { addToast } = useToast();

    const handleInputChange = (name: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    };

    // --- All validation logic now lives inside the hook ---
    const validateField = (name: keyof FormData, value: string): string | undefined => {
        switch (name) {
            case 'fullName': {
                if (mode !== 'signup') return undefined;
                if (!value || value.trim().length === 0) return 'Full name is required.';
                if (value.trim().length < 2) return 'Full name must be at least 2 characters.';
                return undefined;
            }
            case 'username': {
                if (mode !== 'signup') return undefined;
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
                if (mode === 'signup') {
                    if (value.length < 8) return 'Password must be at least 8 characters.';
                    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
                        return 'Password should include at least one letter and one number.';
                    }
                }
                return undefined;
            }
            case 'confirmPassword': {
                if (mode !== 'signup') return undefined;
                const pwd = formData.password || '';
                if (!value) return 'Please confirm your password.';
                if (value !== pwd) return 'Passwords do not match.';
                return undefined;
            }
            case 'phoneNumber': {
                 if (mode !== 'signup') return undefined;
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
            const value = (formData[field as keyof typeof formData] as string) || '';
            const error = validateField(field, value);
            if (error) newErrors[field] = error;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Submission Handlers ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const formIsValid = validateForm();
        if (!formIsValid) {
            addToast({ variant: 'destructive', title: 'Validation Error', description: 'Please fix the errors before submitting.' });
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signup') {
                const result = await registerUser(formData.email!, formData.password!, userType);
                if (!result.success) throw new Error(result.error || 'Sign up failed.');
                
                addToast({ title: 'Account Created', description: 'Please check your email to verify your account and then sign in.' });
                router.push(`/auth/${userType}/signin`);

            } else { // Signin mode
                const result = await signInUser(formData.email!, formData.password!);
                if (!result.success || !result.user) throw new Error(result.error || 'Sign in failed.');
                
                addToast({ title: 'Sign In Successful', description: 'Welcome back!' });
                
                const userResult = await getUserAndProfile(result.user.id, userType);
                if (userResult.success && userResult.user) {
                     router.push(userResult.user.profile?.role === 'admin' ? '/admin' : '/dashboard');
                } else {
                    router.push('/dashboard');
                }
            }
        } catch (err: any) {
            addToast({ variant: 'destructive', title: mode === 'signin' ? 'Sign In Failed' : 'Sign Up Failed', description: err.message });
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        errors,
        loading,
        handleInputChange,
        handleBlur,
        handleSubmit,
    };
}
