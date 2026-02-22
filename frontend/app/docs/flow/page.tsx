'use client';

import FlowSteps from '@/components/docs/FlowSteps';
import { kycFlow, transferFlow } from '@/data/flow';

export default function FlowPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-keter-text mb-2">Protocol Flow</h1>
      <p className="text-keter-text-secondary mb-10">
        Two phases. The bank approves, the investor transfers. Each step in detail.
      </p>

      {/* Phase 1 */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono font-medium text-keter-accent bg-keter-accent-light px-2.5 py-1 rounded-lg tracking-wider uppercase">
            Phase 1
          </span>
          <h2 className="font-serif text-xl text-keter-text">KYC Approval (Bank)</h2>
        </div>

        <FlowSteps
          steps={kycFlow.map((s) => ({
            number: parseInt(s.step),
            title: `${s.title}`,
            description: `${s.description} — ${s.tech}`,
            actor: s.actor,
          }))}
        />
      </div>

      {/* Phase 2 */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-mono font-medium text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg tracking-wider uppercase">
            Phase 2
          </span>
          <h2 className="font-serif text-xl text-keter-text">Transfer with Proof (Investor)</h2>
        </div>

        <FlowSteps
          steps={transferFlow.map((s) => ({
            number: parseInt(s.step),
            title: `${s.title}`,
            description: `${s.description} — ${s.tech}`,
            actor: s.actor,
          }))}
        />
      </div>
    </div>
  );
}
