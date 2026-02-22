'use client';

import { useWallet } from '@/hooks/useWallet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import InvestorDashboard from '@/components/investor/InvestorDashboard';
import Explorer from '@/components/explorer/Explorer';

export default function DashboardPage() {
  const wallet = useWallet();

  return (
    <div className="min-h-screen bg-keter-bg flex flex-col">
      <Header wallet={wallet} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {wallet.role === 'bank' && (
          <div className="text-center py-10 mb-8">
            <p className="text-keter-text-secondary text-sm">
              You are connected as the bank.{' '}
              <a href="/admin" className="text-keter-accent hover:underline font-medium">
                Go to Admin Dashboard
              </a>
            </p>
          </div>
        )}
        {wallet.role === 'investor' && <InvestorDashboard wallet={wallet} />}
        {wallet.role === 'explorer' && <Explorer />}
      </main>

      <Footer />
    </div>
  );
}
