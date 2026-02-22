'use client';

import Link from 'next/link';

interface WalletProps {
  address: string | null;
  role: string | null;
  connect: () => void;
  disconnect: () => void;
}

interface HeaderProps {
  wallet: WalletProps;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Header({ wallet }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-keter-border-light">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex flex-col">
          <span className="font-serif text-2xl font-normal text-keter-text tracking-tight">
            KETER
          </span>
          <span className="text-xs text-keter-text-muted uppercase tracking-widest">
            Privacy-Preserving Compliance
          </span>
        </Link>

        {/* Nav + Wallet */}
        <div className="flex items-center gap-4">
          <Link href="/docs/architecture" className="text-sm text-keter-text-secondary hover:text-keter-text transition-colors">
            Docs
          </Link>
          {wallet.address ? (
            <>
              {/* Role badge */}
              {wallet.role && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    wallet.role === 'bank'
                      ? 'bg-emerald-50 text-keter-accent'
                      : 'bg-gray-100 text-keter-text-secondary'
                  }`}
                >
                  {wallet.role.charAt(0).toUpperCase() + wallet.role.slice(1)}
                </span>
              )}

              {/* Address */}
              <span className="font-mono text-sm text-keter-text-secondary">
                {truncateAddress(wallet.address)}
              </span>

              {/* Disconnect */}
              <button
                onClick={wallet.disconnect}
                className="text-sm text-keter-text-muted hover:text-keter-text"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={wallet.connect}
              className="bg-keter-text text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
