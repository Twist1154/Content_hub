import { createClient } from '@/utils/supabase/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // This createClient call will also refresh the user's session cookie
  // if it's expired.
  const { supabase, response } = createClient(request);

  // This is the only call we need to make in middleware
  await supabase.auth.getSession();

  // The rest of your logic can be removed from here.
  // Role-based logic should be handled in a layout or on the page itself.

    return response;
  }

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
