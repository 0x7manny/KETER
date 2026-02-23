export const frontendLibraries = {
  headers: ['Library', 'Role', 'Install'],
  rows: [
    ['@noir-lang/noir_js', 'Loads the compiled circuit, generates witnesses in WASM in the browser', 'npm i @noir-lang/noir_js@1.0.0-beta.18'],
    ['@aztec/bb.js', 'UltraHonk backend — the mathematical engine behind proof generation', 'npm i @aztec/bb.js'],
    ['circomlibjs', 'Poseidon hash bn254 compatible with Noir — must produce the same hashes', 'npm i circomlibjs'],
    ['ethers', 'Blockchain interaction: send the transferWithProof() transaction', 'npm i ethers'],
  ],
};

export const proofCode = `import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@aztec/bb.js';
import circuit from '../circuit/keter_circuit.json';

// Initialize once
const backend = new UltraHonkBackend(circuit.bytecode);
const noir = new Noir(circuit);

export async function generateProof(inputs: Record<string, any>) {
  // Step 1: Generate witness
  const { witness } = await noir.execute(inputs);

  // Step 2: Generate proof from witness
  const { proof, publicInputs } = await backend.generateProof(witness);

  return { proof, publicInputs };
}`;

export const poseidonCode = `import { buildPoseidon } from 'circomlibjs';

let poseidon: any;

export async function initPoseidon() {
  poseidon = await buildPoseidon();
}

export function hash2(a: bigint, b: bigint): bigint {
  const h = poseidon([poseidon.F.e(a), poseidon.F.e(b)]);
  return BigInt(poseidon.F.toString(h));
}

export function hash8(inputs: bigint[]): bigint {
  const h = poseidon(inputs.map(x => poseidon.F.e(x)));
  return BigInt(poseidon.F.toString(h));
}

// Build the complete leaf for an investor (3-step process)
export function buildLeaf(kyc: KYCData): bigint {
  // Step 1: hash_8([name, surname, age, address, wallet, country, type, face])
  const leaf = hash8([
    kyc.name, kyc.surname, kyc.age, kyc.address,
    kyc.wallet, kyc.countryCode, kyc.investorType, kyc.kycFace
  ]);
  // Step 2: hash_2([leaf, salt])
  const leafInter = hash2(leaf, kyc.salt);
  // Step 3: hash_2([leaf_inter, max_amount])
  const leafFinal = hash2(leafInter, kyc.maxAmount);
  return leafFinal;
}`;

export const merkleCode = `import { hash2 } from './poseidon';

export class MerkleTree {
  depth: number;
  leaves: bigint[];

  constructor(depth: number) {
    this.depth = depth;
    this.leaves = Array(2 ** depth).fill(0n);
  }

  insert(index: number, leaf: bigint) {
    this.leaves[index] = leaf;
  }

  getRoot(): bigint {
    let layer = [...this.leaves];
    for (let d = 0; d < this.depth; d++) {
      const next: bigint[] = [];
      for (let i = 0; i < layer.length; i += 2) {
        next.push(hash2(layer[i], layer[i + 1]));
      }
      layer = next;
    }
    return layer[0];
  }

  getPath(index: number): { merklePath: bigint[], pathIndices: number[] } {
    const merklePath: bigint[] = [];
    const pathIndices: number[] = [];
    let layer = [...this.leaves];
    let idx = index;
    for (let d = 0; d < this.depth; d++) {
      const isRight = idx % 2;
      const sibling = isRight ? idx - 1 : idx + 1;
      merklePath.push(layer[sibling]);
      pathIndices.push(isRight ? 1 : 0);
      const next: bigint[] = [];
      for (let i = 0; i < layer.length; i += 2)
        next.push(hash2(layer[i], layer[i + 1]));
      layer = next;
      idx = Math.floor(idx / 2);
    }
    return { merklePath, pathIndices };
  }
}`;

export const transferCode = `import { ethers } from 'ethers';

export async function sendTransfer(
  signer: ethers.Signer,
  tokenAddr: string,
  to: string,
  amount: bigint,
  proof: Uint8Array,
  publicInputs: string[]
) {
  const abi = ["function transferWithProof(address,uint256,bytes,bytes32[])"];
  const contract = new ethers.Contract(tokenAddr, abi, signer);

  const proofHex = ethers.hexlify(proof);
  const pubInputs = publicInputs.map(p =>
    ethers.zeroPadValue(ethers.toBeHex(BigInt(p)), 32)
  );

  const tx = await contract.transferWithProof(to, amount, proofHex, pubInputs);
  return await tx.wait();
}`;

export const frontendCallout = {
  type: 'warning' as const,
  title: 'Critical compatibility',
  text: 'hash_8 in the Noir circuit and hash8() in JS with circomlibjs must produce the same result for the same inputs. If the hashes diverge, the root will never match. Always test with the same values on both sides before integrating.',
};
