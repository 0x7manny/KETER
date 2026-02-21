export const frontendLibraries = {
  headers: ['Library', 'Role', 'Install'],
  rows: [
    ['@noir-lang/noir_js', 'Loads the compiled circuit, generates proofs in WASM in the browser', 'npm i @noir-lang/noir_js'],
    ['@noir-lang/backend_barretenberg', 'UltraPlonk backend — the mathematical engine behind proof generation', 'npm i @noir-lang/backend_barretenberg'],
    ['circomlibjs', 'Poseidon hash bn254 compatible with Noir — must produce the same hashes', 'npm i circomlibjs'],
    ['ethers', 'Blockchain interaction: send the transferWithProof() transaction', 'npm i ethers'],
  ],
};

export const proofCode = `import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import circuit from '../circuits/target/keter.json';

// Initialize once
const backend = new BarretenbergBackend(circuit);
const noir = new Noir(circuit, backend);

export async function generateProof(inputs: Record<string, any>) {
  console.log("Generating ZK proof...");
  const start = Date.now();

  const { proof, publicInputs } = await noir.generateProof(inputs);

  console.log(\`Proof generated in \${Date.now() - start}ms (\${proof.length} bytes)\`);
  return { proof, publicInputs };
}`;

export const poseidonCode = `import { buildPoseidon } from 'circomlibjs';

let poseidon: any;

export async function initPoseidon() {
  poseidon = await buildPoseidon();
}

export function hash2(a: string, b: string): string {
  const h = poseidon([BigInt(a), BigInt(b)]);
  return poseidon.F.toString(h);
}

export function hash8(inputs: string[]): string {
  const h = poseidon(inputs.map(x => BigInt(x)));
  return poseidon.F.toString(h);
}

// Build the complete leaf for an investor
export function buildLeaf(kyc: KYCData): string {
  const leaf = hash8([
    kyc.name, kyc.surname, kyc.age, kyc.address,
    kyc.wallet, kyc.countryCode, kyc.investorType, kyc.kycFace
  ]);
  const leafInter = hash2(leaf, kyc.salt);
  const leafFinal = hash2(leafInter, kyc.maxAmount);
  return leafFinal;
}`;

export const merkleCode = `import { hash2 } from './poseidon';

export class MerkleTree {
  depth: number;
  leaves: string[];

  constructor(depth: number) {
    this.depth = depth;
    this.leaves = Array(2 ** depth).fill("0");
  }

  insert(index: number, leaf: string) {
    this.leaves[index] = leaf;
  }

  getRoot(): string {
    let layer = [...this.leaves];
    for (let d = 0; d < this.depth; d++) {
      const next: string[] = [];
      for (let i = 0; i < layer.length; i += 2) {
        next.push(hash2(layer[i], layer[i + 1]));
      }
      layer = next;
    }
    return layer[0];
  }

  getPath(index: number): { merklePath: string[], pathIndices: string[] } {
    const merklePath: string[] = [];
    const pathIndices: string[] = [];
    let layer = [...this.leaves];
    let idx = index;
    for (let d = 0; d < this.depth; d++) {
      const isRight = idx % 2;
      const sibling = isRight ? idx - 1 : idx + 1;
      merklePath.push(layer[sibling]);
      pathIndices.push(isRight ? "1" : "0");
      const next: string[] = [];
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
