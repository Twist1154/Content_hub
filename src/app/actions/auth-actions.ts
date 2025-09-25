
// src/app/actions/auth-actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['client', 'admin']),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
});

/**
 * Registers a new user with email and password.
 * This is a privileged action and requires the service role key.
 */
export async function registerUser(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as 'client' | 'admin';
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    const validatedFields = registerSchema.safeParse({ email, password, role, firstName, lastName });

    if (!validatedFields.success) {
        return {
            success: false,
            error: 'Invalid input.',
        };
    }
    
    // We must use the service role client to be able to set the user's role on creation.
    const supabase = await createClient({ useServiceRole: true });

    const displayName = `${firstName} ${lastName}`;

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Send a confirmation email
        user_metadata: { 
            role,
            display_name: displayName,
        },
        app_metadata: { role },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, message: 'User registered. Please check email for verification.' };
}


const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

/**
 * Signs in a user with their email and password.
 */
export async function signInUser(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const validatedFields = signInSchema.safeParse({ email, password });
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid email or password format.' };
    }
    
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    
    if (error) {
        return { success: false, error: error.message };
    }
    
    if (!data.user) {
        return { success: false, error: 'Sign in failed, no user returned.' };
    }

    return { success: true, user: data.user };
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
}


/**
 * Fetches the user and their corresponding profile role.
 * This is used after sign-in to determine the correct redirect path.
 */
export async function getUserAndProfile(userId: string) {
    if (!userId) {
        return { success: false, error: 'User ID is required.' };
    }

    const supabase = await createClient({ useServiceRole: true });
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
    
    if (error) {
        return { success: false, error: 'Failed to fetch user profile.' };
    }

    return { success: true, role: data.role };
}


export async function switchUserRole(userId: string, newRole: 'client' | 'admin') {
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
    
    if (profileError) {
        return { success: false, error: profileError.message };
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
        app_metadata: { role: newRole }
    });

    if (authError) {
        // Attempt to revert the profile change
        await supabase
            .from('profiles')
            .update({ role: newRole === 'admin' ? 'client' : 'admin' })
            .eq('id', userId);
        return { success: false, error: authError.message };
    }

    return { success: true, message: 'User role switched successfully.' };
}
