import React from 'react';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-keter-accent text-white hover:bg-keter-accent-hover',
  secondary: 'bg-keter-text text-white hover:bg-black',
  outline:
    'bg-transparent border border-keter-border text-keter-text hover:bg-keter-secondary',
  ghost: 'bg-keter-accent-light text-keter-accent hover:bg-[#a7f3d0]',
  danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

function Spinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function NeonButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: NeonButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-lg font-sans font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default NeonButton;
