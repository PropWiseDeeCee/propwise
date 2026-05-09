create extension if not exists pgcrypto;

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  visitor_id text not null,
  event_type text not null default 'page_view',
  page_path text not null,
  page_title text,
  referrer text,
  timezone text,
  locale text,
  device_type text,
  browser text,
  user_agent text,
  country text,
  city text,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_at_idx
  on analytics_events (created_at desc);

create index if not exists analytics_events_page_path_idx
  on analytics_events (page_path);

create index if not exists analytics_events_user_id_idx
  on analytics_events (user_id);

create index if not exists analytics_events_visitor_id_idx
  on analytics_events (visitor_id);

alter table analytics_events enable row level security;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
  );
$$;

grant execute on function public.is_super_admin() to authenticated;

drop policy if exists "Anyone can insert analytics events" on analytics_events;
drop policy if exists "Anonymous visitors can insert analytics events" on analytics_events;
drop policy if exists "Authenticated users can insert analytics events" on analytics_events;
drop policy if exists "Super admins can read analytics events" on analytics_events;

create policy "Anonymous visitors can insert analytics events"
on analytics_events
for insert
to anon
with check (
  user_id is null
  and email is null
);

create policy "Authenticated users can insert analytics events"
on analytics_events
for insert
to authenticated
with check (
  (user_id is null or user_id = auth.uid())
  and (
    email is null
    or lower(email) = lower(auth.jwt() ->> 'email')
  )
);

create policy "Super admins can read analytics events"
on analytics_events
for select
to authenticated
using (public.is_super_admin());

update profiles
set role = 'super_admin'
where lower(email) = 'choudhury.diganta17@example.com';

drop policy if exists "Super admins can read profiles" on profiles;
drop policy if exists "Super admins can read comparisons" on comparisons;

create policy "Super admins can read profiles"
on profiles
for select
to authenticated
using (public.is_super_admin());

create policy "Super admins can read comparisons"
on comparisons
for select
to authenticated
using (public.is_super_admin());
