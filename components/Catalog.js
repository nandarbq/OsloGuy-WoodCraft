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

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);
  return product.imageUrl && !failed
    ? <img src={product.imageUrl} alt={product.nama} loading="lazy" onError={() => setFailed(true)} />
    : <Art p={product} />;
}

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

  return (
    <>
      <section className="hero">
        <div className="wrap hero-in">
          <div className="hero-copy">
            <span className="eyebrow">KERAJINAN KAYU · BUATAN LOKAL</span>
            <h1>Ruang yang<br /><b>terasa lebih rumah.</b></h1>
            <p className="lead">Temukan mebel kayu pilihan yang dirancang untuk menemani hari-hari, dibuat dengan perhatian pada detail dan material alami.</p>
            <div className="hero-actions">
              <a className="btn brown" href="#koleksi">Jelajahi koleksi <span aria-hidden="true">↗</span></a>
              <span className="hero-note">Dibuat dengan tangan, dipakai bertahun-tahun.</span>
            </div>
            <dl className="hstats">
              <div><dt>Koleksi</dt><dd>{items.length}<small>+</small></dd></div>
              <div><dt>Kategori</dt><dd>{cats.length}</dd></div>
              <div><dt>Produk pilihan</dt><dd>{items.filter((p) => p.unggulan).length}</dd></div>
            </dl>
          </div>
          <div className="hero-art">
            <img src="/products/workshop-tools.webp" alt="Peralatan pertukangan di atas meja kerja kayu" />
            <div className="hero-photo-caption"><span className="caption-mark">OG</span><span>Setiap detail<br /><b>punya cerita.</b></span></div>
            <span className="hero-index">EST. 2024&nbsp; / &nbsp;JAWA, INDONESIA</span>
          </div>
        </div>
        <div className="marq" aria-hidden="true">
          <div>{[...WOODS, ...WOODS].map((w, i) => <span key={i}>{w}</span>)}</div>
        </div>
      </section>

      <main className="wrap catalog-main" id="koleksi">
        <div className="collection-heading">
          <div><span className="eyebrow">DIBUAT UNTUK HIDUP SEHARI-HARI</span><h2>Temukan favoritmu.</h2></div>
          <p>Potongan sederhana, material jujur, dan karakter kayu yang berbeda di setiap karya.</p>
        </div>
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
          {list.length === 0 && (
            <div className="empty">
              {items.length === 0 ? 'Koleksi sedang disiapkan. Silakan kembali lagi nanti.' : 'Belum ada yang cocok. Coba kata kunci atau kategori lain.'}
            </div>
          )}
          {list.map((p) => {
            const out = p.stok <= 0, low = !out && p.stok <= 3;
            const msg = encodeURIComponent(`Halo OsloGuy, saya tertarik memesan *${p.nama}* (${rp(p.harga)}). Apakah stok masih tersedia?`);
            return (
              <article className="card" key={p.id}>
                <div className="art">
                  <ProductImage product={p} />
                  {p.unggulan && <span className="badge">Pilihan</span>}
                </div>
                <div className="cb">
                  <div className="product-title"><span className="cat">{p.kategori}</span><span className="product-stock">{out ? 'Habis' : low ? `Sisa ${p.stok}` : 'Siap dipesan'}</span></div>
                  <h3>{p.nama}</h3>
                  <p>{p.deskripsi || '-'}</p>
                  <div className="product-purchase"><b>{rp(p.harga)}</b><span>Harga satuan</span></div>
                  {out
                    ? <span className="btn wa off">Stok kosong</span>
                    : <a className="btn wa" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${wa}?text=${msg}`}>Tanya via WhatsApp <span aria-hidden="true">↗</span></a>}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </>
  );
}
