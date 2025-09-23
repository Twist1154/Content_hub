
// src/utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface CreateClientOptions {
  useServiceRole?: boolean;
}

export const createClient = (options?: CreateClientOptions) => {
  const cookieStore = cookies();

  // The service role key should only be used in a server-side context
  // where it is safe from exposure to the client.
  if (options?.useServiceRole) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.');
    }
    // No need to handle cookies for the service role client.
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          cookies: {},
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        }
    );
  }

  // Default client for user sessions.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This is expected when calling from a Server Component.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // This is expected when calling from a Server Component.
          }
        },
      },
    }
  );
};
