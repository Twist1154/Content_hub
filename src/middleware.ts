
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createClient } from '@/utils/supabase/server';

export async function middleware(request: NextRequest) {
  // First, refresh the session. This also attaches cookies to the response.
  let response = await updateSession(request);
  const supabase = createClient(); // Use the server utility which reads from cookies

  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  const userRole = session?.user?.user_metadata?.role;
  const { pathname } = request.nextUrl;
  
  // Add x-pathname to request headers for use in server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  
  response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Let the dedicated /auth/callback route handle the code exchange
  if (pathname.startsWith('/auth/callback')) {
    return response;
  }
  
  // If a client is logged in but hasn't set up a store, redirect them.
  if (session && !pathname.startsWith('/auth/setup-store') && userRole === 'client') {
      const { data: stores } = await supabase.from('stores').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id);
      if (stores?.length === 0) {
        return NextResponse.redirect(new URL('/auth/setup-store', request.url));
      }
  }

  // Protect dashboard routes
  const isProtectedClientRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/settings');
  if (isProtectedClientRoute && !session) {
    return NextResponse.redirect(new URL('/auth/client/signin', request.url));
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/admin/signin', request.url));
    }
    if (userRole !== 'admin') {
      // Redirect non-admins away from admin area
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Redirect authenticated users away from public-only pages
  if (session && (pathname.startsWith('/auth/client') || pathname.startsWith('/auth/admin'))) {
     if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
     }
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect authenticated users from the landing page to their respective dashboards
  if (session && pathname === '/') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
