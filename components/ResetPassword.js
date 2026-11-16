'use client';
import { useState } from 'react';
import PasswordField from './PasswordField';

export default function ResetPassword({ canUpdate, updatePassword, onComplete, onCancel }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (password.length < 12 || password.length > 72 ||
      !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      nextErrors.password = 'Gunakan 12–72 karakter, dengan huruf besar, huruf kecil, dan angka.';
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Konfirmasi kata sandi harus sama.';
    }
    setErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await updatePassword(password);
      setPassword('');
      setConfirmPassword('');
      setDone(true);
    } catch (updateError) {
      setError(updateError.message || 'Kata sandi gagal diperbarui. Minta tautan reset baru.');
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
      <section className="panel login-card">
        <span className="eyebrow">PEMULIHAN AKUN</span>
        <h2 className="dh">{done ? 'Kata sandi diperbarui.' : 'Buat kata sandi baru.'}</h2>
        {done ? (
          <>
            <p className="form-success" role="status">Kata sandi Anda berhasil diperbarui.</p>
            <button className="btn brown" type="button" onClick={onComplete}>Lanjutkan</button>
          </>
        ) : !canUpdate ? (
          <>
            <p className="err" role="alert">Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru dari halaman masuk.</p>
            <button className="btn brown" type="button" onClick={onCancel}>Kembali ke masuk</button>
          </>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="mute">Gunakan kata sandi baru yang belum pernah dipakai.</p>
            <div className="login-fields">
              <PasswordField
                id="reset-password"
                label="Kata sandi baru"
                autoComplete="new-password"
                placeholder="Minimal 12 karakter"
                minLength={12}
                maxLength={72}
                value={password}
                onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: '' })); }}
                error={errors.password}
              />
              <PasswordField
                id="reset-confirm-password"
                label="Ulangi kata sandi baru"
                autoComplete="new-password"
                placeholder="Ketik ulang kata sandi"
                minLength={12}
                maxLength={72}
                value={confirmPassword}
                onChange={(event) => { setConfirmPassword(event.target.value); setErrors((current) => ({ ...current, confirmPassword: '' })); }}
                error={errors.confirmPassword}
              />
            </div>
            {error && <p className="err" role="alert">{error}</p>}
            <div className="acts">
              <button className="btn brown" type="submit" disabled={submitting} style={{ flex: 1 }}>
                {submitting ? 'Menyimpan…' : 'Simpan kata sandi'}
              </button>
              <button className="btn line" type="button" onClick={onCancel}>Batal</button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
