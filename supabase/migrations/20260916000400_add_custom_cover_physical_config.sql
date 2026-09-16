alter table public.custom_cover_customizations
add column if not exists physical_config jsonb not null default
'{
  "size": "A4",
  "pages": 100,
  "paper": "plain",
  "orientation": "portrait",
  "quantity": 1
}'::jsonb;

comment on column public.custom_cover_customizations.physical_config is
'Customer-selected custom notebook physical configuration including size, pages, paper, orientation and quantity.';
