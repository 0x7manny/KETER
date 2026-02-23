'use client';

import { Buffer } from 'buffer';
if (typeof globalThis !== 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
