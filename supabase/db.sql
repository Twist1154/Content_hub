
-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamptz,
  email text unique,
  role text,
  display_name text,
  constraint email_length check (char_length(email) >= 3 and char_length(email) <= 254)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security
alter table profiles
  enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);
  

-- Create a table for stores
create table if not exists stores (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    created_at timestamptz with time zone default timezone('utc'::text, now()) not null,
    name text,
    brand_company text,
    address text
);
-- RLS for stores
alter table stores enable row level security;
create policy "Users can view their own stores." on stores
    for select using ((select auth.uid()) = user_id);
create policy "Users can insert their own stores." on stores
    for insert with check ((select auth.uid()) = user_id);
create policy "Users can update their own stores." on stores
    for update using ((select auth.uid()) = user_id);
-- Admins can access all stores
create policy "Admins can view all stores." on stores for select to authenticated
    using ( (select auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' );

-- Create a table for content
create table if not exists content (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    store_id uuid references public.stores(id) on delete set null,
    created_at timestamptz with time zone default timezone('utc'::text, now()) not null,
    title text,
    file_url text,
    type text,
    file_size bigint,
    start_date date,
    end_date date,
    recurrence_type text,
    recurrence_days text[]
);
-- RLS for content
alter table content enable row level security;
create policy "Users can view their own content." on content
    for select using ((select auth.uid()) = user_id);
create policy "Users can insert their own content." on content
    for insert with check ((select auth.uid()) = user_id);
create policy "Users can update their own content." on content
    for update using ((select auth.uid()) = userid);
create policy "Users can delete their own content." on content
    for delete using ((select auth.uid()) = user_id);
-- Admins can access all content
create policy "Admins can view all content." on content for select to authenticated
    using ( (select auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' );
create policy "Admins can delete all content." on content for delete to authenticated
    using ( (select auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' );
create policy "Admins can update all content." on content for update to authenticated
    using ( (select auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin' );


-- This trigger automatically creates a profile entry when a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, display_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'role', new.raw_user_meta_data ->> 'display_name');
  
  -- Also sync the role to app_metadata for use in RLS policies
  perform (
    select auth.update_user_by_id(
      new.id,
      jsonb_build_object('app_metadata', jsonb_build_object('role', new.raw_user_meta_data ->> 'role'))
    )
  );

  return new;
end;
$$;

-- Connect the trigger to the user creation event in Supabase Auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to update profile when user metadata changes in auth.users
create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set 
    display_name = new.raw_user_meta_data ->> 'display_name',
    role = new.raw_user_meta_data ->> 'role',
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row
  when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
  execute procedure public.handle_user_update();


-- Create a function to get content counts for all users
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
