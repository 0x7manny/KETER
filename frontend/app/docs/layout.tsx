'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const docPages = [
  { href: '/docs/architecture', label: 'Architecture' },
  { href: '/docs/circuit', label: 'ZK Circuit' },
  { href: '/docs/contracts', label: 'Smart Contracts' },
  { href: '/docs/frontend', label: 'Frontend' },
  { href: '/docs/flow', label: 'Protocol Flow' },
  { href: '/docs/erc1400', label: 'ERC-1400' },
  { href: '/docs/alephium', label: 'Alephium' },
  { href: '/docs/roadmap', label: 'Roadmap' },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-keter-bg">
      {/* Sticky top nav */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-keter-border-light">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-keter-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-serif text-xs font-bold">K</span>
              </div>
              <span className="font-serif text-lg text-keter-text">Keter</span>
            </Link>
            <span className="text-keter-border">/</span>
            <span className="text-sm text-keter-text-secondary font-medium">Documentation</span>
          </div>
          <Link
            href="/dashboard"
            className="bg-keter-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-keter-accent-hover transition-colors"
          >
            Launch App
          </Link>
        </div>

        {/* Horizontal page tabs (mobile + desktop) */}
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
          <div className="flex gap-1 pb-2">
            {docPages.map((page) => {
              const isActive = pathname === page.href;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-keter-accent text-white'
                      : 'text-keter-text-secondary hover:bg-keter-secondary hover:text-keter-text'
                  }`}
                >
                  {page.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-keter-border-light">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-xs text-keter-text-muted">
            <span className="font-serif">Keter</span> · Hackin&apos;dau 2026
          </p>
          <p className="text-xs text-keter-text-muted">Paris-Dauphine</p>
        </div>
      </footer>
    </div>
  );
}
