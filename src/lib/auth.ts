
// src/lib/auth.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { getAllUsers } from '@/app/actions/get-clients-action';
import { registerUser } from '@/app/actions/auth-actions';

export async function getCurrentUser() {
    const supabase = await createClient() as SupabaseClient;
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        const serviceClient = await createClient({ useServiceRole: true }) as SupabaseClient;
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
    return getAllUsers();
}

export async function signUp(email: string, password: string, role: 'client' | 'admin' = 'client') {
  const formData = new FormData();
  formData.append('email', email);
  formData.append('password', password);
  formData.append('role', role);

  // We can't use the result of registerUser directly here as it's a form action state.
  // We just call it. Error handling will happen on the client form.
  await registerUser(null, formData);

  // After sign-up, you typically don't have an active session until verification,
  // so fetching the user might not be necessary here. The flow redirects to sign-in.
  return { success: true, message: 'Sign-up initiated. Please check email for verification.' };
}
