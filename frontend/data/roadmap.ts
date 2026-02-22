export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface RoadmapTask {
  priority: Priority;
  task: string;
  file: string;
  time: string;
}

export const roadmapTasks: RoadmapTask[] = [
  { priority: 'CRITICAL', task: 'Noir V2 circuit compiles + tests pass', file: 'src/main.nr', time: '2h' },
  { priority: 'CRITICAL', task: 'ZKToken.sol — transferWithProof()', file: 'contracts/ZKToken.sol', time: '2h' },
  { priority: 'CRITICAL', task: 'Registry.sol — updateRoot()', file: 'contracts/Registry.sol', time: '30m' },
  { priority: 'CRITICAL', task: 'nargo codegen-verifier — UltraVerifier.sol', file: 'contracts/UltraVerifier.sol', time: '30m' },
  { priority: 'CRITICAL', task: 'Frontend KYC form + leaf calculation', file: 'src/components/KYC.tsx', time: '3h' },
  { priority: 'CRITICAL', task: 'Frontend transfer + proof generation', file: 'src/components/Transfer.tsx', time: '3h' },
  { priority: 'CRITICAL', task: 'Full demo: 1 end-to-end transfer', file: '—', time: '2h' },
  { priority: 'HIGH', task: 'Deploy to Sepolia testnet', file: 'scripts/deploy.ts', time: '1h' },
  { priority: 'HIGH', task: 'Pitch deck (5 slides max)', file: 'slides/', time: '1h' },
  { priority: 'MEDIUM', task: 'Foundry tests for contracts', file: 'test/ZKToken.t.sol', time: '2h' },
  { priority: 'MEDIUM', task: 'Mention Alephium + multi-chain vision', file: '—', time: '—' },
];
