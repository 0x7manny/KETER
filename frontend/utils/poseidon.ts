'use client';

let poseidonInstance: any = null;

export const initPoseidon = async () => {
  if (!poseidonInstance) {
    const { buildPoseidon } = await import('circomlibjs');
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
};

// Hash 2 inputs (used for chaining: leaf+salt, leafInter+maxAmount, nullifier)
export const poseidonHash = async (inputs: bigint[]): Promise<bigint> => {
  const poseidon = await initPoseidon();
  const hash = poseidon(inputs.map(i => poseidon.F.e(i)));
  return BigInt(poseidon.F.toString(hash));
};

// Alias for clarity — hash exactly 2 Field elements
export const poseidonHash2 = poseidonHash;

// Hash 8 inputs (used for the KYC leaf: name, surname, age, address, wallet, country, type, face)
export const poseidonHash8 = async (inputs: bigint[]): Promise<bigint> => {
  if (inputs.length !== 8) {
    throw new Error(`poseidonHash8 expects exactly 8 inputs, got ${inputs.length}`);
  }
  const poseidon = await initPoseidon();
  const hash = poseidon(inputs.map(i => poseidon.F.e(i)));
  return BigInt(poseidon.F.toString(hash));
};
