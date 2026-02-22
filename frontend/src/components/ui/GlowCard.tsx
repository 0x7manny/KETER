import React from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap: Record<string, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function GlowCard({
  children,
  className = '',
  hover = true,
  padding = 'md',
}: GlowCardProps) {
  const baseStyles =
    'bg-white rounded-xl border border-keter-border-light shadow-card';
  const hoverStyles = hover
    ? 'hover:shadow-card-hover hover:border-keter-border transition-all duration-200'
    : '';
  const pad = paddingMap[padding];

  return (
    <div className={`${baseStyles} ${hoverStyles} ${pad} ${className}`}>
      {children}
    </div>
  );
}

export default GlowCard;
