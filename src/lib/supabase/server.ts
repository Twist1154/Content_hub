import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';

interface CreateClientOptions {
  useServiceRole?: boolean;
}

// A cache for the service role client so we don't create it on every call
let serviceRoleClient: SupabaseClient | undefined;
  
export const createClient = (options?: CreateClientOptions) => {
  // If the service role is requested, create a pure, admin-level client.
  // This client does not need cookies and is cached.
  if (options?.useServiceRole) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
    }

    // Use the cached client if it exists
    if (serviceRoleClient) {
      return serviceRoleClient;
    }

    // Create a new service role client using the base SupabaseClient constructor
    serviceRoleClient = new SupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // Use the service key
      { auth: { persistSession: false } } // Server-side client, no need to persist sessions
    );

    return serviceRoleClient;
  }

  // --- For all other cases, create a standard, user-session client ---
  const cookieStore = cookies();
    
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use the anonymous key
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Server Components cannot set cookies. This is expected.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Server Components cannot set cookies. This is expected.
          }
      },
    },
    }
  );
};
