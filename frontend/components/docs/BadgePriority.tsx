'use client';

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const styles: Record<Priority, string> = {
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function BadgePriority({ priority }: { priority: Priority }) {
  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${styles[priority]}`}>
      {priority}
    </span>
  );
}
