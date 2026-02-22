'use client';

import CardGrid from '@/components/docs/CardGrid';
import { erc1400Cards } from '@/data/erc1400';

export default function ERC1400Page() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-keter-text mb-2">ERC-1400 Extensions</h1>
      <p className="text-keter-text-secondary mb-8">
        Partitions, forced transfers, documents — what separates a prototype from a real security token.
      </p>

      <CardGrid
        columns={2}
        cards={erc1400Cards.map((c) => ({
          title: c.title,
          subtitle: c.tag,
          description: c.description,
        }))}
      />
    </div>
  );
}
