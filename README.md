# OsloGuy (Next.js)

```bash
npm install
npm run dev   # http://localhost:3000
```

Data sekarang disimpan di `localStorage` (lihat `lib/store.js`), jadi langsung jalan tanpa setup.

## Rekomendasi database: Supabase (Postgres)

Alasan: gratis untuk skala UMKM, ada tabel editor visual untuk pemilik toko, Storage untuk foto produk,
Auth bawaan untuk mengamankan dashboard, dan klien JS yang sederhana. Alternatif yang lebih ringan:
Turso (SQLite) bila hanya butuh tabel tanpa fitur lain.

### Skema

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  nama text not null check (char_length(nama) between 1 and 80),
  kategori text not null,
  harga numeric not null check (harga >= 0),
  stok integer not null check (stok >= 0),
  deskripsi text default '',
  image_url text default '',
  unggulan boolean not null default false,
  created_at timestamptz default now()
);
alter table products enable row level security;
create policy "baca publik" on products for select using (true);
create policy "tulis admin" on products for all to authenticated using (true) with check (true);
```

### Cara menyambungkan

1. `npm i @supabase/supabase-js`, isi `.env.local` dengan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon key memang publik; jangan pernah memasukkan service-role key ke kode).
2. Ganti isi `useProducts()` di `lib/store.js` agar memuat dari `supabase.from('products').select()` dan `commit` memanggil insert/update/delete.
3. Aktifkan Supabase Auth dan lindungi tampilan Dashboard, karena saat ini dashboard terbuka untuk siapa saja.
