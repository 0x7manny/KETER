import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getBalance } from '../utils/contracts';

export const useBalance = (provider: ethers.Provider | null, address: string | null) => {
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!provider || !address) return;
    setLoading(true);
    try {
      const bal = await getBalance(provider, address);
      setBalance(bal);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    } finally {
      setLoading(false);
    }
  }, [provider, address]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [refresh]);

  return { balance, loading, refresh };
};
