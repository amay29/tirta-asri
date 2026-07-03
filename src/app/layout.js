import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import 'remixicon/fonts/remixicon.css';
import Script from 'next/script';

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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tirta Asri',
  },
};

export const viewport = {
  themeColor: '#0f2d26',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${fontInter.variable} ${fontPlayfair.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body>
        {children}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {})
          }
        `}</Script>
      </body>
    </html>
  );
}