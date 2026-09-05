drop function if exists public.consume_custom_cover_ai_credit(uuid);

create or replace function public.finalize_custom_cover_ai_generation(
  p_generation_id uuid,
  p_model text,
  p_front_asset_id uuid default null,
  p_inside_front_asset_id uuid default null,
  p_inside_back_asset_id uuid default null,
  p_back_asset_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  generation_row public.custom_cover_generations%rowtype;
  current_budget jsonb;
  total_credits integer;
  used_credits integer;
  remaining_credits integer;
  updated_generation public.custom_cover_generations%rowtype;
begin
  /*
   * Lock the generation row first.
   *
   * Only a pending generation can be finalized. This prevents a
   * second completion attempt from consuming another credit.
   */
  select *
    into generation_row
  from public.custom_cover_generations
  where id = p_generation_id
  for update;

  if generation_row.id is null then
    raise exception 'AI generation not found'
      using errcode = 'P0002';
  end if;

  if generation_row.status <> 'pending' then
    raise exception 'AI generation is not pending'
      using errcode = 'P0001';
  end if;

  /*
   * Lock the customization budget row.
   *
   * Generation completion and credit consumption happen inside
   * this same transaction.
   */
  select ai_budget
    into current_budget
  from public.custom_cover_customizations
  where id = generation_row.customization_id
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

  /*
   * Finalize generation.
   */
  update public.custom_cover_generations
  set
    model = p_model,
    status = 'completed',
    front_asset_id = p_front_asset_id,
    inside_front_asset_id = p_inside_front_asset_id,
    inside_back_asset_id = p_inside_back_asset_id,
    back_asset_id = p_back_asset_id,
    metadata = coalesce(p_metadata, '{}'::jsonb),
    error_message = null,
    completed_at = now()
  where id = p_generation_id
  returning *
    into updated_generation;

  /*
   * Consume exactly one AI credit.
   */
  used_credits := used_credits + 1;
  remaining_credits := remaining_credits - 1;

  current_budget := jsonb_build_object(
    'total', total_credits,
    'used', used_credits,
    'remaining', remaining_credits
  );

  update public.custom_cover_customizations
  set ai_budget = current_budget
  where id = generation_row.customization_id;

  return jsonb_build_object(
    'generation', to_jsonb(updated_generation),
    'ai_budget', current_budget
  );
end;
$$;

revoke all
on function public.finalize_custom_cover_ai_generation(
  uuid,
  text,
  uuid,
  uuid,
  uuid,
  uuid,
  jsonb
)
from public;

grant execute
on function public.finalize_custom_cover_ai_generation(
  uuid,
  text,
  uuid,
  uuid,
  uuid,
  uuid,
  jsonb
)
to service_role;
