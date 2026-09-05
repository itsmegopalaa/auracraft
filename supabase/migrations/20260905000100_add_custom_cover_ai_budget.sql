alter table public.custom_cover_customizations
add column if not exists ai_budget jsonb not null
default '{"total":7,"used":0,"remaining":7}'::jsonb;
