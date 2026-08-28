import type { Metadata } from 'next';
import './globals.css';
import './premium.css';
import './ui-fixes.css';
import './mobile-layout-fix.css';

export const metadata: Metadata = {
  title: 'WAVLIB',
  description: 'WAVLIB sample library',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
