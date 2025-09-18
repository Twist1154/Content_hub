'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signInUser(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient();

  const validatedFields = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

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
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['client', 'admin']).default('client'),
});

export async function registerUser(formData: FormData) {
  const supabaseAdmin = await createClient({ useServiceRole: true });

  const validatedFields = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role') || 'client',
  });

  if (!validatedFields.success) {
    console.log('Registration validation failed:', validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      error: 'Invalid registration data.',
    };
  }

  const { email, password, role } = validatedFields.data;

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email for simplicity
    user_metadata: { role },
  });

  if (authError) {
    console.error('Auth user creation error:', authError.message);
    return {
      success: false,
      error: authError.message,
    };
  }

  const userId = authData.user.id;

  const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    email: email,
    role: role,
  });

  if (profileError) {
    console.error('Profile creation error:', profileError.message);
    // Best effort to clean up auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return {
      success: false,
      error: 'Failed to create user profile.',
    };
  }

  return {
    success: true,
    message: 'User registered successfully. Please sign in.',
    userId: userId,
  };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
}
