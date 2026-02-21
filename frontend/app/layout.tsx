import type { Metadata } from 'next';
import { Providers } from '@/lib/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'KETER — Privacy-Preserving Compliance',
  description: 'Tokenize financial assets with zero-knowledge compliance. Built at Hackin\'dau 2026.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-keter-bg text-keter-text font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
