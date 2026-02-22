import React, { useState } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../../hooks/useWallet';
import GlowCard from '../ui/GlowCard';
import NeonButton from '../ui/NeonButton';
import { mintTokens, getErrorMessage } from '../../utils/contracts';

interface MintFormProps {
  wallet: WalletState;
}

export function MintForm({ wallet }: MintFormProps) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!ethers.isAddress(address)) {
      setError('Invalid Ethereum address');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!wallet.signer) {
      setError('Wallet signer not available');
      return;
    }

    setLoading(true);
    try {
      const tx = await mintTokens(wallet.signer, address, parsedAmount);
      setSuccess(tx.hash);
      setAddress('');
      setAmount('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlowCard>
      <h2 className="font-serif text-xl mb-4 text-keter-text">Mint Tokens</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-keter-text-secondary mb-1.5">
            Recipient Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 rounded-lg border border-keter-border-light bg-white font-mono text-sm text-keter-text placeholder:text-keter-text-muted focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-keter-text-secondary mb-1.5">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="10000"
            min="0"
            step="any"
            className="w-full px-3 py-2 rounded-lg border border-keter-border-light bg-white font-sans text-sm text-keter-text placeholder:text-keter-text-muted focus:outline-none focus:border-keter-accent focus:ring-1 focus:ring-keter-accent transition-colors"
          />
        </div>
        <NeonButton
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          Mint Tokens
        </NeonButton>
      </form>

      {success && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-sm text-emerald-700">
            Tokens minted successfully
          </p>
          <p className="text-xs font-mono text-emerald-600 mt-1">
            Tx: {success.slice(0, 10)}...{success.slice(-8)}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </GlowCard>
  );
}

export default MintForm;
