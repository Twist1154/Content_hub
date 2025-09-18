
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  // The redirect URL that the user will be sent to after the callback.
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error, data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
       // The user's session is now active.
       // The handle_new_user trigger in db.sql will have already created a profile.
       // We can now redirect based on the user's role.
      const userRole = session?.user?.user_metadata?.role;
      if (userRole === 'admin') {
        return NextResponse.redirect(`${origin}/admin`);
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // If there's an error or no code, redirect to an error page or the sign-in page.
  console.error('OAuth callback error:', 'No code or an error occurred.');
  return NextResponse.redirect(`${origin}/auth/client/signin?error=oauth_error`);
}
