/*
  MineNote Custom Cover — Expand Asset Sides

  Custom cover artwork now supports four physical surfaces:

    front
    insideFront
    back
    insideBack

  Existing applied migrations are intentionally left unchanged.
*/

alter table public.custom_cover_assets
  drop constraint if exists custom_cover_assets_side_check;

alter table public.custom_cover_assets
  add constraint custom_cover_assets_side_check
  check (
    side in (
      'front',
      'insideFront',
      'back',
      'insideBack'
    )
  );
