
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {SupabaseClient} from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const userType = searchParams.get('userType') || 'client';
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient() as SupabaseClient;

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(`${origin}/auth/${userType}/signin?error=oauth_error`);
      }

      if (data.user) {
        // Check if profile exists, create if it doesn't
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              role: userType as 'client' | 'admin'
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        }

        // Redirect based on user type or existing profile role
        const redirectPath = profile?.role === 'admin' || userType === 'admin' ? '/admin' : '/dashboard';
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    } catch (error) {
      console.error('OAuth processing error:', error);
      return NextResponse.redirect(`${origin}/auth/${userType}/signin?error=oauth_error`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/${userType}/signin?error=oauth_error`);
}
