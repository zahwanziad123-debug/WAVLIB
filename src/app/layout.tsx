import type { Metadata } from 'next';
import './globals.css';
import './premium.css';
import './ui-fixes.css';
import './mobile-layout-fix.css';
import './pack-link-fix.css';
import './tap-highlight-fix.css';
import CopyProtection from './copy-protection';
import PackCardNavigation from './pack-card-navigation';

export const metadata: Metadata = {
  title: 'WAVLIB',
  description: 'WAVLIB sample library',
  icons: {
    icon: '/WAVLIB/favicon.svg',
    shortcut: '/WAVLIB/favicon.svg',
    apple: '/WAVLIB/favicon.svg',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CopyProtection />
        <PackCardNavigation />
        {children}
      </body>
    </html>
  );
}
