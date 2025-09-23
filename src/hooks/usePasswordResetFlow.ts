
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/Toast';

export function usePasswordResetFlow() {
    const [status, setStatus] = useState<'validating' | 'ready' | 'error' | 'submitting' | 'success'>('validating');
    const [isNewUser, setIsNewUser] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const router = useRouter();
    const { addToast } = useToast();
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
                     addToast({ type: 'error', title: 'Invalid Link', message: 'This link is invalid or has expired. Please try again.' });
                 }
            } else if (event === 'SIGNED_IN') {
                try {
                    if (!session) throw new Error("Session is null after sign-in.");

                    const user = session.user;
                    setUserEmail(user.email || '');

                    const { data: profile, error } = await supabase.from('profiles').select('id').eq('id', user.id).single();

                    if (error && error.code === 'PGRST116') {
                        setIsNewUser(true);
                        await supabase.from('profiles').insert({ id: user.id, email: user.email!, role: 'client' });
                    } else if (error) {
                        throw error;
                    }

                    setStatus('ready');
                } catch (err: any) {
                    console.error('Validation Error:', err);
                    addToast({ type: 'error', title: 'Invalid Link', message: 'This link is invalid or has expired. Please try again.' });
                    setStatus('error');
                }
            }
        });

        // Handle the case where the user lands on the page without a valid token in the URL
        const timer = setTimeout(() => {
            if (status === 'validating') {
                setStatus('error');
                addToast({ type: 'error', title: 'Invalid Link', message: 'No valid session found. Please use the link from your email.' });
            }
        }, 3000); // If no event after 3s, assume link is bad

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, [supabase, addToast, router, status]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            addToast({ type: 'error', title: 'Password Mismatch', message: 'Passwords do not match.' });
            return;
        }

        setStatus('submitting');
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            addToast({ type: 'success', title: 'Password Updated!', message: 'Redirecting you now...' });
            setStatus('success');

            const { data: { user } } = await supabase.auth.getUser();
            const { data: stores } = await supabase.from('stores').select('id').eq('user_id', user!.id);

            setTimeout(() => {
                router.push((!stores || stores.length === 0) ? '/auth/setup-store' : '/dashboard');
            }, 1500);

        } catch (err: any) {
            addToast({ type: 'error', title: 'Update Failed', message: err.message });
            setStatus('ready');
        }
    };

    return {
        status,
        isNewUser,
        userEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        handleSubmit,
    };
}
