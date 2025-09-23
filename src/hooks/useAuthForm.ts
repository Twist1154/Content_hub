
// src/hooks/useAuthForm.ts
'use client';

import { useState, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
import { signInUser, registerUser, getUserAndProfile } from '@/app/actions/auth-actions';

type AuthMode = 'signin' | 'signup';
type UserType = 'client' | 'admin';

export function useAuthForm(mode: AuthMode, userType: UserType = 'client') {
    const router = useRouter();
    const { toast } = useToast();

    // Use useActionState for form submissions
    const [signInState, signInAction, isSignInPending] = useActionState(signInUser, null);
    const [registerState, registerAction, isRegisterPending] = useActionState(registerUser, null);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Partial<typeof formData>>({});


    const loading = isSignInPending || isRegisterPending;

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleBlur = (field: keyof typeof formData) => {
        // basic validation
    };

    // --- EFFECT TO HANDLE SIGN-IN RESULT ---
    useEffect(() => {
        if (!signInState) return;

        if (signInState.success && signInState.user) {
            // After successful sign-in, fetch the user's role to redirect correctly.
            const fetchRoleAndRedirect = async () => {
                const profileResult = await getUserAndProfile(signInState.user.id);
                if (profileResult.success) {
                    toast({ title: 'Sign In Successful', description: 'Welcome back!' });
                    if (profileResult.role === 'admin') {
                        router.push('/admin');
                    } else {
                        router.push('/dashboard');
                    }
                } else {
                    // This can happen if the profile wasn't created correctly.
                    toast({ variant: 'destructive', title: 'Sign In Error', description: profileResult.error || 'Could not determine user role.' });
                }
            };
            fetchRoleAndRedirect();
        } else if (signInState.error) {
            toast({ variant: 'destructive', title: 'Sign In Failed', description: signInState.error });
        }
    }, [signInState, toast, router]);


    // --- EFFECT TO HANDLE REGISTRATION RESULT ---
    useEffect(() => {
        if (!registerState) return;

        if (registerState.success) {
            toast({ title: 'Account Created', description: 'Please check your email to verify your account.' });
            router.push(`/auth/${userType}/signin`);
        } else if (registerState.error) {
            toast({ variant: 'destructive', title: 'Sign Up Failed', description: registerState.error });
        }
    }, [registerState, toast, router, userType]);


    // --- FORM SUBMISSION HANDLER ---
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formElement = e.currentTarget;
        const formData = new FormData(formElement);

        if (mode === 'signup') {
            if(formData.get('password') !== formData.get('confirmPassword')) {
                toast({ variant: 'destructive', title: 'Passwords do not match' });
                return;
            }
            formData.set('role', userType);
            registerAction(formData);
        } else {
            signInAction(formData);
        }
    };

    return {
        formData,
        errors,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        loading,
        handleInputChange,
        handleBlur,
        handleSubmit,
    };
}
