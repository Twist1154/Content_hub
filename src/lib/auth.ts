// src/lib/auth.ts
'use server';

import { createClient } from './supabase/server';
import type { Client } from './types';
import {SupabaseClient} from "@supabase/supabase-js";

export async function getCurrentUser() {
    const supabase = createClient() as SupabaseClient;
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
