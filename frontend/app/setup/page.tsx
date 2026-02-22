'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CONTRACTS, setContractAddresses } from '@/utils/contracts';

export default function SetupPage() {
  const [registry, setRegistry] = useState('');
  const [zkToken, setZkToken] = useState('');
  const [verifier, setVerifier] = useState('');
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Load current addresses on mount (deferred to avoid SSR/client hydration mismatch)
  useEffect(() => {
    const zero = '0x0000000000000000000000000000000000000000';
    const r = CONTRACTS.REGISTRY;
    const t = CONTRACTS.ZK_TOKEN;
    const v = CONTRACTS.VERIFIER;
    if (r && r !== zero) setRegistry(r);
    if (t && t !== zero) setZkToken(t);
    if (v && v !== zero) setVerifier(v);
    setIsConfigured(r !== zero && t !== zero);
    setMounted(true);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registry || !zkToken || !verifier) return;

    // This saves to localStorage and reloads the page
    setContractAddresses({
      registry: registry.trim(),
      zkToken: zkToken.trim(),
      verifier: verifier.trim(),
    });
  };

  const handleClear = () => {
    localStorage.removeItem('keter_registry_address');
    localStorage.removeItem('keter_zktoken_address');
    localStorage.removeItem('keter_verifier_address');
    setRegistry('');
    setZkToken('');
    setVerifier('');
    setSaved(false);
    setIsConfigured(false);
  };

  const inputClassName =
    'w-full px-3 py-2.5 rounded-lg border border-keter-border-light bg-white font-mono text-sm text-keter-text placeholder:text-keter-text-muted focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors';

  return (
    <div className="min-h-screen bg-keter-bg">
      {/* Header */}
      <nav className="border-b border-keter-border-light bg-white/70 backdrop-blur-xl">
        <div className="flex items-center justify-between max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-keter-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-serif text-sm font-bold">K</span>
            </div>
            <span className="font-serif text-xl text-keter-text">Setup</span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-keter-text-secondary hover:text-keter-text transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Status banner — only rendered after mount to avoid SSR hydration mismatch */}
        {mounted && (isConfigured ? (
          <div className="mb-8 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-emerald-700">Contracts configured</p>
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              The frontend is connected to deployed contracts. Go to the{' '}
              <Link href="/dashboard" className="underline">dashboard</Link> to start using Keter.
            </p>
          </div>
        ) : (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm font-medium text-amber-700">Contracts not configured</p>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Deploy the contracts first, then paste the addresses below.
            </p>
          </div>
        ))}

        {/* Deploy instructions */}
        <div className="mb-8 p-6 rounded-xl bg-white border border-keter-border-light">
          <h2 className="font-serif text-lg text-keter-text mb-3">1. Deploy contracts</h2>
          <p className="text-sm text-keter-text-secondary mb-4">
            Run from the project root:
          </p>
          <div className="bg-keter-bg rounded-lg p-4 font-mono text-xs text-keter-text overflow-x-auto space-y-1">
            <p className="text-keter-text-muted"># Deploy to local or testnet</p>
            <p>forge script script/Deploy.s.sol \</p>
            <p className="pl-4">--rpc-url &lt;RPC_URL&gt; \</p>
            <p className="pl-4">--broadcast \</p>
            <p className="pl-4">--private-key &lt;DEPLOYER_PRIVATE_KEY&gt;</p>
          </div>
          <p className="text-xs text-keter-text-muted mt-3">
            The deployer wallet becomes the <strong>issuer</strong> (bank role). Copy the 3 addresses from the output.
          </p>
        </div>

        {/* Address form */}
        <div className="p-6 rounded-xl bg-white border border-keter-border-light">
          <h2 className="font-serif text-lg text-keter-text mb-1">2. Paste contract addresses</h2>
          <p className="text-sm text-keter-text-secondary mb-6">
            These are saved to localStorage. You can also set them via <code className="text-xs bg-keter-bg px-1 py-0.5 rounded">.env.local</code>.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-keter-text-secondary mb-1.5">
                Registry
              </label>
              <input
                type="text"
                value={registry}
                onChange={(e) => setRegistry(e.target.value)}
                placeholder="0x..."
                required
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-keter-text-secondary mb-1.5">
                KeterToken (ZKToken)
              </label>
              <input
                type="text"
                value={zkToken}
                onChange={(e) => setZkToken(e.target.value)}
                placeholder="0x..."
                required
                className={inputClassName}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-keter-text-secondary mb-1.5">
                HonkVerifier (UltraVerifier)
              </label>
              <input
                type="text"
                value={verifier}
                onChange={(e) => setVerifier(e.target.value)}
                placeholder="0x..."
                required
                className={inputClassName}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!registry || !zkToken || !verifier}
                className="bg-keter-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-keter-accent-hover transition-colors disabled:opacity-50 shadow-sm"
              >
                Save & Reload
              </button>
              {mounted && isConfigured && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm text-keter-text-muted hover:text-red-500 transition-colors"
                >
                  Clear addresses
                </button>
              )}
            </div>
          </form>
        </div>

        {/* What happens next */}
        <div className="mt-8 p-6 rounded-xl bg-white border border-keter-border-light">
          <h2 className="font-serif text-lg text-keter-text mb-3">3. Connect wallet & test</h2>
          <ol className="space-y-3 text-sm text-keter-text-secondary">
            <li className="flex gap-3">
              <span className="text-xs font-mono font-medium text-keter-accent bg-keter-accent/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">1</span>
              <span>Open <Link href="/dashboard" className="text-keter-accent hover:underline">/dashboard</Link> and click <strong>Connect Wallet</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="text-xs font-mono font-medium text-keter-accent bg-keter-accent/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">2</span>
              <span>If connected with the <strong>deployer wallet</strong> you'll see the <strong>Bank Dashboard</strong> (issuer role)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xs font-mono font-medium text-keter-accent bg-keter-accent/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">3</span>
              <span>Any other wallet sees the <strong>Investor Dashboard</strong> with the KYC form</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xs font-mono font-medium text-keter-accent bg-keter-accent/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">4</span>
              <span><strong>Bank flow:</strong> Issue tokens, approve KYC requests (set max amount), publish Merkle root</span>
            </li>
            <li className="flex gap-3">
              <span className="text-xs font-mono font-medium text-keter-accent bg-keter-accent/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">5</span>
              <span><strong>Investor flow:</strong> Submit KYC, then after approval: generate ZK proof & transfer tokens</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
