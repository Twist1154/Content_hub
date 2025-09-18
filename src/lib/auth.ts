// src/lib/auth.ts
'use server';

import { createClient } from './supabase/server';

export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    // Combine user and profile data
    return {
        ...user,
        profile,
    };
}

export async function getAllClients() {
    const supabase = await createClient({ useServiceRole: true });
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            id,
            email,
            role,
            stores ( name, brand_company )
        `)
        .eq('role', 'client');

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }

    return data;
}