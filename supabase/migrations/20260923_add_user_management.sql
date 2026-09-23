-- Username-based accounts and role-aware access control.
create extension if not exists citext;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique check (username::text ~ '^[a-z0-9._-]{3,32}$'),
  display_name text not null check (char_length(display_name) between 1 and 80),
  internal_email text not null unique,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_user_is_active()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select active from public.user_profiles where user_id = auth.uid()), false);
$$;

create or replace function public.current_user_is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select coalesce((select active and role = 'admin' from public.user_profiles where user_id = auth.uid()), false);
$$;

revoke all on function public.current_user_is_active() from public;
revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_active() to authenticated;
grant execute on function public.current_user_is_admin() to authenticated;

-- Bootstrap existing Auth accounts as admins so the current owner keeps access.
insert into public.user_profiles (user_id, username, display_name, internal_email, role, active)
select
  id,
  lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9._-]', '', 'g'))::citext,
  coalesce(nullif(raw_user_meta_data ->> 'display_name', ''), split_part(email, '@', 1)),
  email,
  'admin',
  true
from auth.users
where email is not null
  and length(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9._-]', '', 'g')) between 3 and 32
on conflict (user_id) do nothing;

alter table public.user_profiles enable row level security;
drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Authenticated users can read customers" on public.customers;
drop policy if exists "Authenticated users can add customers" on public.customers;
drop policy if exists "Authenticated users can edit customers" on public.customers;
drop policy if exists "Authenticated users can delete customers" on public.customers;
drop policy if exists "Active users can read customers" on public.customers;
drop policy if exists "Active users can add customers" on public.customers;
drop policy if exists "Active users can edit customers" on public.customers;
drop policy if exists "Active users can delete customers" on public.customers;
create policy "Active users can read customers" on public.customers for select to authenticated using (public.current_user_is_active());
create policy "Active users can add customers" on public.customers for insert to authenticated with check (public.current_user_is_active());
create policy "Active users can edit customers" on public.customers for update to authenticated using (public.current_user_is_active()) with check (public.current_user_is_active());
create policy "Active users can delete customers" on public.customers for delete to authenticated using (public.current_user_is_active());

drop policy if exists "Authenticated users can read entries" on public.job_entries;
drop policy if exists "Authenticated users can add entries" on public.job_entries;
drop policy if exists "Authenticated users can edit entries" on public.job_entries;
drop policy if exists "Authenticated users can delete entries" on public.job_entries;
drop policy if exists "Active users can read entries" on public.job_entries;
drop policy if exists "Active users can add entries" on public.job_entries;
drop policy if exists "Active users can edit entries" on public.job_entries;
drop policy if exists "Active users can delete entries" on public.job_entries;
create policy "Active users can read entries" on public.job_entries for select to authenticated using (public.current_user_is_active());
create policy "Active users can add entries" on public.job_entries for insert to authenticated with check (public.current_user_is_active());
create policy "Active users can edit entries" on public.job_entries for update to authenticated using (public.current_user_is_active()) with check (public.current_user_is_active());
create policy "Active users can delete entries" on public.job_entries for delete to authenticated using (public.current_user_is_active());

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at before update on public.user_profiles
for each row execute function public.set_updated_at();
