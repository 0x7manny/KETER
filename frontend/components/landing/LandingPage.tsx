'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import Link from 'next/link';

interface LandingPageProps {
  onConnect: (providerType?: 'metamask' | 'phantom') => Promise<void>;
  onConnectSuccess: () => void;
  onExplore: () => void;
  isConnecting: boolean;
  walletAddress?: string | null;
}

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

function Reveal({ children, delay = 0, y = 50, style = {} }: { children: ReactNode; delay?: number; y?: number; style?: React.CSSProperties }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{ ...style, transition: `opacity 1s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 1s cubic-bezier(.16,1,.3,1) ${delay}ms`, opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : `translateY(${y}px)` }}>{children}</div>
  );
}

function RevealScale({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [ref, vis] = useReveal();
  return (
    <div ref={ref} style={{ transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`, opacity: vis ? 1 : 0, transform: vis ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)' }}>{children}</div>
  );
}

function RevealLine() {
  const [ref, vis] = useReveal();
  return <div ref={ref} style={{ height: 1, background: '#e0e0dd', transition: 'transform 1.2s cubic-bezier(.16,1,.3,1)', transform: vis ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left' }} />;
}

function useParallax(speed = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const fn = () => { if (!ref.current) return; const rect = ref.current.getBoundingClientRect(); setOffset((window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed); };
    window.addEventListener('scroll', fn, { passive: true }); fn();
    return () => window.removeEventListener('scroll', fn);
  }, [speed]);
  return [ref, offset] as const;
}

function ConnectSpinner() {
  return (
    <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 28px' }}>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ animation: 'spinSlow 2s linear infinite', position: 'absolute' }}>
        <circle cx="36" cy="36" r="32" fill="none" stroke="#e8e8e5" strokeWidth="2" />
        <circle cx="36" cy="36" r="32" fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="60 140" strokeLinecap="round" />
      </svg>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ animation: 'spinReverse 1.4s linear infinite', position: 'absolute' }}>
        <circle cx="36" cy="36" r="22" fill="none" stroke="rgba(5,150,105,0.12)" strokeWidth="1.5" />
        <circle cx="36" cy="36" r="22" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="30 110" strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 10, height: 10, borderRadius: '50%', background: '#059669', animation: 'pulse 1.2s ease-in-out infinite' }} />
    </div>
  );
}

function AnimatedCheck() {
  return (
    <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px' }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="#dcfce7" strokeWidth="3" strokeDasharray="226" strokeDashoffset="226" style={{ animation: 'ringDraw 0.5s ease forwards' }} />
        <circle cx="40" cy="40" r="36" fill="none" stroke="#059669" strokeWidth="3" strokeDasharray="226" strokeDashoffset="226" style={{ animation: 'ringDraw 0.6s ease 0.15s forwards' }} />
        <polyline points="26,42 36,52 56,30" fill="none" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="50" style={{ animation: 'checkDraw 0.4s ease 0.6s forwards' }} />
      </svg>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 5, height: 5, borderRadius: '50%', background: i % 2 === 0 ? '#059669' : '#a7f3d0', opacity: 0, animation: `burst 0.7s ease ${0.6 + i * 0.04}s forwards`, transform: `rotate(${i * 45}deg) translateX(0)` }} />
      ))}
    </div>
  );
}

function StepDots({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i <= step ? '#059669' : '#e8e8e5', transition: 'all 0.5s cubic-bezier(.16,1,.3,1)' }} />
      ))}
    </div>
  );
}

// ═══ WALLET MODAL — MetaMask ONLY ═══
function WalletModal({ open, onClose, onConnect, onConnectSuccess }: { open: boolean; onClose: () => void; onConnect: (providerType?: 'metamask' | 'phantom') => Promise<void>; onConnectSuccess: () => void }) {
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<'metamask' | 'phantom'>('metamask');

  useEffect(() => { if (!open) { setStep(0); setErrorMsg(''); } }, [open]);
  if (!open) return null;

  const walletName = selectedWallet === 'phantom' ? 'Phantom' : 'MetaMask';

  const handleWallet = async (providerType: 'metamask' | 'phantom') => {
    setSelectedWallet(providerType);
    setStep(1);
    try {
      await onConnect(providerType);
      setStep(2);
      setTimeout(() => onConnectSuccess(), 2200);
    } catch (err) {
      setStep(3);
      setErrorMsg(err instanceof Error ? err.message : 'Connection rejected');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.25s ease' }} onClick={() => { if (step === 0) onClose(); }}>
      <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(6px)', background: step === 2 ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.35)', transition: 'background 0.6s ease' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: '#fff', borderRadius: 24, padding: '40px 36px', width: 420, maxWidth: '90vw', boxShadow: step === 2 ? '0 32px 80px rgba(5,150,105,0.15)' : '0 32px 80px rgba(0,0,0,0.12)', animation: 'modalIn 0.35s cubic-bezier(.16,1,.3,1)', overflow: 'hidden', transition: 'box-shadow 0.5s ease' }}>

        {step === 0 && <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: '#f5f5f3', border: 'none', fontSize: 16, color: '#888', cursor: 'pointer', width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>✕</button>}

        <StepDots step={step} />

        {step === 0 && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 26, color: '#111', marginBottom: 6, textAlign: 'center' }}>Connect Wallet</h3>
            <p style={{ fontSize: 14, color: '#999', marginBottom: 28, textAlign: 'center' }}>Choose a wallet to access Keter Protocol.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => handleWallet('metamask')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, border: '2px solid #eee', background: '#fff', cursor: 'pointer', width: '100%', transition: 'all 0.2s', fontFamily: 'var(--f-body)', animation: 'walletSlideIn 0.35s cubic-bezier(.16,1,.3,1) backwards' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.background = '#f0fdf4'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.background = '#fff'; }}>
                <div style={{ textAlign: 'left' }}><span style={{ fontSize: 16, fontWeight: 600, color: '#111', display: 'block' }}>MetaMask</span><span style={{ fontSize: 12, color: '#999' }}>Browser Extension</span></div>
              </button>
              <button onClick={() => handleWallet('phantom')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, border: '2px solid #eee', background: '#fff', cursor: 'pointer', width: '100%', transition: 'all 0.2s', fontFamily: 'var(--f-body)', animation: 'walletSlideIn 0.35s cubic-bezier(.16,1,.3,1) 0.06s backwards' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#AB9FF2'; e.currentTarget.style.background = '#f5f3ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.background = '#fff'; }}>
                <div style={{ textAlign: 'left' }}><span style={{ fontSize: 16, fontWeight: 600, color: '#111', display: 'block' }}>Phantom</span><span style={{ fontSize: 12, color: '#999' }}>Multi-Chain Wallet</span></div>
              </button>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0ee' }}>
              <p style={{ fontSize: 11, color: '#bbb', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12, fontFamily: 'var(--f-mono)' }}>Coming soon</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['WalletConnect', 'Coinbase', 'Rabby'].map(n => (
                  <div key={n} style={{ padding: '8px 14px', borderRadius: 10, background: '#fafaf8', border: '1px solid #eee', fontSize: 12, color: '#ccc', fontWeight: 500, cursor: 'not-allowed' }}>{n}</div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#ccc', marginTop: 24, textAlign: 'center' }}>By connecting, you agree to Keter&apos;s Terms of Service.</p>
          </div>
        )}

        {step === 1 && (
          <div style={{ textAlign: 'center', padding: '16px 0 8px', animation: 'fadeIn 0.5s ease' }}>
            <ConnectSpinner />
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 22, color: '#111', marginBottom: 10 }}>Waiting for {walletName}</h3>
            <p style={{ fontSize: 13, color: '#999', fontFamily: 'var(--f-mono)' }}>Approve the connection in your wallet...</p>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '16px 0 8px', animation: 'successIn 0.6s cubic-bezier(.16,1,.3,1)' }}>
            <AnimatedCheck />
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 26, color: '#111', marginBottom: 10, animation: 'fadeIn 0.5s ease 0.4s backwards' }}>Connected</h3>
            <p style={{ fontSize: 14, color: '#059669', fontWeight: 500, animation: 'fadeIn 0.5s ease 0.6s backwards' }}>Welcome to Keter Protocol</p>
            <div style={{ marginTop: 20, padding: '10px 20px', borderRadius: 10, background: '#f0fdf4', display: 'inline-flex', alignItems: 'center', gap: 8, animation: 'fadeIn 0.4s ease 0.8s backwards' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
              <span style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: '#059669' }}>Wallet connected</span>
            </div>
            <p style={{ fontSize: 12, color: '#bbb', marginTop: 20, animation: 'fadeIn 0.4s ease 1s backwards' }}>Redirecting to dashboard...</p>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '16px 0 8px', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 22, color: '#111', marginBottom: 8 }}>Connection Failed</h3>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 24 }}>{errorMsg}</p>
            <button onClick={() => { setStep(0); setErrorMsg(''); }} style={{ padding: '11px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-body)' }}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ Feature Tabs ═══
function FeatureTabs() {
  const [active, setActive] = useState(0);
  const features = [
    { tab: 'Merkle Privacy', n: '01', title: <>M<em>erk</em>le Pr<em>iva</em>cy</>, body: <><strong>Investor identities are committed to a Merkle tree — only a cryptographic root lives on-chain.</strong> No addresses, no names, no public whitelists.</> },
    { tab: 'Client-Side ZK', n: '02', title: <>Cl<em>ient</em>-S<em>ide</em> Pr<em>oo</em>fs</>, body: <><strong>Keep sensitive KYC data where it belongs — on the user&apos;s machine.</strong> Proofs generated client-side using Noir. Data stays private.</> },
    { tab: 'Composable Compliance', n: '03', title: <>Com<em>pos</em>able Com<em>pli</em>ance</>, body: <><strong>Modular compliance rules that compose without exposing information.</strong> Jurisdiction checks, transfer limits, investor caps — all cryptographic.</> },
    { tab: 'On-Chain Verification', n: '04', title: <>On-Ch<em>ain</em> Ver<em>ifi</em>ca<em>tion</em></>, body: <><strong>Don&apos;t trust — verify the proof.</strong> Every transfer includes a ZK proof verified by a Solidity contract on-chain.</> },
  ];
  const f = features[active];
  return (
    <section style={{ background: '#f7f7f5', borderTop: '1px solid #e8e8e5' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '140px 40px' }}>
        <Reveal>
          <p style={{ fontSize: 15, color: '#999', marginBottom: 8 }}>Keter is the protocol that</p>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 400, color: '#111', lineHeight: 1.05, letterSpacing: -2, marginBottom: 80 }}>Ma<em>ste</em>red the <em>Com</em>pli<em>ance</em> Pro<em>blem</em></h2>
        </Reveal>
        <Reveal delay={120}>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, position: 'relative' }}>
            <div style={{ borderRight: '1px solid #e0e0dd' }}>
              {features.map((feat, i) => (
                <button key={i} onClick={() => setActive(i)} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '22px 28px 22px 0', background: 'none', border: 'none', cursor: 'pointer', borderBottom: i < 3 ? '1px solid #eee' : 'none', transition: 'opacity 0.3s', opacity: i === active ? 1 : 0.3 }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 600, color: i === active ? '#059669' : '#ccc', minWidth: 28 }}>{feat.n}</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#111', textAlign: 'left' as const }}>{feat.tab}</span>
                </button>
              ))}
            </div>
            <div key={active} style={{ padding: '0 0 0 60px', animation: 'fadeIn 0.4s ease' }}>
              <p style={{ fontSize: 12, fontFamily: 'var(--f-mono)', color: '#059669', textTransform: 'uppercase' as const, letterSpacing: 3, marginBottom: 20, fontWeight: 600 }}>Now it&apos;s native</p>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, color: '#111', lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 24 }}>{f.title}</h3>
              <p style={{ fontSize: 16, lineHeight: 1.75, color: '#666', maxWidth: 500, marginBottom: 36 }}>{f.body}</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/docs/architecture" style={{ padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: '#059669', color: '#fff', textDecoration: 'none' }}>Get Started</Link>
                <Link href="/docs/flow" style={{ padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500, background: 'transparent', color: '#555', textDecoration: 'none', border: '1px solid #ddd' }}>The Basics</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ═══ MAIN ═══
export default function LandingPage({ onConnect, onConnectSuccess, onExplore, isConnecting, walletAddress }: LandingPageProps) {
  const [walletOpen, setWalletOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroRef, heroOffset] = useParallax(0.12);
  const [problemRef, problemOffset] = useParallax(0.08);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ background: '#fff', color: '#111', minHeight: '100vh', fontFamily: 'var(--f-body)' }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        :root { --f-display: 'Instrument Serif', Georgia, serif; --f-body: 'Outfit', -apple-system, sans-serif; --f-mono: 'JetBrains Mono', monospace; }
        em { font-style: italic; } ::selection { background: rgba(5,150,105,0.2); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spinReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; transform: translate(-50%,-50%) scale(1); } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.5); } }
        @keyframes ringDraw { to { stroke-dashoffset: 0; } }
        @keyframes checkDraw { to { stroke-dashoffset: 0; } }
        @keyframes burst { 0% { opacity: 1; transform: rotate(var(--r)) translateX(0); } 100% { opacity: 0; transform: rotate(var(--r)) translateX(44px); } }
        @keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes walletSlideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes successIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} onConnect={onConnect} onConnectSuccess={onConnectSuccess} />

      {/* NAVBAR */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, transition: 'all 0.35s', background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 400, color: '#111', letterSpacing: -0.5 }}>Keter</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link href="/docs/architecture" style={{ fontSize: 14, color: '#777', textDecoration: 'none', padding: '8px 16px', borderRadius: 8 }}>Docs</Link>
            <Link href="/docs/circuit" style={{ fontSize: 14, color: '#777', textDecoration: 'none', padding: '8px 16px', borderRadius: 8 }}>Circuit</Link>
            <Link href="/docs/contracts" style={{ fontSize: 14, color: '#777', textDecoration: 'none', padding: '8px 16px', borderRadius: 8 }}>Contracts</Link>
            <button onClick={onExplore} style={{ fontSize: 14, color: '#777', background: 'none', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--f-body)' }}>Explorer</button>
          </div>
          {walletAddress ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} />
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: '#555' }}>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          ) : (
            <button onClick={() => setWalletOpen(true)} disabled={isConnecting} style={{ background: '#059669', color: '#fff', border: 'none', padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f-body)', opacity: isConnecting ? 0.6 : 1 }}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1440, margin: '0 auto', padding: '120px 48px 180px', overflow: 'hidden' }}>
        <div ref={heroRef} style={{ transform: `translateY(${heroOffset}px)`, transition: 'transform 0.05s linear' }}>
          <Reveal><p style={{ fontSize: 15, color: '#aaa', marginBottom: 24 }}>You are now entering</p></Reveal>
          <Reveal delay={80}>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(48px, 8vw, 140px)', fontWeight: 400, lineHeight: 0.9, letterSpacing: -4, color: '#111', marginBottom: 56, maxWidth: '100%', whiteSpace: 'nowrap' }}>
              <em>Th</em>e Next Com<em>pli</em>a<em>nce</em> <em>Era</em>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: '#777', maxWidth: 520, marginBottom: 44 }}>
              <strong style={{ color: '#222', fontWeight: 600 }}>Powered by Keter</strong>—the zero-knowledge protocol enabling privacy-preserving compliance for tokenized financial assets.
            </p>
          </Reveal>
          <Reveal delay={280}>
            <div style={{ display: 'flex', gap: 14 }}>
              <button onClick={() => setWalletOpen(true)} disabled={isConnecting} style={{ padding: '14px 34px', borderRadius: 10, fontSize: 15, fontWeight: 600, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-body)' }}>Launch App</button>
              <button onClick={onExplore} style={{ padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 500, background: 'transparent', color: '#555', border: '1px solid #ddd', cursor: 'pointer', fontFamily: 'var(--f-body)' }}>Explore Transactions</button>
            </div>
          </Reveal>
        </div>
      </section>

      <RevealLine />

      {/* PROBLEM */}
      <section style={{ background: '#fff' }}>
        <div ref={problemRef} style={{ maxWidth: 1280, margin: '0 auto', padding: '140px 40px', transform: `translateY(${problemOffset}px)`, transition: 'transform 0.05s linear' }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 400, color: '#111', lineHeight: 1.05, letterSpacing: -2, marginBottom: 80 }}>
              <em>Com</em>plia<em>nce</em>–{' '}it&apos;s a <em>Pro</em>b<em>lem</em>
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '60px 100px' }}>
            {[
              { hook: 'We need it.', body: 'Enforced transparency is holding security tokens back. Without end-to-end privacy, institutional assets and serious players will never fully come on-chain.' },
              { hook: "We don't have it.", body: "Today's compliance is a privacy nightmare. Public whitelists, centralized oracles, and on-chain KYC registries expose every investor." },
              { hook: 'It needs to be verifiable.', body: "Privacy can't mean opacity. Regulators need mathematical guarantees that every transfer is compliant — without accessing personal data." },
              { hook: 'It needs to be practical.', body: 'Compliance has to work for real institutions: fast proof generation, affordable on-chain verification, compatible with banking KYC workflows.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 120}>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 26, fontWeight: 400, color: '#111', marginBottom: 14 }}>{item.hook}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: '#999' }}><strong style={{ color: '#444', fontWeight: 500 }}>{item.body.split('.')[0]}.</strong> {item.body.split('.').slice(1).join('.').trim()}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <RevealLine />
      <FeatureTabs />
      <RevealLine />

      {/* STATS */}
      <section style={{ background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '120px 40px' }}>
          <Reveal>
            <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 400, color: '#111', letterSpacing: -1.5, marginBottom: 72, textAlign: 'center' }}>
              K<em>eter</em> is <em>A</em>li<em>ve</em>—<em>a</em>nd <em>Qu</em>ite <em>We</em>ll.
            </h3>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, textAlign: 'center' }}>
            {[{ label: 'Proof Generation', value: '< 2s' }, { label: 'Verification Cost', value: '~$0.12' }, { label: 'Privacy Level', value: '100%' }].map((s, i) => (
              <Reveal key={i} delay={i * 150}>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(44px, 6vw, 80px)', fontWeight: 400, color: '#111', letterSpacing: -3, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 14, color: '#bbb', marginTop: 14 }}>{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <RevealLine />

      {/* USE CASES */}
      <section style={{ background: '#f7f7f5', borderTop: '1px solid #e8e8e5' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '140px 40px' }}>
          <Reveal>
            <p style={{ fontSize: 15, color: '#999', marginBottom: 8 }}>Feast your eyes on</p>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, color: '#111', lineHeight: 1.05, letterSpacing: -2, marginBottom: 64 }}>
              <em>Un</em>prece<em>d</em>ented <em>Use</em> Ca<em>ses</em>
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { name: 'Security Token Transfers', type: 'Core', desc: 'Transfer MiCA-compliant security tokens with ZK proofs — no public whitelist, no exposed identities.' },
              { name: 'Private KYC Verification', type: 'Identity', desc: 'Banks verify credentials off-chain and commit to a Merkle tree — compliance without revealing data.' },
              { name: 'Institutional Tokenization', type: 'RWA', desc: 'Tokenize real-world assets with built-in compliance. Jurisdiction checks, investor caps — all ZK.' },
              { name: 'Cross-Border Compliance', type: 'Regulation', desc: 'Prove EU jurisdiction compliance across borders without exposing nationality or residency.' },
              { name: 'On-Chain Audit Trail', type: 'Transparency', desc: 'Every transfer verifiable on-chain. Auditors confirm compliance without accessing personal data.' },
              { name: 'GDPR-Compatible DeFi', type: 'Privacy', desc: 'Reconciles GDPR data minimization with blockchain transparency. No personal data on-chain.' },
            ].map((c, i) => (
              <RevealScale key={i} delay={i * 80}>
                <div style={{ background: '#fff', border: '1px solid #e8e8e5', borderRadius: 16, padding: '28px 24px', transition: 'all 0.3s ease', height: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(5,150,105,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e5'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: '#111' }}>{c.name}</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: '#059669', background: '#ecfdf5', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{c.type}</span>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: '#999' }}>{c.desc}</p>
                </div>
              </RevealScale>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section style={{ borderTop: '1px solid #e8e8e5', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '140px 40px' }}>
          <Reveal>
            <p style={{ fontSize: 15, color: '#999', marginBottom: 8 }}>Why Keter</p>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, color: '#111', lineHeight: 1.05, letterSpacing: -2, marginBottom: 72 }}>Tra<em>diti</em>onal <span style={{ color: '#ccc' }}>vs</span> K<em>eter</em></h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Reveal>
              <div style={{ background: '#fafaf8', border: '1px solid #e8e8e5', borderRadius: 20, padding: '40px 36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ccc' }} /><span style={{ fontFamily: 'var(--f-display)', fontSize: 20, color: '#999' }}>ERC-3643 / Traditional</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                  {[['Whitelist','Public on-chain'],['Investor identity','Visible to everyone'],['KYC provider','Single point of trust'],['Compliance check','Centralized oracle'],['Proof system','None'],['Privacy','None']].map(([k,v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 14, color: '#999' }}>{k}</span><span style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: '#ef4444', fontWeight: 500 }}>✕ {v}</span></div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div style={{ background: '#f0fdf4', border: '2px solid #059669', borderRadius: 20, padding: '40px 36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669' }} /><span style={{ fontFamily: 'var(--f-display)', fontSize: 20, color: '#111' }}>Keter Protocol</span><span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'var(--f-mono)', color: '#059669', background: '#dcfce7', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>ZK-POWERED</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                  {[['Whitelist','Hidden in Merkle tree'],['Investor identity','Never exposed'],['KYC provider','Decentralized proofs'],['Compliance check','On-chain ZK verification'],['Proof system','Noir + UltraPlonk'],['Privacy','Full — zero-knowledge']].map(([k,v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 14, color: '#555' }}>{k}</span><span style={{ fontSize: 13, fontFamily: 'var(--f-mono)', color: '#059669', fontWeight: 600 }}>✓ {v}</span></div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#f7f7f5', borderTop: '1px solid #e8e8e5', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '140px 40px' }}>
          <Reveal>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 400, color: '#111', lineHeight: 1.05, letterSpacing: -2, marginBottom: 20 }}>B<em>uild</em> the f<em>utu</em>re<br/>on K<em>eter</em></h2>
            <p style={{ fontSize: 17, color: '#999', marginBottom: 40, lineHeight: 1.6 }}>Start building privacy-preserving financial infrastructure today.</p>
            <button onClick={() => setWalletOpen(true)} disabled={isConnecting} style={{ padding: '15px 40px', borderRadius: 12, fontSize: 16, fontWeight: 600, background: '#059669', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--f-body)' }}>Get Started</button>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #e8e8e5', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 40px 40px' }}>
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 48, marginBottom: 64 }}>
              <div>
                <p style={{ fontFamily: 'var(--f-display)', fontSize: 24, color: '#111', marginBottom: 20 }}>Keter</p>
                <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 400, color: '#444', lineHeight: 1.3, marginBottom: 28 }}>Build the future with Keter</h3>
              </div>
              {[
                { title: 'Build', links: [{ l: 'Documentation', h: '/docs/architecture' }, { l: 'ZK Circuit', h: '/docs/circuit' }, { l: 'Smart Contracts', h: '/docs/contracts' }] },
                { title: 'Learn', links: [{ l: 'Protocol Flow', h: '/docs/flow' }, { l: 'Architecture', h: '/docs/architecture' }] },
                { title: 'Participate', links: [{ l: 'Explorer', h: '/dashboard' }] },
              ].map(col => (
                <div key={col.title}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#444', marginBottom: 20 }}>{col.title}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {col.links.map(lnk => (<Link key={lnk.l} href={lnk.h} style={{ fontSize: 14, color: '#aaa', textDecoration: 'none' }}>{lnk.l}</Link>))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <div style={{ borderTop: '1px solid #eee', paddingTop: 24, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#ccc' }}>© 2026 Keter Protocol · Hackin&apos;dau Paris-Dauphine</span>
            <span style={{ fontSize: 12, color: '#ccc' }}>Paris-Dauphine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
