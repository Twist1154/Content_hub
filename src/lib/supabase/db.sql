-- 1. Create Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('client', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Stores table
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand_company TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Content table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video', 'music')),
  file_url TEXT NOT NULL,
  file_size BIGINT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  recurrence_type TEXT,
  recurrence_days TEXT[],
  expiration_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Set up Row Level Security (RLS)

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admins can see all profiles. Users can only see their own.
CREATE POLICY "Allow admin to view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow user to view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());
  
-- STORES
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Admins can manage all stores. Users can manage their own.
CREATE POLICY "Allow admin full access to stores"
  ON stores FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
  
CREATE POLICY "Allow user to manage their own stores"
  ON stores FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- CONTENT
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Admins can manage all content. Users can manage their own.
CREATE POLICY "Allow admin full access to content"
  ON content FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Allow user to manage their own content"
  ON content FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
  
-- 5. Create Storage bucket and policies
-- In your Supabase dashboard, go to Storage and create a new bucket named "content"
-- Add the following storage policies:

-- Policy: Allow authenticated users to upload to their own folder
-- Target roles: authenticated
-- Allowed operations: INSERT
-- WITH CHECK: bucket_id = 'content' AND (storage.foldername(name))[1] = auth.uid()::text

-- Policy: Allow users to view their own content
-- Target roles: authenticated
-- Allowed operations: SELECT
-- USING: bucket_id = 'content' AND (storage.foldername(name))[1] = auth.uid()::text

-- Policy: Allow admins to view all content
-- Target roles: authenticated
-- Allowed operations: SELECT
-- USING: bucket_id = 'content' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
