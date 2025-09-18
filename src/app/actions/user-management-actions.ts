
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const emailSchema = z.string().email();

export async function sendPasswordReset(email: string) {
    const validatedFields = emailSchema.safeParse(email);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid email address.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
    });

    if (error) {
        console.error('Password reset error:', error.message);
        return { success: false, error: error.message };
    }

    return { success: true };
}


const idSchema = z.string().uuid();

export async function deleteUser(userId: string) {
    const validatedFields = idSchema.safeParse(userId);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid user ID.' };
    }

    // Use the service role client to delete a user
    const supabase = await createClient({ useServiceRole: true });

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
        console.error('Error deleting user:', error.message);
        return { success: false, error: error.message };
    }

    return { success: true };
}
