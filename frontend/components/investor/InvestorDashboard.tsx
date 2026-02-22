'use client';

import React from 'react';
import GlowCard from '../ui/GlowCard';
import StatusBadge from '../ui/StatusBadge';
import { WalletState } from '../../hooks/useWallet';
import {
  hasCredentials,
  loadCredentials,
  getKYCRequests,
  COUNTRIES,
  INVESTOR_TYPES,
} from '../../utils/credentials';
import Balance from './Balance';
import TransferForm from './TransferForm';
import TransferHistory from './TransferHistory';
import KYCForm from './KYCForm';

interface InvestorDashboardProps {
  wallet: WalletState;
}

export function InvestorDashboard({ wallet }: InvestorDashboardProps) {
  const hasCreds = wallet.address ? hasCredentials(wallet.address) : false;
  const credentials = hasCreds ? loadCredentials(wallet.address!) : null;

  // Check KYC request status for the sidebar
  const kycRequests = getKYCRequests();
  const myRequest = wallet.address
    ? kycRequests.find(
        (r) => r.address.toLowerCase() === wallet.address!.toLowerCase()
      )
    : null;

  const getKYCStatusContent = () => {
    if (hasCreds && credentials) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <StatusBadge status="approved" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-sans text-keter-text-muted uppercase tracking-wide mb-0.5">
                Country
              </p>
              <p className="text-sm font-sans text-keter-text">
                {COUNTRIES[credentials.countryCode] || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs font-sans text-keter-text-muted uppercase tracking-wide mb-0.5">
                Investor Type
              </p>
              <p className="text-sm font-sans text-keter-text">
                {INVESTOR_TYPES[credentials.investorType] || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs font-sans text-keter-text-muted uppercase tracking-wide mb-0.5">
                Leaf Index
              </p>
              <p className="text-sm font-mono text-keter-text">
                #{credentials.leafIndex}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (myRequest) {
      if (myRequest.status === 'pending') {
        return (
          <div className="space-y-3">
            <StatusBadge status="pending" />
            <p className="text-sm font-sans text-keter-text-secondary">
              Your KYC request is under review by the bank.
            </p>
          </div>
        );
      }
      if (myRequest.status === 'rejected') {
        return (
          <div className="space-y-3">
            <StatusBadge status="rejected" />
            <p className="text-sm font-sans text-keter-text-secondary">
              Your KYC request was rejected. You may resubmit.
            </p>
          </div>
        );
      }
    }

    return (
      <div className="space-y-3">
        <div className="h-2 w-2 rounded-full bg-keter-text-muted inline-block" />
        <p className="text-sm font-sans text-keter-text-muted">
          Not submitted
        </p>
        <p className="text-xs font-sans text-keter-text-muted">
          Submit a KYC request to get started.
        </p>
      </div>
    );
  };

  return (
    <div>
      <h1 className="font-serif text-3xl text-keter-text mb-2">
        Investor Dashboard
      </h1>
      <p className="text-keter-text-secondary text-sm mb-8 font-sans">
        Manage your tokens and compliance
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main content */}
        <div className="lg:col-span-2 space-y-6">
          {hasCreds ? (
            <>
              <Balance wallet={wallet} />
              <TransferForm wallet={wallet} />
              <TransferHistory wallet={wallet} />
            </>
          ) : (
            <KYCForm wallet={wallet} />
          )}
        </div>

        {/* Right column - Status sidebar */}
        <div className="lg:col-span-1">
          <GlowCard>
            <h3 className="font-serif text-lg text-keter-text mb-4">
              KYC Status
            </h3>
            {getKYCStatusContent()}

            {/* Wallet address */}
            <div className="mt-6 pt-4 border-t border-keter-border-light">
              <p className="text-xs font-sans text-keter-text-muted uppercase tracking-wide mb-1">
                Connected Wallet
              </p>
              <p className="text-xs font-mono text-keter-text break-all">
                {wallet.address}
              </p>
            </div>
          </GlowCard>
        </div>
      </div>
    </div>
  );
}

export default InvestorDashboard;
