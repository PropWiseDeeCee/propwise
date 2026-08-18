create extension if not exists pgcrypto;

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique,
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  email text,
  category text not null,
  subject text not null,
  message text not null,
  status text not null default 'Open' check (status in ('Open', 'Pending', 'Waiting for Info', 'Closed')),
  priority text not null default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  admin_note text,
  current_page text,
  source_url text,
  client_info jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_support_ticket_number()
returns trigger
language plpgsql
as $$
begin
  if new.ticket_number is null or trim(new.ticket_number) = '' then
    new.ticket_number := 'PT-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6);
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists support_tickets_set_number on public.support_tickets;
create trigger support_tickets_set_number
before insert or update on public.support_tickets
for each row
execute function public.set_support_ticket_number();

create index if not exists support_tickets_user_id_idx
  on public.support_tickets (user_id, created_at desc);

create index if not exists support_tickets_status_idx
  on public.support_tickets (status, created_at desc);

alter table public.support_tickets enable row level security;

drop policy if exists "Users can create their own support tickets" on public.support_tickets;
drop policy if exists "Users can read own support tickets" on public.support_tickets;
drop policy if exists "Users can update own support tickets" on public.support_tickets;
drop policy if exists "Admins can read all support tickets" on public.support_tickets;
drop policy if exists "Admins can update all support tickets" on public.support_tickets;

create policy "Users can create their own support tickets"
on public.support_tickets
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can read own support tickets"
on public.support_tickets
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can update own support tickets"
on public.support_tickets
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins can read all support tickets"
on public.support_tickets
for select
to authenticated
using (public.is_super_admin());

create policy "Admins can update all support tickets"
on public.support_tickets
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "Admins can insert support tickets"
on public.support_tickets
for insert
to authenticated
with check (public.is_super_admin());
