'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export const KEY = 'osloguy_products_v2';
export const KEY_WA = 'osloguy_wa_v2';
export const DEFAULT_WA = '6281234567890';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseConfigError = Boolean(supabaseUrl) !== Boolean(supabaseAnonKey) ||
  (!supabaseUrl && process.env.NODE_ENV === 'production');
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const P = (id, nama, kategori, harga, stok, unggulan, deskripsi, imageUrl) => ({
  id, nama, kategori, harga, stok, unggulan, deskripsi, imageUrl, sellerId: null,
});

export const SEED = [
  P('00000000-0000-4000-8000-000000000001', 'Meja Kopi Jati Minimalis', 'Meja', 1350000, 4, true, 'Meja rendah dari jati solid dengan finishing matte natural.', '/products/coffee-table.webp'),
  P('00000000-0000-4000-8000-000000000002', 'Armchair Kayu Solid', 'Kursi', 1650000, 3, true, 'Kursi berlengan dengan sandaran bilah kayu dan siluet klasik.', '/products/armchair.webp'),
  P('00000000-0000-4000-8000-000000000003', 'Rak Dinding Geometris', 'Rak & Lemari', 490000, 6, false, 'Rak pajang dinding berbentuk segitiga, cocok untuk tanaman dan benda kecil.', '/products/wall-shelf.webp'),
  P('00000000-0000-4000-8000-000000000004', 'Papan Saji Kayu Sungkai', 'Dekorasi', 145000, 20, false, 'Papan saji serbaguna dengan permukaan serat kayu alami.', '/products/serving-board.webp'),
  P('00000000-0000-4000-8000-000000000005', 'Meja Kerja Minimalis', 'Meja', 1650000, 2, true, 'Meja kerja ringkas dengan konstruksi kayu kokoh dan ruang kaki lega.', '/products/work-desk.webp'),
  P('00000000-0000-4000-8000-000000000006', 'Bangku Stool Trembesi', 'Kursi', 375000, 15, false, 'Bangku rendah berkaki tiga dengan dudukan kayu solid.', '/products/stool.webp'),
  P('00000000-0000-4000-8000-000000000007', 'Nakas Samping Tempat Tidur', 'Rak & Lemari', 540000, 0, false, 'Nakas satu laci dengan permukaan lebar untuk lampu dan barang esensial.', '/products/nightstand.webp'),
  P('00000000-0000-4000-8000-000000000008', 'Jam Dinding Kayu Geometris', 'Dekorasi', 195000, 9, true, 'Jam dinding berlapis kayu dengan pola potong geometris.', '/products/wood-clock.webp'),
];

const valid = (product) =>
  product && typeof product.id === 'string' && typeof product.nama === 'string' &&
  typeof product.kategori === 'string' && Number.isFinite(Number(product.harga)) &&
  Number(product.harga) >= 0 && Number.isInteger(Number(product.stok)) && Number(product.stok) >= 0;

const fromRow = (row) => ({
  id: row.id,
  nama: row.nama,
  kategori: row.kategori,
  harga: Number(row.harga),
  stok: row.stok,
  deskripsi: row.deskripsi || '',
  imageUrl: row.image_url || '',
  unggulan: row.unggulan,
  sellerId: row.seller_id || null,
});

const toRow = ({ id, nama, kategori, harga, stok, deskripsi, imageUrl, unggulan, sellerId }) => ({
  id, nama, kategori, harga, stok, deskripsi, image_url: imageUrl, unggulan, seller_id: sellerId,
});

const messageOf = (error) => error?.message || 'Terjadi kesalahan yang tidak diketahui.';

