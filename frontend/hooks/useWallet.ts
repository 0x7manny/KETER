'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS } from '../utils/contracts';
import { getApprovedBankAddresses } from '../utils/credentials';
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
  isDeployer: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  connect: (providerType?: 'metamask' | 'phantom') => Promise<void>;
  disconnect: () => void;
}

export const useWallet = (): WalletState => {
  const [address, setAddress] = useState<string | null>(null);
  const [role, setRole] = useState<Role>('explorer');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isDeployer, setIsDeployer] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectRole = useCallback(async (addr: string, prov: ethers.BrowserProvider) => {
    try {
      const zkToken = new ethers.Contract(CONTRACTS.ZK_TOKEN, ZKTokenABI, prov);
      const onChainIssuer = await zkToken.isIssuer(addr);
      if (onChainIssuer) {
        setRole('bank');
        setIsDeployer(true);
        return;
      }
    } catch {
      // Contract call failed — check localStorage fallback
    }
    // Check if approved bank in localStorage
    const approvedBanks = getApprovedBankAddresses();
    if (approvedBanks.includes(addr.toLowerCase())) {
      setRole('bank');
      setIsDeployer(false);
    } else {
      setRole('investor');
      setIsDeployer(false);
    }
  }, []);

  const connect = useCallback(async (providerType?: 'metamask' | 'phantom') => {
    let ethereumProvider: any;

    if (providerType === 'phantom') {
      ethereumProvider = (window as any).phantom?.ethereum;
      if (!ethereumProvider) {
        setError('Phantom is not installed');
        throw new Error('Phantom is not installed');
      }
    } else {
      ethereumProvider = window.ethereum;
      if (!ethereumProvider) {
        setError('MetaMask is not installed');
        throw new Error('MetaMask is not installed');
      }
    }

    setIsConnecting(true);
    setError(null);

    try {
      const prov = new ethers.BrowserProvider(ethereumProvider);
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
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [detectRole]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setRole('explorer');
    setIsDeployer(false);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setError(null);
  }, []);

  // Auto-reconnect: silently check if wallet is already authorized (no popup)
  useEffect(() => {
    const tryReconnect = async () => {
      // Try Phantom first, then MetaMask/default
      const providers = [
        (window as any).phantom?.ethereum,
        window.ethereum,
      ].filter(Boolean);

      for (const ethereumProvider of providers) {
        try {
          const accounts: string[] = await ethereumProvider.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const prov = new ethers.BrowserProvider(ethereumProvider);
            const sign = await prov.getSigner();
            const addr = await sign.getAddress();
            const network = await prov.getNetwork();
            setProvider(prov);
            setSigner(sign);
            setAddress(addr);
            setChainId(Number(network.chainId));
            await detectRole(addr, prov);
            return; // Connected — stop trying
          }
        } catch {
          // Provider not available or failed — try next
        }
      }
    };
    tryReconnect();
  }, [detectRole]);

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

  return { address, role, isDeployer, provider, signer, chainId, isConnecting, error, connect, disconnect };
};
