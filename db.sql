-- Create a table for public profiles
create table
  profiles (
    id uuid not null primary key,
    full_name text,
    avatar_url text,
    website text,
    "role" text default 'client'::text,
    email text,
    created_at timestamp with time zone default now(),
    username text,
    phone_number text,
    constraint id_fkey foreign key (id) references auth.users (id) on delete cascade
  );

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for
select
  using (true);

create policy "Users can insert their own profile." on profiles for
insert
  with
  check (
    (
      select
        auth.uid ()
    ) = id
  );

create policy "Users can update own profile." on profiles for
update
  using (
    (
      select
        auth.uid ()
    ) = id
  );

-- This trigger automatically creates a profile entry when a new user signs up.
-- It also syncs the role from the metadata to the auth schema for RLS.
create or replace function public.handle_new_user() returns trigger as $$
begin
  -- Insert a new profile record for the new user.
  insert into public.profiles (id, full_name, avatar_url, role, email, username, phone_number)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_app_meta_data->>'role', 'client'),
    new.email,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'phone_number'
  );

  -- Update the user's app_metadata in the auth.users table to include their role.
  -- This is crucial for RLS policies that depend on the user's role from the JWT.
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', coalesce(new.raw_app_meta_data->>'role', 'client'))
  where id = new.id;

  return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it exists, then create it.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user();

-- Create a table for stores
create table
  stores (
    id uuid not null default gen_random_uuid () primary key,
    user_id uuid not null,
    name text,
    brand_company text,
    address text,
    created_at timestamp with time zone not null default now(),
    constraint user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  );

-- Set up RLS for stores
alter table stores enable row level security;

-- Admins can see all stores
create policy "allow_admin_all" on stores for
select
  using (
    (
      select
        auth.jwt ()->'app_metadata'->>'role'
    ) = '"admin"'::jsonb
  );

-- Users can see their own stores
create policy "allow_user_own_stores" on stores for
select
  using (
    (
      select
        auth.uid ()
    ) = user_id
  );

-- Users can insert their own stores
create policy "allow_user_insert_own_stores" on stores for
insert
  with
  check (
    (
      select
        auth.uid ()
    ) = user_id
  );

-- Create a table for content
create table
  content (
    id uuid not null default gen_random_uuid () primary key,
    store_id uuid,
    user_id uuid,
    title text,
    "type" text,
    file_url text,
    file_size bigint,
    start_date text,
    end_date text,
    recurrence_type text,
    recurrence_days text[],
    created_at timestamp with time zone not null default now(),
    constraint store_id_fkey foreign key (store_id) references stores (id) on delete set null,
    constraint user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  );

-- Set up RLS for content
alter table content enable row level security;

-- Admins can see all content
create policy "allow_admin_all_content" on content for
select
  using (
    (
      select
        auth.jwt ()->'app_metadata'->>'role'
    ) = '"admin"'::jsonb
  );

-- Users can see their own content
create policy "allow_user_own_content" on content for
select
  using (
    (
      select
        auth.uid ()
    ) = user_id
  );

-- Users can insert their own content
create policy "allow_user_insert_own_content" on content for
insert
  with
  check (
    (
      select
        auth.uid ()
    ) = user_id
  );

-- Create storage bucket for files
insert into
  storage.buckets (id, name, public)
values
  ('files', 'files', true);

-- Create RLS policies for storage
create policy "allow_select_files" on storage.objects for
select
  using (bucket_id = 'files');

create policy "allow_insert_files" on storage.objects for
insert
  with
  check (bucket_id = 'files');

-- Function to get user content counts (for admin dashboard)
create
or replace function get_user_content_counts() returns table (
  user_id uuid,
  content_count bigint,
  latest_upload timestamptz
) as $$
begin
  return query
  select
    c.user_id,
    count(c.id) as content_count,
    max(c.created_at) as latest_upload
  from
    content c
  group by
    c.user_id;
end;
$$ language plpgsql;