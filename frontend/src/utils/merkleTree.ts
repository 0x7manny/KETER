import { poseidonHash } from './poseidon';
import { InvestorCredentials } from './credentials';

// === Types ===

export interface MerkleLeaf {
  index: number;
  hash: bigint;
  address: string;
  countryCode: number;
  investorType: number;
  salt: bigint;
}

export interface MerkleTree {
  depth: number;
  leaves: (bigint | null)[];
  nodes: bigint[][];
  root: bigint;
  leafData: MerkleLeaf[];
}

// === Constants ===

const DEPTH = 4;
const NUM_LEAVES = 16; // 2^DEPTH

// === Tree Construction ===

export const createEmptyTree = async (): Promise<MerkleTree> => {
  const leaves: (bigint | null)[] = new Array(NUM_LEAVES).fill(null);
  const leafValues: bigint[] = new Array(NUM_LEAVES).fill(0n);

  // Build nodes bottom-up
  const nodes: bigint[][] = [];
  nodes[0] = [...leafValues];

  for (let level = 1; level <= DEPTH; level++) {
    const prevLevel = nodes[level - 1];
    const currentLevel: bigint[] = [];
    for (let i = 0; i < prevLevel.length; i += 2) {
      const left = prevLevel[i];
      const right = prevLevel[i + 1];
      const parent = await poseidonHash([left, right]);
      currentLevel.push(parent);
    }
    nodes[level] = currentLevel;
  }

  return {
    depth: DEPTH,
    leaves,
    nodes,
    root: nodes[DEPTH][0],
    leafData: [],
  };
};

// === Leaf Insertion ===

export const insertLeaf = async (
  tree: MerkleTree,
  address: string,
  countryCode: number,
  investorType: number
): Promise<{ tree: MerkleTree; credentials: InvestorCredentials }> => {
  // Find next free slot
  const leafIndex = tree.leaves.findIndex(l => l === null);
  if (leafIndex === -1) {
    throw new Error('Merkle tree is full (max 16 leaves)');
  }

  // Generate random salt (31 bytes to stay within the field)
  const saltBytes = crypto.getRandomValues(new Uint8Array(31));
  const salt = BigInt(
    '0x' + Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  );

  // Compute leaf hash = poseidon(address, countryCode, investorType, salt)
  const addressBigInt = BigInt(address);
  const leafHash = await poseidonHash([
    addressBigInt,
    BigInt(countryCode),
    BigInt(investorType),
    salt,
  ]);

  // Insert leaf
  tree.leaves[leafIndex] = leafHash;
  tree.nodes[0][leafIndex] = leafHash;

  // Store leaf data
  tree.leafData.push({
    index: leafIndex,
    hash: leafHash,
    address,
    countryCode,
    investorType,
    salt,
  });

  // Recompute all parents up to root
  let currentIndex = leafIndex;
  for (let level = 0; level < DEPTH; level++) {
    const pairIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
    const leftIndex = Math.min(currentIndex, pairIndex);
    const left = tree.nodes[level][leftIndex];
    const right = tree.nodes[level][leftIndex + 1];
    const parentIndex = Math.floor(currentIndex / 2);
    tree.nodes[level + 1][parentIndex] = await poseidonHash([left, right]);
    currentIndex = parentIndex;
  }

  tree.root = tree.nodes[DEPTH][0];

  const credentials: InvestorCredentials = {
    address,
    countryCode,
    investorType,
    salt: salt.toString(),
    leafIndex,
  };

  return { tree, credentials };
};

// === Merkle Path ===

export const getMerklePath = (
  tree: MerkleTree,
  leafIndex: number
): { path: bigint[]; indices: number[] } => {
  if (leafIndex < 0 || leafIndex >= NUM_LEAVES) {
    throw new Error(`Leaf index ${leafIndex} out of bounds (0-${NUM_LEAVES - 1})`);
  }

  const path: bigint[] = [];
  const indices: number[] = [];
  let currentIndex = leafIndex;

  for (let level = 0; level < DEPTH; level++) {
    const isLeft = currentIndex % 2 === 0;
    const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;

    path.push(tree.nodes[level][siblingIndex]);
    indices.push(isLeft ? 0 : 1);

    currentIndex = Math.floor(currentIndex / 2);
  }

  return { path, indices };
};

// === Persistence ===

const STORAGE_KEY = 'keter_merkle_tree';

const bigIntSerializer = (_key: string, value: any): any => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

const bigIntDeserializer = (_key: string, value: any): any => {
  if (typeof value === 'string' && value.length > 15 && /^\d+$/.test(value)) {
    return BigInt(value);
  }
  return value;
};

export const saveTree = (tree: MerkleTree): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tree, bigIntSerializer));
};

export const loadTree = (): MerkleTree | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  return JSON.parse(data, bigIntDeserializer) as MerkleTree;
};
