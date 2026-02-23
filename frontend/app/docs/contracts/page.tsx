'use client';

import CodeBlock from '@/components/docs/CodeBlock';
import FlowSteps from '@/components/docs/FlowSteps';
import CalloutBox from '@/components/docs/CalloutBox';
import { contractDescriptions, transferWithProofCode, deploymentSteps, contractsCallout } from '@/data/contracts-docs';

export default function ContractsPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-keter-text mb-2">Smart Contracts</h1>
      <p className="text-keter-text-secondary mb-8">
        Three contracts deployed in a precise order. The token, the registry, and the verifier. None store personal data.
      </p>

      {/* Contract descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {contractDescriptions.map((c) => (
          <div key={c.name} className="bg-white border border-keter-border-light rounded-xl p-6">
            <h3 className="font-serif text-lg text-keter-text mb-2 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${c.color === 'violet' ? 'bg-violet-500' : 'bg-emerald-500'}`} />
              {c.name}
            </h3>
            <p className="text-sm text-keter-text-secondary mb-4">{c.description}</p>
            <ul className="space-y-1.5">
              {c.features.map((f) => (
                <li key={f} className="text-sm text-keter-text-secondary flex items-start gap-2">
                  <span className="text-keter-accent mt-1 shrink-0">›</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* transferWithProof code */}
      <h2 className="font-serif text-xl text-keter-text mb-4">transferWithProof() — the core function</h2>
      <CodeBlock code={transferWithProofCode} language="solidity" title="contracts/ZKToken.sol" />

      <CalloutBox type={contractsCallout.type} title={contractsCallout.title}>
        {contractsCallout.text}
      </CalloutBox>

      {/* Deployment order */}
      <h2 className="font-serif text-xl text-keter-text mb-4 mt-10">Deployment order</h2>
      <FlowSteps
        steps={deploymentSteps.map((s) => ({
          number: parseInt(s.step),
          title: s.title,
          description: `${s.description} (${s.tech})`,
          actor: s.actor,
        }))}
      />
    </div>
  );
}
