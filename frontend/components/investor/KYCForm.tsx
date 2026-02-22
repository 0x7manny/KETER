'use client';

import React, { useState, useEffect } from 'react';
import GlowCard from '../ui/GlowCard';
import NeonButton from '../ui/NeonButton';
import StatusBadge from '../ui/StatusBadge';
import { WalletState } from '../../hooks/useWallet';
import {
  submitKYCRequest,
  getKYCRequests,
  COUNTRIES,
  INVESTOR_TYPES,
  KYCRequest,
} from '../../utils/credentials';

interface KYCFormProps {
  wallet: WalletState;
}

export function KYCForm({ wallet }: KYCFormProps) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState<number>(0);
  const [investorType, setInvestorType] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [existingRequest, setExistingRequest] = useState<KYCRequest | null>(
    null
  );

  // Check for existing KYC request on mount
  useEffect(() => {
    if (!wallet.address) return;
    const requests = getKYCRequests();
    const existing = requests.find(
      (r) => r.address.toLowerCase() === wallet.address!.toLowerCase()
    );
    if (existing) {
      setExistingRequest(existing);
    }
  }, [wallet.address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country || !investorType) return;

    submitKYCRequest({
      address: wallet.address!,
      name: name.trim(),
      country,
      investorType,
      timestamp: Date.now(),
      status: 'pending',
    });

    setSubmitted(true);
  };

  // Show existing request status
  if (existingRequest && existingRequest.status === 'pending') {
    return (
      <GlowCard>
        <h2 className="font-serif text-xl text-keter-text mb-1">
          KYC Request Submitted
        </h2>
        <p className="text-keter-text-secondary text-sm mb-4">
          Your request is being reviewed by the bank.
        </p>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-keter-bg border border-keter-border-light">
          <StatusBadge status="pending" />
          <div>
            <p className="text-sm font-sans text-keter-text">
              {existingRequest.name}
            </p>
            <p className="text-xs text-keter-text-muted font-mono">
              {wallet.address}
            </p>
          </div>
        </div>
      </GlowCard>
    );
  }

  if (existingRequest && existingRequest.status === 'rejected') {
    return (
      <GlowCard>
        <h2 className="font-serif text-xl text-keter-text mb-1">
          KYC Request Rejected
        </h2>
        <p className="text-keter-text-secondary text-sm mb-4">
          Your previous request was rejected. You may resubmit.
        </p>
        <StatusBadge status="rejected" />
      </GlowCard>
    );
  }

  // Show success after submission
  if (submitted) {
    return (
      <GlowCard>
        <h2 className="font-serif text-xl text-keter-text mb-1">
          Request Submitted
        </h2>
        <p className="text-keter-text-secondary text-sm mb-4">
          KYC request submitted. Waiting for bank approval.
        </p>
        <StatusBadge status="pending" />
      </GlowCard>
    );
  }

  return (
    <GlowCard>
      <h2 className="font-serif text-xl text-keter-text mb-1">
        Request KYC Approval
      </h2>
      <p className="text-keter-text-secondary text-sm mb-6">
        Submit your compliance information to the bank for review
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className="w-full px-3 py-2 rounded-lg border border-keter-border-light bg-keter-bg font-sans text-sm text-keter-text placeholder:text-keter-text-muted focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(Number(e.target.value))}
            required
            className="w-full px-3 py-2 rounded-lg border border-keter-border-light bg-keter-bg font-sans text-sm text-keter-text focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors"
          >
            <option value={0} disabled>
              Select a country
            </option>
            {Object.entries(COUNTRIES).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
            Investor Type
          </label>
          <select
            value={investorType}
            onChange={(e) => setInvestorType(Number(e.target.value))}
            required
            className="w-full px-3 py-2 rounded-lg border border-keter-border-light bg-keter-bg font-sans text-sm text-keter-text focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors"
          >
            <option value={0} disabled>
              Select investor type
            </option>
            {Object.entries(INVESTOR_TYPES).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <NeonButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!name.trim() || !country || !investorType}
        >
          Submit KYC Request
        </NeonButton>
      </form>
    </GlowCard>
  );
}

export default KYCForm;
