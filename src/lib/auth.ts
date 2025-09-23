// src/lib/auth.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

export async function getCurrentUser() {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        // Use a service role client here to ensure we can fetch any profile,
        // especially when an admin is checking another user's details.
        const serviceClient = await createClient({ useServiceRole: true });
        const { data: profile, error: profileError } = await serviceClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('Error fetching profile for auth.ts:', profileError.message);
            // Return user without profile if profile fetch fails, but log the error.
            return { ...user, profile: null };
        }

        return { ...user, profile };
    } catch (e) {
        console.error("Error in getCurrentUser:", e);
        return null;
    }
}


export async function getAllClients() {
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
            id,
            email,
            created_at,
            role,
            stores ( id, name, brand_company )
        `)
        .eq('role', 'client');

    if (profileError) {
        console.error('Error fetching clients:', profileError);
        return { success: false, clients: [], error: profileError.message };
    }

    const { data: contentCounts, error: countError } = await supabase
        .rpc('get_user_content_counts');

    if (countError) {
        console.error('Error fetching content counts:', countError);
        return { success: false, clients: [], error: countError.message };
    }

    const countsMap = new Map(contentCounts.map((c: any) => [c.user_id, {
        content_count: c.content_count,
        latest_upload: c.latest_upload,
    }]));

    const clients = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        role: 'client' as const,
        stores: profile.stores,
        content_count: countsMap.get(profile.id)?.content_count || 0,
        latest_upload: countsMap.get(profile.id)?.latest_upload || null,
    }));

    return { success: true, clients };
}
