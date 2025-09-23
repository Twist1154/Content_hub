
// src/hooks/useAuthForm.ts
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signInUser, registerUser, getUserAndProfile } from '@/app/actions/auth-actions';

type AuthMode = 'signin' | 'signup';
type UserType = 'client' | 'admin';

export function useAuthForm(mode: AuthMode, userType: UserType = 'client') {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Partial<typeof formData>>({});

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleBlur = (field: keyof typeof formData) => {
        // basic validation can go here
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formElement = e.currentTarget;
        const submissionData = new FormData(formElement);

        if (mode === 'signup') {
            if(submissionData.get('password') !== submissionData.get('confirmPassword')) {
                toast({ variant: 'destructive', title: 'Passwords do not match' });
                setLoading(false);
                return;
            }
            submissionData.set('role', userType);
            const registerState = await registerUser(null, submissionData);
            
            if (registerState.success) {
                toast({ title: 'Account Created', description: 'Please check your email to verify your account.' });
                router.push(`/auth/${userType}/signin`);
            } else if (registerState.error) {
                toast({ variant: 'destructive', title: 'Sign Up Failed', description: registerState.error });
            }

        } else { // 'signin' mode
            const signInState = await signInUser(null, submissionData);

            if (signInState.success && signInState.user) {
                const profileResult = await getUserAndProfile(signInState.user.id);
                if (profileResult.success) {
                    toast({ title: 'Sign In Successful', description: 'Welcome back!' });
                    if (profileResult.role === 'admin') {
                        router.push('/admin');
                    } else {
                        router.push('/dashboard');
                    }
                } else {
                    toast({ variant: 'destructive', title: 'Sign In Error', description: profileResult.error || 'Could not determine user role.' });
                }
            } else if (signInState.error) {
                toast({ variant: 'destructive', title: 'Sign In Failed', description: signInState.error });
            }
        }

        setLoading(false);
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
