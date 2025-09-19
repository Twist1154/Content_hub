
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { headers } from 'next/headers';

const emailSchema = z.string().email();

export async function sendPasswordReset(email: string) {
    const validatedFields = emailSchema.safeParse(email);
    if (!validatedFields.success) {
        return { success: false, error: 'Invalid email address.' };
    }

    const supabase = await createClient();
    const origin = headers().get('origin');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/reset-password`,
    });

    if (error) {
        console.error('Password reset error:', error.message);
        return { success: false, error: error.message };
    }

    return { success: true, message: 'Password reset link sent successfully.' };
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

    return { success: true, message: 'User successfully deleted.' };
}


export async function changeUserEmail(userId: string, newEmail: string) {
    const idValidation = idSchema.safeParse(userId);
    if (!idValidation.success) {
        return { success: false, error: 'Invalid user ID.' };
    }
    const emailValidation = emailSchema.safeParse(newEmail);
    if (!emailValidation.success) {
        return { success: false, error: 'Invalid new email address.' };
    }

    const supabase = await createClient({ useServiceRole: true });

    const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { email: newEmail }
    );

    if (error) {
        console.error('Error changing user email:', error);
        return { success: false, error: error.message };
    }
    
    // Also update the profiles table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', userId);

    if (profileError) {
        console.error('Error updating email in profile:', profileError);
        // This is a state inconsistency, but we'll report success on the auth part
        return { success: false, error: 'Failed to update profile email, but auth email was changed.' };
    }

    return { success: true, message: 'User email changed successfully. A confirmation email has been sent.' };
}

export async function requestReauthentication(email: string) {
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
        return { success: false, error: 'Invalid email address.' };
    }
    
    // There isn't a direct "reauthentication" email in Supabase GoTrue.
    // The most common pattern is to send a password reset link, which forces
    // the user to verify their identity by accessing their email.
    return sendPasswordReset(email);
}


