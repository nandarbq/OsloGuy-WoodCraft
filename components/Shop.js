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
            <button aria-pressed={view === 'admin'} onClick={() => setView('admin')}>Dashboard demo</button>
          </nav>
        </div>
      </header>
      {view === 'catalog' ? <Catalog {...data} /> : <Dashboard {...data} />}
      <footer className="foot wrap">© OsloGuy · Mode demo, data tersimpan di browser ini.</footer>
    </>
  );
}
