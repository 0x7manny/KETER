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
  const { addLeaf, getRoot } = useMerkleTree();

  const refreshRequests = useCallback(() => {
    setRequests(getPendingKYCRequests());
  }, []);

  useEffect(() => {
    refreshRequests();
  }, [refreshRequests]);

  const handleApprove = async (request: KYCRequest) => {
    setProcessingAddress(request.address);
    setError(null);

    const result = await approveInvestor(wallet, request, addLeaf, getRoot);

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
        <div className="space-y-0">
          {requests.map((request) => {
            const isProcessing = processingAddress === request.address;

            return (
              <div
                key={request.address}
                className="flex items-center justify-between gap-4 py-3 border-b border-keter-border-light last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm text-keter-text truncate">
                    {request.address.slice(0, 8)}...{request.address.slice(-6)}
                  </p>
                  <p className="text-xs text-keter-text-secondary mt-0.5">
                    {COUNTRIES[request.country] || 'Unknown'} &middot;{' '}
                    {INVESTOR_TYPES[request.investorType] || 'Unknown'} &middot;{' '}
                    <span className="text-keter-text-muted">{timeAgo(request.timestamp)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <NeonButton
                    variant="primary"
                    size="sm"
                    loading={isProcessing}
                    disabled={isProcessing}
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
