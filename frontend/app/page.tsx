'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import LandingPage from '@/components/landing/LandingPage';

export default function Home() {
  const wallet = useWallet();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = useCallback(async (providerType?: 'metamask' | 'phantom') => {
    setIsConnecting(true);
    await wallet.connect(providerType);
  }, [wallet]);

  const handleConnectSuccess = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  const handleExplore = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <LandingPage
      onConnect={handleConnect}
      onConnectSuccess={handleConnectSuccess}
      onExplore={handleExplore}
      isConnecting={isConnecting}
      walletAddress={wallet.address}
    />
  );
}
