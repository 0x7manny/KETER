import { ethers } from 'ethers';
import ZKTokenABI from '../abis/ZKToken.json';
import RegistryABI from '../abis/Registry.json';

export const CONTRACTS = {
  REGISTRY: import.meta.env.VITE_REGISTRY_ADDRESS || localStorage.getItem('keter_registry_address') || '0x0000000000000000000000000000000000000000',
  ZK_TOKEN: import.meta.env.VITE_ZKTOKEN_ADDRESS || localStorage.getItem('keter_zktoken_address') || '0x0000000000000000000000000000000000000000',
  VERIFIER: import.meta.env.VITE_VERIFIER_ADDRESS || localStorage.getItem('keter_verifier_address') || '0x0000000000000000000000000000000000000000',
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
export const mintTokens = async (signer: ethers.Signer, to: string, amount: number) => {
  const token = getZKToken(signer);
  const tx = await token.mint(to, ethers.parseUnits(amount.toString(), 18));
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
  const tx = await token.transferWithProof(
    to,
    ethers.parseUnits(amount.toString(), 18),
    proof,
    pubInputsBytes32
  );
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

// === ERROR HANDLING ===
const ERROR_MESSAGES: Record<string, string> = {
  'Not issuer': 'Only the bank can perform this action',
  'Root mismatch': 'Merkle root is outdated — ask the bank to update',
  'Invalid proof': 'ZK proof verification failed — try regenerating',
  'Insufficient balance': 'Not enough tokens for this transfer',
  'Not admin': 'Only the admin can update the Merkle root',
  'user rejected': 'Transaction rejected in wallet',
};

export const getErrorMessage = (error: any): string => {
  const msg = error?.reason || error?.message || String(error);
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (msg.includes(key)) return value;
  }
  return 'An unexpected error occurred';
};
