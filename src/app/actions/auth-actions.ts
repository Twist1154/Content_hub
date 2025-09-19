'use server';

import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// --- Zod Schemas for Validation ---
const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Password can't be empty
});

const registerSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  role: z.enum(['client', 'admin']).default('client'),
  fullName: z.string().optional(),
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
});

const magicLinkSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});


// --- Authentication Functions ---

export async function signInUser(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient() as SupabaseClient;

    const validatedFields = signInSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
      // Return specific field errors for better UX
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      return {
        success: false,
        error: fieldErrors.email?.[0] || fieldErrors.password?.[0] || 'Invalid credentials.',
      };
    }

    const { email, password } = validatedFields.data;

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign-in error:', error.message);
      return {
        success: false,
        error: 'Invalid email or password.', // Generic message for security
      };
    }
    
    return {
      success: true,
      user: data.user,
    };
  } catch (error: any) {
    console.error('Unexpected error signing in user:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Registers a new user and creates a corresponding profile.
 * This is a transactional operation: if the profile creation fails,
 * the newly created authentication user is deleted to prevent orphaned data.
 */
export async function registerUser(prevState: any, formData: FormData) {
  try {
    const supabaseAdmin = await createClient({ useServiceRole: true }) as SupabaseClient;
    
    const validatedFields = registerSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      return {
        success: false,
        // Provide the first validation error found
        error: Object.values(fieldErrors).flat()[0] || 'Invalid registration data.',
      };
    }

    const { email, password, role, fullName, username, phoneNumber } = validatedFields.data;

    // Step 1: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, full_name: fullName },
      app_metadata: { role },
    });

    if (authError) {
      console.error('Auth user creation error:', authError.message);
      // Check for common errors like "User already registered"
      return {
          success: false,
          error: authError.message,
      };
    }

    if (!authData.user) {
        return {
            success: false,
            error: 'Failed to create user.',
        };
    }

    // Step 2: Create the user's profile in the 'profiles' table
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: authData.user.id,
            email: authData.user.email!,
            role: role,
            full_name: fullName,
            username: username,
            phone_number: phoneNumber,
        });
    
    // Step 3: Handle potential failure (Rollback)
    if (profileError) {
        console.error('Error creating profile:', profileError);
        // CRITICAL: Delete the auth user if profile creation fails to avoid orphaned accounts.
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return {
            success: false,
            error: 'Failed to create user profile after authentication. The operation has been rolled back. Please try again.',
        };
    }

    return {
      success: true,
      message: 'User registered successfully. You can now sign in.',
      userId: authData.user.id,
    };
  } catch (error: any) {
    console.error('Unexpected error in registerUser:', error);
    return {
        success: false,
        error: 'An unexpected error occurred during registration.',
    };
  }
}

export async function signOut() {
    try {
        const supabase = await createClient();
        await supabase.auth.signOut();
    } catch (error: any) {
        console.error('Unexpected error during sign out:', error);
        // Usually, sign-out errors are not critical to the user, but logging is important.
    }
}

/**
 * Sends a magic link (One-Time Password) to the user's email.
 * This function is now secure, using a static environment variable for the redirect URL.
 */
export async function sendMagicLink(prevState: any, formData: FormData) {
    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
        if (!siteUrl) {
            console.error('Error: NEXT_PUBLIC_SITE_URL is not set in environment variables.');
            return { success: false, error: 'Server configuration error.' };
        }

        const validatedFields = magicLinkSchema.safeParse(
            Object.fromEntries(formData.entries())
        );

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.flatten().fieldErrors.email?.[0] || 'Invalid email address.',
            };
        }
        const { email } = validatedFields.data;

        const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

        // Determine user role to construct the correct redirect URL
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', email)
            .single();
        
        // Securely build the redirect URL based on the user's role
        const redirectTo = profile?.role === 'admin'
            ? `${siteUrl}/auth/callback?next=/admin`
            : `${siteUrl}/auth/callback?next=/dashboard`;

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectTo,
            },
        });

        if (error) {
            console.error('Magic link error:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
            message: 'A magic link has been sent to your email address.',
        };
    } catch (error: any) {
        console.error('Unexpected error sending magic link:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

// --- User Management Functions ---

export async function getUserAndProfile(userId: string) {
  try {
    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;
    const { data: userResponse, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError) {
      return { success: false, error: userError.message };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      // A user might exist in auth but not have a profile yet, this might not be an error
      console.warn(`Could not find profile for user ID: ${userId}`);
        return { success: false, error: profileError.message };
    }

    return { success: true, user: { ...userResponse.user, profile: profile || null } };
  } catch (error: any) {
    console.error('Unexpected error getting user and profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Switches a user's role in both the 'profiles' table and the secure app_metadata.
 */
export async function switchUserRole(userId: string, newRole: 'admin' | 'client') {
    if (!userId || !newRole) {
        return { success: false, error: 'User ID and new role are required.' };
    }

    const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

    // Step 1: Update the user's app_metadata in Supabase Auth first.
    // This is the most critical part for security (JWT claims).
    const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { app_metadata: { role: newRole } }
    );

    if (authError) {
        console.error(`Failed to update app_metadata for ${userId}:`, authError);
        return { success: false, error: 'Failed to update user authentication role.' };
    }

    // Step 2: Update the user's role in the 'profiles' table for application logic.
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (profileError) {
        console.error(`Failed to update role in profiles for ${userId}:`, profileError);
        // This is an inconsistent state. The user's JWT will have the new role,
        // but the profile table will be out of sync. This requires manual fixing.
        return { success: false, error: 'Auth role updated, but profile update failed. Data is now inconsistent.' };
    }

    return { success: true, message: `User role successfully updated to ${newRole}.` };
}
