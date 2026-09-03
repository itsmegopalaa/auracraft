create unique index if not exists
  custom_cover_generations_customization_generation_number_idx
on public.custom_cover_generations (
  customization_id,
  generation_number
);
