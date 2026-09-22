import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'BABA PUSTAK BHANDAR',
    template: '%s | BABA PUSTAK BHANDAR',
  },
  description:
    'Browse school, office, art, printing, and everyday stationery essentials with WhatsApp ordering.',
  openGraph: {
    title: 'BABA PUSTAK BHANDAR',
    description:
      'A clean local stationery shop storefront for products, categories, details, and WhatsApp orders.',
    images: ['/images/stationery-hero.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
