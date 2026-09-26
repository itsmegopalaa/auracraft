insert into public.minenote_production_templates (
  template_key,
  version,
  name,
  description,
  status,
  locked,
  required_elements
)
values (
  'minenote-notebook',
  'v1',
  'MineNote Notebook Production Template',
  'Permanent production template for the MineNote physical notebook model. Defines the required brand, product, and production metadata layers without storing mutable product artwork.',
  'draft',
  false,
  '[
    "minenote_branding",
    "product_information",
    "production_metadata"
  ]'::jsonb
)
on conflict (template_key, version) do nothing;
