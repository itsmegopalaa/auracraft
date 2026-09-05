alter table public.custom_cover_generations
  add column if not exists inside_front_asset_id uuid
    references public.custom_cover_assets(id)
    on delete set null;

alter table public.custom_cover_generations
  add column if not exists inside_back_asset_id uuid
    references public.custom_cover_assets(id)
    on delete set null;

create index if not exists
  custom_cover_generations_inside_front_asset_id_idx
  on public.custom_cover_generations(inside_front_asset_id);

create index if not exists
  custom_cover_generations_inside_back_asset_id_idx
  on public.custom_cover_generations(inside_back_asset_id);
