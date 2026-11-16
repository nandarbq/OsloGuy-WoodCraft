'use client';
import { useEffect, useState } from 'react';
import { useProducts } from '../lib/store';
import Catalog from './Catalog';
import Dashboard from './Dashboard';
import Login from './Login';

const ROLE_LABELS = { admin: 'Admin', seller: 'Seller', buyer: 'Buyer' };

export default function Shop() {
  const data = useProducts();
  const [view, setView] = useState('catalog');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (data.user && data.role) {
      setView(data.role === 'buyer' ? 'catalog' : 'dashboard');
    } else if (!data.user && !data.authLoading) {
      setView('catalog');
    }
  }, [data.user, data.role, data.authLoading]);

  async function logout() {
    setAuthError('');
    try {
      await data.signOut();
    } catch (error) {
      setAuthError(`Gagal keluar: ${error.message}`);
    }
  }

  const canOpenDashboard = !data.isSupabase || data.role === 'admin' || data.role === 'seller';

  return (
    <>
      <header className="top">
        <div className="wrap top-in">
          <div className="logo">Oslo<b>Guy</b></div>
          <nav aria-label="Tampilan">
            <button aria-pressed={view === 'catalog'} onClick={() => setView('catalog')}>Katalog</button>
            {canOpenDashboard && <button aria-pressed={view === 'dashboard'} onClick={() => setView('dashboard')}>{data.role === 'seller' ? 'Produk saya' : 'Dashboard'}</button>}
            {data.isSupabase && !data.user && !data.authLoading && (
              <button aria-pressed={view === 'login'} onClick={() => setView('login')}>Masuk</button>
            )}
            {data.isSupabase && data.user && (
              <>
                <span>{data.user.email} · {ROLE_LABELS[data.role] || 'Memuat role'}</span>
                <button onClick={logout}>Keluar</button>
              </>
            )}
          </nav>
        </div>
      </header>
      {data.configurationError
        ? <main className="wrap dash-page"><p role="alert">{data.error}</p></main>
        : <>
          {(data.error || authError) && <p className="wrap" role="alert">{authError || data.error}</p>}
          {data.loading
            ? <main className="wrap dash-page"><p role="status">Memuat produk…</p></main>
            : data.user && data.roleLoading
              ? <main className="wrap dash-page"><p role="status">Memeriksa role akun…</p></main>
              : data.user && !data.role
                ? <main className="wrap dash-page"><p role="alert">Role akun belum tersedia. Minta admin memperbaiki akun atau jalankan SQL setup.</p></main>
                : view === 'login' && !data.user
                  ? <Login signIn={data.signIn} onCancel={() => setView('catalog')} />
                  : view === 'dashboard' && canOpenDashboard
                    ? <Dashboard {...data} />
                    : <Catalog {...data} />}
        </>}
      <footer className="foot wrap">
        © OsloGuy · {data.isSupabase ? 'Data produk tersimpan di Supabase.' : 'Mode demo, data tersimpan di browser ini.'}
      </footer>
    </>
  );
}
