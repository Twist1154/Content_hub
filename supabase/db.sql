
-- Profiles Table
create table if not exists public.profiles (
  id uuid not null primary key,
  email text,
  role text default 'client',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;

-- Stores Table
create table if not exists public.stores (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references public.profiles,
  name text,
  brand_company text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.stores enable row level security;

-- Content Table
create table if not exists public.content (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references public.profiles,
  store_id uuid references public.stores,
  title text,
  type text,
  file_url text,
  file_size bigint,
  start_date date,
  end_date date,
  recurrence_type text,
  recurrence_days text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.content enable row level security;


-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, new.raw_app_meta_data->>'role');
  return new;
end;
$$;

-- Trigger to call the function when a new user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Function to get user content counts
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
    p.role = 'client'
  group by
    p.id;
$$;


-- POLICIES

-- Profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );


-- Stores
drop policy if exists "Stores are viewable by owners and admins." on public.stores;
create policy "Stores are viewable by owners and admins."
  on public.stores for select
  using (
    (auth.uid() = user_id) or
    (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  );

drop policy if exists "Users can insert their own stores." on public.stores;
create policy "Users can insert their own stores."
  on public.stores for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own stores." on public.stores;
create policy "Users can update their own stores."
  on public.stores for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own stores." on public.stores;
create policy "Users can delete their own stores."
    on public.stores for delete
    using ( auth.uid() = user_id );


-- Content
drop policy if exists "Content is viewable by owners and admins." on public.content;
create policy "Content is viewable by owners and admins."
  on public.content for select
  using (
    (auth.uid() = user_id) or
    (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  );

drop policy if exists "Users can insert their own content." on public.content;
create policy "Users can insert their own content."
  on public.content for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own content." on public.content;
create policy "Users can update their own content."
  on public.content for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete their own content." on public.content;
create policy "Users can delete their own content."
    on public.content for delete
    using ( auth.uid() = user_id );

-- Enable policies for file storage
-- Files bucket
drop policy if exists "Owners and admins can manage files." on storage.objects;
create policy "Owners and admins can manage files."
  on storage.objects for all
  using (
    (bucket_id = 'files' and auth.uid() = owner) or
    (bucket_id = 'files' and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  );

drop policy if exists "Anyone can view public files." on storage.objects;
create policy "Anyone can view public files."
    on storage.objects for select
    using ( bucket_id = 'files' AND (storage.foldername(name))[1] = 'public' );

-- Function to keep app_metadata in sync with profiles table
create or replace function public.sync_user_app_metadata()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new.role)
  where id = new.id;
  return new;
end;
$$;

-- Trigger to sync on profile update
create or replace trigger on_profile_updated
  after update of role on public.profiles
  for each row execute procedure public.sync_user_app_metadata();
