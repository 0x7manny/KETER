'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '../utils/contracts';
import ZKTokenABI from '../abis/ZKToken.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type Role = 'bank' | 'investor' | 'explorer';

export interface WalletState {
  address: string | null;
  role: Role;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWallet = (): WalletState => {
  const [address, setAddress] = useState<string | null>(null);
  const [role, setRole] = useState<Role>('explorer');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectRole = useCallback(async (addr: string, prov: ethers.BrowserProvider) => {
    try {
      const zkToken = new ethers.Contract(CONTRACTS.ZK_TOKEN, ZKTokenABI, prov);
      const isBank = await zkToken.isIssuer(addr);
      setRole(isBank ? 'bank' : 'investor');
    } catch {
      // If contract call fails (wrong network, contract not deployed), default to investor
      setRole('investor');
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const prov = new ethers.BrowserProvider(window.ethereum);
      await prov.send('eth_requestAccounts', []);
      const sign = await prov.getSigner();
      const addr = await sign.getAddress();
      const network = await prov.getNetwork();

      setProvider(prov);
      setSigner(sign);
      setAddress(addr);
      setChainId(Number(network.chainId));

      await detectRole(addr, prov);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [detectRole]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setRole('explorer');
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        // Re-connect with new account
        connect();
      }
    };

    const handleChainChanged = () => {
      // Re-connect on chain change
      connect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [address, connect, disconnect]);

  return { address, role, provider, signer, chainId, isConnecting, error, connect, disconnect };
};
