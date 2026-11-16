'use client';
import { useEffect, useRef, useState } from 'react';
import PasswordField from './PasswordField';

const MAX_TRIES = 5;
const LOCK_SECONDS = 30;

export default function Login({ signIn, requestPasswordReset, onRegister, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lock, setLock] = useState(0);
  const tries = useRef(0);

  useEffect(() => {
    if (lock <= 0) return undefined;
    const t = setTimeout(() => setLock((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [lock]);

  async function submit(event) {
    event.preventDefault();
    if (submitting || (mode === 'login' && lock > 0)) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (mode === 'forgot') {
        await requestPasswordReset(email);
        setSuccess('Jika email tersebut terdaftar, tautan reset kata sandi akan dikirim.');
      } else {
        await signIn(email, password);
        tries.current = 0;
        setPassword('');
      }
    } catch (authError) {
      if (mode === 'forgot') {
        setError(authError.message || 'Tautan reset gagal dikirim. Coba lagi.');
      } else if (authError.code !== 'invalid_credentials') {
        setError(authError.message || 'Login gagal. Coba lagi.');
      } else {
        tries.current += 1;
        setPassword('');
        if (tries.current >= MAX_TRIES) {
          tries.current = 0;
          setLock(LOCK_SECONDS);
          setError(`Terlalu banyak percobaan gagal. Coba lagi dalam ${LOCK_SECONDS} detik.`);
        } else {
          setError(authError.message || 'Email atau password salah.');
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="wrap login-page">
      <aside className="login-aside">
        <img src="/products/workshop-tools.webp" alt="" />
        <div><span className="eyebrow">OSLOGUY WORKSHOP</span><h2>Karya yang baik<br />dimulai dari bahan<br /><i>yang jujur.</i></h2></div>
      </aside>
      <form className="panel login-card" onSubmit={submit} noValidate={false}>
        <span className="eyebrow">{mode === 'forgot' ? 'BANTUAN AKUN' : 'AREA MEMBER'}</span>
        <h2 className="dh">{mode === 'forgot' ? 'Lupa kata sandi?' : 'Selamat datang.'}</h2>
        <p className="mute">{mode === 'forgot' ? 'Masukkan email akun Anda untuk menerima tautan reset.' : 'Masuk dengan akun OsloGuy Anda.'}</p>
        <div className="login-fields">
          <div className="fg">
            <label htmlFor="login-email">Alamat email</label>
            <input id="login-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
          </div>
          {mode === 'login' && (
            <>
              <PasswordField
                id="login-password"
                label="Kata sandi"
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <div className="forgot-link"><button className="text-button" type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>Lupa sandi?</button></div>
            </>
          )}
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        {success && <p className="form-success" role="status">{success}</p>}
        <div className="acts">
          <button className="btn brown" type="submit" disabled={submitting || (mode === 'login' && lock > 0)} style={{ flex: 1 }}>
            {mode === 'forgot'
              ? submitting ? 'Mengirim…' : 'Kirim tautan reset'
              : lock > 0 ? `Tunggu ${lock} detik` : submitting ? 'Memproses…' : 'Masuk'}
          </button>
          <button className="btn line" type="button" onClick={onCancel}>Kembali ke katalog</button>
        </div>
        <p className="login-help">
          {mode === 'forgot'
            ? <>Ingat kata sandi? <button className="text-button" type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Kembali masuk</button></>
            : <>Belum punya akun? <button className="text-button" type="button" onClick={onRegister}>Daftar sekarang</button></>}
        </p>
      </form>
    </main>
  );
}
