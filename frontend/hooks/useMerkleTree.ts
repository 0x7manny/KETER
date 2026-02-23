'use client';

import { useState, useEffect, useCallback } from 'react';
import { MerkleTree, createEmptyTree, insertLeaf, getMerklePath, saveTree, loadTree } from '../utils/merkleTree';
import { InvestorCredentials, KYCRequest } from '../utils/credentials';

export const useMerkleTree = () => {
  const [tree, setTree] = useState<MerkleTree | null>(null);
  const [loading, setLoading] = useState(true);

  // Load tree on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        let loaded = loadTree();
        if (!loaded) {
          loaded = await createEmptyTree();
          saveTree(loaded);
        }
        setTree(loaded);
      } catch (err) {
        console.error('Failed to init Merkle tree:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const addLeaf = useCallback(async (
    request: KYCRequest,
    wallet: string,
    maxAmount: string
  ): Promise<InvestorCredentials | null> => {
    if (!tree) return null;
    try {
      const { tree: updatedTree, credentials } = await insertLeaf(tree, request, wallet, maxAmount);
      setTree(updatedTree);
      saveTree(updatedTree);
      return credentials;
    } catch (err) {
      console.error('Failed to insert leaf:', err);
      return null;
    }
  }, [tree]);

  const getProof = useCallback((leafIndex: number) => {
    if (!tree) return null;
    return getMerklePath(tree, leafIndex);
  }, [tree]);

  const getRoot = useCallback((): bigint | null => {
    return tree?.root ?? null;
  }, [tree]);

  const resetTree = useCallback(async () => {
    const newTree = await createEmptyTree();
    setTree(newTree);
    saveTree(newTree);
  }, []);

  const leafCount = tree?.leafData?.length ?? 0;

  return { tree, loading, addLeaf, getProof, getRoot, resetTree, leafCount };
};
