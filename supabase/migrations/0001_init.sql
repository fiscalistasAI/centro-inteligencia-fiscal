-- Centro de Inteligencia Fiscal — esquema inicial
--
-- Convenciones:
--   * timestamptz siempre (nunca timestamp sin zona).
--   * numeric(18,2) para importes; jamás float.
--   * RLS activo en todas las tablas, con `user_id` denormalizado para que
--     las políticas no necesiten joins.
--   * Importes NULL significan "el documento no traía el dato". No son cero.

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- El perfil se crea junto con el usuario. Requiere SECURITY DEFINER porque
-- corre sobre auth.users; por eso se le fija search_path y se le revoca
-- EXECUTE a los roles públicos.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------

create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  legal_name  text not null check (length(btrim(legal_name)) > 0),
  trade_name  text,
  rfc         text not null check (rfc ~ '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$'),
  tax_regime  text,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Un mismo RFC no puede repetirse para el mismo usuario.
create unique index if not exists companies_user_rfc_key
  on public.companies (user_id, rfc);

create index if not exists companies_user_id_idx
  on public.companies (user_id);

alter table public.companies enable row level security;

create policy "companies_select_own"
  on public.companies for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "companies_insert_own"
  on public.companies for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "companies_update_own"
  on public.companies for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "companies_delete_own"
  on public.companies for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- declarations
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'declaration_status') then
    create type public.declaration_status as enum (
      'processing',
      'review_required',
      'completed',
      'failed'
    );
  end if;
end
$$;

create table if not exists public.declarations (
  id                uuid primary key default gen_random_uuid(),
  company_id        uuid not null references public.companies (id) on delete cascade,
  user_id           uuid not null references auth.users (id) on delete cascade,

  document_type     text,
  declaration_type  text,
  period_type       text,
  year              integer check (year between 1990 and 2100),
  month             integer check (month between 1 and 12),
  filing_date       date,
  operation_number  text,

  file_path         text,
  file_name         text,
  file_size         integer,

  status            public.declaration_status not null default 'processing',
  error_message     text,

  rfc_extracted     text,
  rfc_matches       boolean,

  raw_extraction    jsonb,
  confidence        jsonb,
  notes             text,

  is_demo           boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists declarations_company_period_idx
  on public.declarations (company_id, year desc, month desc);

create index if not exists declarations_user_id_idx
  on public.declarations (user_id);

create index if not exists declarations_status_idx
  on public.declarations (company_id, status);

-- Detección de duplicados: mismo periodo, tipo y número de operación.
create unique index if not exists declarations_operation_key
  on public.declarations (company_id, year, month, declaration_type, operation_number)
  where operation_number is not null;

alter table public.declarations enable row level security;

create policy "declarations_select_own"
  on public.declarations for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "declarations_insert_own"
  on public.declarations for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "declarations_update_own"
  on public.declarations for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "declarations_delete_own"
  on public.declarations for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create trigger declarations_set_updated_at
  before update on public.declarations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- declaration_tax_data
-- ---------------------------------------------------------------------------

create table if not exists public.declaration_tax_data (
  id                 uuid primary key default gen_random_uuid(),
  declaration_id     uuid not null unique
                       references public.declarations (id) on delete cascade,
  user_id            uuid not null references auth.users (id) on delete cascade,

  isr_tax_due        numeric(18, 2),
  isr_withholdings   numeric(18, 2),
  isr_payments       numeric(18, 2),

  iva_charged        numeric(18, 2),
  iva_creditable     numeric(18, 2),
  iva_withholdings   numeric(18, 2),
  iva_due            numeric(18, 2),
  iva_balance_favor  numeric(18, 2),

  amount_due         numeric(18, 2),
  amount_paid        numeric(18, 2),

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists declaration_tax_data_user_id_idx
  on public.declaration_tax_data (user_id);

alter table public.declaration_tax_data enable row level security;

create policy "tax_data_select_own"
  on public.declaration_tax_data for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "tax_data_insert_own"
  on public.declaration_tax_data for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "tax_data_update_own"
  on public.declaration_tax_data for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "tax_data_delete_own"
  on public.declaration_tax_data for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create trigger declaration_tax_data_set_updated_at
  before update on public.declaration_tax_data
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Storage: bucket privado para los PDF originales
-- Ruta: {user_id}/{company_id}/{year}/{archivo}.pdf
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('declarations', 'declarations', false, 20971520, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "declarations_objects_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'declarations'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- INSERT + SELECT + UPDATE son los tres necesarios para que un upsert funcione.
create policy "declarations_objects_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'declarations'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "declarations_objects_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'declarations'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'declarations'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "declarations_objects_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'declarations'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
