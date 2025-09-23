// hooks/useMagicLinkAuth.ts

'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserType = 'client' | 'admin';

export function useMagicLinkAuth(defaultUserType: UserType = 'client') {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  const sendMagicLink = async (userType: UserType = defaultUserType) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast({ variant: 'destructive', title: 'Invalid email', description: 'Please enter a valid email address.' });
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?userType=${userType}`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;
      setSent(true);
      toast({ title: 'Magic link sent', description: 'Check your email for the sign-in link.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to send link', description: err.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, loading, sent, sendMagicLink };
}
