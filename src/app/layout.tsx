import type { Metadata } from 'next';
import './globals.css';
import './premium.css';

export const metadata: Metadata = {
  title: 'WAVLIB',
  description: 'WAVLIB sample library',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
