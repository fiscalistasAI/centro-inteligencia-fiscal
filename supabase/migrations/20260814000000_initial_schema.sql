create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  legal_name text not null,
  trade_name text,
  rfc text not null check (rfc = upper(regexp_replace(rfc, '\s', '', 'g')) and length(rfc) between 12 and 13),
  tax_regime text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, rfc)
);

create table public.declarations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text,
  declaration_type text not null,
  year smallint not null check (year between 2000 and 2100),
  month smallint not null check (month between 1 and 12),
  filing_date date,
  operation_number text,
  file_path text not null,
  status text not null check (status in ('uploading','processing','extracting','review_required','completed','failed')),
  raw_extraction jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (company_id, year, month, declaration_type, operation_number)
);

create table public.declaration_tax_data (
  id uuid primary key default gen_random_uuid(),
  declaration_id uuid not null unique references public.declarations(id) on delete cascade,
  isr_tax_due numeric(15,2),
  isr_withholdings numeric(15,2),
  isr_payments numeric(15,2),
  iva_charged numeric(15,2),
  iva_creditable numeric(15,2),
  iva_withholdings numeric(15,2),
  iva_due numeric(15,2),
  iva_balance_favor numeric(15,2),
  amount_due numeric(15,2),
  amount_paid numeric(15,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index companies_user_id_idx on public.companies (user_id);
create index declarations_user_company_period_idx on public.declarations (user_id, company_id, year desc, month desc);
create index declarations_review_idx on public.declarations (user_id, status) where status = 'review_required';
create index declaration_tax_data_declaration_id_idx on public.declaration_tax_data (declaration_id);

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.declarations enable row level security;
alter table public.declaration_tax_data enable row level security;

grant select, insert, update, delete on public.profiles, public.companies, public.declarations, public.declaration_tax_data to authenticated;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "companies_select_own" on public.companies for select to authenticated using ((select auth.uid()) = user_id);
create policy "companies_insert_own" on public.companies for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "companies_update_own" on public.companies for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "companies_delete_own" on public.companies for delete to authenticated using ((select auth.uid()) = user_id);

create policy "declarations_select_own" on public.declarations for select to authenticated using ((select auth.uid()) = user_id);
create policy "declarations_insert_own" on public.declarations for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.companies c where c.id = company_id and c.user_id = (select auth.uid())));
create policy "declarations_update_own" on public.declarations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "declarations_delete_own" on public.declarations for delete to authenticated using ((select auth.uid()) = user_id);

create policy "tax_data_select_own" on public.declaration_tax_data for select to authenticated using (exists (select 1 from public.declarations d where d.id = declaration_id and d.user_id = (select auth.uid())));
create policy "tax_data_insert_own" on public.declaration_tax_data for insert to authenticated with check (exists (select 1 from public.declarations d where d.id = declaration_id and d.user_id = (select auth.uid())));
create policy "tax_data_update_own" on public.declaration_tax_data for update to authenticated using (exists (select 1 from public.declarations d where d.id = declaration_id and d.user_id = (select auth.uid()))) with check (exists (select 1 from public.declarations d where d.id = declaration_id and d.user_id = (select auth.uid())));
create policy "tax_data_delete_own" on public.declaration_tax_data for delete to authenticated using (exists (select 1 from public.declarations d where d.id = declaration_id and d.user_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tax-declarations', 'tax-declarations', false, 10485760, array['application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "declaration_files_select_own" on storage.objects for select to authenticated using (bucket_id = 'tax-declarations' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "declaration_files_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'tax-declarations' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "declaration_files_update_own" on storage.objects for update to authenticated using (bucket_id = 'tax-declarations' and owner_id = (select auth.uid()::text)) with check (bucket_id = 'tax-declarations' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "declaration_files_delete_own" on storage.objects for delete to authenticated using (bucket_id = 'tax-declarations' and owner_id = (select auth.uid()::text));
