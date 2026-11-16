/* Ilustrasi produk buatan sendiri (SVG) — tanpa aset berhak cipta. */
const IC = {
  meja: "<rect x='38' y='58' width='124' height='10' rx='3'/><path d='M56 68v50M144 68v50'/>",
  kursi: "<path d='M68 32v86M68 82h68M136 82v36M68 52h26'/>",
  rak: "<rect x='55' y='28' width='90' height='90'/><path d='M55 58h90M55 88h90'/>",
  nampan: "<ellipse cx='100' cy='78' rx='60' ry='20'/><path d='M40 78h-10M160 78h10'/>",
  kerja: "<rect x='30' y='55' width='140' height='10' rx='3'/><path d='M46 65v53M154 65v53'/><rect x='96' y='65' width='46' height='22'/>",
  stool: "<ellipse cx='100' cy='62' rx='46' ry='12'/><path d='M66 70l-12 48M134 70l12 48M100 74v44'/>",
  nakas: "<rect x='60' y='42' width='80' height='56' rx='3'/><path d='M60 70h80M92 56h16M92 84h16M70 98v20M130 98v20'/>",
  jam: "<circle cx='100' cy='70' r='46'/><path d='M100 70V42M100 70l20 12'/>",
};
const COL = { Meja: '#A9743F', Kursi: '#8B5E34', 'Rak & Lemari': '#B8895A', Dekorasi: '#C79A63' };

function iconKey(p) {
  const n = p.nama.toLowerCase();
  if (/nampan/.test(n)) return 'nampan';
  if (/jam/.test(n)) return 'jam';
  if (/stool|bangku/.test(n)) return 'stool';
  if (/nakas/.test(n)) return 'nakas';
  if (/kerja|sudut/.test(n)) return 'kerja';
  return { Meja: 'meja', Kursi: 'kursi', 'Rak & Lemari': 'rak', Dekorasi: 'jam' }[p.kategori] || 'rak';
}

export default function Art({ p, sw = 5 }) {
  const k = iconKey(p);
  const c = COL[p.kategori] || '#A9743F';
  const id = `g-${c.slice(1)}`;
  return (
    <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" role="img" aria-label={p.nama}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c} />
          <stop offset="1" stopColor="#1b1209" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill={`url(#${id})`} />
      <path d="M0 22q100 14 200 0M0 48q100-14 200 0M0 98q100 14 200 0M0 134q100-14 200 0" stroke="#fff" strokeOpacity=".12" strokeWidth="2" fill="none" />
      {k !== 'jam' && k !== 'nampan' && (
        <path d="M20 122h160" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
      )}
      <g stroke="#FFF7EA" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none"
         dangerouslySetInnerHTML={{ __html: IC[k] }} />
    </svg>
  );
}
