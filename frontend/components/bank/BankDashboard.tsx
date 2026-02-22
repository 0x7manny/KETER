'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../../hooks/useWallet';
import { useMerkleTree } from '../../hooks/useMerkleTree';
import { useBalance } from '../../hooks/useBalance';
import GlowCard from '../ui/GlowCard';
import { CONTRACTS } from '../../utils/contracts';
import ZKTokenABI from '../../abis/ZKToken.json';
import MintForm from './MintForm';
import KYCRequests from './KYCRequests';
import InvestorList from './InvestorList';
import AdminExplorer from './AdminExplorer';
import { getRootHistory, RootHistoryEntry } from './ApproveInvestor';
import {
  getPendingBankRegistrations,
  updateBankRegistrationStatus,
  BankRegistration,
  COUNTRIES,
} from '../../utils/credentials';

interface BankDashboardProps {
  wallet: WalletState;
}

export function BankDashboard({ wallet }: BankDashboardProps) {
  const { leafCount, getRoot, loading: treeLoading } = useMerkleTree();
  const { balance } = useBalance(wallet.provider, wallet.address);
  const [rootHistory, setRootHistory] = useState<RootHistoryEntry[]>([]);
  const [bankRequests, setBankRequests] = useState<BankRegistration[]>([]);
  const [totalSupply, setTotalSupply] = useState<string | null>(null);

  useEffect(() => {
    setRootHistory(getRootHistory());
  }, [leafCount]); // Refresh when tree changes

  useEffect(() => {
    if (wallet.isDeployer) {
      setBankRequests(getPendingBankRegistrations());
    }
  }, [wallet.isDeployer]);

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
          <p className="font-serif text-2xl text-keter-text">{totalSupply ?? formattedBalance}</p>
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

      {/* Bank Registrations — deployer only */}
      {wallet.isDeployer && bankRequests.length > 0 && (
        <GlowCard>
          <h2 className="font-serif text-xl mb-4 text-keter-text">
            Pending Bank Registrations
          </h2>
          <div className="space-y-3">
            {bankRequests.map((req) => (
              <div
                key={req.address}
                className="flex items-center justify-between p-4 rounded-lg border border-keter-border-light bg-keter-bg"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-keter-text">
                    {req.institutionName}
                  </p>
                  <p className="text-xs text-keter-text-secondary mt-0.5">
                    {COUNTRIES[req.country]} &middot; Reg. {req.registrationNumber}
                  </p>
                  <p className="text-xs text-keter-text-muted font-mono mt-0.5">
                    {req.address}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => {
                      updateBankRegistrationStatus(req.address, 'approved');
                      setBankRequests(getPendingBankRegistrations());
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-keter-accent border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      updateBankRegistrationStatus(req.address, 'rejected');
                      setBankRequests(getPendingBankRegistrations());
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      )}

      {/* Admin Explorer — full compliance view */}
      <div className="mb-6">
        <AdminExplorer />
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
