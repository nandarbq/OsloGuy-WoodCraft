'use client';
import { useState } from 'react';
import { SEED, rp } from '../lib/store';

const EMPTY = { id: '', nama: '', kategori: '', harga: '', stok: '', deskripsi: '', imageUrl: '', unggulan: false };

export default function Dashboard({ items, commit, wa, setWa }) {
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState({});
  const [armed, setArmed] = useState('');
  const [waIn, setWaIn] = useState(wa);
  const [msg, setMsg] = useState('');
  const cats = [...new Set(items.map((p) => p.kategori))].sort();
  const total = items.reduce((a, p) => a + p.stok, 0);
  const max = Math.max(1, ...items.map((p) => p.stok));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const say = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2200); };
  const ask = (id, fn) => { if (armed === id) { setArmed(''); fn(); } else { setArmed(id); setTimeout(() => setArmed((a) => (a === id ? '' : a)), 3000); } };

  function submit(e) {
    e.preventDefault();
    const nama = f.nama.trim(), kategori = f.kategori.trim(), img = f.imageUrl.trim();
    const harga = Number(f.harga), stok = Number(f.stok), er = {};
    if (nama.length < 3) er.nama = 'Nama minimal 3 karakter.';
    if (!kategori) er.kategori = 'Kategori wajib diisi.';
    if (f.harga === '' || !Number.isFinite(harga) || harga < 0) er.harga = 'Harga harus angka 0 atau lebih.';
    if (f.stok === '' || !Number.isInteger(stok) || stok < 0) er.stok = 'Stok harus bilangan bulat 0 atau lebih.';
    if (img && !/^(https?:\/\/|\.{0,2}\/|data:image\/)/i.test(img)) er.imageUrl = 'Gunakan URL http(s) atau path lokal.';
    setErr(er);
    if (Object.keys(er).length) return;
    const d = { nama, kategori, harga, stok, deskripsi: f.deskripsi.trim(), imageUrl: img, unggulan: f.unggulan };
    commit(f.id ? items.map((p) => (p.id === f.id ? { ...p, ...d } : p)) : [{ id: 'og-' + Date.now(), ...d }, ...items]);
    say(f.id ? 'Produk diperbarui' : 'Produk ditambahkan');
    setF(EMPTY);
  }

  function saveWa(e) {
    e.preventDefault();
    const n = waIn.replace(/\D/g, '');
    if (n.length < 8 || n.length > 15) return say('Nomor harus 8–15 digit.');
    setWa(n); say('Nomor WhatsApp disimpan');
  }

  const field = (k, label, extra = {}) => (
    <div className="fg"><label htmlFor={k}>{label}</label><input id={k} value={f[k]} onChange={set(k)} {...extra} /><span className="err">{err[k]}</span></div>
  );

  return (
    <main className="wrap dash-page">
      <h2 className="dh">Dashboard <em>bengkel</em></h2>
      <p className="mute">Mode demo: tanpa login, data hanya tersimpan di browser ini.</p>
      <div className="stats">
        <div><b>{items.length}</b><span>Jenis produk</span></div>
        <div><b>{total}</b><span>Total unit stok</span></div>
        <div><b>{cats.length}</b><span>Kategori aktif</span></div>
      </div>

      <form className="panel wa-row" onSubmit={saveWa}>
        <div className="fg"><label htmlFor="wa">Nomor WhatsApp toko (format 62…)</label><input id="wa" value={waIn} onChange={(e) => setWaIn(e.target.value)} inputMode="numeric" /></div>
        <button className="btn ink" type="submit">Simpan nomor</button>
      </form>

      <div className="dash">
        <form className="panel" onSubmit={submit} noValidate>
          <h3>{f.id ? 'Ubah produk' : 'Tambah produk'}</h3>
          {field('nama', 'Nama *', { maxLength: 80 })}
          {field('kategori', 'Kategori *', { list: 'cl', maxLength: 40 })}
          <datalist id="cl">{cats.map((c) => <option key={c} value={c} />)}</datalist>
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
            <button className="btn line sm" type="button" onClick={() => ask('reset', () => { commit(SEED); say('Data contoh dipulihkan'); })}>{armed === 'reset' ? 'Yakin reset?' : 'Reset data contoh'}</button>
          </div>
          <div className="tw"><table>
            <thead><tr><th>Produk</th><th>Harga</th><th>Stok</th><th /></tr></thead>
            <tbody>{items.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.nama}</strong>{p.unggulan && ' ★'}<br /><small>{p.kategori}</small></td>
                <td>{rp(p.harga)}</td>
                <td><div className="bar"><i style={{ width: `${(p.stok / max) * 100}%` }} className={p.stok === 0 ? 'z' : p.stok <= 3 ? 'l' : ''} /></div>{p.stok}</td>
                <td className="a">
                  <button className="btn line sm" onClick={() => { setF({ ...p, harga: String(p.harga), stok: String(p.stok) }); setErr({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Ubah</button>
                  <button className="btn line sm bad" onClick={() => ask(p.id, () => { commit(items.filter((x) => x.id !== p.id)); say('Produk dihapus'); })}>{armed === p.id ? 'Yakin?' : 'Hapus'}</button>
                </td>
              </tr>))}
            </tbody>
          </table></div>
        </div>
      </div>
      <div className={`toast ${msg ? 'on' : ''}`} role="status">{msg}</div>
    </main>
  );
}
