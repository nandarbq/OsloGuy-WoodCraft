-- Jalankan SETELAH setup.sql. Aman dijalankan berulang.

-- 1. Cabut hak tulis anon & hak eksekusi fungsi internal (defense in depth di atas RLS)
revoke all on public.profiles, public.products, public.store_settings from anon;
grant select on public.products, public.store_settings to anon;
revoke insert, update, delete on public.profiles from authenticated;
revoke insert, delete on public.store_settings from authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.current_user_role() from public, anon;
revoke execute on function public.is_admin() from public, anon;

-- 2. Validasi data produk di level database
alter table public.products
  drop constraint if exists products_kategori_len,
  drop constraint if exists products_deskripsi_len,
  drop constraint if exists products_image_url_safe,
  drop constraint if exists products_harga_max;
alter table public.products
  add constraint products_kategori_len check (char_length(kategori) between 1 and 40),
  add constraint products_deskripsi_len check (char_length(deskripsi) <= 300),
  add constraint products_harga_max check (harga <= 1000000000),
  add constraint products_image_url_safe check (
    image_url = '' or (char_length(image_url) <= 500 and image_url ~* '^(https://|/)')
  );

-- 3. Kolom updated_at + indeks
alter table public.products add column if not exists updated_at timestamptz not null default now();
create index if not exists products_seller_idx on public.products (seller_id);
create index if not exists products_created_idx on public.products (created_at);

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute procedure public.touch_updated_at();

-- 4. Sinkronkan email profil bila email auth berubah
create or replace function public.sync_profile_email() returns trigger
language plpgsql security definer set search_path = '' as $$
begin update public.profiles set email = new.email where id = new.id; return new; end; $$;
revoke execute on function public.sync_profile_email() from public, anon, authenticated;
drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute procedure public.sync_profile_email();

-- 5. Admin terakhir tidak boleh diturunkan/dihapus lewat jalur mana pun
create or replace function public.protect_last_admin() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.role = 'admin' and (tg_op = 'DELETE' or new.role <> 'admin')
     and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'Minimal harus ada satu admin.';
  end if;
  return coalesce(new, old);
end; $$;
drop trigger if exists profiles_protect_admin on public.profiles;
create trigger profiles_protect_admin before update or delete on public.profiles
  for each row execute procedure public.protect_last_admin();
