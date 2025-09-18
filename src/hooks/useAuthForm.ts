'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from './use-toast';
import { signInUser, registerUser } from '@/app/actions/auth-actions';

type AuthMode = 'signin' | 'signup';
type UserType = 'client' | 'admin';

export function useAuthForm(mode: AuthMode, userType: UserType) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const signInWithGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      toast({
        title: 'Google Sign-In Error',
        description: error.message,
        variant: 'destructive',
      });
      setGoogleLoading(false);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append('email', formData.email);
    form.append('password', formData.password);
    if(mode === 'signup') {
        form.append('role', userType);
    }

    const action = mode === 'signin' ? signInUser : registerUser;
    const result = await action(null, form);

    if (result?.success) {
      toast({
        title: 'Success',
        description: mode === 'signin' ? 'Signed in successfully.' : 'Registration successful! Please sign in.',
      });
      if (mode === 'signin') {
        router.push(userType === 'admin' ? '/admin' : '/dashboard');
      } else {
        router.push(`/auth/${userType}/signin`);
      }
    } else {
      toast({
        title: 'Error',
        description: result?.error || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };

  return {
    formData,
    loading,
    googleLoading,
    handleInputChange,
    handleSubmit,
    signInWithGoogle,
  };
}
