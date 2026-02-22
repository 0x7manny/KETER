'use client';

import React, { useState, useEffect } from 'react';
import { WalletState } from '../../hooks/useWallet';
import { useMerkleTree } from '../../hooks/useMerkleTree';
import { useBalance } from '../../hooks/useBalance';
import GlowCard from '../ui/GlowCard';
import MintForm from './MintForm';
import KYCRequests from './KYCRequests';
import InvestorList from './InvestorList';
import { getRootHistory, RootHistoryEntry } from './ApproveInvestor';

interface BankDashboardProps {
  wallet: WalletState;
}

export function BankDashboard({ wallet }: BankDashboardProps) {
  const { leafCount, getRoot, loading: treeLoading } = useMerkleTree();
  const { balance } = useBalance(wallet.provider, wallet.address);
  const [rootHistory, setRootHistory] = useState<RootHistoryEntry[]>([]);

  useEffect(() => {
    setRootHistory(getRootHistory());
  }, [leafCount]); // Refresh when tree changes

  const root = getRoot();
  const rootHex = root ? '0x' + root.toString(16).padStart(64, '0') : null;

  // Raw integer balance (no decimals — circuit uses u64 amounts)
  const formattedBalance = balance
    ? Number(balance).toLocaleString()
    : '\u2014';

  return (
    <div>
      <h1 className="font-serif text-3xl text-keter-text mb-2">Bank Dashboard</h1>
      <p className="text-keter-text-secondary text-sm mb-8">
        Manage compliance and token distribution
      </p>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <GlowCard hover={false} padding="md">
          <p className="text-keter-text-secondary text-xs uppercase tracking-wide mb-1">
            Total Supply
          </p>
          <p className="font-serif text-2xl text-keter-text">{formattedBalance}</p>
          <p className="text-keter-text-muted text-xs mt-0.5">KETER</p>
        </GlowCard>

        <GlowCard hover={false} padding="md">
          <p className="text-keter-text-secondary text-xs uppercase tracking-wide mb-1">
            Approved Investors
          </p>
          <p className="font-serif text-2xl text-keter-text">
            {treeLoading ? '\u2014' : leafCount}
            <span className="text-keter-text-muted text-sm font-sans">/16</span>
          </p>
        </GlowCard>

        <GlowCard hover={false} padding="md">
          <p className="text-keter-text-secondary text-xs uppercase tracking-wide mb-1">
            Current Merkle Root
          </p>
          {rootHex ? (
            <p className="font-mono text-xs text-keter-text mt-1 truncate" title={rootHex}>
              {rootHex.slice(0, 10)}...{rootHex.slice(-8)}
            </p>
          ) : (
            <p className="text-keter-text-muted text-sm mt-1">Not published</p>
          )}
        </GlowCard>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MintForm wallet={wallet} />
          <KYCRequests wallet={wallet} />

          {/* Root Publication History */}
          {rootHistory.length > 0 && (
            <GlowCard>
              <h2 className="font-serif text-xl mb-4 text-keter-text">Root Publication History</h2>
              <div className="space-y-2">
                {rootHistory.slice(0, 10).map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-keter-border-light bg-keter-bg text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-keter-text truncate" title={entry.root}>
                        {entry.root.slice(0, 14)}...{entry.root.slice(-8)}
                      </p>
                      <p className="text-keter-text-muted mt-0.5">
                        Approved: {entry.investorName}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-keter-text-secondary">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.txHash && (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${entry.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-keter-accent hover:underline"
                        >
                          View tx
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          )}
        </div>
        <div className="lg:col-span-1">
          <InvestorList />
        </div>
      </div>
    </div>
  );
}

export default BankDashboard;
