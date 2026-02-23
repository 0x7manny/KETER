'use client';

interface Step {
  number: number;
  title: string;
  description: string;
  actor?: string;
}

interface FlowStepsProps {
  steps: Step[];
}

const actorColors: Record<string, string> = {
  Bank: 'bg-emerald-50 text-keter-accent border-emerald-200',
  Investor: 'bg-violet-50 text-violet-700 border-violet-200',
  Contract: 'bg-blue-50 text-blue-700 border-blue-200',
  Frontend: 'bg-amber-50 text-amber-700 border-amber-200',
  Verifier: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function FlowSteps({ steps }: FlowStepsProps) {
  return (
    <div className="relative mb-6">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-px bg-keter-border-light" />

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="relative flex gap-4">
            {/* Number circle */}
            <div className="relative z-10 w-10 h-10 rounded-full bg-keter-accent flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-mono font-bold">
                {String(step.number).padStart(2, '0')}
              </span>
            </div>

            {/* Content */}
            <div className="pt-1.5 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-keter-text">{step.title}</h4>
                {step.actor && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${actorColors[step.actor] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {step.actor}
                  </span>
                )}
              </div>
              <p className="text-sm text-keter-text-secondary leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
