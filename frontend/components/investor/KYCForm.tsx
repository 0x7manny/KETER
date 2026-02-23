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
  KYCRequest,
} from '../../utils/credentials';

interface KYCFormProps {
  wallet: WalletState;
}

export function KYCForm({ wallet }: KYCFormProps) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');
  const [country, setCountry] = useState<number>(0);
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
    if (!name.trim() || !surname.trim() || !age || !physicalAddress.trim() || !country) return;

    submitKYCRequest({
      address: wallet.address!,
      name: name.trim(),
      surname: surname.trim(),
      age: parseInt(age),
      physicalAddress: physicalAddress.trim(),
      country,
      investorType: 0, // Set by the bank during approval
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
              {existingRequest.name} {existingRequest.surname}
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

  const inputClassName = "w-full px-3 py-2 rounded-lg border border-keter-border-light bg-keter-bg font-sans text-sm text-keter-text placeholder:text-keter-text-muted focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors";

  return (
    <GlowCard>
      <h2 className="font-serif text-xl text-keter-text mb-1">
        Request KYC Approval
      </h2>
      <p className="text-keter-text-secondary text-sm mb-6">
        Submit your compliance information to the bank for review.
        Your data will be hashed — only the cryptographic commitment is stored on-chain.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name + Surname row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
              First Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John"
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
              Surname
            </label>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Doe"
              required
              className={inputClassName}
            />
          </div>
        </div>

        {/* Age + Country row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
              required
              min="18"
              max="120"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
              Country (EU)
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(Number(e.target.value))}
              required
              className={inputClassName}
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
        </div>

        {/* Physical Address */}
        <div>
          <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
            Physical Address
          </label>
          <input
            type="text"
            value={physicalAddress}
            onChange={(e) => setPhysicalAddress(e.target.value)}
            placeholder="123 Main St, Paris"
            required
            className={inputClassName}
          />
        </div>

        {/* Wallet address (read-only, from MetaMask) */}
        <div>
          <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
            Wallet Address
          </label>
          <div className="w-full px-3 py-2 rounded-lg border border-keter-border-light bg-white/50 font-mono text-xs text-keter-text-muted truncate">
            {wallet.address || 'Not connected'}
          </div>
        </div>

        <NeonButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!name.trim() || !surname.trim() || !age || !physicalAddress.trim() || !country}
        >
          Submit KYC Request
        </NeonButton>
      </form>
    </GlowCard>
  );
}

export default KYCForm;
