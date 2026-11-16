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
  demo.deskripsi, '', demo.unggulan, seller.id
from (values
  ('00000000-0000-4000-8000-000000000001'::uuid, 'Meja Kopi Jati Minimalis', 'Meja', 1350000, 4, 'Kayu jati solid 100x50 cm, finishing matte natural.', true),
  ('00000000-0000-4000-8000-000000000002'::uuid, 'Kursi Makan Scandinavian', 'Kursi', 650000, 12, 'Kayu mahoni dengan dudukan ergonomis bergaya Nordic.', true),
  ('00000000-0000-4000-8000-000000000003'::uuid, 'Rak Buku Tangga 4 Susun', 'Rak & Lemari', 890000, 6, 'Rak kayu pinus serbaguna untuk ruang tamu atau kerja.', false),
  ('00000000-0000-4000-8000-000000000004'::uuid, 'Nampan Saji Kayu Sungkai', 'Dekorasi', 145000, 20, 'Nampan saji food-grade dengan pegangan ergonomis.', false),
  ('00000000-0000-4000-8000-000000000005'::uuid, 'Meja Kerja Sudut L-Shape', 'Meja', 2150000, 2, 'Meja kerja luas dengan laci penyimpanan tersembunyi.', true),
  ('00000000-0000-4000-8000-000000000006'::uuid, 'Bangku Stool Bundar', 'Kursi', 275000, 15, 'Bangku pendek serbaguna dari kayu trembesi.', false),
  ('00000000-0000-4000-8000-000000000007'::uuid, 'Nakas Samping Tempat Tidur', 'Rak & Lemari', 540000, 0, 'Nakas 1 laci dengan kaki kayu jati bubut.', false),
  ('00000000-0000-4000-8000-000000000008'::uuid, 'Jam Dinding Kayu Geometris', 'Dekorasi', 195000, 9, 'Hiasan dinding dengan mesin sweep senyap.', true)
) as demo(id, nama, kategori, harga, stok, deskripsi, unggulan)
cross join lateral (
  select id from public.profiles where role = 'seller' order by created_at limit 1
) as seller
on conflict (id) do nothing;
