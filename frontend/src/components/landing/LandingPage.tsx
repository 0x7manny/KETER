import { useState, useEffect } from 'react';
import AnimatedBackground from './AnimatedBackground';
import ZKFlowDiagram from './ZKFlowDiagram';
import ActivityTicker from './ActivityTicker';
import ScrollReveal from './ScrollReveal';

interface LandingPageProps {
  onConnect: () => void;
  onExplore: () => void;
  isConnecting: boolean;
}

export default function LandingPage({ onConnect, onExplore, isConnecting }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-keter-bg">
      <AnimatedBackground />

      {/* Sticky Navbar with glassmorphism */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/70 backdrop-blur-xl border-b border-keter-border-light shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-keter-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-serif text-sm font-bold">K</span>
            </div>
            <span className="font-serif text-xl text-keter-text">Keter</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onExplore}
              className="text-sm text-keter-text-secondary hover:text-keter-text transition-colors"
            >
              Explorer
            </button>
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="bg-keter-text text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — two columns, more breathing room */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-24 sm:pt-32 pb-28 sm:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
          {/* Left — text (3 cols) */}
          <div className="lg:col-span-3">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-keter-accent-light/60 backdrop-blur-sm text-keter-accent text-xs font-medium px-3.5 py-1.5 rounded-full mb-10 border border-keter-accent/20">
              <span className="w-1.5 h-1.5 bg-keter-accent rounded-full animate-pulse" />
              Built at Hackin'dau 2026 — Paris-Dauphine
            </div>

            {/* Headline */}
            <h1 className="font-serif text-[3.25rem] sm:text-[4rem] lg:text-[4.75rem] text-keter-text leading-[1.05] tracking-tight mb-8">
              Compliance
              <br />
              without{' '}
              <span className="text-keter-accent">compromising</span>
              <br />
              privacy.
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-keter-text-secondary leading-relaxed max-w-lg mb-12">
              Tokenize financial assets with zero-knowledge compliance.
              Investors prove they're authorized without revealing their identity.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onConnect}
                disabled={isConnecting}
                className="bg-keter-accent text-white px-7 py-3.5 rounded-xl text-sm font-medium hover:bg-keter-accent-hover transition-all shadow-lg shadow-keter-accent/20 disabled:opacity-50 hover:shadow-xl hover:shadow-keter-accent/25"
              >
                {isConnecting ? 'Connecting...' : 'Launch App'}
              </button>
              <button
                onClick={onExplore}
                className="group flex items-center gap-2 text-keter-text text-sm font-medium px-7 py-3.5 rounded-xl border border-keter-border hover:border-keter-text-muted transition-all hover:bg-white/50"
              >
                Explore Transactions
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right — ZK flow diagram (2 cols) */}
          <div className="hidden lg:flex lg:col-span-2 justify-center">
            <ZKFlowDiagram />
          </div>
        </div>
      </section>

      {/* Activity ticker */}
      <div className="relative z-10">
        <ActivityTicker />
      </div>

      {/* How it works — 3 columns */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        <ScrollReveal>
          <p className="text-xs font-medium text-keter-text-muted uppercase tracking-widest mb-4">
            How it works
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-keter-text mb-14">
            Three steps to private compliance
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <ScrollReveal delay={0}>
            <div className="group">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-medium text-keter-accent bg-keter-accent-light w-7 h-7 rounded-lg flex items-center justify-center">01</span>
                <div className="h-px flex-1 bg-keter-border-light" />
              </div>
              <h3 className="font-serif text-xl text-keter-text mb-3">Bank verifies KYC</h3>
              <p className="text-sm text-keter-text-secondary leading-relaxed">
                The issuing bank reviews investor credentials and adds them to a Merkle tree.
                A cryptographic commitment is published on-chain — no personal data exposed.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="group">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-medium text-keter-accent bg-keter-accent-light w-7 h-7 rounded-lg flex items-center justify-center">02</span>
                <div className="h-px flex-1 bg-keter-border-light" />
              </div>
              <h3 className="font-serif text-xl text-keter-text mb-3">Investor generates ZK proof</h3>
              <p className="text-sm text-keter-text-secondary leading-relaxed">
                When transferring tokens, a zero-knowledge proof is generated in the browser.
                It proves Merkle tree membership without revealing identity, country, or KYC status.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="group">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono font-medium text-keter-accent bg-keter-accent-light w-7 h-7 rounded-lg flex items-center justify-center">03</span>
                <div className="h-px flex-1 bg-keter-border-light" />
              </div>
              <h3 className="font-serif text-xl text-keter-text mb-3">Public verifies on-chain</h3>
              <p className="text-sm text-keter-text-secondary leading-relaxed">
                Anyone can verify that every transfer is compliant — the proof is checked on-chain.
                But no one can see who is on the whitelist or why they're authorized.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Comparison: ERC-3643 vs Keter */}
      <ScrollReveal className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div>
          <p className="text-xs font-medium text-keter-text-muted uppercase tracking-widest mb-4">
            Why Keter
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-keter-text mb-12">
            Traditional compliance <span className="text-keter-text-muted">vs</span> Keter
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ERC-3643 / Traditional */}
            <div className="bg-white border border-keter-border-light rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 bg-keter-text-muted rounded-full" />
                <h3 className="font-serif text-lg text-keter-text-secondary">ERC-3643 / Traditional</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { label: 'Whitelist', value: 'Public on-chain', bad: true },
                  { label: 'Investor identity', value: 'Visible to everyone', bad: true },
                  { label: 'KYC provider', value: 'Single point of trust', bad: true },
                  { label: 'Compliance check', value: 'Centralized oracle', bad: true },
                  { label: 'Privacy', value: 'None', bad: true },
                ].map((row) => (
                  <li key={row.label} className="flex items-start justify-between gap-4">
                    <span className="text-sm text-keter-text-secondary">{row.label}</span>
                    <span className="text-sm font-medium text-keter-text-muted flex items-center gap-1.5 shrink-0">
                      <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Keter */}
            <div className="bg-white border-2 border-keter-accent/30 rounded-2xl p-8 shadow-lg shadow-keter-accent/5">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 bg-keter-accent rounded-full animate-pulse" />
                <h3 className="font-serif text-lg text-keter-text">Keter Protocol</h3>
                <span className="ml-auto text-[10px] font-medium bg-keter-accent-light text-keter-accent px-2 py-0.5 rounded-full">
                  ZK-powered
                </span>
              </div>
              <ul className="space-y-4">
                {[
                  { label: 'Whitelist', value: 'Hidden in Merkle tree' },
                  { label: 'Investor identity', value: 'Never exposed' },
                  { label: 'KYC provider', value: 'Decentralized proofs' },
                  { label: 'Compliance check', value: 'On-chain ZK verification' },
                  { label: 'Privacy', value: 'Full — zero-knowledge' },
                ].map((row) => (
                  <li key={row.label} className="flex items-start justify-between gap-4">
                    <span className="text-sm text-keter-text-secondary">{row.label}</span>
                    <span className="text-sm font-medium text-keter-accent flex items-center gap-1.5 shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Quote / Value prop */}
      <ScrollReveal className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="bg-white border border-keter-border-light rounded-2xl p-10 sm:p-14 shadow-card">
          <blockquote className="font-serif text-2xl sm:text-3xl text-keter-text leading-snug max-w-3xl">
            "Today, tokenizing a financial asset means choosing between compliance and privacy.
            <span className="text-keter-accent"> With Keter, you no longer have to choose.</span>"
          </blockquote>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-8 h-8 bg-keter-accent rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <div>
              <p className="text-sm font-medium text-keter-text">Keter Protocol</p>
              <p className="text-xs text-keter-text-muted">ZK-powered Security Tokens</p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Tech stack badges */}
      <ScrollReveal className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <p className="text-xs font-medium text-keter-text-muted uppercase tracking-widest mb-6 text-center">
          Built with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['Ethereum', 'Noir ZK', 'Poseidon Hash', 'Solidity', 'React', 'Alephium'].map(tech => (
            <span
              key={tech}
              className="px-4 py-2 bg-white border border-keter-border-light rounded-full text-xs text-keter-text-secondary font-medium hover:border-keter-text-muted transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </ScrollReveal>

      {/* Footer */}
      <footer className="relative z-10 border-t border-keter-border-light">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-xs text-keter-text-muted">
            <span className="font-serif">Keter</span> · Hackin'dau 2026
          </p>
          <p className="text-xs text-keter-text-muted">Paris-Dauphine</p>
        </div>
      </footer>
    </div>
  );
}
