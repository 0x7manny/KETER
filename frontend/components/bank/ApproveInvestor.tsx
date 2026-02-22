'use client';

import { WalletState } from '../../hooks/useWallet';
import { KYCRequest, InvestorCredentials, saveCredentials, updateKYCStatus } from '../../utils/credentials';
import { publishMerkleRoot, getErrorMessage } from '../../utils/contracts';

export const approveInvestor = async (
  wallet: WalletState,
  request: KYCRequest,
  maxAmount: string,
  addLeaf: (request: KYCRequest, wallet: string, maxAmount: string) => Promise<InvestorCredentials | null>,
  getRoot: () => bigint | null,
): Promise<{ success: boolean; error?: string }> => {
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
    await publishMerkleRoot(wallet.signer, root);

    // 5. Update KYC status to approved
    updateKYCStatus(request.address, 'approved');

    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
};
