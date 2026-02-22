'use client';

import { ethers } from 'ethers';
import ZKTokenABI from '../abis/ZKToken.json';
import RegistryABI from '../abis/Registry.json';

const getStoredAddress = (key: string): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key) || '';
  }
  return '';
};

export const CONTRACTS = {
  get REGISTRY() { return process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || getStoredAddress('keter_registry_address') || '0x0000000000000000000000000000000000000000'; },
  get ZK_TOKEN() { return process.env.NEXT_PUBLIC_ZKTOKEN_ADDRESS || getStoredAddress('keter_zktoken_address') || '0x0000000000000000000000000000000000000000'; },
  get VERIFIER() { return process.env.NEXT_PUBLIC_VERIFIER_ADDRESS || getStoredAddress('keter_verifier_address') || '0x0000000000000000000000000000000000000000'; },
};

// Save contract addresses to localStorage (for hackathon flexibility)
export const setContractAddresses = (addresses: { registry?: string; zkToken?: string; verifier?: string }) => {
  if (addresses.registry) localStorage.setItem('keter_registry_address', addresses.registry);
  if (addresses.zkToken) localStorage.setItem('keter_zktoken_address', addresses.zkToken);
  if (addresses.verifier) localStorage.setItem('keter_verifier_address', addresses.verifier);
  // Reload to pick up new addresses
  window.location.reload();
};

export const getZKToken = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACTS.ZK_TOKEN, ZKTokenABI, signerOrProvider);
};

export const getRegistry = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACTS.REGISTRY, RegistryABI, signerOrProvider);
};

// === BANK ACTIONS ===
export const issueTokens = async (signer: ethers.Signer, to: string, amount: number) => {
  const token = getZKToken(signer);
  // Raw integer amount (no decimals) — circuit uses u64, so amounts must stay raw
  const tx = await token.issue(to, BigInt(amount), '0x');
  await tx.wait();
  return tx;
};

export const publishMerkleRoot = async (signer: ethers.Signer, root: bigint) => {
  const registry = getRegistry(signer);
  const rootHex = '0x' + root.toString(16).padStart(64, '0');
  const tx = await registry.setMerkleRoot(rootHex);
  await tx.wait();
  return tx;
};

// === INVESTOR ACTIONS ===
export const getBalance = async (provider: ethers.Provider, address: string): Promise<bigint> => {
  const token = getZKToken(provider);
  return await token.balanceOf(address);
};

export const transferWithProof = async (
  signer: ethers.Signer,
  to: string,
  amount: number,
  proof: Uint8Array,
  publicInputs: string[]
) => {
  const token = getZKToken(signer);
  const pubInputsBytes32 = publicInputs.map(
    input => '0x' + BigInt(input).toString(16).padStart(64, '0')
  );
  const rawAmount = BigInt(amount);

  // Pre-flight: check proof length matches on-chain verifier expectation (258 field elements for LOG_N=14)
  const EXPECTED_PROOF_BYTES = 258 * 32; // 8256 bytes
  if (proof.length !== EXPECTED_PROOF_BYTES) {
    throw new Error(
      `Proof length mismatch: got ${proof.length} bytes, expected ${EXPECTED_PROOF_BYTES}. ` +
      `bb.js version may be incompatible with the deployed verifier.`
    );
  }

  // Dry-run via raw provider.call with high gas limit (Honk verifier needs ~5-10M gas)
  const from = await signer.getAddress();
  const calldata = token.interface.encodeFunctionData('transferWithProof', [
    to, rawAmount, proof, pubInputsBytes32,
  ]);
  try {
    await signer.provider!.call({
      to: CONTRACTS.ZK_TOKEN,
      data: calldata,
      from,
      gasLimit: 30_000_000n,
    });
  } catch (staticErr: any) {
    const reason = staticErr?.reason || staticErr?.revert?.args?.[0] || '';
    // Try to decode verifier custom errors from raw revert data
    const errData = staticErr?.data || staticErr?.error?.data;
    let decoded = '';
    if (errData && typeof errData === 'string' && errData.length >= 10) {
      const sel = errData.slice(0, 10);
      decoded = VERIFIER_ERRORS[sel] || `Unknown verifier error: ${sel}`;
    }
    const msg = decoded || reason || staticErr?.message || 'transferWithProof reverted (no reason)';
    console.error('[Keter] staticCall revert:', msg, { reason, errData, staticErr });
    throw new Error(msg);
  }

  // Raw integer amount — must match publicInputs[4] from the ZK proof exactly
  const tx = await token.transferWithProof(to, rawAmount, proof, pubInputsBytes32, {
    gasLimit: 10_000_000n,
  });
  await tx.wait();
  return tx;
};

// === READ ===
export const getCurrentRoot = async (provider: ethers.Provider): Promise<string> => {
  const registry = getRegistry(provider);
  return await registry.getMerkleRoot();
};

export const getTransferEvents = async (provider: ethers.Provider) => {
  const token = getZKToken(provider);
  const filter = token.filters.Transfer();
  return await token.queryFilter(filter);
};

// Verifier custom error selectors (from UltraVerifier.sol)
const VERIFIER_ERRORS: Record<string, string> = {
  [ethers.id('ProofLengthWrong()').slice(0, 10)]: 'Proof length wrong — bb.js version may not match deployed verifier',
  [ethers.id('ProofLengthWrongWithLogN(uint256,uint256,uint256)').slice(0, 10)]: 'Proof length wrong (with details)',
  [ethers.id('PublicInputsLengthWrong()').slice(0, 10)]: 'Public inputs count wrong — expected 5',
  [ethers.id('SumcheckFailed()').slice(0, 10)]: 'Sumcheck failed — proof hash mismatch (poseidon2 vs keccak)',
  [ethers.id('ShpleminiFailed()').slice(0, 10)]: 'Shplemini verification failed',
  [ethers.id('GeminiChallengeInSubgroup()').slice(0, 10)]: 'Gemini challenge in subgroup',
  [ethers.id('ConsistencyCheckFailed()').slice(0, 10)]: 'Consistency check failed',
};

// === ERROR HANDLING ===
const ERROR_MESSAGES: Record<string, string> = {
  'KT: not issuer': 'Only the bank (issuer) can perform this action',
  'KT: paused': 'Token contract is currently paused',
  'KT: invalid proof': 'ZK proof verification failed — try regenerating',
  'KT: transfer amount': 'Transfer amount exceeds proof limit',
  'KT: sender mismatch': 'Proof sender does not match your wallet',
  'KT: recipient mismatch': 'Proof recipient does not match the target address',
  'KT: root mismatch': 'Merkle root is outdated — ask the bank to update',
  'KT: nullifier used': 'This proof has already been used — generate a new one',
  'Not admin': 'Only the admin can update the Merkle root',
  'Insufficient balance': 'Not enough tokens for this transfer',
  'user rejected': 'Transaction rejected in wallet',
  'insufficient funds': 'Not enough ETH for gas fees',
};

export const getErrorMessage = (error: any): string => {
  const msg = error?.reason || error?.message || String(error);
  // Always log full error for debugging
  console.error('[Keter] Contract error:', msg, error);
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (msg.includes(key)) return value;
  }
  return `An unexpected error occurred: ${msg.slice(0, 120)}`;
};
