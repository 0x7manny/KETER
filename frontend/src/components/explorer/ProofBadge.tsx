import React from 'react';

interface ProofBadgeProps {
  verified: boolean;
}

export function ProofBadge({ verified }: ProofBadgeProps) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs font-medium whitespace-nowrap">
        <svg
          className="h-3 w-3 flex-shrink-0"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="8" cy="8" r="8" fill="currentColor" fillOpacity="0.15" />
          <path
            d="M5 8.5L7 10.5L11 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        ZK Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs font-medium whitespace-nowrap">
      <span className="inline-block h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
      Unverified
    </span>
  );
}

export default ProofBadge;
