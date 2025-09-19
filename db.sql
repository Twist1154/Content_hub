
-- db.sql

-- This trigger automatically creates a profile for a new user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create a profile for the new user
  insert into public.profiles (id, email, role, full_name, username, phone_number)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'phone_number'
  );

  -- Sync the role back to the auth.users table for JWT claims
  update auth.users
  set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new.raw_user_meta_data->>'role')
  where id = new.id;
  
  return new;
end;
$$;

-- This trigger fires when a new user is created in Supabase Auth.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- This trigger automatically syncs the role from the profiles table to the auth users table.
create function public.update_user_role_from_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Check if the role column was actually changed
  IF (TG_OP = 'UPDATE' AND OLD.role <> NEW.role) THEN
    -- Update the user's auth metadata to reflect the new role
    update auth.users
    set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', NEW.role)
    where id = NEW.id;
  END IF;
  
  return NEW;
end;
$$;

-- This trigger fires when a profile's role is updated.
create trigger on_profile_role_updated
  after update of role on public.profiles
  for each row execute procedure public.update_user_role_from_profile();


-- This is a helper function in Postgres to get user content counts and latest upload timestamp.
-- We can call this from our server-side code to get aggregated data efficiently.
create or replace function get_user_content_counts()
returns table(user_id uuid, content_count bigint, latest_upload timestamptz) as $$
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
