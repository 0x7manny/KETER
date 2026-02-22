'use client';

let poseidonInstance: any = null;

export const initPoseidon = async () => {
  if (!poseidonInstance) {
    const { buildPoseidon } = await import('circomlibjs');
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
};

export const poseidonHash = async (inputs: bigint[]): Promise<bigint> => {
  const poseidon = await initPoseidon();
  const hash = poseidon(inputs.map(i => poseidon.F.e(i)));
  return BigInt(poseidon.F.toString(hash));
};
