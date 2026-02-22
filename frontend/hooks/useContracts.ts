'use client';

import { useMemo } from 'react';
import { ethers } from 'ethers';
import { getZKToken, getRegistry } from '../utils/contracts';

export const useContracts = (signerOrProvider: ethers.Signer | ethers.Provider | null) => {
  const zkToken = useMemo(() => {
    if (!signerOrProvider) return null;
    return getZKToken(signerOrProvider);
  }, [signerOrProvider]);

  const registry = useMemo(() => {
    if (!signerOrProvider) return null;
    return getRegistry(signerOrProvider);
  }, [signerOrProvider]);

  return { zkToken, registry };
};
