create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nama text not null default 'Akun lama',
  role text not null default 'buyer' check (role in ('admin', 'seller', 'buyer')),
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists nama text not null default 'Akun lama';

update public.profiles
set nama = 'Akun lama'
where char_length(btrim(nama)) not between 2 and 80 or nama ~ '[0-9]';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass and conname = 'profiles_nama_valid'
  ) then
    alter table public.profiles
      add constraint profiles_nama_valid
      check (char_length(btrim(nama)) between 2 and 80 and nama !~ '[0-9]');
  end if;
end;
$$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  nama text not null check (char_length(nama) between 1 and 80),
  kategori text not null,
  harga numeric not null check (harga >= 0),
  stok integer not null check (stok >= 0),
  deskripsi text not null default '',
  image_url text not null default '',
  unggulan boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_name text := coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nama'), ''), 'Akun lama');
  user_role text := case when new.raw_user_meta_data ->> 'role' = 'seller' then 'seller' else 'buyer' end;
begin
  insert into public.profiles (id, email, nama, role)
  values (new.id, new.email, user_name, user_role)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email, nama, role)
select
  id,
  email,
  coalesce(nullif(btrim(raw_user_meta_data ->> 'nama'), ''), 'Akun lama'),
  case when raw_user_meta_data ->> 'role' = 'seller' then 'seller' else 'buyer' end
from auth.users
where email is not null
on conflict (id) do update set email = excluded.email;

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profile self or admin read" on public.profiles;
create policy "profile self or admin read" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

alter table public.products
  add column if not exists seller_id uuid references public.profiles(id) on delete set null;
alter table public.products enable row level security;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

drop policy if exists "baca publik" on public.products;
drop policy if exists "tulis admin" on public.products;
drop policy if exists "product public read" on public.products;
drop policy if exists "product admin manage" on public.products;
drop policy if exists "seller insert products" on public.products;
drop policy if exists "seller update products" on public.products;
drop policy if exists "seller delete products" on public.products;

create policy "product public read" on public.products
  for select to anon, authenticated
  using (true);

create policy "product admin manage" on public.products
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "seller insert products" on public.products
  for insert to authenticated
  with check (
    seller_id = (select auth.uid())
    and (select public.current_user_role()) = 'seller'
  );

create policy "seller update products" on public.products
  for update to authenticated
  using (
    seller_id = (select auth.uid())
    and (select public.current_user_role()) = 'seller'
  )
  with check (
    seller_id = (select auth.uid())
    and (select public.current_user_role()) = 'seller'
  );

create policy "seller delete products" on public.products
  for delete to authenticated
  using (
    seller_id = (select auth.uid())
    and (select public.current_user_role()) = 'seller'
  );

create table if not exists public.store_settings (
  id text primary key check (id = 'store'),
  whatsapp text not null default '6281234567890' check (whatsapp ~ '^[0-9]{8,15}$'),
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id, whatsapp)
values ('store', '6281234567890')
on conflict (id) do nothing;

alter table public.store_settings enable row level security;
grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;

drop policy if exists "store settings public read" on public.store_settings;
drop policy if exists "store settings admin update" on public.store_settings;

create policy "store settings public read" on public.store_settings
  for select to anon, authenticated
  using (true);

create policy "store settings admin update" on public.store_settings
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
