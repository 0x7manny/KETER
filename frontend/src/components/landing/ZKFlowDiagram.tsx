import { useEffect, useState } from 'react';

const steps = [
  { id: 'bank', label: 'Bank', sublabel: 'KYC Review', icon: '🏦' },
  { id: 'tree', label: 'Merkle Tree', sublabel: 'Commitment', icon: '🌳' },
  { id: 'proof', label: 'ZK Proof', sublabel: 'Privacy', icon: '🔐' },
  { id: 'chain', label: 'On-chain', sublabel: 'Verified', icon: '⛓️' },
];

export default function ZKFlowDiagram() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-4 bg-gradient-to-br from-keter-accent/5 via-transparent to-keter-accent/5 rounded-3xl blur-2xl" />

      <div className="relative bg-white/70 backdrop-blur-sm border border-keter-border-light rounded-2xl p-6 shadow-card">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-keter-accent animate-pulse" />
          <span className="text-[10px] font-medium text-keter-text-muted uppercase tracking-widest">
            Compliance Flow
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-5 top-10 w-0.5 h-5 -mb-2">
                  <div
                    className="h-full transition-all duration-700 rounded-full"
                    style={{
                      background: i <= activeStep
                        ? 'linear-gradient(to bottom, #059669, #059669)'
                        : '#e8e8ed',
                      opacity: i < activeStep ? 1 : 0.3,
                    }}
                  />
                </div>
              )}

              {/* Step row */}
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500 ${
                  i === activeStep
                    ? 'bg-keter-accent-light/50 border border-keter-accent/20 scale-[1.02]'
                    : i < activeStep
                    ? 'bg-keter-bg/50 border border-transparent'
                    : 'border border-transparent opacity-50'
                }`}
              >
                {/* Icon circle */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0 transition-all duration-500 ${
                    i === activeStep
                      ? 'bg-keter-accent text-white shadow-lg shadow-keter-accent/30'
                      : i < activeStep
                      ? 'bg-keter-accent-light text-keter-accent'
                      : 'bg-keter-secondary text-keter-text-muted'
                  }`}
                >
                  {i < activeStep ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm">{step.icon}</span>
                  )}
                </div>

                {/* Label */}
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    i === activeStep ? 'text-keter-text' : 'text-keter-text-secondary'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-keter-text-muted">{step.sublabel}</p>
                </div>

                {/* Active indicator */}
                {i === activeStep && (
                  <div className="ml-auto">
                    <div className="w-1.5 h-1.5 bg-keter-accent rounded-full animate-ping" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom data bar */}
        <div className="mt-5 pt-4 border-t border-keter-border-light flex items-center justify-between">
          <div>
            <p className="text-[10px] text-keter-text-muted uppercase tracking-wide">Privacy</p>
            <p className="text-xs font-medium text-keter-accent">100% preserved</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-keter-text-muted uppercase tracking-wide">Compliance</p>
            <p className="text-xs font-medium text-keter-accent">Verified on-chain</p>
          </div>
        </div>
      </div>
    </div>
  );
}
