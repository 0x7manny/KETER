/**
 * Generate a Solidity HonkVerifier contract from the circuit
 * using the same @aztec/bb.js version the frontend uses for proof generation.
 *
 * Usage:  node scripts/generateVerifier.mjs
 * Output: ../src/UltraVerifier.sol (overwrites)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('[1/5] Loading circuit...');
  const circuitPath = join(__dirname, '..', 'circuit', 'keter_circuit.json');
  const circuit = JSON.parse(readFileSync(circuitPath, 'utf-8'));
  console.log(`  Circuit loaded (bytecode length: ${circuit.bytecode.length} chars)`);

  console.log('[2/5] Initializing Barretenberg...');
  const { UltraHonkBackend, Barretenberg } = await import('@aztec/bb.js');
  const api = await Barretenberg.new({ threads: 1 });
  const backend = new UltraHonkBackend(circuit.bytecode, api);
  console.log('  Barretenberg initialized');

  console.log('[3/5] Computing verification key (target: evm)...');
  const vk = await backend.getVerificationKey({ verifierTarget: 'evm' });
  console.log(`  VK size: ${vk.length} bytes`);

  console.log('[4/5] Generating Solidity verifier...');
  const solidityCode = await backend.getSolidityVerifier(vk, {
    verifierTarget: 'evm',
  });
  console.log(`  Solidity code: ${solidityCode.length} chars`);

  // Check the NUMBER_OF_PUBLIC_INPUTS in the generated code
  const match = solidityCode.match(/NUMBER_OF_PUBLIC_INPUTS\s*=\s*(\d+)/);
  if (match) {
    console.log(`  NUMBER_OF_PUBLIC_INPUTS = ${match[1]}`);
  }

  // Write the verifier
  const outPath = join(__dirname, '..', '..', 'src', 'UltraVerifier.sol');
  writeFileSync(outPath, solidityCode);
  console.log(`[5/5] Written to ${outPath}`);

  // Also write a copy in circuit/target for reference
  const targetPath = join(__dirname, '..', '..', 'circuit', 'target', 'Verifier_new.sol');
  writeFileSync(targetPath, solidityCode);
  console.log(`  Also saved to ${targetPath}`);

  await api.destroy();
  console.log('\nDone! New verifier generated with correct public inputs count.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
