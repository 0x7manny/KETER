'use client';

import React, { useEffect, useState } from 'react';
import { GlowCard } from '../ui/GlowCard';
import { TransactionList } from './TransactionList';
import { getTransfers, TransferRecord } from '../../utils/credentials';

export function Explorer() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  useEffect(() => {
    setTransfers(getTransfers());
  }, []);

  const totalTransfers = transfers.length;
  const zkVerified = transfers.filter((t) => t.zkVerified).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* ── Hero ── */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-keter-text mb-2">
          Public Explorer
        </h1>
        <p className="text-keter-text-secondary text-sm">
          Verify transactions and proofs &mdash; no identity data exposed
        </p>
      </div>

      {/* ── Privacy Callout ── */}
      <GlowCard className="border-l-4 border-l-keter-accent mb-8" hover={false}>
        <div className="flex items-start gap-3 mb-4">
          <div className="mt-0.5">
            <svg
              className="h-5 w-5 text-keter-accent flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-serif text-lg text-keter-text">
              Zero-Knowledge Compliance Active
            </h2>
            <p className="text-keter-text-secondary text-sm mt-1 leading-relaxed">
              Every transfer on this ledger includes a cryptographic proof that
              the sender is compliant. But the proof reveals nothing about their
              identity, country, or KYC status. This is privacy-preserving
              compliance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-3 border-t border-keter-border-light">
          <div>
            <h3 className="text-xs uppercase tracking-wide text-keter-text-muted font-sans mb-2">
              What you CAN see
            </h3>
            <ul className="space-y-1">
              {['Transfers', 'Amounts', 'Proof validity'].map((item) => (
                <li
                  key={item}
                  className="text-sm text-keter-accent flex items-center gap-1.5"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-keter-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wide text-keter-text-muted font-sans mb-2">
              What you CANNOT see
            </h3>
            <ul className="space-y-1">
              {[
                'Investor identities',
                'KYC data',
                'Whitelist membership',
              ].map((item) => (
                <li
                  key={item}
                  className="text-sm text-keter-text-muted flex items-center gap-1.5"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-keter-text-muted" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlowCard>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlowCard padding="sm" hover={false}>
          <p className="text-keter-text-muted text-xs uppercase tracking-wide font-sans mb-1">
            Total Transfers
          </p>
          <p className="text-2xl font-serif text-keter-text">{totalTransfers}</p>
        </GlowCard>
        <GlowCard padding="sm" hover={false}>
          <p className="text-keter-text-muted text-xs uppercase tracking-wide font-sans mb-1">
            ZK Verified
          </p>
          <p className="text-2xl font-serif text-keter-accent">{zkVerified}</p>
        </GlowCard>
      </div>

      {/* ── Transaction List ── */}
      <TransactionList />
    </div>
  );
}

export default Explorer;
