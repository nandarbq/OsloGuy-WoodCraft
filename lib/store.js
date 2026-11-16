'use client';
import { useCallback, useEffect, useState } from 'react';

/* ------------------------------------------------------------------
   Lapisan data. Sekarang memakai localStorage supaya jalan tanpa setup.
   Untuk database sungguhan (Supabase), cukup ganti isi useProducts()
   — komponen lain tidak perlu diubah. Lihat README.md.
------------------------------------------------------------------- */
export const KEY = 'osloguy_products_v2';
export const KEY_WA = 'osloguy_wa_v2';
export const DEFAULT_WA = '6281234567890'; // nomor demo

const P = (id, nama, kategori, harga, stok, unggulan, deskripsi) => ({
  id, nama, kategori, harga, stok, unggulan, deskripsi, imageUrl: '',
});

export const SEED = [
  P('og-1', 'Meja Kopi Jati Minimalis', 'Meja', 1350000, 4, true, 'Kayu jati solid 100x50 cm, finishing matte natural.'),
  P('og-2', 'Kursi Makan Scandinavian', 'Kursi', 650000, 12, true, 'Kayu mahoni dengan dudukan ergonomis bergaya Nordic.'),
  P('og-3', 'Rak Buku Tangga 4 Susun', 'Rak & Lemari', 890000, 6, false, 'Rak kayu pinus serbaguna untuk ruang tamu atau kerja.'),
  P('og-4', 'Nampan Saji Kayu Sungkai', 'Dekorasi', 145000, 20, false, 'Nampan saji food-grade dengan pegangan ergonomis.'),
  P('og-5', 'Meja Kerja Sudut L-Shape', 'Meja', 2150000, 2, true, 'Meja kerja luas dengan laci penyimpanan tersembunyi.'),
  P('og-6', 'Bangku Stool Bundar', 'Kursi', 275000, 15, false, 'Bangku pendek serbaguna dari kayu trembesi.'),
  P('og-7', 'Nakas Samping Tempat Tidur', 'Rak & Lemari', 540000, 0, false, 'Nakas 1 laci dengan kaki kayu jati bubut.'),
  P('og-8', 'Jam Dinding Kayu Geometris', 'Dekorasi', 195000, 9, true, 'Hiasan dinding dengan mesin sweep senyap.'),
];

const valid = (p) =>
  p && typeof p.id === 'string' && typeof p.nama === 'string' && typeof p.kategori === 'string' &&
  Number.isFinite(p.harga) && p.harga >= 0 && Number.isInteger(p.stok) && p.stok >= 0;

export const rp = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export function useProducts() {
  const [items, setItems] = useState(SEED);
  const [wa, setWaState] = useState(DEFAULT_WA);

  useEffect(() => {
    try {
      const a = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(a) && a.length && a.every(valid)) setItems(a);
      const w = localStorage.getItem(KEY_WA);
      if (w) setWaState(w);
    } catch {}
  }, []);

  const commit = useCallback((next) => {
    setItems(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  }, []);

  const setWa = useCallback((n) => {
    setWaState(n);
    try { localStorage.setItem(KEY_WA, n); } catch {}
  }, []);

  return { items, commit, wa, setWa };
}
