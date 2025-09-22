# HapoHub Authentication Flow (Sign-In)

This document provides a detailed, implementation-level overview of what happens in the application when a user signs in. It covers the supported sign-in methods, data read/written, redirects, cookies/session lifecycle, and the exact modules involved.

Supported sign-in methods:
- Email + Password (Clients and Admins)
- Magic Link (Passwordless)

Key components involved:
- UI: `src/components/auth/AuthForm.tsx`, `src/components/auth/MagicLinkForm.tsx`
- Hooks: `src/hooks/useAuthForm.ts`
- Server actions: `src/app/actions/auth-actions.ts`
- Magic link callback: `src/app/auth/callback/route.ts`
- Supabase clients: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server), `src/lib/supabase/middleware.ts` (middleware)
- Middleware: `src/middleware.ts`

Notes on roles:
- Application roles are: `client` and `admin`.
- Roles are stored in the `profiles` table and are synced to the user's `app_metadata` in Supabase Auth, which is used for secure routing and policies.

---

## 1) Email + Password Sign-In

**Entry points (examples):**
- **Admin**: `/auth/admin/signin` (uses `AuthForm` with `mode="signin"` and `userType="admin"`)
- **Client**: `/auth/client/signin` (uses `AuthForm` with `mode="signin"` and `userType="client"`)

**Primary code paths:**
- UI submits via `src/hooks/useAuthForm.ts` → `handleSubmit()`
- Server action: `src/app/actions/auth-actions.ts` → `signInUser(prevState, formData)`
- Post-login profile check: `src/app/actions/auth-actions.ts` → `getUserAndProfile(userId)`

**Step-by-step flow:**
1. User enters their email and password in the `AuthForm` component.
2. On submit, the `useAuthForm` hook's `handleSubmit` function is triggered. It creates a `FormData` object from the form state.
3. The hook calls the `signInUser` server action with the `FormData`.
4. Inside `signInUser`:
   - A server-side Supabase client is created.
   - It calls `supabase.auth.signInWithPassword()` with the user's email and password.
   - Supabase verifies the credentials and, on success, returns a user object and sets session cookies.
   - The action returns `{ success: true, user: data.user }` to the client-side hook.
5. If sign-in succeeds, the `useAuthForm` hook then calls the `getUserAndProfile` server action with the user's ID.
6. The `getUserAndProfile` action fetches the user's role from the `profiles` table.
7. **Redirect Decision (Client-side)**: Based on the returned role (`admin` or `client`), the `useRouter()` hook in `useAuthForm` redirects the user to the appropriate dashboard (`/admin` or `/dashboard`).
8. **Notifications/UI**: Success and error toasts are displayed via the `useToast` hook, which is called from `useAuthForm`.

**Data read/written:**
- **Read**: Supabase `auth.users` table (for credential verification), `profiles` table (to get the role).
- **Cookies/Tokens**: Supabase automatically sets session cookies (`sb-*-access-token`, `sb-*-refresh-token`) in the browser's response headers. These are refreshed by the `middleware.ts`.

---

## 2) Magic Link (Passwordless)

**Entry points (examples):**
- **Admin**: `/auth/admin/magic-link`
- **Client**: `/auth/client/magic-link`

**Primary code paths:**
- UI: `src/components/auth/MagicLinkForm.tsx`
- Server Action: `src/app/actions/auth-actions.ts` → `sendMagicLink(prevState, formData)`
- Callback route: `src/app/auth/callback/route.ts`

**Step-by-step flow:**
1. User enters their email in the `MagicLinkForm` and clicks "Send Magic Link".
2. The form calls the `sendMagicLink` server action.
3. Inside `sendMagicLink`:
   - A service-role Supabase client is created.
   - It looks up the user's role in the `profiles` table to construct the correct callback URL.
   - It calls `supabase.auth.signInWithOtp()` with the user's email and the `emailRedirectTo` option.
4. Supabase emails a sign-in link to the user.
5. The user clicks the link, which directs them to the `/auth/callback` route with a one-time code in the URL.
6. `src/app/auth/callback/route.ts` handles the GET request:
   - It extracts the `code` from the URL.
   - It exchanges the code for a valid session by calling `supabase.auth.exchangeCodeForSession(code)`.
   - It inspects the new session's metadata (`session.user.user_metadata.role`).
   - It redirects to `/admin` for administrators or `/dashboard` for clients.
7. **Session Management**: The `middleware.ts` will refresh and solidify the session cookies on all subsequent requests to the application.

**Data read/written:**
- **Read**: `profiles` table (to determine redirect URL), `auth.users` (after session exchange).
- **Cookies/Tokens**: Session cookies are set by Supabase during the `exchangeCodeForSession` step.

**Error handling:**
- If the token exchange fails, the callback route redirects the user to the sign-in page with an error parameter.

---

## Session, Cookies, and Middleware

**Supabase client creation:**
- **Browser**: `src/lib/supabase/client.ts` → `createBrowserClient()`
- **Server (RSC/actions)**: `src/lib/supabase/server.ts` → `createServerClient()` or a service-role `SupabaseClient` when requested.
- **Middleware**: `src/lib/supabase/middleware.ts` → `updateSession()` creates a server client configured to handle cookies for the request/response cycle.

**Cookie behavior:**
- In Server Components and Server Actions, cookie `set` and `remove` operations are wrapped in `try/catch` blocks because they cannot always write cookies directly.
- The `middleware.ts`, which calls `updateSession`, is the primary mechanism for refreshing session tokens on every matched request, ensuring cookies remain current.
- The middleware's matcher (`config.matcher`) is configured to run on most paths while excluding static assets.

**Service-role client:**
- Certain administrative actions (like creating or deleting users) use `createClient({ useServiceRole: true })` to create a privileged client on the server that can bypass Row Level Security. This key is **never** exposed to the browser.

---

## Authorization and Redirect Logic

- **Post Sign-In**: After a successful email/password sign-in, the `useAuthForm` hook fetches the user's profile and uses the role to redirect.
- **Post Verification**: After a magic link or email verification, the `/auth/callback` route inspects the new session and redirects based on the role found in the user's metadata.
- **Route Protection**: The `middleware.ts` enforces route protection on every request. It redirects unauthenticated users from protected routes and redirects authenticated users away from public sign-in pages to their respective dashboards.
- **Role usage:**
  - `admin` → `/admin`
  - `client` → `/dashboard`

---

## Data Model Touchpoints

- `public.profiles`:
  - `id`: UUID (foreign key to `auth.users.id`)
  - `email`: `text`
  - `role`: `'client'` | `'admin'`
- Supabase Auth (managed by Supabase):
  - `users` table: Stores user identity.
  - `sessions` table: Manages active sessions.
  - `app_metadata`: Secure, server-only metadata on the user object. We store `role` here to ensure JWTs contain the user's role for security policies. This is synced from the `profiles` table.

---

## Developer References (Source Files)

- `src/app/actions/auth-actions.ts` (`signInUser`, `registerUser`, `sendMagicLink`)
- `src/app/auth/callback/route.ts` (Handles email verification and magic link callbacks)
- `src/hooks/useAuthForm.ts` (Handles form state, validation, and submission for email/password sign-in)
- `src/components/auth/AuthForm.tsx` (UI for sign-in and sign-up)
- `src/components/auth/MagicLinkForm.tsx` (UI for passwordless sign-in)
- `src/lib/supabase/server.ts`, `client.ts`, `middleware.ts` (Supabase client configurations)
- `src/middleware.ts` (Session refresh and route protection logic)
- `supabase/db.sql` (Contains the `handle_new_user` trigger that creates profiles automatically)
