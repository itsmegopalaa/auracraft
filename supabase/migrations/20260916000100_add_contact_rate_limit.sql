create table if not exists public.contact_rate_limits (
  key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.contact_rate_limits enable row level security;

revoke all on public.contact_rate_limits from anon, authenticated;
grant select, insert, update, delete on public.contact_rate_limits to service_role;

create or replace function public.consume_contact_rate_limit(
  p_key text,
  p_window_seconds integer default 3600,
  p_max_requests integer default 5
)
returns table (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_started timestamptz;
  v_count integer;
  v_retry integer;
begin
  insert into public.contact_rate_limits (
    key,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    p_key,
    v_now,
    1,
    v_now
  )
  on conflict (key) do nothing;

  select
    window_started_at,
    request_count
  into
    v_window_started,
    v_count
  from public.contact_rate_limits
  where key = p_key
  for update;

  if v_now >= v_window_started + make_interval(secs => p_window_seconds) then
    update public.contact_rate_limits
    set
      window_started_at = v_now,
      request_count = 1,
      updated_at = v_now
    where key = p_key;

    return query
    select
      true,
      greatest(p_max_requests - 1, 0),
      0;

    return;
  end if;

  if v_count >= p_max_requests then
    v_retry := greatest(
      1,
      ceil(
        extract(
          epoch from (
            v_window_started
            + make_interval(secs => p_window_seconds)
            - v_now
          )
        )
      )::integer
    );

    update public.contact_rate_limits
    set updated_at = v_now
    where key = p_key;

    return query
    select
      false,
      0,
      v_retry;

    return;
  end if;

  update public.contact_rate_limits
  set
    request_count = request_count + 1,
    updated_at = v_now
  where key = p_key;

  return query
  select
    true,
    greatest(p_max_requests - (v_count + 1), 0),
    0;
end;
$$;

revoke all on function public.consume_contact_rate_limit(text, integer, integer)
from public, anon, authenticated;

grant execute on function public.consume_contact_rate_limit(text, integer, integer)
to service_role;
