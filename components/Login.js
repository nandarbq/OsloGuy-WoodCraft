'use client';
import { useEffect, useRef, useState } from 'react';
import PasswordField from './PasswordField';

const MAX_TRIES = 5;
const LOCK_SECONDS = 30;

export default function Login({ signIn, onRegister, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
    if (submitting || lock > 0) return;
    setSubmitting(true);
    setError('');
    try {
      await signIn(email, password);
      tries.current = 0;
      setPassword('');
    } catch (loginError) {
      tries.current += 1;
      setPassword('');
      if (tries.current >= MAX_TRIES) {
        tries.current = 0;
        setLock(LOCK_SECONDS);
        setError(`Terlalu banyak percobaan gagal. Coba lagi dalam ${LOCK_SECONDS} detik.`);
      } else {
        setError(loginError.message || 'Email atau password salah.');
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
        <span className="eyebrow">AREA MEMBER</span>
        <h2 className="dh">Selamat datang.</h2>
        <p className="mute">Masuk dengan akun OsloGuy Anda.</p>
        <div className="login-fields">
          <div className="fg">
            <label htmlFor="login-email">Alamat email</label>
            <input id="login-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" />
          </div>
          <PasswordField
            id="login-password"
            label="Kata sandi"
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <div className="acts">
          <button className="btn brown" type="submit" disabled={submitting || lock > 0} style={{ flex: 1 }}>
            {lock > 0 ? `Tunggu ${lock} detik` : submitting ? 'Memproses…' : 'Masuk'}
          </button>
          <button className="btn line" type="button" onClick={onCancel}>Kembali ke katalog</button>
        </div>
        <p className="login-help">Belum punya akun? <button className="text-button" type="button" onClick={onRegister}>Daftar sekarang</button></p>
      </form>
    </main>
  );
}
