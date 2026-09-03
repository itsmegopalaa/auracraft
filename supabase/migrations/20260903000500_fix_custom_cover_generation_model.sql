-- Pending AI generations do not have a model until the provider runs.
-- The provider/model is recorded when generation completes.

alter table public.custom_cover_generations
  alter column model drop not null;
