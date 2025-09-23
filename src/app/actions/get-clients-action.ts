// src/app/actions/get-clients-action.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

// Define the User type to include both clients and admins
export interface User {
    id: string;
    email: string;
    role: 'client' | 'admin';
    created_at: string;
    stores: {
        id: string;
        name: string;
        brand_company: string;
    }[];
    content_count: number;
    latest_upload: string | null;
}


export async function getAllUsers(): Promise<{ success: boolean, users: User[], error?: string }> {
    const supabase = await createClient({useServiceRole: true}) as SupabaseClient;

    // 1. Fetch all user profiles (clients and admins) along with their stores
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(`
            id,
            email,
            created_at,
            role,
            stores ( id, name, brand_company )
        `);

    if (profileError) {
        console.error('Error fetching users:', profileError);
        return { success: false, users: [], error: profileError.message };
    }

    // 2. Fetch content counts for all users in one go
    const { data: contentCounts, error: countError } = await supabase
        .rpc('get_user_content_counts');

    if (countError) {
        console.error('Error fetching content counts:', countError);
        return { success: false, users: [], error: countError.message };
    }

    // Create a map for easy lookup
    const countsMap = new Map(contentCounts.map((c: any) => [c.user_id, {
        content_count: c.content_count,
        latest_upload: c.latest_upload,
    }]));


    // 3. Combine the data
    const users: User[] = profiles.map(profile => ({
        id: profile.id,
        email: profile.email,
        created_at: profile.created_at,
        stores: profile.stores,
        content_count: countsMap.get(profile.id)?.content_count || 0,
        latest_upload: countsMap.get(profile.id)?.latest_upload || null,
        role: profile.role as 'client' | 'admin'
    }));

    return { success: true, users };
}