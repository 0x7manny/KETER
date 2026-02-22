'use client';

import { WalletState } from '../../hooks/useWallet';
import { KYCRequest, InvestorCredentials, saveCredentials, updateKYCStatus } from '../../utils/credentials';
import { publishMerkleRoot, getErrorMessage } from '../../utils/contracts';

// === Root History ===
export interface RootHistoryEntry {
  root: string;
  timestamp: number;
  investorAddress: string;
  investorName: string;
  txHash?: string;
}

export const saveRootHistory = (entry: RootHistoryEntry) => {
  const history = getRootHistory();
  history.unshift(entry);
  localStorage.setItem('keter_root_history', JSON.stringify(history));
};

export const getRootHistory = (): RootHistoryEntry[] => {
  const data = localStorage.getItem('keter_root_history');
  return data ? JSON.parse(data) : [];
};

export const approveInvestor = async (
  wallet: WalletState,
  request: KYCRequest,
  maxAmount: string,
  addLeaf: (request: KYCRequest, wallet: string, maxAmount: string) => Promise<InvestorCredentials | null>,
  getRoot: () => bigint | null,
): Promise<{ success: boolean; error?: string; credentials?: InvestorCredentials }> => {
  try {
    // 1. Insert investor leaf into the Merkle tree (full KYC data + bank-set maxAmount)
    const credentials = await addLeaf(request, request.address, maxAmount);
    if (!credentials) {
      return { success: false, error: 'Failed to add investor to Merkle tree' };
    }

    // 2. Save credentials to localStorage (keyed by wallet address)
    saveCredentials(request.address, credentials);

    // 3. Get the updated root
    const root = getRoot();
    if (!root) {
      return { success: false, error: 'Failed to retrieve Merkle root' };
    }

    // 4. Publish root on-chain
    if (!wallet.signer) {
      return { success: false, error: 'Wallet signer not available' };
    }
    const tx = await publishMerkleRoot(wallet.signer, root);

    // 5. Save root to history
    const rootHex = '0x' + root.toString(16).padStart(64, '0');
    saveRootHistory({
      root: rootHex,
      timestamp: Date.now(),
      investorAddress: request.address,
      investorName: `${request.name} ${request.surname}`,
      txHash: tx.hash,
    });

    // 6. Update KYC status to approved
    updateKYCStatus(request.address, 'approved');

    return { success: true, credentials };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
};
