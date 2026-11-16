'use client';
import { useMemo, useState } from 'react';
import Art from './Art';
import { rp } from '../lib/store';

const WOODS = ['Jati', 'Mahoni', 'Pinus', 'Sungkai', 'Trembesi', 'Handmade', 'Natural finish'];
const SORTS = {
  feat: (a, b) => b.unggulan - a.unggulan || a.nama.localeCompare(b.nama),
  nama: (a, b) => a.nama.localeCompare(b.nama),
  lo: (a, b) => a.harga - b.harga,
  hi: (a, b) => b.harga - a.harga,
  stok: (a, b) => b.stok - a.stok,
};

export default function Catalog({ items, wa }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Semua');
  const [sort, setSort] = useState('feat');
  const [ft, setFt] = useState(false);

  const cats = useMemo(() => [...new Set(items.map((p) => p.kategori))].sort(), [items]);
  const active = cats.includes(cat) ? cat : 'Semua';
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items
      .filter((p) => `${p.nama} ${p.deskripsi}`.toLowerCase().includes(s) &&
        (active === 'Semua' || p.kategori === active) && (!ft || p.unggulan))
      .sort(SORTS[sort]);
  }, [items, q, active, sort, ft]);

  const hero = { nama: 'Kursi', kategori: 'Kursi' };

  return (
    <>
      <section className="hero">
        <div className="wrap hero-in">
          <div>
            <p className="eyebrow">Bengkel kayu UMKM · dikerjakan dengan tangan</p>
            <h1>Kayu yang <em>bercerita.</em></h1>
            <p className="lead">Meja, kursi, rak, dan pernak-pernik kayu dengan garis bersih ala Nordik. Pilih, lalu pesan langsung lewat WhatsApp.</p>
            <a className="btn amber" href="#koleksi">Lihat koleksi ↓</a>
            <dl className="hstats">
              <div><dt>Produk</dt><dd>{items.length}</dd></div>
              <div><dt>Kategori</dt><dd>{cats.length}</dd></div>
              <div><dt>Unggulan</dt><dd>{items.filter((p) => p.unggulan).length}</dd></div>
            </dl>
          </div>
          <div className="hero-art" aria-hidden="true"><Art p={hero} sw={3.5} /><span className="ticks" /></div>
        </div>
        <div className="marq" aria-hidden="true">
          <div>{[...WOODS, ...WOODS].map((w, i) => <span key={i}>{w}</span>)}</div>
        </div>
      </section>

      <main className="wrap" id="koleksi">
        <div className="tools">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau deskripsi…" aria-label="Cari produk" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Urutkan">
            <option value="feat">Unggulan dahulu</option><option value="nama">Nama A–Z</option>
            <option value="lo">Harga termurah</option><option value="hi">Harga termahal</option><option value="stok">Stok terbanyak</option>
          </select>
          <label className="chk"><input type="checkbox" checked={ft} onChange={(e) => setFt(e.target.checked)} /> Unggulan saja</label>
        </div>
        <div className="chips" role="group" aria-label="Filter kategori">
          {['Semua', ...cats].map((k) => (
            <button key={k} className="chip" aria-pressed={k === active} onClick={() => setCat(k)}>
              {k}<sup>{k === 'Semua' ? items.length : items.filter((p) => p.kategori === k).length}</sup>
            </button>
          ))}
        </div>

        <div className="grid">
          {list.length === 0 && <div className="empty">Belum ada yang cocok. Coba kata kunci atau kategori lain.</div>}
          {list.map((p) => {
            const out = p.stok <= 0, low = !out && p.stok <= 3;
            const msg = encodeURIComponent(`Halo OsloGuy, saya tertarik memesan *${p.nama}* (${rp(p.harga)}). Apakah stok masih tersedia?`);
            return (
              <article className="card" key={p.id}>
                <div className="art">
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.nama} /> : <Art p={p} />}
                  <span className="idx">{String(items.indexOf(p) + 1).padStart(2, '0')}</span>
                  {p.unggulan && <span className="badge">★ Unggulan</span>}
                  <span className="ticks" />
                </div>
                <div className="cb">
                  <span className="cat">{p.kategori}</span>
                  <h3>{p.nama}</h3>
                  <p>{p.deskripsi || '-'}</p>
                  <div className="leader"><span>Harga</span><i /><b>{rp(p.harga)}</b></div>
                  <div className="leader"><span>Stok</span><i /><b className={out ? 'bad' : low ? 'warn' : ''}>{out ? 'Habis' : low ? `Sisa ${p.stok}` : `${p.stok} unit`}</b></div>
                  {out
                    ? <span className="btn wa off">Stok kosong</span>
                    : <a className="btn wa" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${wa}?text=${msg}`}>Pesan via WhatsApp</a>}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}
