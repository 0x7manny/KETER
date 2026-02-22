import React, { useState, useEffect } from 'react';

interface LoadingProofProps {
  step?: 1 | 2 | 3;
}

const steps = [
  { label: 'Preparing witness' },
  { label: 'Computing proof' },
  { label: 'Finalizing' },
];

export function LoadingProof({ step = 1 }: LoadingProofProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-keter-border-light shadow-elevated p-8 w-full max-w-md text-center">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <svg
            className="h-16 w-16"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer static circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#d1fae5"
              strokeWidth="4"
            />
            {/* Middle static circle */}
            <circle
              cx="32"
              cy="32"
              r="20"
              fill="none"
              stroke="#a7f3d0"
              strokeWidth="3"
            />
            {/* Inner rotating arc */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#059669"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="44 132"
              className="animate-spin origin-center"
            />
          </svg>
        </div>

        {/* Main text */}
        <h3 className="font-serif text-xl text-keter-text mb-1">
          Generating ZK Proof...
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-keter-text-secondary mb-6">
          Proving compliance without revealing identity
        </p>

        {/* Elapsed time */}
        <p className="text-xs text-keter-text-muted font-mono mb-8">
          {elapsed}s elapsed
        </p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < step;
            const isCurrent = stepNum === step;

            return (
              <React.Fragment key={stepNum}>
                {/* Step */}
                <div className="flex items-center gap-1.5">
                  {/* Circle / check */}
                  <div
                    className={`flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-medium ${
                      isCompleted
                        ? 'bg-keter-accent text-white'
                        : isCurrent
                          ? 'bg-keter-accent text-white'
                          : 'bg-keter-border-light text-keter-text-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={`text-xs font-sans font-medium whitespace-nowrap ${
                      isCompleted || isCurrent
                        ? 'text-keter-accent'
                        : 'text-keter-text-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    className={`h-px w-6 ${
                      stepNum < step
                        ? 'bg-keter-accent'
                        : 'bg-keter-border-light'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LoadingProof;
