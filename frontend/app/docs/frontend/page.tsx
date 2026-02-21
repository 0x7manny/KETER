'use client';

import TechTable from '@/components/docs/TechTable';
import CodeBlock from '@/components/docs/CodeBlock';
import CalloutBox from '@/components/docs/CalloutBox';
import { frontendLibraries, proofCode, poseidonCode, merkleCode, transferCode, frontendCallout } from '@/data/frontend-docs';

export default function FrontendPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-keter-text mb-2">Frontend + noir_js</h1>
      <p className="text-keter-text-secondary mb-8">
        The proof is generated in the browser. No server. The investor keeps total control of their data.
      </p>

      {/* Libraries table */}
      <TechTable
        headers={frontendLibraries.headers}
        rows={frontendLibraries.rows.map((row) =>
          row.map((cell, i) =>
            i === 0 || i === 2 ? (
              <code key={i} className="text-xs font-mono text-keter-accent bg-keter-accent-light/30 px-1.5 py-0.5 rounded">{cell}</code>
            ) : cell
          )
        )}
      />

      {/* Proof generation code */}
      <h2 className="font-serif text-xl text-keter-text mb-4 mt-10">Initialize noir_js + generate proof</h2>
      <CodeBlock code={proofCode} language="typescript" title="src/lib/proof.ts" />

      {/* Poseidon hash */}
      <h2 className="font-serif text-xl text-keter-text mb-4 mt-10">Poseidon hash — the JS to Noir bridge</h2>
      <CodeBlock code={poseidonCode} language="typescript" title="src/lib/poseidon.ts" />

      <CalloutBox type={frontendCallout.type} title={frontendCallout.title}>
        {frontendCallout.text}
      </CalloutBox>

      {/* MerkleTree class */}
      <h2 className="font-serif text-xl text-keter-text mb-4 mt-10">MerkleTree class</h2>
      <CodeBlock code={merkleCode} language="typescript" title="src/lib/merkle.ts" />

      {/* Send transaction */}
      <h2 className="font-serif text-xl text-keter-text mb-4 mt-10">Send the transaction on-chain</h2>
      <CodeBlock code={transferCode} language="typescript" title="src/lib/contract.ts" />
    </div>
  );
}
