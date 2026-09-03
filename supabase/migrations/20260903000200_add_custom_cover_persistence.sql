/*
  MineNote Custom Cover — Batch 2
  Persistence + assets + AI generations + order linkage + storage.

  Principles:
  - Customization is separate from commerce.
  - Production assets remain private.
  - Customers can only access their own customization data.
  - Admin/service-role controls production assets.
  - Orders keep an order-time customization snapshot.
*/

-- ============================================================
-- 1. CUSTOM COVER ASSETS
-- ============================================================

create table if not exists public.custom_cover_assets (
  id uuid primary key default gen_random_uuid(),

  customization_id uuid not null
    references public.custom_cover_customizations(id)
    on delete cascade,

  side text not null
    check (side in ('front', 'back')),

  kind text not null
    check (kind in ('original', 'preview', 'production')),

  storage_path text not null,

  width integer
    check (width is null or width > 0),

  height integer
    check (height is null or height > 0),

  mime_type text not null,

  file_size bigint
    check (file_size is null or file_size >= 0),

  metadata jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists custom_cover_assets_customization_id_idx
  on public.custom_cover_assets(customization_id);

create index if not exists custom_cover_assets_kind_idx
  on public.custom_cover_assets(kind);

create index if not exists custom_cover_assets_side_idx
  on public.custom_cover_assets(side);


-- ============================================================
-- 2. AI GENERATION HISTORY
-- ============================================================

create table if not exists public.custom_cover_generations (
  id uuid primary key default gen_random_uuid(),

  customization_id uuid not null
    references public.custom_cover_customizations(id)
    on delete cascade,

  provider text not null,
  model text not null,

  prompt text not null,

  negative_prompt text,

  generation_number integer not null
    check (generation_number > 0),

  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed')),

  front_asset_id uuid
    references public.custom_cover_assets(id)
    on delete set null,

  back_asset_id uuid
    references public.custom_cover_assets(id)
    on delete set null,

  metadata jsonb not null default '{}'::jsonb,

  error_message text,

  created_at timestamptz not null default now(),

  completed_at timestamptz
);

create index if not exists custom_cover_generations_customization_id_idx
  on public.custom_cover_generations(customization_id);

create index if not exists custom_cover_generations_status_idx
  on public.custom_cover_generations(status);


-- ============================================================
-- 3. ORDER → CUSTOMIZATION LINK
-- ============================================================

alter table public.orders
  add column if not exists custom_cover_id uuid;

alter table public.orders
  drop constraint if exists orders_custom_cover_id_fkey;

alter table public.orders
  add constraint orders_custom_cover_id_fkey
  foreign key (custom_cover_id)
  references public.custom_cover_customizations(id)
  on delete set null;

create index if not exists orders_custom_cover_id_idx
  on public.orders(custom_cover_id);


-- ============================================================
-- 4. ORDER-TIME CUSTOM COVER SNAPSHOT
-- ============================================================

/*
  This is the historical production configuration attached to
  the order at order creation time.

  The application will write this snapshot once when creating
  the order and will not use the customer's later draft as the
  source of truth for production.
*/

alter table public.orders
  add column if not exists custom_cover_snapshot jsonb;


-- ============================================================
-- 5. APPROVAL / REJECTION METADATA
-- ============================================================

alter table public.custom_cover_customizations
  add column if not exists customer_approved_by uuid;

alter table public.custom_cover_customizations
  add column if not exists admin_approved_by uuid;

alter table public.custom_cover_customizations
  add column if not exists rejection_reason text;


-- ============================================================
-- 6. APPROVAL USER REFERENCES
-- ============================================================

alter table public.custom_cover_customizations
  drop constraint if exists custom_cover_customer_approved_by_fkey;

alter table public.custom_cover_customizations
  add constraint custom_cover_customer_approved_by_fkey
  foreign key (customer_approved_by)
  references auth.users(id)
  on delete set null;


alter table public.custom_cover_customizations
  drop constraint if exists custom_cover_admin_approved_by_fkey;

alter table public.custom_cover_customizations
  add constraint custom_cover_admin_approved_by_fkey
  foreign key (admin_approved_by)
  references auth.users(id)
  on delete set null;


-- ============================================================
-- 7. UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_custom_cover_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists custom_cover_customizations_updated_at
  on public.custom_cover_customizations;

create trigger custom_cover_customizations_updated_at
before update on public.custom_cover_customizations
for each row
execute function public.set_custom_cover_updated_at();


-- ============================================================
-- 8. PRIVATE STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public
)
values
  ('custom-cover-uploads', 'custom-cover-uploads', false),
  ('custom-cover-previews', 'custom-cover-previews', false),
  ('custom-cover-production', 'custom-cover-production', false)
