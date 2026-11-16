do $$
begin
  if not exists (select 1 from public.profiles where role = 'seller') then
    raise exception 'Buat akun seller terlebih dahulu, lalu jalankan ulang supabase/demo-data.sql.';
  end if;
end;
$$;

insert into public.products (
  id, nama, kategori, harga, stok, deskripsi, image_url, unggulan, seller_id
)
select
  demo.id, demo.nama, demo.kategori, demo.harga, demo.stok,
  demo.deskripsi, demo.image_url, demo.unggulan, seller.id
from (values
  ('00000000-0000-4000-8000-000000000001'::uuid, 'Meja Kopi Jati Minimalis', 'Meja', 1350000, 4, 'Meja rendah dari jati solid dengan finishing matte natural.', '/products/coffee-table.webp', true),
  ('00000000-0000-4000-8000-000000000002'::uuid, 'Armchair Kayu Solid', 'Kursi', 1650000, 3, 'Kursi berlengan dengan sandaran bilah kayu dan siluet klasik.', '/products/armchair.webp', true),
  ('00000000-0000-4000-8000-000000000003'::uuid, 'Rak Dinding Geometris', 'Rak & Lemari', 490000, 6, 'Rak pajang dinding berbentuk segitiga, cocok untuk tanaman dan benda kecil.', '/products/wall-shelf.webp', false),
  ('00000000-0000-4000-8000-000000000004'::uuid, 'Papan Saji Kayu Sungkai', 'Dekorasi', 145000, 20, 'Papan saji serbaguna dengan permukaan serat kayu alami.', '/products/serving-board.webp', false),
  ('00000000-0000-4000-8000-000000000005'::uuid, 'Meja Kerja Minimalis', 'Meja', 1650000, 2, 'Meja kerja ringkas dengan konstruksi kayu kokoh dan ruang kaki lega.', '/products/work-desk.webp', true),
  ('00000000-0000-4000-8000-000000000006'::uuid, 'Bangku Stool Trembesi', 'Kursi', 375000, 15, 'Bangku rendah berkaki tiga dengan dudukan kayu solid.', '/products/stool.webp', false),
  ('00000000-0000-4000-8000-000000000007'::uuid, 'Nakas Samping Tempat Tidur', 'Rak & Lemari', 540000, 0, 'Nakas satu laci dengan permukaan lebar untuk lampu dan barang esensial.', '/products/nightstand.webp', false),
  ('00000000-0000-4000-8000-000000000008'::uuid, 'Jam Dinding Kayu Geometris', 'Dekorasi', 195000, 9, 'Jam dinding berlapis kayu dengan pola potong geometris.', '/products/wood-clock.webp', true)
) as demo(id, nama, kategori, harga, stok, deskripsi, image_url, unggulan)
cross join lateral (
  select id from public.profiles where role = 'seller' order by created_at limit 1
) as seller
on conflict (id) do update set
  nama = excluded.nama,
  kategori = excluded.kategori,
  harga = excluded.harga,
  stok = excluded.stok,
  deskripsi = excluded.deskripsi,
  image_url = excluded.image_url,
  unggulan = excluded.unggulan,
  seller_id = excluded.seller_id;
