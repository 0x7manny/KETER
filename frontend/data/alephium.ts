export const comparisonTable = {
  headers: ['', 'Ethereum', 'Alephium'],
  rows: [
    ['Consensus', 'Proof of Stake', 'Proof of Less Work (87% less energy)'],
    ['Block time', '12 seconds', '8 seconds — 2 blocks/s throughput'],
    ['Smart contracts', 'Solidity (EVM)', 'Ralph (Alphred VM) — not EVM'],
    ['Model', 'Account-based', 'Stateful UTXO — tokens = first-class citizens'],
    ['Native hashes', 'Keccak256, SHA256', 'Blake2b, Keccak256, SHA256, SHA3'],
    ['Poseidon', 'Via precompile bn128', 'Not available'],
    ['ZK verification', 'UltraVerifier.sol native', 'No pairing precompile'],
    ['Bridge', '—', 'Wormhole-based to ETH and BSC'],
  ],
};

export const integrationStrategies = {
  headers: ['Strategy', 'Idea', 'Complexity', 'Trust', 'Hackathon?'],
  rows: [
    {
      name: '1. Wormhole Bridge',
      idea: 'ZK verification on ETH, bridge tokens to Alephium',
      complexity: 'LOW' as const,
      trust: 'Wormhole guardians',
      hackathon: 'YES — V1',
      hackathonColor: 'emerald' as const,
    },
    {
      name: '2. Oracle attestation',
      idea: 'Oracle verifies proof, signs attestation, Ralph contract verifies signature',
      complexity: 'MEDIUM' as const,
      trust: 'Oracle(s)',
      hackathon: 'Mention',
      hackathonColor: 'blue' as const,
    },
    {
      name: '3. Native Ralph verifier',
      idea: 'Reimplement UltraPlonk in Ralph (~2000+ lines of pairings)',
      complexity: 'CRITICAL' as const,
      trust: 'Trustless',
      hackathon: 'NO',
      hackathonColor: 'rose' as const,
    },
    {
      name: '4. Hash adapter',
      idea: 'New circuit with Keccak256 (native Alephium) instead of Poseidon',
      complexity: 'HIGH' as const,
      trust: 'Trustless',
      hackathon: 'NO',
      hackathonColor: 'rose' as const,
    },
  ],
};

export const ralphCode = `// Ralph contract on Alephium
// The oracle verifies the ZK proof on ETH, signs an attestation
// This contract verifies the signature before authorizing the transfer

Contract KeterAlph(
  oraclePublicKey: ByteVec,
  mut totalSupply: U256
) {
  mapping[Address, U256] balances

  enum ErrorCodes {
    InvalidSignature = 0
    InsufficientBalance = 1
  }

  @using(checkExternalCaller = false)
  pub fn transferWithAttestation(
    to: Address,
    amount: U256,
    attestation: ByteVec,  // nullifier + merkle_root + timestamp
    signature: ByteVec
  ) -> () {
    // Build the expected message
    let message = blake2b!(
      toByteVec!(callerAddress!()) ++
      toByteVec!(to) ++
      toByteVec!(amount) ++
      attestation
    )

    // Verify the oracle signature
    assert!(
      verifySecP256K1!(message, oraclePublicKey, signature),
      ErrorCodes.InvalidSignature
    )

    // Execute the transfer
    let senderBal = balances[callerAddress!()]
    assert!(senderBal >= amount, ErrorCodes.InsufficientBalance)
    balances[callerAddress!()] = senderBal - amount
    balances[to] = balances[to] + amount
  }
}`;

export const alephiumCallout = {
  type: 'warning' as const,
  title: 'The fundamental problem',
  text: 'The circuit uses Poseidon bn254 + UltraPlonk. Alephium has neither. Deploying UltraVerifier.sol on Alephium is impossible. A cross-chain strategy is required.',
};
