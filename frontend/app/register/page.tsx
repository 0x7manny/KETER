'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GlowCard from '@/components/ui/GlowCard';
import NeonButton from '@/components/ui/NeonButton';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  submitBankRegistration,
  getBankRegistration,
  BankRegistration,
  COUNTRIES,
} from '@/utils/credentials';

export default function RegisterPage() {
  const wallet = useWallet();
  const [institutionName, setInstitutionName] = useState('');
  const [country, setCountry] = useState<number>(0);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [existing, setExisting] = useState<BankRegistration | null>(null);

  useEffect(() => {
    if (!wallet.address) return;
    const reg = getBankRegistration(wallet.address);
    if (reg) setExisting(reg);
  }, [wallet.address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim() || !country || !registrationNumber.trim()) return;

    submitBankRegistration({
      address: wallet.address!,
      institutionName: institutionName.trim(),
      country,
      registrationNumber: registrationNumber.trim(),
      timestamp: Date.now(),
      status: 'pending',
    });

    setSubmitted(true);
  };

  const inputClassName =
    'w-full px-3 py-2 rounded-lg border border-keter-border-light bg-keter-bg font-sans text-sm text-keter-text placeholder:text-keter-text-muted focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors';

  const renderContent = () => {
    if (!wallet.address) {
      return (
        <div className="text-center py-20">
          <h1 className="font-serif text-3xl text-keter-text mb-4">Bank Registration</h1>
          <p className="text-keter-text-secondary mb-6">
            Connect your wallet to register as a bank on Keter Protocol.
          </p>
          <button
            onClick={wallet.connect}
            className="bg-keter-text text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black transition"
          >
            Connect Wallet
          </button>
        </div>
      );
    }

    if (wallet.role === 'bank') {
      return (
        <GlowCard>
          <h2 className="font-serif text-xl text-keter-text mb-1">Already Registered</h2>
          <p className="text-keter-text-secondary text-sm mb-4">
            This wallet is already authorized as a bank.
          </p>
          <StatusBadge status="approved" />
        </GlowCard>
      );
    }

    if (existing && existing.status === 'pending') {
      return (
        <GlowCard>
          <h2 className="font-serif text-xl text-keter-text mb-1">Registration Pending</h2>
          <p className="text-keter-text-secondary text-sm mb-4">
            Your bank registration is being reviewed by the protocol admin.
          </p>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-keter-bg border border-keter-border-light">
            <StatusBadge status="pending" />
            <div>
              <p className="text-sm font-sans text-keter-text">{existing.institutionName}</p>
              <p className="text-xs text-keter-text-muted font-mono">{wallet.address}</p>
            </div>
          </div>
        </GlowCard>
      );
    }

    if (existing && existing.status === 'rejected') {
      return (
        <GlowCard>
          <h2 className="font-serif text-xl text-keter-text mb-1">Registration Rejected</h2>
          <p className="text-keter-text-secondary text-sm mb-4">
            Your previous registration was rejected. You may resubmit.
          </p>
          <StatusBadge status="rejected" />
        </GlowCard>
      );
    }

    if (submitted) {
      return (
        <GlowCard>
          <h2 className="font-serif text-xl text-keter-text mb-1">Registration Submitted</h2>
          <p className="text-keter-text-secondary text-sm mb-4">
            Your bank registration has been submitted. Waiting for admin approval.
          </p>
          <StatusBadge status="pending" />
        </GlowCard>
      );
    }

    return (
      <GlowCard>
        <h2 className="font-serif text-xl text-keter-text mb-1">Register as Bank</h2>
        <p className="text-keter-text-secondary text-sm mb-6">
          Submit your institution details to register as a bank on Keter Protocol.
          Once approved, you will be able to manage KYC and issue tokens.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
              Institution Name
            </label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="Banque de France"
              required
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
                Country
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
            <div>
              <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
                Registration Number
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="FR-2026-XXXXX"
                required
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
              Wallet Address
            </label>
            <div className="w-full px-3 py-2 rounded-lg border border-keter-border-light bg-white/50 font-mono text-xs text-keter-text-muted truncate">
              {wallet.address}
            </div>
          </div>

          <NeonButton
            type="submit"
            variant="primary"
            className="w-full"
            disabled={!institutionName.trim() || !country || !registrationNumber.trim()}
          >
            Submit Registration
          </NeonButton>
        </form>
      </GlowCard>
    );
  };

  return (
    <div className="min-h-screen bg-keter-bg flex flex-col">
      <Header wallet={wallet} />
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}
