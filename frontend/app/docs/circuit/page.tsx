'use client';

import TechTable from '@/components/docs/TechTable';
import CodeBlock from '@/components/docs/CodeBlock';
import CalloutBox from '@/components/docs/CalloutBox';
import { circuitConstraints, circuitCode, circuitCallout } from '@/data/circuit';

export default function CircuitPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-keter-text mb-2">ZK Circuit — Noir V2</h1>
      <p className="text-keter-text-secondary mb-8">
        13 private inputs, 5 public inputs, 8 constraints. The circuit takes identity data and produces a mathematical proof without revealing anything.
      </p>

      {/* Constraints table */}
      <h2 className="font-serif text-xl text-keter-text mb-4">The 8 constraints explained</h2>
      <TechTable
        headers={['#', 'Name', 'What it verifies', 'Why']}
        rows={circuitConstraints.map((c) => [
          <span key={c.id} className="font-mono text-keter-accent font-medium">{c.id}</span>,
          <strong key={`n-${c.id}`} className="text-keter-text">{c.name}</strong>,
          c.verifies,
          c.reason,
        ])}
      />

      {/* Full circuit code */}
      <h2 className="font-serif text-xl text-keter-text mb-4 mt-10">The complete circuit</h2>
      <CodeBlock code={circuitCode} language="noir" title="src/main.nr" />

      {/* Callout */}
      <CalloutBox type={circuitCallout.type} title={circuitCallout.title}>
        {circuitCallout.text}
      </CalloutBox>
    </div>
  );
}
