'use client';

import { useWallet } from '@/hooks/useWallet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BankDashboard from '@/components/bank/BankDashboard';

export default function AdminPage() {
  const wallet = useWallet();

  const isBank = wallet.role === 'bank';

  return (
    <div className="min-h-screen bg-keter-bg flex flex-col">
      <Header wallet={wallet} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {!wallet.address ? (
          <div className="text-center py-20">
            <h1 className="font-serif text-3xl text-keter-text mb-4">Bank Administration</h1>
            <p className="text-keter-text-secondary mb-6">
              Connect the bank wallet to access the compliance dashboard.
            </p>
            <button
              onClick={wallet.connect}
              className="bg-keter-accent text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
            >
              Connect Wallet
            </button>
          </div>
        ) : !isBank ? (
          <div className="text-center py-20">
            <h1 className="font-serif text-3xl text-keter-text mb-4">Access Restricted</h1>
            <p className="text-keter-text-secondary">
              This wallet is not authorized as a bank/issuer.
              Only the deployer wallet can access the admin dashboard.
            </p>
          </div>
        ) : (
          <BankDashboard wallet={wallet} />
        )}
      </main>

      <Footer />
    </div>
  );
}
