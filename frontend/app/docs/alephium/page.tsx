'use client';

import TechTable from '@/components/docs/TechTable';
import CodeBlock from '@/components/docs/CodeBlock';
import CalloutBox from '@/components/docs/CalloutBox';
import BadgePriority from '@/components/docs/BadgePriority';
import { comparisonTable, integrationStrategies, ralphCode, alephiumCallout } from '@/data/alephium';

export default function AlephiumPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-keter-text mb-2">Cross-chain Alephium</h1>
      <p className="text-keter-text-secondary mb-8">
        An energy-efficient PoW L1 with 8s block time. How to extend Keter security tokens there?
      </p>

      {/* ETH vs Alephium comparison */}
      <h2 className="font-serif text-xl text-keter-text mb-4">Ethereum vs Alephium</h2>
      <TechTable
        headers={comparisonTable.headers}
        rows={comparisonTable.rows.map((row) => [
          <strong key={row[0]} className="text-keter-text">{row[0]}</strong>,
          row[1],
          row[2],
        ])}
      />

      <CalloutBox type={alephiumCallout.type} title={alephiumCallout.title}>
        {alephiumCallout.text}
      </CalloutBox>

      {/* Integration strategies */}
      <h2 className="font-serif text-xl text-keter-text mb-4 mt-10">4 integration strategies</h2>
      <TechTable
        headers={integrationStrategies.headers}
        rows={integrationStrategies.rows.map((r) => [
          <strong key={r.name} className="text-keter-text">{r.name}</strong>,
          r.idea,
          <BadgePriority key={`c-${r.name}`} priority={r.complexity} />,
          r.trust,
          <span
            key={`h-${r.name}`}
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              r.hackathonColor === 'emerald'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : r.hackathonColor === 'blue'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {r.hackathon}
          </span>,
        ])}
      />

      {/* Ralph contract code */}
      <h2 className="font-serif text-xl text-keter-text mb-4 mt-10">Strategy 2 — Ralph contract with oracle</h2>
      <CodeBlock code={ralphCode} language="ralph" title="contracts/KeterAlph.ral" />
    </div>
  );
}
