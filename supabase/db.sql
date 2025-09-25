--
-- RLS Policies
--

-- 1. Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.content enable row level security;

-- 2. Create policies for the 'profiles' table
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 3. Create policies for the 'stores' table
drop policy if exists "Stores are viewable by their owner and admins." on public.stores;
create policy "Stores are viewable by their owner and admins."
  on public.stores for select
  using ( (auth.uid() = user_id) or (select role from public.profiles where id = auth.uid()) = 'admin' );

drop policy if exists "Users can insert their own stores." on public.stores;
create policy "Users can insert their own stores."
  on public.stores for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update their own stores." on public.stores;
create policy "Users can update their own stores."
  on public.stores for update
  using ( auth.uid() = user_id );

-- 4. Create policies for the 'content' table
drop policy if exists "Content is viewable by its owner and admins." on public.content;
create policy "Content is viewable by its owner and admins."
  on public.content for select
  using ( (auth.uid() = user_id) or ((select role from public.profiles where id = auth.uid()) = 'admin') );

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

drop policy if exists "Admins can delete any content." on public.content;
create policy "Admins can delete any content."
  on public.content for delete
  using ( (select role from public.profiles where id = auth.uid()) = 'admin' );


--
-- DB Functions & Triggers
--

-- 1. Function to get content counts for all users
drop function if exists public.get_user_content_counts();
create function public.get_user_content_counts()
returns table(user_id uuid, content_count bigint, latest_upload timestamptz)
language sql
security definer set search_path = public
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


-- 2. Function to handle new user creation
drop function if exists public.handle_new_user();
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, display_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;
$$;


-- 3. Trigger to call handle_new_user on new user sign-up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 4. Function to sync profile changes to auth.users metadata
-- This is useful for keeping the JWT in sync with the user's role
drop function if exists public.sync_profile_to_auth_user();
create or replace function public.sync_profile_to_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update auth.users
  set
    raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new.role),
    raw_user_meta_data = raw_user_meta_data || jsonb_build_object('display_name', new.display_name)
  where
    id = new.id;
  return new;
end;
$$;

-- 5. Trigger to call sync_profile_to_auth_user on profile update
drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  after update on public.profiles
  for each row execute procedure public.sync_profile_to_auth_user();
