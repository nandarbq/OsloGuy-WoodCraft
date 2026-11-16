'use client';
import { useEffect, useRef, useState } from 'react';

const MAX_TRIES = 5;
const LOCK_SECONDS = 30;

export default function Login({ signIn, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
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
      <form className="panel login-card" onSubmit={submit} noValidate={false}>
        <h2 className="dh">Masuk</h2>
        <p className="mute">Gunakan akun yang dibuat oleh admin toko.</p>
        <div className="fg">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="fg">
          <label htmlFor="login-password">Password</label>
          <div className="pw">
            <input id="login-password" type={show ? 'text' : 'password'} autoComplete="current-password" required maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="btn line sm" onClick={() => setShow(!show)} aria-pressed={show}>{show ? 'Sembunyikan' : 'Lihat'}</button>
          </div>
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <div className="acts">
          <button className="btn brown" type="submit" disabled={submitting || lock > 0} style={{ flex: 1 }}>
            {lock > 0 ? `Tunggu ${lock} detik` : submitting ? 'Memproses…' : 'Masuk'}
          </button>
          <button className="btn line" type="button" onClick={onCancel}>Kembali</button>
        </div>
      </form>
    </main>
  );
}
