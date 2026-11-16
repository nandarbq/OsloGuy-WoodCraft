# OsloGuy (Next.js)

## Menjalankan aplikasi

```bash
npm install
npm run dev   # http://localhost:3000
```

Tanpa konfigurasi Supabase, aplikasi berjalan dalam mode demo dan menyimpan produk di `localStorage`.

## Menghubungkan Supabase

1. Buat project di [Supabase](https://supabase.com/), lalu buka **SQL Editor** dan jalankan:

   ```sql
   create table if not exists products (
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

   alter table products enable row level security;

   create policy "baca publik" on products
     for select using (true);

   create policy "tulis admin" on products
     for all to authenticated
     using (true) with check (true);
   ```

   Jalankan SQL ini satu kali pada database baru.

2. Di **Authentication → Users**, buat user untuk admin. Matikan pendaftaran publik (sign ups) di pengaturan **Authentication**, agar pengunjung tidak bisa membuat akun sendiri. Semua user yang terautentikasi di project ini mendapat izin tulis dari policy di atas.
3. Ambil **Project URL** dan **anon/public key** dari **Project Settings → API**. Buat `.env.local` di folder project (boleh salin format dari `.env.example`):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

   Gunakan hanya anon/public key di aplikasi browser. Jangan pernah masukkan `service_role` key ke `.env.local` yang berawalan `NEXT_PUBLIC_` atau ke Git.
4. Mulai ulang `npm run dev`. Buka **Dashboard**, masuk memakai email dan password admin, lalu tambah produk. Katalog publik dapat membaca data; perubahan data perlu login.

Jika project masih baru dan tabel `products` kosong, katalog akan kosong sampai produk pertama ditambahkan dari Dashboard.
Kolom nomor WhatsApp toko saat ini masih disimpan di browser, belum di Supabase.

## Catatan

Produk memakai tabel `products`; gambar disimpan sebagai URL di `image_url`. Supabase Storage belum dikonfigurasi.
