-- Product selection is optional while creating a custom cover.
-- The product can be selected later in the customization flow.

alter table public.custom_cover_customizations
  alter column product_id drop not null;
