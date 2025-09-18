/*
  ================================================================
  == HAPO MEDIA CONTENT HUB - COMPLETE HYBRID SETUP SCRIPT (V3)
  ================================================================
  This script combines the best of both previous versions. It:
  1. Creates all necessary tables (`profiles`, `stores`, `content`) with the `expiration_date` field.
  2. Sets up Supabase Storage.
  3. Creates trigger functions to automatically sync user profiles and JWT roles.
  4. Applies performant, non-recursive RLS policies using JWT claims.
  5. Creates and schedules a daily job to automatically delete expired content.
*/

-- =====================================================
-- STEP 1: CREATE TABLES
-- =====================================================

-- Create the `profiles` table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
    created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.profiles IS 'Stores user-specific metadata and roles.';

-- Create the `stores` table
CREATE TABLE IF NOT EXISTS public.stores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    brand_company text NOT NULL,
    address text NOT NULL,
    latitude numeric,
    longitude numeric,
    created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.stores IS 'Stores information about client-specific store locations.';

-- Create the `content` table with the expiration_date field
CREATE TABLE IF NOT EXISTS public.content (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    type text NOT NULL CHECK (type IN ('image', 'video', 'music')),
    file_url text NOT NULL,
    file_size bigint NOT NULL DEFAULT 0,
    start_date date NOT NULL,
    end_date date NOT NULL,
    recurrence_type text NOT NULL DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'custom')),
    recurrence_days text[],
    expiration_date timestamptz, -- ADDED BACK: The date when this content record should be auto-deleted.
    created_at timestamptz DEFAULT now()
);
COMMENT ON TABLE public.content IS 'Stores metadata for uploaded digital signage content, including an auto-deletion date.';

-- =====================================================
-- STEP 2: SET UP STORAGE
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 3: CREATE TRIGGER FUNCTIONS FOR DATA SYNC
-- =====================================================

-- This function creates a user profile and syncs the role to the JWT.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- This now only creates the profile. The role is set on user creation in the app code.
    INSERT INTO public.profiles (id, email, role)
    VALUES (new.id, new.email, COALESCE(new.raw_app_meta_data->>'role', 'client')::text);
    RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- This function keeps the JWT role in sync if an admin changes a user's role.
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.role <> NEW.role) THEN
        UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', NEW.role)
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_sync_user_role
    AFTER UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.sync_user_role();

-- =====================================================
-- STEP 4: APPLY ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

--- PROFILES TABLE RLS ---
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can manage any profile" ON public.profiles;
CREATE POLICY "Admins can manage any profile" ON public.profiles FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

--- STORES TABLE RLS ---
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own stores" ON public.stores;
CREATE POLICY "Users can manage their own stores" ON public.stores FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all stores" ON public.stores;
CREATE POLICY "Admins can manage all stores" ON public.stores FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

--- CONTENT TABLE RLS ---
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own content" ON public.content;
CREATE POLICY "Users can manage their own content" ON public.content FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can manage all content" ON public.content;
CREATE POLICY "Admins can manage all content" ON public.content FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

--- STORAGE RLS ---
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own files" ON storage.objects;
CREATE POLICY "Users can manage their own files" ON storage.objects FOR ALL
    USING ( bucket_id = 'content' AND owner = auth.uid() );
DROP POLICY IF EXISTS "Admins can manage all files" ON storage.objects;
CREATE POLICY "Admins can manage all files" ON storage.objects FOR ALL
    USING ( bucket_id = 'content' AND (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );

-- =====================================================
-- STEP 5: AUTOMATE DELETION OF EXPIRED CONTENT
-- =====================================================
-- NOTE: This requires the `pg_cron` extension to be enabled on your Supabase project.
-- Go to Dashboard -> Database -> Extensions and enable `pg_cron`.

-- This function will be called by the cron job to delete content.
-- It also attempts to delete the associated file from Storage.
CREATE OR REPLACE FUNCTION public.delete_expired_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Allows the function to bypass RLS to delete any user's content.
AS $$
DECLARE
    expired_record RECORD;
    storage_path text;
BEGIN
    -- Loop through each expired content record
    FOR expired_record IN
        SELECT id, file_url, user_id FROM public.content WHERE expiration_date IS NOT NULL AND expiration_date <= now()
    LOOP
        -- Construct the storage path from the user_id and file name
        storage_path := expired_record.user_id || '/' || substring(expired_record.file_url from '[^/]+$');
        
        -- Attempt to delete the associated file from Supabase Storage
        BEGIN
            PERFORM storage.delete_object('content', storage_path);
        EXCEPTION WHEN OTHERS THEN
            -- Log or handle the error if the file deletion fails, but don't stop the process.
            RAISE NOTICE 'Could not delete file from storage: %', storage_path;
        END;

        -- Delete the database record
        DELETE FROM public.content WHERE id = expired_record.id;

    END LOOP;
END;
$$;

-- Schedule the function to run once every day at midnight UTC.
-- The job is named 'daily_content_cleanup' to be identifiable.
-- It will be unscheduled if it already exists, then scheduled again, making this script re-runnable.
SELECT cron.unschedule('daily_content_cleanup');
SELECT cron.schedule('daily_content_cleanup', '0 0 * * *', 'SELECT public.delete_expired_content()');

-- =====================================================
-- SCRIPT COMPLETE
-- =====================================================
