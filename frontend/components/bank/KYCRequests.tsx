'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WalletState } from '../../hooks/useWallet';
import { useMerkleTree } from '../../hooks/useMerkleTree';
import GlowCard from '../ui/GlowCard';
import NeonButton from '../ui/NeonButton';
import {
  getPendingKYCRequests,
  updateKYCStatus,
  COUNTRIES,
  INVESTOR_TYPES,
  KYCRequest,
} from '../../utils/credentials';
import { approveInvestor } from './ApproveInvestor';

interface KYCRequestsProps {
  wallet: WalletState;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function KYCRequests({ wallet }: KYCRequestsProps) {
  const [requests, setRequests] = useState<KYCRequest[]>([]);
  const [processingAddress, setProcessingAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maxAmounts, setMaxAmounts] = useState<Record<string, string>>({});
  const [investorTypes, setInvestorTypes] = useState<Record<string, number>>({});
  const { addLeaf, getRoot } = useMerkleTree();

  const refreshRequests = useCallback(() => {
    setRequests(getPendingKYCRequests());
  }, []);

  useEffect(() => {
    refreshRequests();
  }, [refreshRequests]);

  const handleMaxAmountChange = (address: string, value: string) => {
    setMaxAmounts(prev => ({ ...prev, [address]: value }));
  };

  const handleInvestorTypeChange = (address: string, value: number) => {
    setInvestorTypes(prev => ({ ...prev, [address]: value }));
  };

  const handleApprove = async (request: KYCRequest) => {
    const maxAmount = maxAmounts[request.address];
    const investorType = investorTypes[request.address];
    if (!maxAmount || Number(maxAmount) <= 0) {
      setError('Please set a valid max transfer amount before approving');
      return;
    }
    if (!investorType) {
      setError('Please select an investor type before approving');
      return;
    }

    setProcessingAddress(request.address);
    setError(null);

    // Bank defines investorType — override whatever the investor submitted
    const bankRequest = { ...request, investorType };
    const result = await approveInvestor(wallet, bankRequest, maxAmount, addLeaf, getRoot);

    if (result.success) {
      refreshRequests();
    } else {
      setError(result.error || 'Failed to approve investor');
    }

    setProcessingAddress(null);
  };

  const handleReject = (address: string) => {
    updateKYCStatus(address, 'rejected');
    refreshRequests();
  };

  return (
    <GlowCard>
      <h2 className="font-serif text-xl mb-4 text-keter-text">KYC Requests</h2>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-keter-text-muted text-center text-sm py-8">
          No pending requests
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const isProcessing = processingAddress === request.address;

            return (
              <div
                key={request.address}
                className="p-4 rounded-lg border border-keter-border-light bg-keter-bg"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-keter-text">
                      {request.name} {request.surname}
                    </p>
                    <p className="font-mono text-xs text-keter-text-muted truncate mt-0.5">
                      {request.address.slice(0, 8)}...{request.address.slice(-6)}
                    </p>
                  </div>
                  <span className="text-xs text-keter-text-muted shrink-0">
                    {timeAgo(request.timestamp)}
                  </span>
                </div>

                {/* Investor details */}
                <div className="flex flex-wrap gap-2 text-xs text-keter-text-secondary mb-3">
                  <span className="px-2 py-0.5 bg-white rounded border border-keter-border-light">
                    {COUNTRIES[request.country] || 'Unknown'}
                  </span>
                  <span className="px-2 py-0.5 bg-white rounded border border-keter-border-light">
                    Age: {request.age}
                  </span>
                </div>

                {/* Bank-defined fields: Investor Type + Max Amount */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-keter-text-secondary mb-1">
                      Investor Type
                    </label>
                    <select
                      value={investorTypes[request.address] || 0}
                      onChange={(e) => handleInvestorTypeChange(request.address, Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-keter-border-light bg-white text-sm text-keter-text focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors"
                    >
                      <option value={0} disabled>Select type</option>
                      {Object.entries(INVESTOR_TYPES).map(([code, label]) => (
                        <option key={code} value={code}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-keter-text-secondary mb-1">
                      Max Transfer Amount
                    </label>
                    <input
                      type="number"
                      value={maxAmounts[request.address] || ''}
                      onChange={(e) => handleMaxAmountChange(request.address, e.target.value)}
                      placeholder="e.g. 100000"
                      min="1"
                      className="w-full px-3 py-1.5 rounded-lg border border-keter-border-light bg-white font-mono text-sm text-keter-text placeholder:text-keter-text-muted focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <NeonButton
                    variant="primary"
                    size="sm"
                    loading={isProcessing}
                    disabled={isProcessing || !maxAmounts[request.address] || !investorTypes[request.address]}
                    onClick={() => handleApprove(request)}
                  >
                    Approve
                  </NeonButton>
                  <NeonButton
                    variant="danger"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleReject(request.address)}
                  >
                    Reject
                  </NeonButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlowCard>
  );
}

export default KYCRequests;
