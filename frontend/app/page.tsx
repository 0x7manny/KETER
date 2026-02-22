'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import LandingPage from '@/components/landing/LandingPage';

export default function Home() {
  const wallet = useWallet();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  // Called by the modal — does the REAL MetaMask connection
  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    await wallet.connect(); // MetaMask popup opens here
    // If wallet.connect() throws, the modal catches it and shows error state
  }, [wallet]);

  // Called AFTER the success animation finishes (2s delay)
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
    />
  );
}
