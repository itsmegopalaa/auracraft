create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  created_at timestamptz not null default now()
);

revoke all on table public.admin_users from anon;
revoke all on table public.admin_users from authenticated;

grant all on table public.admin_users to service_role;

insert into public.admin_users (user_id, role)
values (
  '4865f987-4875-4bbc-90c7-2bb6c0be48ca',
  'admin'
)
on conflict (user_id)
do update set role = 'admin';
