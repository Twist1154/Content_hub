
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { headers } from 'next/headers';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signInUser(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient();

    const validatedFields = signInSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
      return {
        success: false,
        error: 'Invalid email or password.',
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
        error: error.message,
      };
    }
    
    return {
      success: true,
      user: data.user,
    };
  } catch (error: any) {
    console.error('Unexpected error signing in user:', error);
    return { success: false, error: error.message };
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['client', 'admin']).default('client'),
  fullName: z.string().optional(),
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export async function registerUser(prevState: any, formData: FormData) {
  try {
    const supabaseAdmin = await createClient({ useServiceRole: true });
    
    const validatedFields = registerSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
      console.log('Registration validation failed:', validatedFields.error.flatten().fieldErrors);
      return {
        success: false,
        error: 'Invalid registration data.',
      };
    }

    const { email, password, role, fullName, username, phoneNumber } = validatedFields.data;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, full_name: fullName },
      app_metadata: { role },
    });

    if (authError) {
      console.error('Auth user creation error:', authError.message);
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
        return {
            success: false,
            error: 'User creation failed with no error',
        };
    }

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
    
    if (profileError) {
        console.error('Error creating profile:', profileError);
        // If profile creation fails, we should ideally delete the auth user to avoid orphaned accounts
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return {
            success: false,
            error: 'Failed to create user profile. Please try again.',
        };
    }

    return {
      success: true,
      message: 'User registered successfully. Please sign in.',
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
    }
}


const magicLinkSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

export async function sendMagicLink(prevState: any, formData: FormData, forceEmail?: string) {
    try {
        const supabase = await createClient();
        const origin = headers().get('origin');

        let email: string;
        if (forceEmail) {
            email = forceEmail;
        } else {
            const validatedFields = magicLinkSchema.safeParse(
                Object.fromEntries(formData.entries())
            );

            if (!validatedFields.success) {
                return {
                success: false,
                error: 'Invalid email address.',
                };
            }
            email = validatedFields.data.email;
        }


        // Determine user role to construct the correct redirect URL
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', email)
            .single();
        
        const redirectTo = profile?.role === 'admin' 
            ? `${origin}/auth/callback?next=/admin`
            : `${origin}/auth/callback?next=/dashboard`;


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

export async function getUserAndProfile(userId: string) {
  try {
    const supabase = await createClient({ useServiceRole: true });
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError) {
      return { success: false, error: userError.message };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true, user: { ...user.user, profile } };
  } catch (error: any) {
    console.error('Unexpected error getting user and profile:', error);
    return { success: false, error: error.message };
  }
}

export async function switchUserRole(userId: string, newRole: 'admin' | 'client') {
    if (!userId || !newRole) {
        return { success: false, error: 'User ID and new role are required.' };
    }

    const supabase = await createClient({ useServiceRole: true });

    // 1. Update the user's role in the 'profiles' table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (profileError) {
        console.error(`Failed to update role in profiles for ${userId}:`, profileError);
        return { success: false, error: 'Failed to update user profile role.' };
    }

    // 2. Update the user's app_metadata in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { app_metadata: { role: newRole } }
    );

    if (authError) {
        console.error(`Failed to update app_metadata for ${userId}:`, authError);
        // If this fails, we should ideally roll back the profile update, but for now we'll just report the error.
        return { success: false, error: 'Failed to update user authentication role.' };
    }

    return { success: true, message: `User role successfully updated to ${newRole}.` };
}
