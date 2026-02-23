'use client';

import React from 'react';
import GlowCard from '../ui/GlowCard';
import NeonButton from '../ui/NeonButton';

const AlephiumIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 2L3 7V13L10 18L17 13V7L10 2Z"
      stroke="#6e6e73"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M10 8L6.5 10.5V13.5L10 16L13.5 13.5V10.5L10 8Z"
      stroke="#6e6e73"
      strokeWidth="1"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const ConnectAlephium: React.FC = () => {
  return (
    <GlowCard padding="sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlephiumIcon />
          <span className="text-sm font-medium text-keter-text">
            Alephium Wallet
          </span>
          <span className="inline-flex items-center rounded-full bg-keter-bg text-keter-text-muted text-xs px-2 py-0.5 border border-keter-border-light">
            Coming Soon
          </span>
        </div>
        <NeonButton variant="outline" size="sm" disabled>
          Connect Alephium
        </NeonButton>
      </div>
    </GlowCard>
  );
};

export default ConnectAlephium;
