'use client';

import { useWallet } from '@/hooks/useWallet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import KYCVerification from '@/components/investor/KYCVerification';

export default function KYCPage() {
  const wallet = useWallet();

  return (
    <div className="min-h-screen bg-keter-bg flex flex-col">
      <Header wallet={wallet} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        <KYCVerification
          apiUrl={process.env.NEXT_PUBLIC_KYC_API_URL ?? 'http://localhost:8000'}
        />
      </main>

      <Footer />
    </div>
  );
}
