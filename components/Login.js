'use client';
import { useState } from 'react';

export default function Login({ signIn, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (loginError) {
      setError(loginError.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="wrap dash-page">
      <h2 className="dh">Masuk <em>akun</em></h2>
      <form className="panel" onSubmit={submit} style={{ maxWidth: 480 }}>
        <p className="mute">Masuk memakai akun yang dibuat oleh admin.</p>
        <div className="fg">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div className="fg">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <div className="acts">
          <button className="btn ink" type="submit" disabled={submitting}>{submitting ? 'Memproses…' : 'Masuk'}</button>
          <button className="btn line" type="button" onClick={onCancel}>Kembali ke katalog</button>
        </div>
      </form>
    </main>
  );
}
