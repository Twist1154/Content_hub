# HapoHub Authentication Flow

This document outlines the step-by-step data and action flow when a user signs into the HapoHub application.

## 1. User Enters Credentials

- **File**: `src/components/auth/AuthForm.tsx`
- **Action**: The user enters their email and password into the form rendered by the `AuthForm` component.

## 2. Form Submission Handling

- **File**: `src/hooks/useAuthForm.ts`
- **Action**: The `useAuthForm` hook manages the form state. When the user clicks "Sign In", the `handleSubmit` function is triggered.
- **Data Flow**:
    1. The form state (email, password) is validated.
    2. A `FormData` object is created from the state.
    3. The `signInUser` Server Action is called with the `FormData`.

## 3. Server-Side Authentication

- **File**: `src/app/actions/auth-actions.ts`
- **Action**: The `signInUser` function receives the `FormData`.
- **Data Flow**:
    1. The data is parsed and validated against the `signInSchema` (using Zod).
    2. A service-role Supabase client is created.
    3. `supabase.auth.signInWithPassword` is called with the user's email and password.
    4. Supabase verifies the credentials against the `auth.users` table.
    5. If successful, Supabase generates a JWT (JSON Web Token) and sets a session cookie in the browser's response headers.
    6. The `signInUser` action returns a success object containing the user data to the client.

## 4. Post-Sign-In Redirection

- **File**: `src/hooks/useAuthForm.ts`
- **Action**: The `handleSubmit` function receives the successful result from `signInUser`.
- **Data Flow**:
    1. It calls the `getUserAndProfile` action to fetch the user's role from the `profiles` table.
    2. Based on the returned role (`admin` or `client`), the `useRouter()` hook from Next.js redirects the user to the appropriate dashboard (`/admin` or `/dashboard`).

## 5. Subsequent Requests & Session Management

- **File**: `src/middleware.ts` & `src/lib/supabase/middleware.ts`
- **Action**: For every subsequent request to the application, the middleware intercepts it.
- **Data Flow**:
    1. The `updateSession` function (`src/lib/supabase/middleware.ts`) is called first. It uses the cookies from the request to create a Supabase client and calls `supabase.auth.getSession()`. This automatically refreshes the session cookie (JWT) if it has expired.
    2. The main `middleware.ts` then uses this refreshed session to check the user's authentication status and role (`session.user.user_metadata.role`).
    3. It enforces routing rules:
        - Protects `/admin` routes, allowing only `admin` roles.
        - Protects `/dashboard`, `/profile`, and `/settings` routes, requiring any authenticated user.
        - Redirects already-signed-in users away from public pages like `/` or `/auth/client/signin` to their respective dashboards.

## 6. Post-Verification Callback

- **File**: `src/app/auth/callback/route.ts`
- **Action**: When a new user clicks the verification link in their sign-up email, they are sent to this route.
- **Data Flow**:
    1. The route receives a `code` in the URL search parameters.
    2. It calls `supabase.auth.exchangeCodeForSession(code)` to verify the code and create the user's first session.
    3. The database trigger `handle_new_user` (defined in `supabase/db.sql`) has already created a corresponding entry in the `profiles` table when the user first signed up.
    4. The callback route inspects the new session's metadata (`session.user.user_metadata.role`).
    5. It redirects the user to `/admin` or `/dashboard` based on their role.

This flow ensures a secure, role-based authentication system where session management and routing are handled automatically and efficiently.