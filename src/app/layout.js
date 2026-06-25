import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import 'remixicon/fonts/remixicon.css';

const fontInter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

const fontPlayfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-playfair',
});

export const metadata = {
  title: "Tirta Asri Residence — Portal Warga",
  description: "Portal layanan mandiri warga Tirta Asri Residence. Kelola iuran, pengajuan surat, dan informasi RT.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fontInter.variable} ${fontPlayfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}