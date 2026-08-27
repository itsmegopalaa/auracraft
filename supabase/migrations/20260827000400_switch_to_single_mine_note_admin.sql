-- MineNote production admin must be exactly one account.
-- Replace all existing admin mappings with the dedicated production admin.

delete from public.admin_users;

create unique index if not exists admin_users_single_admin_idx
on public.admin_users (role);

insert into public.admin_users (user_id, role)
values (
  'ae3e6a91-8688-4472-a3ed-be871c4ece94',
  'admin'
);
