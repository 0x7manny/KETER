import React, { useState } from 'react';
import { ethers } from 'ethers';
import GlowCard from '../ui/GlowCard';
import NeonButton from '../ui/NeonButton';
import LoadingProof from '../ui/LoadingProof';
import { WalletState } from '../../hooks/useWallet';
import { useMerkleTree } from '../../hooks/useMerkleTree';
import { useProof } from '../../hooks/useProof';
import { loadCredentials, saveTransfer } from '../../utils/credentials';
import { transferWithProof, getErrorMessage } from '../../utils/contracts';

interface TransferFormProps {
  wallet: WalletState;
}

export function TransferForm({ wallet }: TransferFormProps) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getProof, getRoot } = useMerkleTree();
  const { generateProof, isGenerating, proofStep } = useProof();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Validate inputs
    if (!ethers.isAddress(to)) {
      setError('Invalid recipient address');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      // Load credentials
      const credentials = loadCredentials(wallet.address!);
      if (!credentials) {
        setError('No KYC credentials found');
        setLoading(false);
        return;
      }

      // Get merkle proof
      const proof = getProof(credentials.leafIndex);
      if (!proof) {
        setError('Failed to generate Merkle proof');
        setLoading(false);
        return;
      }

      // Get merkle root
      const root = getRoot();
      if (!root) {
        setError('Failed to get Merkle root');
        setLoading(false);
        return;
      }

      // Build proof inputs
      const inputs = {
        address: BigInt(credentials.address).toString(),
        country_code: credentials.countryCode.toString(),
        investor_type: credentials.investorType.toString(),
        salt: credentials.salt,
        merkle_path: proof.path.map((p: bigint) => p.toString()),
        path_indices: proof.indices.map((i: number) => i.toString()),
        merkle_root: root.toString(),
      };

      // Generate ZK proof
      const proofResult = await generateProof(inputs);

      // Transfer with proof on-chain
      const tx = await transferWithProof(
        wallet.signer!,
        to,
        parseFloat(amount),
        proofResult.proof,
        proofResult.publicInputs
      );

      // Save transfer record
      saveTransfer({
        from: wallet.address!,
        to,
        amount,
        txHash: tx.hash,
        timestamp: Date.now(),
        zkVerified: true,
      });

      setSuccess(`Transfer successful! Tx: ${tx.hash}`);
      setTo('');
      setAmount('');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowCard className="relative">
      {/* ZK Proof generation overlay */}
      {isGenerating && (
        <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <LoadingProof step={proofStep} />
        </div>
      )}

      <h2 className="font-serif text-xl text-keter-text mb-1">
        Transfer Tokens
      </h2>
      <p className="text-keter-text-secondary text-sm mb-6">
        Tokens are transferred with a zero-knowledge proof of compliance
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
            Recipient Address
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 rounded-lg border border-keter-border-light bg-keter-bg font-mono text-sm text-keter-text placeholder:text-keter-text-muted focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-keter-text-secondary mb-1.5">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
            min="0"
            step="any"
            className="w-full px-3 py-2 rounded-lg border border-keter-border-light bg-keter-bg font-sans text-sm text-keter-text placeholder:text-keter-text-muted focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent/20 transition-colors"
          />
        </div>

        <NeonButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading || isGenerating}
          className="w-full"
        >
          Generate Proof & Transfer
        </NeonButton>
      </form>

      {/* Success message */}
      {success && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-sm text-emerald-700 font-sans">{success}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700 font-sans">{error}</p>
        </div>
      )}
    </GlowCard>
  );
}

export default TransferForm;
