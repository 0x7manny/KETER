import React from 'react';
import GlowCard from '../ui/GlowCard';
import StatusBadge from '../ui/StatusBadge';
import { WalletState } from '../../hooks/useWallet';
import { getTransfers, TransferRecord } from '../../utils/credentials';

interface TransferHistoryProps {
  wallet?: WalletState;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function TransferHistory({ wallet }: TransferHistoryProps) {
  const allTransfers = getTransfers();

  // Filter by wallet address if provided
  const transfers = wallet?.address
    ? allTransfers.filter(
        (t) =>
          t.from.toLowerCase() === wallet.address!.toLowerCase() ||
          t.to.toLowerCase() === wallet.address!.toLowerCase()
      )
    : allTransfers;

  // Show max 10 most recent (already sorted newest first from saveTransfer)
  const recentTransfers = transfers.slice(0, 10);

  return (
    <GlowCard>
      <h2 className="font-serif text-xl text-keter-text mb-4">
        Transfer History
      </h2>

      {recentTransfers.length === 0 ? (
        <p className="text-keter-text-muted text-center py-6 text-sm font-sans">
          No transfers yet
        </p>
      ) : (
        <div className="divide-y divide-keter-border-light">
          {recentTransfers.map((transfer, index) => {
            const isSent =
              wallet?.address &&
              transfer.from.toLowerCase() === wallet.address.toLowerCase();
            const counterparty = isSent ? transfer.to : transfer.from;

            return (
              <div
                key={`${transfer.txHash}-${index}`}
                className="py-3 flex items-center justify-between gap-3"
              >
                {/* Direction + Address */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Direction icon */}
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${
                      isSent
                        ? 'bg-red-50 text-red-500'
                        : 'bg-emerald-50 text-emerald-500'
                    }`}
                  >
                    {isSent ? (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 12V4M8 4L4.5 7.5M8 4L11.5 7.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 4V12M8 12L4.5 8.5M8 12L11.5 8.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-sans font-medium text-keter-text">
                      {isSent ? 'Sent' : 'Received'}
                    </p>
                    <p className="text-xs font-mono text-keter-text-muted truncate">
                      {isSent ? 'To: ' : 'From: '}
                      {truncateAddress(counterparty)}
                    </p>
                  </div>
                </div>

                {/* Amount + Time + Badge */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-sans font-medium text-keter-text">
                      {isSent ? '-' : '+'}
                      {transfer.amount}
                      <span className="text-keter-text-muted text-xs ml-1">
                        KETER
                      </span>
                    </p>
                    <p className="text-[10px] text-keter-text-muted font-sans">
                      {formatRelativeTime(transfer.timestamp)}
                    </p>
                  </div>

                  {transfer.zkVerified && (
                    <StatusBadge status="verified" size="sm" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlowCard>
  );
}

export default TransferHistory;
