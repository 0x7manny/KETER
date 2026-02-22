'use client';

import React, { useEffect, useState } from 'react';
import GlowCard from '../ui/GlowCard';
import {
  getTransfers,
  getKYCRequests,
  TransferRecord,
  KYCRequest,
  COUNTRIES,
  INVESTOR_TYPES,
} from '../../utils/credentials';

function formatTime(timestamp: number): string {
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

interface EnrichedTransfer extends TransferRecord {
  fromName?: string;
  fromCountry?: string;
  fromInvestorType?: string;
  toName?: string;
  toCountry?: string;
  toInvestorType?: string;
}

export function AdminExplorer() {
  const [transfers, setTransfers] = useState<EnrichedTransfer[]>([]);

  useEffect(() => {
    const rawTransfers = getTransfers();
    const kycRequests = getKYCRequests();

    // Build lookup: address → KYC data
    const kycMap = new Map<string, KYCRequest>();
    kycRequests.forEach((r) => {
      kycMap.set(r.address.toLowerCase(), r);
    });

    // Enrich transfers with investor data
    const enriched: EnrichedTransfer[] = rawTransfers.map((tx) => {
      const fromKyc = kycMap.get(tx.from.toLowerCase());
      const toKyc = kycMap.get(tx.to.toLowerCase());

      return {
        ...tx,
        fromName: fromKyc ? `${fromKyc.name} ${fromKyc.surname}` : undefined,
        fromCountry: fromKyc ? COUNTRIES[fromKyc.country] : undefined,
        fromInvestorType: fromKyc ? INVESTOR_TYPES[fromKyc.investorType] : undefined,
        toName: toKyc ? `${toKyc.name} ${toKyc.surname}` : undefined,
        toCountry: toKyc ? COUNTRIES[toKyc.country] : undefined,
        toInvestorType: toKyc ? INVESTOR_TYPES[toKyc.investorType] : undefined,
      };
    });

    setTransfers(enriched);
  }, []);

  const totalTransfers = transfers.length;
  const zkVerified = transfers.filter((t) => t.zkVerified).length;

  return (
    <GlowCard>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-xl text-keter-text">
            Compliance Explorer
          </h2>
          <p className="text-xs text-keter-text-secondary mt-0.5">
            Full transaction view with resolved investor identities
          </p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-xs text-keter-text-muted uppercase tracking-wide">Transfers</p>
            <p className="font-serif text-lg text-keter-text">{totalTransfers}</p>
          </div>
          <div>
            <p className="text-xs text-keter-text-muted uppercase tracking-wide">ZK Verified</p>
            <p className="font-serif text-lg text-keter-accent">{zkVerified}</p>
          </div>
        </div>
      </div>

      {transfers.length === 0 ? (
        <p className="text-keter-text-muted text-center py-8 text-sm">
          No transfers recorded yet
        </p>
      ) : (
        <div className="space-y-3">
          {transfers.map((tx, i) => (
            <div
              key={tx.txHash || i}
              className="p-4 rounded-lg border border-keter-border-light bg-keter-bg"
            >
              {/* Top row: From → To + Amount */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* From */}
                  <div className="min-w-0">
                    {tx.fromName ? (
                      <p className="text-sm font-medium text-keter-text truncate">
                        {tx.fromName}
                      </p>
                    ) : (
                      <p className="text-sm text-keter-text-muted italic">Unknown</p>
                    )}
                    <p className="font-mono text-xs text-keter-text-muted truncate">
                      {tx.from.slice(0, 8)}...{tx.from.slice(-6)}
                    </p>
                  </div>

                  <span className="text-keter-text-muted text-sm shrink-0 mx-2">&rarr;</span>

                  {/* To */}
                  <div className="min-w-0">
                    {tx.toName ? (
                      <p className="text-sm font-medium text-keter-text truncate">
                        {tx.toName}
                      </p>
                    ) : (
                      <p className="text-sm text-keter-text-muted italic">Unknown</p>
                    )}
                    <p className="font-mono text-xs text-keter-text-muted truncate">
                      {tx.to.slice(0, 8)}...{tx.to.slice(-6)}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-keter-text">
                    {tx.amount} <span className="text-xs text-keter-text-muted">KETER</span>
                  </p>
                  <p className="text-xs text-keter-text-secondary">
                    {formatTime(tx.timestamp)}
                  </p>
                </div>
              </div>

              {/* Detail row: Compliance tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Proof badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                    tx.zkVerified
                      ? 'bg-emerald-50 text-keter-accent border border-emerald-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      tx.zkVerified ? 'bg-keter-accent' : 'bg-red-500'
                    }`}
                  />
                  {tx.zkVerified ? 'ZK Verified' : 'Unverified'}
                </span>

                {/* From country/type */}
                {tx.fromCountry && (
                  <span className="px-2 py-0.5 bg-white rounded border border-keter-border-light text-keter-text-secondary">
                    From: {tx.fromCountry}
                  </span>
                )}
                {tx.fromInvestorType && (
                  <span className="px-2 py-0.5 bg-white rounded border border-keter-border-light text-keter-text-secondary">
                    {tx.fromInvestorType}
                  </span>
                )}

                {/* To country/type */}
                {tx.toCountry && (
                  <span className="px-2 py-0.5 bg-white rounded border border-keter-border-light text-keter-text-secondary">
                    To: {tx.toCountry}
                  </span>
                )}

                {/* Tx hash link */}
                {tx.txHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-keter-accent hover:underline font-mono"
                  >
                    {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-6)}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </GlowCard>
  );
}

export default AdminExplorer;
