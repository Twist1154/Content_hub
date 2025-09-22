// src/app/actions/get-clients-action.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

// Define the Client type locally as it's returned by this action
export interface Client {
    id: string;
    email: string;
    role: 'client';
    created_at: string;
    stores: {
        id: string;
        name: string;
        brand_company: string;
    }[];
    content_count: number;
    latest_upload: string | null;
}


export async function getAllClients(): Promise<{ success: boolean, clients: Client[], error?: string }> {
    const supabase = createClient({ useServiceRole: true }) as SupabaseClient;

    // 1. Fetch all client profiles along with their stores
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

    // 2. Fetch content counts for all users in one go
    const { data: contentCounts, error: countError } = await supabase
        .rpc('get_user_content_counts');

    if (countError) {
        console.error('Error fetching content counts:', countError);
        return { success: false, clients: [], error: countError.message };
    }

    // Create a map for easy lookup
    const countsMap = new Map(contentCounts.map((c: any) => [c.user_id, {
        content_count: c.content_count,
        latest_upload: c.latest_upload,
    }]));


    // 3. Combine the data
    const clients: Client[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        stores: profile.stores,
        content_count: countsMap.get(profile.id)?.content_count || 0,
        latest_upload: countsMap.get(profile.id)?.latest_upload || null,
        role: 'client'
    }));

    return { success: true, clients };
}
