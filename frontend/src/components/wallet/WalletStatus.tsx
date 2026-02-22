import React from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../../hooks/useWallet';
import GlowCard from '../ui/GlowCard';

interface WalletStatusProps {
  wallet: WalletState;
  balance: bigint;
}

const getChainName = (chainId: number | null): string => {
  switch (chainId) {
    case 1:
      return 'Ethereum';
    case 11155111:
      return 'Sepolia';
    default:
      return 'Unknown';
  }
};

const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const InfoRow: React.FC<{
  label: string;
  children: React.ReactNode;
  last?: boolean;
}> = ({ label, children, last }) => (
  <div className={`flex items-center justify-between py-2.5 ${last ? '' : 'border-b border-keter-border-light'}`}>
    <span className="text-keter-text-muted text-xs uppercase tracking-wide">
      {label}
    </span>
    <span className="text-sm text-keter-text">{children}</span>
  </div>
);

const WalletStatus: React.FC<WalletStatusProps> = ({ wallet, balance }) => {
  if (!wallet.address) return null;

  const formattedBalance = ethers.formatUnits(balance, 18);

  return (
    <GlowCard>
      <div className="divide-y-0">
        <InfoRow label="Address">
          <span className="font-mono text-sm">
            {truncateAddress(wallet.address)}
          </span>
        </InfoRow>

        <InfoRow label="Network">
          {getChainName(wallet.chainId)}
        </InfoRow>

        <InfoRow label="Role">
          {wallet.role === 'bank' ? (
            <span className="inline-flex items-center rounded-full bg-keter-accent-light text-keter-accent text-xs font-medium px-2.5 py-0.5">
              Bank
            </span>
          ) : wallet.role === 'investor' ? (
            <span className="inline-flex items-center rounded-full bg-keter-bg text-keter-text-secondary text-xs font-medium px-2.5 py-0.5 border border-keter-border-light">
              Investor
            </span>
          ) : (
            <span className="text-keter-text-secondary text-sm">Explorer</span>
          )}
        </InfoRow>

        <InfoRow label="Balance" last>
          <span className="font-mono">
            {formattedBalance}{' '}
            <span className="text-keter-text-muted">KETER</span>
          </span>
        </InfoRow>
      </div>
    </GlowCard>
  );
};

export default WalletStatus;
