'use client';

import { useWallet } from '@/hooks/useWallet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BankDashboard from '@/components/bank/BankDashboard';
import InvestorDashboard from '@/components/investor/InvestorDashboard';
import Explorer from '@/components/explorer/Explorer';

export default function DashboardPage() {
  const wallet = useWallet();

  return (
    <div className="min-h-screen bg-keter-bg flex flex-col">
      <Header wallet={wallet} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {wallet.role === 'bank' && <BankDashboard wallet={wallet} />}
        {wallet.role === 'investor' && <InvestorDashboard wallet={wallet} />}
        {wallet.role === 'explorer' && <Explorer />}
      </main>

      <Footer />
    </div>
  );
}
