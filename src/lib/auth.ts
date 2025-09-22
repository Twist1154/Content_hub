'use server';

import { createClient } from './supabase/server';
import { registerUser } from '@/app/actions/auth-actions';
import { SupabaseClient } from '@supabase/supabase-js';

export async function signUp(email: string, password: string, role: 'client' | 'admin' = 'client') {
  // Use the server action to register the user with proper role handling
  const result = await registerUser(email, password, role);

  if (!result.success) {
    throw new Error(result.error || result.message);
  }

  const supabase = await createClient() as SupabaseClient;
  const { data, error } = await supabase.auth.getUser();

  if (error) throw error;

  return data;
}

export async function getCurrentUser() {
  const supabase = await createClient() as SupabaseClient;
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';

  let supabaseClient: SupabaseClient;
  if (isAdmin) {
    supabaseClient = await createClient({ useServiceRole: true }) as SupabaseClient;
  } else {
    supabaseClient = supabase;
  }

  const { data: profile, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    
    const { data: newProfile, error: insertError } = await supabaseClient
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        role: isAdmin ? 'admin' : 'client'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating profile:', insertError);
      // Return user with a default profile if creation fails
      return { 
        ...user, 
        profile: { 
          id: user.id, 
          email: user.email!, 
          role: isAdmin ? ('admin' as const) : ('client' as const),
          created_at: new Date().toISOString()
        } 
      };
    }
    
    return { ...user, profile: newProfile };
  }
  
  return { ...user, profile };
}
