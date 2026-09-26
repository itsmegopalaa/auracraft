-- MineNote production template lock hardening.
--
-- A template may become active+locked only when all four canonical
-- physical sides exist. Once locked, neither the template nor its
-- assets may be mutated.

create or replace function public.validate_minenote_production_template_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  asset_count integer;
begin
  if new.locked = true or new.status = 'active' then
    select count(*)
      into asset_count
      from public.minenote_production_template_assets
     where template_id = new.id
       and side in ('front', 'insideFront', 'insideBack', 'back');

    if asset_count <> 4 then
      raise exception
        'MineNote production template cannot be activated/locked until all 4 canonical assets exist. Found %.',
        asset_count;
    end if;
  end if;

  if old.locked = true then
    if new.locked is distinct from old.locked
       or new.status is distinct from old.status
       or new.template_key is distinct from old.template_key
       or new.version is distinct from old.version
       or new.name is distinct from old.name
       or new.description is distinct from old.description
       or new.required_elements is distinct from old.required_elements then
      raise exception
        'Locked MineNote production templates are immutable.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_validate_minenote_production_template_lock
  on public.minenote_production_templates;

create trigger trg_validate_minenote_production_template_lock
before update on public.minenote_production_templates
for each row
execute function public.validate_minenote_production_template_lock();


create or replace function public.prevent_locked_minenote_template_asset_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  template_locked boolean;
begin
  select locked
    into template_locked
    from public.minenote_production_templates
   where id = coalesce(new.template_id, old.template_id);

  if coalesce(template_locked, false) then
    raise exception
      'Assets belonging to a locked MineNote production template are immutable.';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_prevent_locked_minenote_template_asset_insert
  on public.minenote_production_template_assets;

drop trigger if exists trg_prevent_locked_minenote_template_asset_update
  on public.minenote_production_template_assets;

drop trigger if exists trg_prevent_locked_minenote_template_asset_delete
  on public.minenote_production_template_assets;

create trigger trg_prevent_locked_minenote_template_asset_insert
before insert on public.minenote_production_template_assets
for each row
execute function public.prevent_locked_minenote_template_asset_mutation();

create trigger trg_prevent_locked_minenote_template_asset_update
before update on public.minenote_production_template_assets
for each row
execute function public.prevent_locked_minenote_template_asset_mutation();

create trigger trg_prevent_locked_minenote_template_asset_delete
before delete on public.minenote_production_template_assets
for each row
execute function public.prevent_locked_minenote_template_asset_mutation();
