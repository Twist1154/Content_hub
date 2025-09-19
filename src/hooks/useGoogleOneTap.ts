'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useGoogleOneTap() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();

    useEffect(() => {
        const initializeGoogleOneTap = async () => {
            try {
                if (!(window as any).google?.accounts?.id) {
                    console.error("Google One Tap script not loaded yet.");
                    return;
                }

                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
                if (!clientId) {
                    console.warn('Google One Tap: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Skipping initialization.');
                    return;
                }
                
                (window as any).google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response: any) => {
                        try {
                            const { error } = await supabase.auth.signInWithIdToken({
                                provider: 'google',
                                token: response.credential,
                            });
                            if (error) {
                                console.error('Supabase sign-in error:', error);
                                return;
                            }
                            // Successful sign-in will trigger onAuthStateChange in useUser hook,
                            // which will handle redirection. We just need to refresh.
                            router.refresh();
                        } catch (err) {
                            console.error('Error handling Google One Tap callback:', err);
                        }
                    },
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    context: 'signin',
                });

                (window as any).google.accounts.id.prompt();

            } catch (e) {
                console.error('Failed to initialize Google One Tap:', e);
            }
        };

        // Check if the script is already there
        if (document.getElementById('google-gsi-script')) {
            initializeGoogleOneTap();
            return;
        }

        // Otherwise, load it
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleOneTap;
        script.onerror = () => console.error('Failed to load Google GSI script');
        document.head.appendChild(script);

        return () => {
            const scriptTag = document.getElementById('google-gsi-script');
            if (scriptTag) {
                // It's good practice to clean up, though not strictly necessary on page navigation
                // document.head.removeChild(scriptTag);
            }
        };

    }, [router, supabase.auth]);
}
