'use client';
import { useCallback, useEffect, useState } from 'react';
import { SEED, rp } from '../lib/store';

const EMPTY = { id: '', nama: '', kategori: '', harga: '', stok: '', deskripsi: '', imageUrl: '', unggulan: false };
const NEW_USER = { email: '', password: '', role: 'buyer' };
const ROLES = ['admin', 'seller', 'buyer'];

export default function Dashboard({
  items, commit, wa, setWa, isSupabase, role, user, adminUsersRequest,
}) {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState({});
  const [armed, setArmed] = useState('');
  const [waIn, setWaIn] = useState(wa);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('products');
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState(NEW_USER);
  const [usersLoading, setUsersLoading] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [usersError, setUsersError] = useState('');

  const isAdmin = !isSupabase || role === 'admin';
  const visibleItems = role === 'seller'
    ? items.filter((product) => product.sellerId === user?.id)
    : items;
  const cats = [...new Set(visibleItems.map((product) => product.kategori))].sort();
  const total = visibleItems.reduce((sum, product) => sum + product.stok, 0);
  const max = Math.max(1, ...visibleItems.map((product) => product.stok));
  const set = (key) => (event) => setF({ ...f, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });
  const say = (message) => { setMsg(message); setTimeout(() => setMsg(''), 2600); };
  const ask = (id, action) => {
    if (armed === id) {
      setArmed('');
      action();
    } else {
      setArmed(id);
      setTimeout(() => setArmed((current) => (current === id ? '' : current)), 3000);
    }
  };

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const result = await adminUsersRequest('GET');
      setUsers(result.users);
    } catch (loadError) {
      setUsersError(loadError.message || 'Gagal memuat akun.');
    } finally {
      setUsersLoading(false);
    }
  }, [adminUsersRequest]);

  useEffect(() => {
    if (isSupabase && role === 'admin') loadUsers();
  }, [isSupabase, role, loadUsers]);

  async function submitProduct(event) {
    event.preventDefault();
    const nama = f.nama.trim(), kategori = f.kategori.trim(), imageUrl = f.imageUrl.trim();
    const harga = Number(f.harga), stok = Number(f.stok), errors = {};
    if (nama.length < 3) errors.nama = 'Nama minimal 3 karakter.';
    if (!kategori) errors.kategori = 'Kategori wajib diisi.';
    if (f.harga === '' || !Number.isFinite(harga) || harga < 0) errors.harga = 'Harga harus angka 0 atau lebih.';
    if (f.stok === '' || !Number.isInteger(stok) || stok < 0) errors.stok = 'Stok harus bilangan bulat 0 atau lebih.';
    if (imageUrl && !/^(https?:\/\/|\.{0,2}\/|data:image\/)/i.test(imageUrl)) errors.imageUrl = 'Gunakan URL http(s) atau path lokal.';
    setErr(errors);
    if (Object.keys(errors).length) return;

    const details = { nama, kategori, harga, stok, deskripsi: f.deskripsi.trim(), imageUrl, unggulan: f.unggulan };
    const next = f.id
      ? items.map((product) => (product.id === f.id ? { ...product, ...details } : product))
      : [{
        id: crypto.randomUUID(),
        ...details,
        sellerId: role === 'seller' ? user.id : null,
      }, ...items];
    try {
      await commit(next);
      say(f.id ? 'Produk diperbarui' : 'Produk ditambahkan');
      setF(EMPTY);
    } catch (saveError) {
      say(`Gagal menyimpan: ${saveError.message || 'terjadi kesalahan.'}`);
    }
  }

  async function saveWa(event) {
    event.preventDefault();
    const number = waIn.replace(/\D/g, '');
    if (number.length < 8 || number.length > 15) return say('Nomor harus 8–15 digit.');
    try {
      await setWa(number);
      say('Nomor WhatsApp disimpan');
    } catch (saveError) {
      say(`Gagal menyimpan: ${saveError.message || 'terjadi kesalahan.'}`);
    }
  }

  async function resetProducts() {
    try {
      await commit(SEED);
      say('Data contoh dipulihkan');
    } catch (saveError) {
      say(`Gagal reset: ${saveError.message || 'terjadi kesalahan.'}`);
    }
  }

  async function deleteProduct(id) {
    try {
      await commit(items.filter((product) => product.id !== id));
      say('Produk dihapus');
    } catch (deleteError) {
      say(`Gagal menghapus: ${deleteError.message || 'terjadi kesalahan.'}`);
    }
  }

  async function createUser(event) {
    event.preventDefault();
    setUsersError('');
    if (newUser.password.length < 8) {
      setUsersError('Password minimal 8 karakter.');
      return;
    }
    setCreatingUser(true);
    try {
      await adminUsersRequest('POST', newUser);
      setNewUser(NEW_USER);
      say('Akun berhasil dibuat');
      await loadUsers();
    } catch (createError) {
      setUsersError(createError.message || 'Gagal membuat akun.');
    } finally {
      setCreatingUser(false);
    }
  }

  async function updateUserRole(id, newRole) {
    setUsersError('');
    try {
      await adminUsersRequest('PATCH', { id, role: newRole });
      say('Role akun diperbarui');
      await loadUsers();
    } catch (updateError) {
      setUsersError(updateError.message || 'Gagal mengubah role.');
    }
  }

  async function deleteUser(id) {
    setUsersError('');
    try {
      await adminUsersRequest('DELETE', { id });
      say('Akun dihapus');
      await loadUsers();
    } catch (deleteError) {
      setUsersError(deleteError.message || 'Gagal menghapus akun.');
    }
  }

  const field = (key, label, extra = {}) => (
    <div className="fg">
      <label htmlFor={key}>{label}</label>
      <input id={key} value={f[key]} onChange={set(key)} {...extra} />
      <span className="err">{err[key]}</span>
    </div>
  );

  return (
    <main className="wrap dash-page">
      <h2 className="dh">{isAdmin ? 'Dashboard' : 'Dashboard'} <em>{isAdmin ? 'admin' : 'seller'}</em></h2>
      <p className="mute">Login sebagai {user?.email || 'mode demo'}.</p>
      {isAdmin && (
        <div className="chips" role="tablist" aria-label="Menu dashboard">
          <button className="chip" role="tab" aria-selected={tab === 'products'} onClick={() => setTab('products')}>Produk</button>
          {isSupabase && <button className="chip" role="tab" aria-selected={tab === 'users'} onClick={() => setTab('users')}>Kelola akun</button>}
        </div>
      )}

      {tab === 'users' && isAdmin && isSupabase ? (
        <>
          <section className="panel">
            <h3>Buat akun</h3>
            <p className="mute">Akun yang dibuat admin langsung bisa login. Buyer menjadi role default bila dipilih.</p>
            <form className="row" onSubmit={createUser}>
              <div className="fg" style={{ flex: '1 1 200px' }}>
                <label htmlFor="new-user-email">Email</label>
                <input id="new-user-email" type="email" required value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} />
              </div>
              <div className="fg" style={{ flex: '1 1 160px' }}>
                <label htmlFor="new-user-password">Password (min. 8 karakter)</label>
                <input id="new-user-password" type="password" minLength={8} required value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} />
              </div>
              <div className="fg">
                <label htmlFor="new-user-role">Role</label>
                <select id="new-user-role" value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}>
                  {ROLES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <button className="btn ink" type="submit" disabled={creatingUser}>{creatingUser ? 'Membuat…' : 'Buat akun'}</button>
            </form>
            {usersError && <p className="err" role="alert">{usersError}</p>}
          </section>

          <section className="panel">
            <div className="row"><h3>Daftar akun</h3><button className="btn line sm" type="button" onClick={loadUsers}>Muat ulang</button></div>
            {usersLoading ? <p role="status">Memuat akun…</p> : (
              <div className="tw"><table>
                <thead><tr><th>Email</th><th>Role</th><th>Dibuat</th><th /></tr></thead>
                <tbody>{users.map((account) => (
                  <tr key={account.id}>
                    <td>{account.email}{account.id === user?.id ? ' (akun Anda)' : ''}</td>
                    <td>
                      <select aria-label={`Role ${account.email}`} value={account.role} disabled={account.id === user?.id} onChange={(event) => updateUserRole(account.id, event.target.value)}>
                        {ROLES.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </td>
                    <td>{new Date(account.created_at).toLocaleDateString('id-ID')}</td>
                    <td>
                      <button className="btn line sm bad" type="button" onClick={() => ask(account.id, () => deleteUser(account.id))}>
                        {armed === account.id ? 'Yakin hapus?' : 'Hapus'}
                      </button>
                    </td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </section>
        </>
      ) : (
        <>
          <div className="stats">
            <div><b>{visibleItems.length}</b><span>Jenis produk</span></div>
            <div><b>{total}</b><span>Total unit stok</span></div>
            <div><b>{cats.length}</b><span>Kategori aktif</span></div>
          </div>

          {isAdmin && (
            <form className="panel wa-row" onSubmit={saveWa}>
              <div className="fg"><label htmlFor="wa">Nomor WhatsApp toko (format 62…)</label><input id="wa" value={waIn} onChange={(event) => setWaIn(event.target.value)} inputMode="numeric" /></div>
              <button className="btn ink" type="submit">Simpan nomor</button>
            </form>
          )}

          <div className="dash">
            <form className="panel" onSubmit={submitProduct} noValidate>
              <h3>{f.id ? 'Ubah produk' : 'Tambah produk'}</h3>
              {field('nama', 'Nama *', { maxLength: 80 })}
              {field('kategori', 'Kategori *', { list: 'cl', maxLength: 40 })}
              <datalist id="cl">{cats.map((category) => <option key={category} value={category} />)}</datalist>
              {field('harga', 'Harga (Rp) *', { inputMode: 'numeric', placeholder: '750000' })}
              {field('stok', 'Stok *', { inputMode: 'numeric', placeholder: '5' })}
              <div className="fg"><label htmlFor="deskripsi">Deskripsi</label><textarea id="deskripsi" rows={2} maxLength={300} value={f.deskripsi} onChange={set('deskripsi')} /></div>
              {field('imageUrl', 'URL gambar (opsional)', { placeholder: 'Kosongkan untuk ilustrasi bawaan' })}
              <label className="chk"><input type="checkbox" checked={f.unggulan} onChange={set('unggulan')} /> Produk unggulan</label>
              <div className="acts">
                <button className="btn ink" type="submit" style={{ flex: 1 }}>{f.id ? 'Simpan perubahan' : 'Tambah produk'}</button>
                {f.id && <button className="btn line" type="button" onClick={() => { setF(EMPTY); setErr({}); }}>Batal</button>}
              </div>
            </form>

            <div className="panel">
              <div className="row"><h3>Inventaris</h3>
                {!isSupabase && <button className="btn line sm" type="button" onClick={() => ask('reset', resetProducts)}>{armed === 'reset' ? 'Yakin reset?' : 'Reset data contoh'}</button>}
              </div>
              {visibleItems.length === 0 ? <p className="mute">Belum ada produk yang dikelola akun ini.</p> : (
                <div className="tw"><table>
                  <thead><tr><th>Produk</th><th>Harga</th><th>Stok</th><th /></tr></thead>
                  <tbody>{visibleItems.map((product) => (
                    <tr key={product.id}>
                      <td><strong>{product.nama}</strong>{product.unggulan && ' ★'}<br /><small>{product.kategori}</small></td>
                      <td>{rp(product.harga)}</td>
                      <td><div className="bar"><i style={{ width: `${(product.stok / max) * 100}%` }} className={product.stok === 0 ? 'z' : product.stok <= 3 ? 'l' : ''} /></div>{product.stok}</td>
                      <td className="a">
                        <button className="btn line sm" type="button" onClick={() => { setF({ ...product, harga: String(product.harga), stok: String(product.stok) }); setErr({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Ubah</button>
                        <button className="btn line sm bad" type="button" onClick={() => ask(product.id, () => deleteProduct(product.id))}>{armed === product.id ? 'Yakin?' : 'Hapus'}</button>
                      </td>
                    </tr>
                  ))}</tbody>
                </table></div>
              )}
            </div>
          </div>
        </>
      )}
      <div className={`toast ${msg ? 'on' : ''}`} role="status">{msg}</div>
    </main>
  );
}
