import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from '@/lib/supabase/middleware';


export async function middleware(request: NextRequest) {
  // First, run the session refresher.
  let response = await updateSession(request);

  // Now, create a client to check the session for routing logic.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  const userRole = session?.user?.user_metadata?.role;
  const { pathname, search } = request.nextUrl;
  
  // Add pathname and search to request headers for use in server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-search', search);

  // Use NextResponse.next() to apply the new headers
   response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Let the dedicated /auth/callback route handle the code exchange
  if (pathname === '/auth/callback') {
    return response;
  }
  
  if (session && pathname !== '/auth/setup-store' && userRole === 'client') {
      const { data: stores } = await supabase.from('stores').select('id').eq('user_id', session.user.id);
      if(!stores || stores.length === 0) {
        return NextResponse.redirect(new URL('/auth/setup-store', request.url));
      }
  }


  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/settings')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/client/signin', request.url));
    }
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

  // Redirect signed-in users from public auth pages to their dashboard
  if (session && (pathname.startsWith('/auth/client') || pathname.startsWith('/auth/admin'))) {
     if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
     }
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect signed-in users from the landing page to their dashboard
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
