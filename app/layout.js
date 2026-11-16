import './globals.css';
import { Fraunces, Instrument_Sans } from 'next/font/google';

const display = Fraunces({ subsets: ['latin'], variable: '--f-display' });
const body = Instrument_Sans({ subsets: ['latin'], variable: '--f-body' });

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
