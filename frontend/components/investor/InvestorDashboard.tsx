'use client';

import React, { useState } from 'react';
import GlowCard from '../ui/GlowCard';
import NeonButton from '../ui/NeonButton';
import StatusBadge from '../ui/StatusBadge';
import { WalletState } from '../../hooks/useWallet';
import {
  hasCredentials,
  loadCredentials,
  saveCredentials,
  getKYCRequests,
  COUNTRIES,
  INVESTOR_TYPES,
  InvestorCredentials,
} from '../../utils/credentials';
import Balance from './Balance';
import TransferForm from './TransferForm';
import TransferHistory from './TransferHistory';
import KYCForm from './KYCForm';

interface InvestorDashboardProps {
  wallet: WalletState;
}

export function InvestorDashboard({ wallet }: InvestorDashboardProps) {
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const hasCreds = wallet.address ? hasCredentials(wallet.address) : false;
  const credentials = hasCreds ? loadCredentials(wallet.address!) : null;

  const handleImportCredentials = () => {
    try {
      const parsed = JSON.parse(importJson) as InvestorCredentials;
      if (!parsed.salt || !parsed.wallet || parsed.leafIndex === undefined) {
        setImportError('Invalid credentials format');
        return;
      }
      saveCredentials(wallet.address!, parsed);
      setImportSuccess(true);
      setImportError(null);
      // Reload to pick up new credentials
      window.location.reload();
    } catch {
      setImportError('Invalid JSON');
    }
  };

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
                Transfer Limit
              </p>
              <p className="text-sm font-sans text-keter-text">
                {Number(credentials.maxAmount).toLocaleString()} KETER
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
            <>
              <KYCForm wallet={wallet} />

              {/* Import credentials received from bank */}
              <GlowCard>
                <h2 className="font-serif text-xl text-keter-text mb-1">
                  Import Credentials
                </h2>
                <p className="text-keter-text-secondary text-sm mb-4">
                  If the bank sent you credentials, paste them here.
                </p>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='{"name":"...","salt":"...","leafIndex":0,...}'
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-keter-border-light bg-keter-bg font-mono text-xs text-keter-text placeholder:text-keter-text-muted focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors mb-3"
                />
                {importError && (
                  <p className="text-sm text-red-600 mb-2">{importError}</p>
                )}
                {importSuccess && (
                  <p className="text-sm text-emerald-600 mb-2">Credentials imported successfully.</p>
                )}
                <NeonButton
                  variant="secondary"
                  onClick={handleImportCredentials}
                  disabled={!importJson.trim()}
                >
                  Import
                </NeonButton>
              </GlowCard>
            </>
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
