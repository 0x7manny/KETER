'use client';

import React from 'react';
import GlowCard from '../ui/GlowCard';
import StatusBadge from '../ui/StatusBadge';
import { getKYCRequests, COUNTRIES, INVESTOR_TYPES } from '../../utils/credentials';

export function InvestorList() {
  const approved = getKYCRequests().filter((r) => r.status === 'approved');

  return (
    <GlowCard>
      <h2 className="font-serif text-xl mb-4 text-keter-text">Approved Investors</h2>

      {approved.length === 0 ? (
        <p className="text-keter-text-muted text-center text-sm py-4">
          No approved investors yet
        </p>
      ) : (
        <div className="space-y-0">
          {approved.map((investor, index) => (
            <div
              key={investor.address}
              className="flex items-center gap-3 py-3 border-b border-keter-border-light last:border-0"
            >
              <span className="text-keter-text-muted font-mono text-xs w-6 shrink-0">
                #{index}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm text-keter-text truncate">
                  {investor.address.slice(0, 8)}...{investor.address.slice(-6)}
                </p>
                <p className="text-xs text-keter-text-secondary mt-0.5">
                  {COUNTRIES[investor.country] || 'Unknown'} &middot;{' '}
                  {INVESTOR_TYPES[investor.investorType] || 'Unknown'}
                </p>
              </div>
              <StatusBadge status="approved" size="sm" />
            </div>
          ))}
        </div>
      )}
    </GlowCard>
  );
}

export default InvestorList;
