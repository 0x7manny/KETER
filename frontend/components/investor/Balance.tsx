'use client';

import React from 'react';
import GlowCard from '../ui/GlowCard';
import { WalletState } from '../../hooks/useWallet';
import { useBalance } from '../../hooks/useBalance';

interface BalanceProps {
  wallet: WalletState;
}

export function Balance({ wallet }: BalanceProps) {
  const { balance, loading, refresh } = useBalance(wallet.provider, wallet.address);

  // Raw integer balance (no decimals — circuit uses u64 amounts)
  const formatBalance = (bal: bigint): string => {
    return Number(bal).toLocaleString('en-US');
  };

  return (
    <GlowCard>
      <p className="text-keter-text-muted text-xs uppercase tracking-wide mb-1">
        Your Balance
      </p>
      <div className="flex items-baseline">
        <span
          className={`font-serif text-4xl text-keter-text ${
            loading ? 'animate-pulse' : ''
          }`}
        >
          {formatBalance(balance)}
        </span>
        <span className="text-keter-text-muted text-lg ml-2">KETER</span>
      </div>
      <button
        onClick={refresh}
        disabled={loading}
        className="mt-3 text-keter-accent text-xs font-sans font-medium hover:underline disabled:opacity-50"
      >
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
    </GlowCard>
  );
}

export default Balance;
