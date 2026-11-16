'use client';
import { useState } from 'react';
import PasswordField from './PasswordField';

const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES = ['buyer', 'seller'];

export default function Register({ signUp, onLogin, onCancel }) {
  const [form, setForm] = useState({ nama: '', email: '', role: 'buyer', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setError('');
    setSuccess('');
  };

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    const nama = form.nama.trim().replace(/\s+/g, ' ');
    const email = form.email.trim().toLowerCase();
    const nextErrors = {};
    if (nama.length < 2 || nama.length > 80 || !NAME_PATTERN.test(nama)) {
      nextErrors.nama = 'Masukkan nama 2–80 karakter, tanpa angka.';
    }
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
      nextErrors.email = 'Masukkan alamat email yang valid.';
    }
    if (!VALID_ROLES.includes(form.role)) {
      nextErrors.role = 'Pilih peran pembeli atau penjual.';
    }
    if (form.password.length < 12 || form.password.length > 72 ||
      !/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
      nextErrors.password = 'Gunakan 12–72 karakter, dengan huruf besar, huruf kecil, dan angka.';
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Konfirmasi kata sandi harus sama.';
    }
    setErrors(nextErrors);
    setError('');
    setSuccess('');
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const result = await signUp({ nama, email, password: form.password, role: form.role });
      setForm((current) => ({ ...current, password: '', confirmPassword: '' }));
      setSuccess(result.session
        ? 'Akun berhasil dibuat. Anda sedang masuk.'
        : 'Akun berhasil dibuat. Periksa email untuk menyelesaikan konfirmasi sebelum masuk.');
    } catch (signupError) {
      setError(signupError.message || 'Pendaftaran gagal. Coba lagi.');
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
      <form className="panel login-card" onSubmit={submit} noValidate>
        <span className="eyebrow">GABUNG DENGAN KAMI</span>
        <h2 className="dh">Buat akun.</h2>
        <p className="mute">Daftar sebagai pembeli atau penjual. Admin tidak perlu membuat akun Anda.</p>
        <div className="login-fields">
          <div className="fg">
            <label htmlFor="register-name">Nama lengkap</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              value={form.nama}
              onChange={set('nama')}
              placeholder="Contoh: Budi Santoso"
              aria-invalid={Boolean(errors.nama)}
              aria-describedby={errors.nama ? 'register-name-error' : undefined}
            />
            {errors.nama && <span className="err" id="register-name-error">{errors.nama}</span>}
          </div>
          <div className="fg">
            <label htmlFor="register-email">Alamat email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={form.email}
              onChange={set('email')}
              placeholder="nama@email.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'register-email-error' : undefined}
            />
            {errors.email && <span className="err" id="register-email-error">{errors.email}</span>}
          </div>
          <div className="fg">
            <label htmlFor="register-role">Daftar sebagai</label>
            <select id="register-role" value={form.role} onChange={set('role')} aria-invalid={Boolean(errors.role)}>
              <option value="buyer">Pembeli</option>
              <option value="seller">Penjual</option>
            </select>
            {errors.role && <span className="err">{errors.role}</span>}
          </div>
          <PasswordField
            id="register-password"
            label="Kata sandi"
            autoComplete="new-password"
            placeholder="Minimal 12 karakter"
            minLength={12}
            maxLength={72}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
          />
          <PasswordField
            id="register-confirm-password"
            label="Ulangi kata sandi"
            autoComplete="new-password"
            placeholder="Ketik ulang kata sandi"
            minLength={12}
            maxLength={72}
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
          />
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        {success && <p className="form-success" role="status">{success}</p>}
        <div className="acts">
          <button className="btn brown" type="submit" disabled={submitting} style={{ flex: 1 }}>
            {submitting ? 'Membuat akun…' : 'Daftar'}
          </button>
          <button className="btn line" type="button" onClick={onCancel}>Kembali</button>
        </div>
        <p className="login-help">Sudah punya akun? <button className="text-button" type="button" onClick={onLogin}>Masuk</button></p>
      </form>
    </main>
  );
}
