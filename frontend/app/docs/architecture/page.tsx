'use client';

import CardGrid from '@/components/docs/CardGrid';
import CalloutBox from '@/components/docs/CalloutBox';
import { architectureLayers, architectureCallout, architectureStats } from '@/data/architecture';

export default function ArchitecturePage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-keter-text mb-2">Architecture</h1>
      <p className="text-keter-text-secondary mb-8">
        Five independent layers that transform a transparency problem into a mathematics problem.
      </p>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {architectureStats.map((s) => (
          <div key={s.label} className="bg-white border border-keter-border-light rounded-xl p-4 text-center">
            <div className="text-2xl font-mono font-bold text-keter-text">
              {s.value}<span className="text-sm text-keter-accent ml-1 font-normal">{s.unit}</span>
            </div>
            <div className="text-[10px] text-keter-text-muted uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Layer cards */}
      <CardGrid
        columns={2}
        cards={architectureLayers.map((l) => ({
          title: l.title,
          subtitle: l.tag,
          description: l.description,
          tags: l.chips,
        }))}
      />

      {/* Callout */}
      <CalloutBox type={architectureCallout.type} title={architectureCallout.title}>
        {architectureCallout.text}
      </CalloutBox>
    </div>
  );
}
