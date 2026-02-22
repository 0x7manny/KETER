'use client';

import { useState, useRef, useCallback } from 'react';

export interface ProofResult {
  proof: Uint8Array;
  publicInputs: string[];
}

export const useProof = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofStep, setProofStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);
  const backendRef = useRef<any>(null);
  const noirRef = useRef<any>(null);

  const initialize = useCallback(async () => {
    // Dynamic imports for code splitting (these are large WASM modules)
    const { Noir } = await import('@noir-lang/noir_js');
    const { UltraHonkBackend, Barretenberg } = await import('@aztec/bb.js');
    const circuit = await import('../circuit/keter_circuit.json');

    // Create Barretenberg WASM instance first
    const api = await Barretenberg.new();
    const backend = new UltraHonkBackend((circuit as any).bytecode, api);
    const noir = new Noir(circuit as any);

    backendRef.current = backend;
    noirRef.current = noir;
  }, []);

  const generateProof = useCallback(async (inputs: Record<string, any>): Promise<ProofResult> => {
    setIsGenerating(true);
    setError(null);
    setProofStep(1);

    try {
      // Step 1: Initialize if needed
      if (!noirRef.current || !backendRef.current) {
        await initialize();
      }

      // Step 2: Generate witness + proof
      setProofStep(2);
      const { witness } = await noirRef.current.execute(inputs);

      // Step 3: Finalize proof
      setProofStep(3);
      const proof = await backendRef.current.generateProof(witness);

      return proof;
    } catch (err: any) {
      const msg = err?.message || 'Proof generation failed';
      setError(msg);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [initialize]);

  const verifyProof = useCallback(async (proof: any): Promise<boolean> => {
    try {
      if (!backendRef.current) {
        await initialize();
      }
      return await backendRef.current.verifyProof(proof);
    } catch {
      return false;
    }
  }, [initialize]);

  return { generateProof, verifyProof, isGenerating, proofStep, error };
};
