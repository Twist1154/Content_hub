// hooks/useUser.ts

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; // Use the CLIENT Supabase utility

export function useUser() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.error("Error fetching user:", error);
                setUser(null);
            } else if (data.user) {
                // You can also fetch the profile here if needed
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
                setUser({ ...data.user, profile });
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    return { user, loading };
}