export const rp = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export function useProducts() {
  const [items, setItems] = useState(supabase ? [] : SEED);
  const [wa, setWaState] = useState(DEFAULT_WA);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [roleLoading, setRoleLoading] = useState(Boolean(supabase));
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(supabaseConfigError
    ? 'Lengkapi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.'
    : '');

  useEffect(() => {
    if (supabaseConfigError) {
      setItems([]);
      setLoading(false);
      setAuthLoading(false);
      setRoleLoading(false);
      return;
    }

    if (supabase) {
      let active = true;
      const productsRequest = supabase.from('products')
        .select('id,nama,kategori,harga,stok,deskripsi,image_url,unggulan,seller_id')
        .order('created_at', { ascending: true });
      const settingsRequest = supabase.from('store_settings')
        .select('whatsapp').eq('id', 'store').single();
      Promise.all([productsRequest, settingsRequest])
        .then(([{ data: products, error: productsError }, { data: settings, error: settingsError }]) => {
          if (!active) return;
          const errors = [];
          if (productsError) errors.push(`Gagal memuat produk dari Supabase: ${productsError.message}`);
          else setItems((products || []).map(fromRow).filter(valid));
          if (settingsError) errors.push(`Gagal memuat nomor WhatsApp dari Supabase: ${settingsError.message}`);
          else setWaState(settings.whatsapp);
          setError(errors.join(' '));
          setLoading(false);
        }).catch((queryError) => {
          if (!active) return;
          setError(`Gagal memuat produk dari Supabase: ${messageOf(queryError)}`);
          setLoading(false);
        });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        setAuthLoading(false);
      });
      supabase.auth.getSession().then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setError(`Gagal memeriksa sesi login: ${sessionError.message}`);
        setUser(data.session?.user || null);
        setAuthLoading(false);
      }).catch((sessionError) => {
        if (!active) return;
        setError(`Gagal memeriksa sesi login: ${messageOf(sessionError)}`);
        setAuthLoading(false);
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    }

    try {
      const saved = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(saved) && saved.length && saved.every(valid)) setItems(saved);
      const savedWa = localStorage.getItem(KEY_WA);
      if (savedWa) setWaState(savedWa);
    } catch (storageError) {
      setError(`Gagal membaca data lokal: ${messageOf(storageError)}`);
    }
    setLoading(false);
    setAuthLoading(false);
    setRoleLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase || !user) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    let active = true;
    setRoleLoading(true);
    supabase.from('profiles').select('role').eq('id', user.id).single()
      .then(({ data, error: profileError }) => {
        if (!active) return;
        if (profileError) {
          setRole(null);
          setError(`Gagal memuat role akun. Pastikan skema Supabase sudah dijalankan: ${profileError.message}`);
        } else {
          setRole(data.role);
          setError('');
        }
        setRoleLoading(false);
      })
      .catch((profileError) => {
        if (!active) return;
        setRole(null);
        setError(`Gagal memuat role akun: ${messageOf(profileError)}`);
        setRoleLoading(false);
      });

    return () => { active = false; };
  }, [user]);

  const commit = useCallback(async (next) => {
    if (!Array.isArray(next) || !next.every(valid)) {
      throw new Error('Data produk tidak valid.');
    }
    if (supabaseConfigError) {
      throw new Error('Lengkapi konfigurasi Supabase di .env.local lalu mulai ulang server.');
    }

    if (!supabase) {
      setItems(next);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch (storageError) {
        setError(`Data berubah di tampilan, tetapi gagal disimpan di browser: ${messageOf(storageError)}`);
        throw storageError;
      }
      setError('');
      return;
    }

    const nextIds = new Set(next.map((product) => product.id));
    const removed = items.filter((product) => !nextIds.has(product.id)).map((product) => product.id);
    const changed = next.filter((product) => {
      const previous = items.find((item) => item.id === product.id);
      return !previous || JSON.stringify(previous) !== JSON.stringify(product);
    });

    if (changed.length) {
      const { error: upsertError } = await supabase.from('products').upsert(changed.map(toRow));
      if (upsertError) {
        setError(`Gagal menyimpan produk: ${upsertError.message}`);
        throw upsertError;
      }
    }
    if (removed.length) {
      const { error: deleteError } = await supabase.from('products').delete().in('id', removed);
      if (deleteError) {
        setError(`Gagal menghapus produk: ${deleteError.message}`);
        throw deleteError;
      }
    }

    setItems(next);
    setError('');
  }, [items]);

  const setWa = useCallback(async (number) => {
    if (supabaseConfigError) {
      throw new Error('Lengkapi konfigurasi Supabase di .env.local lalu mulai ulang server.');
    }
    if (supabase) {
      const { error: updateError } = await supabase.from('store_settings')
        .update({ whatsapp: number, updated_at: new Date().toISOString() })
        .eq('id', 'store');
      if (updateError) {
        setError(`Nomor WhatsApp gagal disimpan di Supabase: ${updateError.message}`);
        throw updateError;
      }
    } else {
      try {
        localStorage.setItem(KEY_WA, number);
      } catch (storageError) {
        setError(`Nomor WhatsApp gagal disimpan di browser: ${messageOf(storageError)}`);
        throw storageError;
      }
    }
    setWaState(number);
    setError('');
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(), password,
    });
    if (signInError) {
      if (signInError.status === 429) throw new Error('Terlalu banyak percobaan. Tunggu beberapa menit.');
      throw new Error('Email atau password salah.');
    }
  }, []);

  const signUp = useCallback(async ({ nama, email, password, role }) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: String(email).trim().toLowerCase(),
      password,
      options: {
        data: {
          nama: String(nama).trim(),
          role: role === 'seller' ? 'seller' : 'buyer',
        },
      },
    });
    if (signUpError) {
      if (signUpError.status === 429) throw new Error('Terlalu banyak pendaftaran. Coba lagi nanti.');
      throw new Error(signUpError.message);
    }
    return { session: Boolean(data.session) };
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      String(email).trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/?auth=recovery` },
    );
    if (resetError) {
      if (resetError.status === 429) throw new Error('Terlalu banyak permintaan. Coba lagi nanti.');
      throw new Error(resetError.message);
    }
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) throw new Error(updateError.message);
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
    if (signOutError) throw signOutError;
  }, []);

  const adminUsersRequest = useCallback(async (method, body) => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const accessToken = data.session?.access_token;
    if (!accessToken) throw new Error('Silakan login kembali.');

    const response = await fetch('/api/admin/users', {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error('Respons server tidak valid.');
    }
    if (!response.ok) throw new Error(result.error || 'Permintaan admin gagal.');
    return result;
  }, []);

  return {
    items, commit, wa, setWa, loading, authLoading, roleLoading, user, role, error,
    isSupabase: Boolean(supabase), configurationError: supabaseConfigError,
    signIn, signUp, requestPasswordReset, updatePassword, signOut, adminUsersRequest,
  };
}
