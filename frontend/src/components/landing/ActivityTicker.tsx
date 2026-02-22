import { useEffect, useState, useRef } from 'react';

const MOCK_EVENTS = [
  { type: 'transfer', from: '0xA3f1...8d2E', to: '0xB7c4...1aF9', amount: '500', time: '2s ago' },
  { type: 'verified', addr: '0xD9e2...3cB1', time: '5s ago' },
  { type: 'transfer', from: '0xC5a8...7eD3', to: '0xE1b6...4fA2', amount: '1,200', time: '8s ago' },
  { type: 'mint', to: '0xF4d7...9bC6', amount: '10,000', time: '12s ago' },
  { type: 'verified', addr: '0x8a2E...5dF7', time: '15s ago' },
  { type: 'transfer', from: '0x1cB9...6eA4', to: '0x3fD2...8aC5', amount: '750', time: '18s ago' },
  { type: 'root', hash: '0x7f3a...9d2c', time: '22s ago' },
  { type: 'transfer', from: '0x6eF1...2bD8', to: '0x9aC3...4fE7', amount: '2,500', time: '25s ago' },
  { type: 'verified', addr: '0xB4d5...7cA1', time: '30s ago' },
  { type: 'mint', to: '0x2aE8...1dC6', amount: '5,000', time: '35s ago' },
];

function EventBadge({ event }: { event: typeof MOCK_EVENTS[0] }) {
  if (event.type === 'transfer') {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="w-1.5 h-1.5 bg-keter-accent rounded-full" />
        <span className="font-mono text-keter-text-secondary">{event.from}</span>
        <span className="text-keter-text-muted">→</span>
        <span className="font-mono text-keter-text-secondary">{event.to}</span>
        <span className="font-medium text-keter-text">{event.amount} KETER</span>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200">
          ZK ✓
        </span>
      </span>
    );
  }
  if (event.type === 'verified') {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
        <span className="text-keter-text-secondary">Investor</span>
        <span className="font-mono text-keter-text-secondary">{event.addr}</span>
        <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-200">
          KYC Approved
        </span>
      </span>
    );
  }
  if (event.type === 'mint') {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
        <span className="text-keter-text-secondary">Minted</span>
        <span className="font-medium text-keter-text">{event.amount} KETER</span>
        <span className="text-keter-text-muted">→</span>
        <span className="font-mono text-keter-text-secondary">{event.to}</span>
      </span>
    );
  }
  if (event.type === 'root') {
    return (
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
        <span className="text-keter-text-secondary">Merkle root updated</span>
        <span className="font-mono text-keter-text-muted">{event.hash}</span>
      </span>
    );
  }
  return null;
}

export default function ActivityTicker() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev + 0.5);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  // Double the events for seamless loop
  const doubled = [...MOCK_EVENTS, ...MOCK_EVENTS];

  return (
    <div className="relative overflow-hidden py-4 border-y border-keter-border-light bg-white/50 backdrop-blur-sm">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-keter-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-keter-bg to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex items-center gap-8 text-xs"
        style={{
          transform: `translateX(-${offset % (MOCK_EVENTS.length * 350)}px)`,
          width: 'max-content',
        }}
      >
        {doubled.map((event, i) => (
          <EventBadge key={i} event={event} />
        ))}
      </div>
    </div>
  );
}
