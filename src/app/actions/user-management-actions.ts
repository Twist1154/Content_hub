
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';

// It's a good practice to define schemas at the top for reusability.
const emailSchema = z.string().email({ message: 'Invalid email address.' });
const idSchema = z.string().uuid({ message: 'Invalid user ID.' });

/**
 * Sends a password reset link to the user's email.
 * This function now uses a static environment variable for the redirect URL to prevent
 * open redirect vulnerabilities.
 */
export async function sendPasswordReset(email: string) {
    const validatedFields = emailSchema.safeParse(email);
    if (!validatedFields.success) {
        return { success: false, error: validatedFields.error.flatten().fieldErrors.toString?.[0] };
    }

    // Ensure the site URL is configured in your environment variables.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        console.error('Error: NEXT_PUBLIC_SITE_URL is not set in environment variables.');
        return { success: false, error: 'Server configuration error.' };
    }

    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset-password`,
    });

    if (error) {
        console.error('Password reset error:', error.message);
        return { success: false, error: error.message };
    }

    return { success: true, message: 'Password reset link sent successfully.' };
}

/**
 * Deletes a user from Supabase Auth using their UUID.
 * This is a privileged action and requires a service role key.
 */
export async function deleteUser(userId: string) {
    const validatedFields = idSchema.safeParse(userId);
    if (!validatedFields.success) {
        return { success: false, error: validatedFields.error.flatten().fieldErrors.toString?.[0] };
    }

    // Use the service role client to delete a user
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
        console.error('Error deleting user:', error.message);
        return { success: false, error: error.message };
    }

    return { success: true, message: 'User successfully deleted.' };
}

/**
 * Changes a user's email in both Supabase Auth and the public 'profiles' table.
 */
export async function changeUserEmail(userId: string, newEmail: string) {
    const idValidation = idSchema.safeParse(userId);
    if (!idValidation.success) {
        return { success: false, error: 'Invalid user ID.' };
    }
    const emailValidation = emailSchema.safeParse(newEmail);
    if (!emailValidation.success) {
        return { success: false, error: 'Invalid new email address.' };
    }

    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    // First, update the email in the authentication system
    const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { email: newEmail }
    );

    if (authError) {
        console.error('Error changing user email in Auth:', authError);
        return { success: false, error: authError.message };
    }

    // If the first step was successful, update the corresponding profile table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', userId);

    if (profileError) {
        console.error('Error updating email in profile for user:', userId, profileError);
        // This is an inconsistent state. The auth email is updated, but the profile is not.
        // It's crucial to alert the admin about this for manual correction.
        return {
            success: false,
            error: 'User auth email was changed, but updating the profile failed. Please check the user data for inconsistencies.'
        };
    }

    return { success: true, message: 'User email changed successfully. A confirmation email has been sent.' };
}

/**
 * Sends an email that allows a user to re-verify their identity.
 * This is effectively the same as sending a password reset link.
 */
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

/**
 * Invites a new user by email, assigning them a role.
 * The redirect URL is securely constructed based on the role.
 */
export async function inviteUser(email: string, role: 'client' | 'admin') {
    const emailValidation = emailSchema.safeParse(email);
    if (!emailValidation.success) {
        return { success: false, error: 'Invalid email address.' };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
        console.error('Error: NEXT_PUBLIC_SITE_URL is not set in environment variables.');
        return { success: false, error: 'Server configuration error.' };
    }

    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    // This part was already correct and serves as a great example of secure redirection.
    // The unused 'origin' variable has been removed.
    const redirectTo = role === 'admin'
        ? `${siteUrl}/admin`
        : `${siteUrl}/dashboard`;

    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { role },
        redirectTo,
    });

    if (error) {
        console.error('Error inviting user:', error.message);
        return { success: false, error: error.message };
    }

    return { success: true, message: `Invitation sent to ${email}.` };
}

/**
 * Syncs the 'role' from the 'profiles' table to the app_metadata in Auth for all users.
 * Useful for ensuring JWT claims are up-to-date with profile data.
 */
export async function syncAllUsersAppMetadata() {
    try {
        const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

        // 1. Fetch all profiles
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, role');

        if (profileError) {
            throw new Error(`Failed to fetch profiles: ${profileError.message}`);
        }

        if (!profiles) {
            return { success: true, message: 'No profiles found to sync.' };
        }

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // 2. Iterate and update each user's app_metadata in Auth
        for (const profile of profiles) {
            const { error: authError } = await supabase.auth.admin.updateUserById(
                profile.id,
                { app_metadata: { role: profile.role } }
            );

            if (authError) {
                console.error(`Failed to sync role for user ${profile.id}:`, authError.message);
                errors.push(`User ${profile.id}: ${authError.message}`);
                errorCount++;
            } else {
                successCount++;
            }
        }

        const message = `Sync complete. ${successCount} users synced successfully, ${errorCount} failed.`;
        if (errorCount > 0) {
            console.error('Sync errors:', errors);
            return { success: false, error: message, details: errors };
        }

        return { success: true, message };

    } catch (error: any) {
        console.error('Unexpected error during user sync:', error);
        return { success: false, error: 'An unexpected error occurred during the sync process.' };
    }
}