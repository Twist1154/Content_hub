-- supabase/db.sql

-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique,
  role text default 'client'
);
-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

-- Allow users to manage their own profiles
create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile for new users
-- and copies the user's role from the metadata to the 'profiles' table.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, new.raw_user_meta_data->>'role');

  -- Also, update the app_metadata to ensure the role is in the JWT
  update auth.users set app_metadata = jsonb_set(
    coalesce(app_metadata, '{}'::jsonb),
    '{role}',
    to_jsonb(new.raw_user_meta_data->>'role')
  ) where id = new.id;

  return new;
end;
$$;

-- Drop existing trigger if it exists to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;
-- create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create stores table
create table if not exists stores (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users on delete cascade not null,
    name text not null,
    brand_company text not null,
    address text not null,
    created_at timestamptz default now()
);

alter table stores enable row level security;

create policy "Users can view their own stores." on stores
    for select using (auth.uid() = user_id);
    
create policy "Users can insert their own stores." on stores
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own stores." on stores
    for update using (auth.uid() = user_id);

create policy "Users can delete their own stores." on stores
    for delete using (auth.uid() = user_id);

-- Admins can manage all stores
create policy "Admins can view all stores." on stores
    for select to authenticated using (
        (select role from profiles where id = auth.uid()) = 'admin'
    );

create policy "Admins can insert any store." on stores
    for insert to authenticated with check (
        (select role from profiles where id = auth.uid()) = 'admin'
    );
create policy "Admins can update any store." on stores
    for update to authenticated using (
        (select role from profiles where id = auth.uid()) = 'admin'
    );
create policy "Admins can delete any store." on stores
    for delete to authenticated using (
        (select role from profiles where id = auth.uid()) = 'admin'
    );

-- Create content table
create table if not exists content (
    id uuid primary key default gen_random_uuid(),
    store_id uuid references stores(id) on delete set null,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    type text not null,
    file_url text not null,
    file_size bigint not null,
    created_at timestamptz default now(),
    start_date date,
    end_date date,
    recurrence_type text,
    recurrence_days text[]
);

alter table content enable row level security;

create policy "Users can view their own content." on content
    for select using (auth.uid() = user_id);

create policy "Users can insert their own content." on content
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own content." on content
    for update using (auth.uid() = user_id);

create policy "Users can delete their own content." on content
    for delete using (auth.uid() = user_id);

-- Admins can manage all content
create policy "Admins can view all content." on content
    for select using ((select role from profiles where id = auth.uid()) = 'admin');
    
create policy "Admins can insert any content." on content
    for insert with check ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Admins can update any content." on content
    for update using ((select role from profiles where id = auth.uid()) = 'admin');

create policy "Admins can delete any content." on content
    for delete using ((select role from profiles where id = auth.uid()) = 'admin');


-- STORAGE
-- Set up storage for files
insert into storage.buckets (id, name, public)
  values ('files', 'files', true)
  on conflict (id) do nothing;

-- Set up RLS policies for storage
create policy "Users can view their own files"
on storage.objects for select
using ( auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can upload files to their folder"
on storage.objects for insert
with check ( auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can update their own files"
on storage.objects for update
using ( auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete their own files"
on storage.objects for delete
using ( auth.uid()::text = (storage.foldername(name))[1] );

-- Admins can do anything with files
create policy "Admins can view any file"
on storage.objects for select
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can upload any file"
on storage.objects for insert
with check ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can update any file"
on storage.objects for update
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

create policy "Admins can delete any file"
on storage.objects for delete
using ( (select role from public.profiles where id = auth.uid()) = 'admin' );

-- Function to sync profile role to user app_metadata
create or replace function public.sync_user_app_metadata_from_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update auth.users set app_metadata = jsonb_set(
    coalesce(app_metadata, '{}'::jsonb),
    '{role}',
    to_jsonb(new.role)
  ) where id = new.id;
  return new;
end;
$$;

-- Trigger to run the function when a profile is updated
drop trigger if exists on_profile_updated on public.profiles;

create trigger on_profile_updated
  after update of role on public.profiles
  for each row execute procedure public.sync_user_app_metadata_from_profile();
  
create or replace function public.get_user_content_counts()
returns table(user_id uuid, content_count bigint, latest_upload timestamptz)
language sql
as $$
  select
    p.id as user_id,
    count(c.id) as content_count,
    max(c.created_at) as latest_upload
  from
    public.profiles p
  left join
    public.content c on p.id = c.user_id
  where
   p.role = 'client' or p.role = 'admin'
  group by
    p.id;
$$;
