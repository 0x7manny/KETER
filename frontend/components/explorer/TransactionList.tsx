'use client';

import React, { useEffect, useState } from 'react';
import { GlowCard } from '../ui/GlowCard';
import { ProofBadge } from './ProofBadge';
import { getTransfers, TransferRecord } from '../../utils/credentials';

function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function truncateTxHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export function TransactionList() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  useEffect(() => {
    setTransfers(getTransfers());
  }, []);

  return (
    <GlowCard hover={false}>
      <h2 className="font-serif text-xl text-keter-text mb-4">
        Recent Transfers
      </h2>

      {transfers.length === 0 ? (
        <p className="text-keter-text-muted text-center py-8 text-sm">
          No transfers recorded yet
        </p>
      ) : (
        <div className="overflow-x-auto">
          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_1fr_auto_auto_auto] gap-x-4 items-center px-2 pb-2 border-b border-keter-border mb-1">
            <span className="text-keter-text-muted text-xs uppercase tracking-wide font-sans">
              From
            </span>
            <span />
            <span className="text-keter-text-muted text-xs uppercase tracking-wide font-sans">
              To
            </span>
            <span className="text-keter-text-muted text-xs uppercase tracking-wide font-sans">
              Amount
            </span>
            <span className="text-keter-text-muted text-xs uppercase tracking-wide font-sans">
              Time
            </span>
            <span className="text-keter-text-muted text-xs uppercase tracking-wide font-sans">
              Proof
            </span>
          </div>

          {/* Rows */}
          {transfers.map((tx, i) => (
            <div key={tx.txHash || i}>
              <div className="grid grid-cols-[1fr_auto_1fr_auto_auto_auto] gap-x-4 items-center px-2 py-3 border-b border-keter-border-light">
                {/* From */}
                <span className="font-mono text-sm text-keter-text truncate">
                  {truncateAddress(tx.from)}
                </span>

                {/* Arrow */}
                <span className="text-keter-text-muted text-sm select-none">
                  &rarr;
                </span>

                {/* To */}
                <span className="font-mono text-sm text-keter-text truncate">
                  {truncateAddress(tx.to)}
                </span>

                {/* Amount */}
                <span className="text-sm whitespace-nowrap">
                  <span className="font-medium text-keter-text">
                    {tx.amount}
                  </span>{' '}
                  <span className="text-keter-text-muted text-xs">KETER</span>
                </span>

                {/* Time */}
                <span className="text-xs text-keter-text-secondary whitespace-nowrap">
                  {formatRelativeTime(tx.timestamp)}
                </span>

                {/* Proof */}
                <ProofBadge verified={tx.zkVerified} />
              </div>

              {/* Tx hash */}
              {tx.txHash && (
                <div className="px-2 pt-1 pb-2">
                  <span className="text-xs text-keter-text-muted font-mono">
                    tx: {truncateTxHash(tx.txHash)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </GlowCard>
  );
}

export default TransactionList;
