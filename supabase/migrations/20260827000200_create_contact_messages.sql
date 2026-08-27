create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  email text not null,
  message text not null,

  is_read boolean not null default false,

  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.contact_messages enable row level security;

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

create index if not exists contact_messages_is_read_idx
  on public.contact_messages (is_read);

create policy "Admins can read contact messages"
on public.contact_messages
for select
to authenticated
using (public.is_admin());

create policy "Admins can update contact messages"
on public.contact_messages
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select, update on public.contact_messages to authenticated;
