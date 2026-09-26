create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),

  admin_user_id uuid references auth.users(id) on delete set null,

  source text not null default 'admin'
    check (source in ('admin', 'automation', 'webhook', 'system')),

  action text not null,
  entity_type text not null,
  entity_id text,

  before_data jsonb,
  after_data jsonb,
  metadata jsonb,

  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);

create index if not exists admin_audit_logs_admin_user_id_idx
  on public.admin_audit_logs (admin_user_id);

create index if not exists admin_audit_logs_entity_idx
  on public.admin_audit_logs (entity_type, entity_id);

create index if not exists admin_audit_logs_action_idx
  on public.admin_audit_logs (action);

alter table public.admin_audit_logs enable row level security;

revoke all on table public.admin_audit_logs from anon;
revoke all on table public.admin_audit_logs from authenticated;

grant select on table public.admin_audit_logs to authenticated;
grant all on table public.admin_audit_logs to service_role;

create policy "Admins can view audit logs"
  on public.admin_audit_logs
  for select
  to authenticated
  using (public.is_admin());

comment on table public.admin_audit_logs is
  'Append-only administrative activity history. Written by trusted server-side/service-role code.';

comment on column public.admin_audit_logs.source is
  'Origin of the action: admin, automation, webhook, or system.';

comment on column public.admin_audit_logs.before_data is
  'Sanitized state before the action. Never store secrets or payment credentials.';

comment on column public.admin_audit_logs.after_data is
  'Sanitized state after the action. Never store secrets or payment credentials.';
