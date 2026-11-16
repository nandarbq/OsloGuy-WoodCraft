'use client';
import { useState } from 'react';
import { useProducts } from '../lib/store';
import Catalog from './Catalog';
import Dashboard from './Dashboard';

export default function Shop() {
  const data = useProducts();
  const [view, setView] = useState('catalog');
  return (
    <>
      <header className="top">
        <div className="wrap top-in">
          <div className="logo">Oslo<b>Guy</b></div>
          <nav aria-label="Tampilan">
            <button aria-pressed={view === 'catalog'} onClick={() => setView('catalog')}>Katalog</button>
            <button aria-pressed={view === 'admin'} onClick={() => setView('admin')}>Dashboard</button>
          </nav>
        </div>
      </header>
      {data.configurationError
        ? <main className="wrap dash-page"><p role="alert">{data.error}</p></main>
        : <>
          {data.error && <p className="wrap" role="alert">{data.error}</p>}
          {data.loading
            ? <main className="wrap dash-page"><p role="status">Memuat produk…</p></main>
            : view === 'catalog' ? <Catalog {...data} /> : <Dashboard {...data} />}
        </>}
      <footer className="foot wrap">
        © OsloGuy · {data.isSupabase ? 'Data produk tersimpan di Supabase.' : 'Mode demo, data tersimpan di browser ini.'}
      </footer>
    </>
  );
}
