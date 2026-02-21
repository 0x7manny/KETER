'use client';

import React from 'react';

type Status = 'pending' | 'approved' | 'rejected' | 'verified';

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
}

const statusStyles: Record<Status, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const dotColors: Record<Status, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  verified: 'bg-emerald-500',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

function getLabel(status: Status): string {
  if (status === 'verified') return '\u2713 ZK Verified';
  return status.toUpperCase();
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium font-sans ${statusStyles[status]} ${sizeStyles[size]}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${dotColors[status]}`}
      />
      {getLabel(status)}
    </span>
  );
}

export default StatusBadge;
