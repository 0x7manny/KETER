'use client';

interface CalloutBoxProps {
  type?: 'info' | 'warning' | 'success' | 'note';
  title?: string;
  children: React.ReactNode;
}

const styles = {
  info: 'border-l-blue-500 bg-blue-50/50',
  warning: 'border-l-amber-500 bg-amber-50/50',
  success: 'border-l-emerald-500 bg-emerald-50/50',
  note: 'border-l-keter-accent bg-keter-accent-light/30',
};

const icons = {
  info: 'i',
  warning: '!',
  success: '\u2713',
  note: '\u2731',
};

export default function CalloutBox({ type = 'note', title, children }: CalloutBoxProps) {
  return (
    <div className={`border-l-4 rounded-r-xl p-5 mb-6 ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-white border border-keter-border-light flex items-center justify-center text-xs font-bold text-keter-text-secondary shrink-0 mt-0.5">
          {icons[type]}
        </span>
        <div>
          {title && <p className="font-medium text-keter-text mb-1 text-sm">{title}</p>}
          <div className="text-sm text-keter-text-secondary leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
