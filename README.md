# OsloGuy (Next.js)

## Menjalankan aplikasi

```bash
npm install
npm run dev   # http://localhost:3000
```

Tanpa konfigurasi Supabase, aplikasi berjalan dalam mode demo lokal. Login dan role memerlukan Supabase.

## Setup Supabase: login dan role

1. Di Supabase **SQL Editor**, jalankan isi [`supabase/setup.sql`](./supabase/setup.sql). Script ini membuat atau memperbarui tabel produk, profil (nama dan role), pengaturan WhatsApp, trigger pendaftaran, dan Row Level Security (RLS). Public dapat membaca katalog; hanya admin dan seller pemilik produk dapat mengubah produk.
2. User yang sudah ada akan mendapat profil buyer. Jadikan user Anda sebagai admin pertama dengan menjalankan query ini, ganti alamat email contoh:

   ```sql
   update public.profiles
   set role = 'admin'
   where lower(email) = lower('EMAIL_USER_YANG_SUDAH_DIBUAT');

   select email, role from public.profiles;
   ```

3. Untuk mengaktifkan registrasi, buka **Authentication → Settings → User Signups** dan nyalakan **Allow new users to sign up**. Pengunjung memilih sendiri daftar sebagai **Pembeli** atau **Penjual**; form memvalidasi nama, email, serta kata sandi dan konfirmasinya. Role admin tidak tersedia di form dan hanya diberikan melalui query bootstrap admin. Admin dapat mengubah role atau menghapus akun dari **Dashboard → Kelola akun**, tetapi tidak membuat akun pembeli/penjual. Aplikasi mencegah penghapusan admin terakhir.
4. Agar pendaftar tidak perlu verifikasi email, buka **Authentication → Providers → Email** dan matikan **Confirm email**. Pendaftaran tanpa verifikasi akan langsung membuat sesi login. Tombol **Lupa sandi?** tetap mengirim tautan pemulihan lewat email. Tambahkan URL pemulihan ke **Authentication → URL Configuration → Redirect URLs**, misalnya `http://localhost:3000/**` dan `https://DOMAIN-VERCEL-ANDA/**`.
5. Tambahkan URL dan publishable key ke `.env.local` di root project. URL dan publishable key sudah diisi pada komputer yang dipakai mengembangkan project. Agar admin dapat melihat dan mengelola akun dari dashboard, tambahkan juga secret server-side:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SECRET_OR_SERVICE_ROLE_KEY
   ```

   Ambil secret/service-role key dari **Project Settings → API Keys**. `SUPABASE_SERVICE_ROLE_KEY` tidak berawalan `NEXT_PUBLIC_`; jangan kirim ke browser, commit ke Git, atau bagikan. `.env.local` sudah diabaikan Git. Setelah mengubah file, mulai ulang `npm run dev`.
6. Setelah ada akun seller, jalankan [`supabase/demo-data.sql`](./supabase/demo-data.sql) untuk menambahkan atau memperbarui delapan produk dummy yang dimiliki seller pertama.

## Hak akses

- **Admin:** mengubah role atau menghapus akun dan mengelola semua produk; mengatur nomor WhatsApp toko. Admin awal dibuat melalui query bootstrap, bukan registrasi publik.
- **Seller:** menambah, mengubah, dan menghapus produk miliknya sendiri.
- **Buyer:** melihat katalog dan menghubungi toko lewat WhatsApp; tidak memiliki Dashboard atau akses tulis.

Role produk dan user juga dibatasi di Supabase RLS, bukan hanya disembunyikan di antarmuka. Trigger database hanya menerima role publik seller atau buyer; metadata lain, termasuk permintaan role admin, tidak dapat membuat akun admin.

## Deploy

Di hosting, misalnya Vercel, atur tiga environment variable yang sama di **Project Settings → Environment Variables**, termasuk secret server-side `SUPABASE_SERVICE_ROLE_KEY` untuk fitur pengelolaan akun admin, lalu deploy ulang. Jangan memasukkan secret tersebut ke variabel `NEXT_PUBLIC_*`.

Foto produk disimpan sebagai URL pada `image_url`; Supabase Storage belum dikonfigurasi.

## Foto katalog demo

Mode demo lokal dan `supabase/demo-data.sql` memakai foto WebP lokal di `public/products`, jadi katalog tidak bergantung pada hotlink saat dibuka. Foto referensi dipilih dari Openverse dengan lisensi CC0/public domain; foto tersebut hanya untuk data demo dan sebaiknya diganti dengan foto produk milik toko sebelum dipakai untuk penjualan sungguhan.

- [Meja kopi](https://pd.w.org/2025/02/58767b0267bc2e906.18851946-1536x2048.jpeg) dan [rak dinding](https://pd.w.org/2026/05/476a1429b6c6b972.70327558-2048x1867.jpeg): WordPress Photo Directory.
- [Armchair](https://ids.si.edu/ids/deliveryService?id=NMAAHC-2011_12_26_004-000001): Smithsonian Open Access.
- [Papan saji](https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvYnMxMDk3LWltYWdlLWt3eXQ3YjcyLmpwZw.jpg) dan [stool](https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL3NrMzUxOC1pbWFnZS1rd3Z4OWd0NS5qcGc.jpg): Rawpixel public-domain collection.
- [Meja kerja](https://live.staticflickr.com/962/41252892574_48e1803c73_b.jpg), [jam](https://live.staticflickr.com/414/32514132710_f024df6213_b.jpg), dan [foto alat kerja](https://live.staticflickr.com/4350/37099081475_cce2cb1ee6_b.jpg): Flickr CC0.
- [Nakas](https://pd.w.org/2026/03/58669c56435764159.14264172-1478x2048.jpeg): WordPress Photo Directory.
