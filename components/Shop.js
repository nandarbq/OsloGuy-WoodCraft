'use client';
import { useEffect, useState } from 'react';
import { useProducts } from '../lib/store';
import Catalog from './Catalog';
import Dashboard from './Dashboard';
import Login from './Login';
import Register from './Register';
import ResetPassword from './ResetPassword';

const ROLE_LABELS = { admin: 'Admin', seller: 'Seller', buyer: 'Buyer' };

export default function Shop() {
  const data = useProducts();
  const [view, setView] = useState('catalog');
  const [authError, setAuthError] = useState('');
  const [authRoute, setAuthRoute] = useState(null);

  useEffect(() => {
    const recovery = new URLSearchParams(window.location.search).get('auth') === 'recovery';
    setAuthRoute(recovery ? 'recovery' : 'normal');
    if (recovery) setView('reset-password');
  }, []);

  useEffect(() => {
    if (authRoute === null || authRoute === 'recovery') return;
    if (data.user && data.role) {
      setView(data.role === 'buyer' ? 'catalog' : 'dashboard');
    } else if (!data.user && !data.authLoading) {
      setView('catalog');
    }
  }, [data.user, data.role, data.authLoading, authRoute]);

  async function logout() {
    setAuthError('');
    try {
      await data.signOut();
    } catch (error) {
      setAuthError(`Gagal keluar: ${error.message}`);
    }
  }

  const canOpenDashboard = !data.isSupabase || data.role === 'admin' || data.role === 'seller';

  function leaveRecovery(nextView) {
    const url = new URL(window.location.href);
    url.searchParams.delete('auth');
    url.hash = '';
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
    setAuthRoute('normal');
    setView(nextView);
  }

  let mainContent;
  if (data.configurationError) {
    mainContent = <main className="wrap dash-page"><p role="alert">{data.error}</p></main>;
  } else if (authRoute === null) {
    mainContent = <main className="wrap dash-page"><p role="status">Memeriksa halaman…</p></main>;
  } else if (authRoute === 'recovery') {
    mainContent = data.authLoading
      ? <main className="wrap dash-page"><p role="status">Memeriksa tautan reset…</p></main>
      : <ResetPassword
        canUpdate={Boolean(data.user)}
        updatePassword={data.updatePassword}
        onComplete={() => leaveRecovery(data.role === 'seller' || data.role === 'admin' ? 'dashboard' : 'catalog')}
        onCancel={() => leaveRecovery('login')}
      />;
  } else if (data.loading) {
    mainContent = <main className="wrap dash-page"><p role="status">Memuat produk…</p></main>;
  } else if (data.user && data.roleLoading) {
    mainContent = <main className="wrap dash-page"><p role="status">Memeriksa role akun…</p></main>;
  } else if (data.user && !data.role) {
    mainContent = <main className="wrap dash-page"><p role="alert">Role akun belum tersedia. Minta admin memperbaiki akun atau jalankan SQL setup.</p></main>;
  } else if (view === 'login' && !data.user) {
    mainContent = <Login
      signIn={data.signIn}
      requestPasswordReset={data.requestPasswordReset}
      onRegister={() => setView('register')}
      onCancel={() => setView('catalog')}
    />;
  } else if (view === 'register' && !data.user) {
    mainContent = <Register signUp={data.signUp} onLogin={() => setView('login')} onCancel={() => setView('catalog')} />;
  } else if (view === 'dashboard' && canOpenDashboard) {
    mainContent = <Dashboard {...data} />;
  } else {
    mainContent = <Catalog {...data} />;
  }

  return (
    <>
      <header className="top">
        <div className="wrap top-in">
          <a className="logo" href="#" onClick={() => setView('catalog')} aria-label="OsloGuy, kembali ke katalog">
            <span className="mark" aria-hidden="true">O</span>
            <span>OsloGuy<small>WOODCRAFT STUDIO</small></span>
          </a>
          <nav aria-label="Tampilan">
            <button aria-pressed={view === 'catalog'} onClick={() => setView('catalog')}>Katalog</button>
            {canOpenDashboard && <button aria-pressed={view === 'dashboard'} onClick={() => setView('dashboard')}>{data.role === 'seller' ? 'Produk saya' : 'Dashboard'}</button>}
            {data.isSupabase && authRoute !== 'recovery' && !data.user && !data.authLoading && (
              <>
                <button aria-pressed={view === 'login'} onClick={() => setView('login')}>Masuk</button>
                <button aria-pressed={view === 'register'} onClick={() => setView('register')}>Daftar</button>
              </>
            )}
            {data.isSupabase && data.user && (
              <>
                <span className="who">{data.user.email} <i>{ROLE_LABELS[data.role] || 'Memuat role'}</i></span>
                <button onClick={logout}>Keluar</button>
              </>
            )}
          </nav>
        </div>
      </header>
      {(data.error || authError) && !data.configurationError && <p className="wrap" role="alert">{authError || data.error}</p>}
      {mainContent}
      <footer className="foot wrap">
        <div><strong>OsloGuy</strong><span>Furniture & objects, made with care.</span></div>
        <p>© OsloGuy Woodcraft. {data.isSupabase ? 'Pesanan diproses lewat WhatsApp.' : 'Mode demo: data tersimpan di browser ini.'}</p>
      </footer>
    </>
  );
}
