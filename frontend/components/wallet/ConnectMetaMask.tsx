'use client';

import React from 'react';
import { WalletState } from '../../hooks/useWallet';
import NeonButton from '../ui/NeonButton';

interface ConnectMetaMaskProps {
  wallet: WalletState;
}

const MetaMaskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 1L8.9 5.1L9.9 2.7L14.5 1Z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M1.5 1L7.05 5.15L6.1 2.7L1.5 1Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 10.95L11.05 13.15L14.2 14L15.05 11L12.5 10.95Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M0.95 11L1.8 14L4.95 13.15L3.5 10.95L0.95 11Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.8 7.05L3.95 8.3L7.1 8.45L7 5.1L4.8 7.05Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.2 7.05L8.95 5.05L8.9 8.45L12.05 8.3L11.2 7.05Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.95 13.15L6.9 12.2L5.2 11.05L4.95 13.15Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.1 12.2L11.05 13.15L10.8 11.05L9.1 12.2Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const ConnectMetaMask: React.FC<ConnectMetaMaskProps> = ({ wallet }) => {
  if (!wallet.address) {
    return (
      <div>
        <NeonButton
          variant="secondary"
          onClick={wallet.connect}
          loading={wallet.isConnecting}
          disabled={wallet.isConnecting}
        >
          <span className="flex items-center gap-2">
            <MetaMaskIcon />
            <span>Connect Wallet</span>
          </span>
        </NeonButton>
        {wallet.error && (
          <p className="text-red-500 text-xs mt-1.5">{wallet.error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {/* Role badge */}
        {wallet.role === 'bank' ? (
          <span className="inline-flex items-center rounded-full bg-keter-accent-light text-keter-accent text-xs font-medium px-2.5 py-0.5">
            Bank
          </span>
        ) : wallet.role === 'investor' ? (
          <span className="inline-flex items-center rounded-full bg-keter-bg text-keter-text-secondary text-xs font-medium px-2.5 py-0.5 border border-keter-border-light">
            Investor
          </span>
        ) : null}

        {/* Truncated address */}
        <span className="font-mono text-sm text-keter-text-secondary">
          {truncateAddress(wallet.address)}
        </span>

        {/* Disconnect button */}
        <button
          onClick={wallet.disconnect}
          className="text-xs text-keter-text-muted hover:text-keter-text transition-colors"
        >
          Disconnect
        </button>
      </div>
      {wallet.error && (
        <p className="text-red-500 text-xs mt-1.5">{wallet.error}</p>
      )}
    </div>
  );
};

export default ConnectMetaMask;
