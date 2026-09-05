create or replace function public.consume_custom_cover_ai_credit(
  p_customization_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_budget jsonb;
  total_credits integer;
  used_credits integer;
  remaining_credits integer;
begin
  select ai_budget
    into current_budget
  from public.custom_cover_customizations
  where id = p_customization_id
  for update;

  if current_budget is null then
    raise exception 'Custom cover customization not found'
      using errcode = 'P0002';
  end if;

  total_credits :=
    coalesce((current_budget ->> 'total')::integer, 7);

  used_credits :=
    coalesce((current_budget ->> 'used')::integer, 0);

  remaining_credits :=
    coalesce(
      (current_budget ->> 'remaining')::integer,
      greatest(total_credits - used_credits, 0)
    );

  if remaining_credits <= 0 then
    raise exception 'No AI generations remaining'
      using errcode = 'P0001';
  end if;

  used_credits := used_credits + 1;
  remaining_credits := remaining_credits - 1;

  current_budget := jsonb_build_object(
    'total', total_credits,
    'used', used_credits,
    'remaining', remaining_credits
  );

  update public.custom_cover_customizations
  set ai_budget = current_budget
  where id = p_customization_id;

  return current_budget;
end;
$$;

revoke all on function public.consume_custom_cover_ai_credit(uuid)
from public;

grant execute on function public.consume_custom_cover_ai_credit(uuid)
to service_role;
