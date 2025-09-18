'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signInUser(prevState: any, formData: FormData) {
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
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['client', 'admin']).default('client'),
});

export async function registerUser(prevState: any, formData: FormData) {
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

  const { email, password, role } = validatedFields.data;

  // The handle_new_user trigger in the DB will create the profile.
  // We just need to create the auth user and set their role in metadata.
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
  
  // The trigger 'on_auth_user_created' will now handle inserting into the profiles table.

  return {
    success: true,
    message: 'User registered successfully. Please sign in.',
    userId: authData.user.id,
  };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
}
