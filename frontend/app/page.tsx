'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import LandingPage from '@/components/landing/LandingPage';

export default function Home() {
  const wallet = useWallet();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await wallet.connect();
      router.push('/dashboard');
    } catch {
      setIsConnecting(false);
    }
  };

  const handleExplore = () => {
    router.push('/dashboard');
  };

  return (
    <LandingPage
      onConnect={handleConnect}
      onExplore={handleExplore}
      isConnecting={isConnecting}
    />
  );
}
