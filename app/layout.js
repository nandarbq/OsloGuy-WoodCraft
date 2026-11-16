import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';

const display = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['700', '800'], variable: '--f-display' });
const body = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--f-body' });

export const metadata = {
  title: 'OsloGuy – Mebel & Kerajinan Kayu',
  description: 'Katalog dan dashboard produk UMKM kerajinan kayu dan mebel.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
