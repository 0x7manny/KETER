'use client';

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { GlowCard } from '../ui/GlowCard';
import { TransactionList } from './TransactionList';
import { getTransfers, TransferRecord } from '../../utils/credentials';
import { CONTRACTS } from '../../utils/contracts';
import ZKTokenABI from '../../abis/ZKToken.json';

export function Explorer() {
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [totalSupply, setTotalSupply] = useState<string | null>(null);

  useEffect(() => {
    setTransfers(getTransfers());
  }, []);

  useEffect(() => {
    const fetchSupply = async () => {
      try {
        const rpc = process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
        const provider = new ethers.JsonRpcProvider(rpc);
        const token = new ethers.Contract(CONTRACTS.ZK_TOKEN, ZKTokenABI, provider);
        const supply: bigint = await token.totalSupply();
        const formatted = ethers.formatUnits(supply, 18);
        setTotalSupply(Number(formatted).toLocaleString());
      } catch {
        setTotalSupply('\u2014');
      }
    };
    fetchSupply();
  }, []);

  const totalTransfers = transfers.length;
  const zkVerified = transfers.filter((t) => t.zkVerified).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* ── Hero ── */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-keter-text mb-2">
          Public Ledger
        </h1>
        <p className="text-keter-text-secondary text-sm leading-relaxed max-w-2xl">
          This is an intentionally limited view. You can verify that transfers
          happened and that every sender passed compliance — but you cannot see
          who they are. That&apos;s the whole point.
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
              Why is this view so limited?
            </h2>
            <p className="text-keter-text-secondary text-sm mt-1 leading-relaxed">
              By design. Every transfer carries a zero-knowledge proof that the
              sender passed KYC — but the proof itself reveals nothing about
              their identity, country, investor type, or compliance details.
              Only the issuing bank holds that information. The public ledger
              guarantees compliance without exposing private data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-3 border-t border-keter-border-light">
          <div>
            <h3 className="text-xs uppercase tracking-wide text-keter-text-muted font-sans mb-2">
              Public data (on-chain)
            </h3>
            <ul className="space-y-1">
              {['Wallet addresses', 'Transfer amounts', 'ZK proof validity', 'Transaction hashes'].map((item) => (
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
              Hidden by ZK proofs
            </h3>
            <ul className="space-y-1">
              {[
                'Real identities (name, age)',
                'Country & jurisdiction',
                'Investor type & limits',
                'Merkle tree position',
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <GlowCard padding="sm" hover={false}>
          <p className="text-keter-text-muted text-xs uppercase tracking-wide font-sans mb-1">
            Total Supply
          </p>
          <p className="text-2xl font-serif text-keter-text">
            {totalSupply ?? '\u2014'}
          </p>
          <p className="text-keter-text-muted text-xs mt-0.5">KETER</p>
        </GlowCard>
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

      {/* ── Footer note ── */}
      <p className="text-center text-xs text-keter-text-muted mt-6 mb-2">
        Banks and issuers have access to a detailed compliance view with full investor data.
      </p>
    </div>
  );
}

export default Explorer;
