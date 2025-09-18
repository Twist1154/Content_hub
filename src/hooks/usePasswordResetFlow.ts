
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePasswordResetFlow() {
    const [status, setStatus] = useState<'validating' | 'ready' | 'error' | 'submitting' | 'success'>('validating');
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClient();

    // Effect for handling the initial token validation
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                 if (session?.user) {
                    setUserEmail(session.user.email || '');
                    setStatus('ready');
                 } else {
                     setStatus('error');
                     toast({ variant: 'destructive', title: 'Invalid Link', description: 'This link is invalid or has expired. Please try again.' });
                 }
            }
        });
        
        // Handle the case where the user lands on the page without a valid token in the URL hash
        // The 'PASSWORD_RECOVERY' event only fires if the hash is present.
         const timer = setTimeout(() => {
            if (status === 'validating') {
                setStatus('error');
                toast({ variant: 'destructive', title: 'Invalid Link', description: 'No valid session found. Please use the link from your email.' });
            }
        }, 3000); // If no event after 3s, assume link is bad

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [supabase, toast, status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Password Mismatch', description: 'Passwords do not match.' });
            return;
        }
         if (password.length < 8) {
            toast({ variant: 'destructive', title: 'Password Too Short', description: 'Password must be at least 8 characters.' });
            return;
        }


        setStatus('submitting');
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            toast({ title: 'Password Updated!', description: 'You can now sign in with your new password. Redirecting...' });
            setStatus('success');
            
            // Sign out to clear the recovery session
            await supabase.auth.signOut();

            setTimeout(() => {
                router.push('/auth/client/signin');
            }, 2000);

        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: err.message });
            setStatus('ready');
        }
    };

    return {
        status,
        userEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        handleSubmit,
    };
}