on conflict (id) do update
set public = false;


-- ============================================================
-- 9. CUSTOMER UPLOAD STORAGE POLICIES
-- ============================================================

drop policy if exists
  "Customers can upload custom cover files"
  on storage.objects;

create policy
  "Customers can upload custom cover files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'custom-cover-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);


drop policy if exists
  "Customers can view own custom cover uploads"
  on storage.objects;

create policy
  "Customers can view own custom cover uploads"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'custom-cover-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);


drop policy if exists
  "Customers can delete own custom cover uploads"
  on storage.objects;

create policy
  "Customers can delete own custom cover uploads"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'custom-cover-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- 10. CUSTOMER PREVIEW STORAGE ACCESS
-- ============================================================

/*
  Preview files are private.

  Server-side code will generate signed URLs after verifying
  customization ownership.
*/

drop policy if exists
  "Customers can view own custom cover previews"
  on storage.objects;

create policy
  "Customers can view own custom cover previews"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'custom-cover-previews'
  and (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================================
-- 11. PRODUCTION STORAGE
-- ============================================================

/*
  No authenticated-user policy is intentionally created here.

  Production assets are accessed by service-role/admin
  server-side code only.
*/


-- ============================================================
-- 12. TABLE RLS
-- ============================================================

alter table public.custom_cover_assets
  enable row level security;

alter table public.custom_cover_generations
  enable row level security;


-- ============================================================
-- 13. CUSTOMER ASSET READ ACCESS
-- ============================================================

drop policy if exists
  "Customers can view own custom cover assets"
  on public.custom_cover_assets;

create policy
  "Customers can view own custom cover assets"
on public.custom_cover_assets
for select
to authenticated
using (
  exists (
    select 1
    from public.custom_cover_customizations c
    where c.id = custom_cover_assets.customization_id
      and c.customer_id = auth.uid()
  )
);


-- ============================================================
-- 14. CUSTOMER ASSET INSERT ACCESS
-- ============================================================

drop policy if exists
  "Customers can create own custom cover assets"
  on public.custom_cover_assets;

create policy
  "Customers can create own custom cover assets"
on public.custom_cover_assets
for insert
to authenticated
with check (
  exists (
    select 1
    from public.custom_cover_customizations c
    where c.id = custom_cover_assets.customization_id
      and c.customer_id = auth.uid()
      and c.status = 'draft'
  )
);


-- ============================================================
-- 15. CUSTOMER GENERATION READ ACCESS
-- ============================================================

drop policy if exists
  "Customers can view own custom cover generations"
  on public.custom_cover_generations;

create policy
  "Customers can view own custom cover generations"
on public.custom_cover_generations
for select
to authenticated
using (
  exists (
    select 1
    from public.custom_cover_customizations c
    where c.id = custom_cover_generations.customization_id
      and c.customer_id = auth.uid()
  )
);


-- ============================================================
-- 16. GRANTS
-- ============================================================

grant select, insert
on public.custom_cover_assets
to authenticated;

grant select
on public.custom_cover_generations
to authenticated;

grant select, insert, update
on public.custom_cover_customizations
to authenticated;

grant all
on public.custom_cover_assets
to service_role;

grant all
on public.custom_cover_generations
to service_role;

grant all
on public.custom_cover_customizations
to service_role;


-- ============================================================
-- 17. DOCUMENTATION
-- ============================================================

comment on table public.custom_cover_customizations is
  'Customer-created MineNote custom cover designs.';

comment on table public.custom_cover_assets is
  'Private front/back assets belonging to a custom cover customization.';

comment on table public.custom_cover_generations is
  'Provider/model generation history for custom cover artwork.';

comment on column public.orders.custom_cover_id is
  'Links an order to its MineNote custom cover customization.';

comment on column public.orders.custom_cover_snapshot is
  'Order-time snapshot of the custom cover configuration used for production.';

comment on column public.custom_cover_assets.storage_path is
  'Private Supabase Storage object path.';

comment on column public.custom_cover_customizations.customer_approved_by is
  'Authenticated customer who approved the customization.';

comment on column public.custom_cover_customizations.admin_approved_by is
  'Authenticated admin who approved the customization for production.';
