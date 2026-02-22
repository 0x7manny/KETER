export interface InvestorCredentials {
  address: string;
  countryCode: number;
  investorType: number;
  salt: string; // stored as string for JSON compatibility
  leafIndex: number;
}

export interface KYCRequest {
  address: string;
  alephiumAddress?: string;
  name: string;
  country: number; // 1=France, 2=Germany, 3=Spain, 4=Italy, 5=Belgium
  investorType: number; // 1=Qualified, 2=Retail
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const COUNTRIES: Record<number, string> = {
  1: 'France',
  2: 'Germany',
  3: 'Spain',
  4: 'Italy',
  5: 'Belgium',
};

export const INVESTOR_TYPES: Record<number, string> = {
  1: 'Qualified',
  2: 'Retail',
};

// === Credentials CRUD ===
export const saveCredentials = (address: string, creds: InvestorCredentials) => {
  const key = `keter_creds_${address.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(creds));
};

export const loadCredentials = (address: string): InvestorCredentials | null => {
  const key = `keter_creds_${address.toLowerCase()}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const hasCredentials = (address: string): boolean => {
  return loadCredentials(address) !== null;
};

// === KYC Requests CRUD ===
export const submitKYCRequest = (request: KYCRequest) => {
  const requests = getKYCRequests();
  // Remove existing request from same address if any
  const filtered = requests.filter(
    r => r.address.toLowerCase() !== request.address.toLowerCase()
  );
  filtered.push(request);
  localStorage.setItem('keter_kyc_requests', JSON.stringify(filtered));
};

export const getKYCRequests = (): KYCRequest[] => {
  const data = localStorage.getItem('keter_kyc_requests');
  return data ? JSON.parse(data) : [];
};

export const getPendingKYCRequests = (): KYCRequest[] => {
  return getKYCRequests().filter(r => r.status === 'pending');
};

export const updateKYCStatus = (address: string, status: 'approved' | 'rejected') => {
  const requests = getKYCRequests();
  const updated = requests.map(r =>
    r.address.toLowerCase() === address.toLowerCase() ? { ...r, status } : r
  );
  localStorage.setItem('keter_kyc_requests', JSON.stringify(updated));
};

// === Transfer History ===
export interface TransferRecord {
  from: string;
  to: string;
  amount: string;
  txHash: string;
  timestamp: number;
  zkVerified: boolean;
}

export const saveTransfer = (record: TransferRecord) => {
  const transfers = getTransfers();
  transfers.unshift(record); // newest first
  localStorage.setItem('keter_transfers', JSON.stringify(transfers));
};

export const getTransfers = (): TransferRecord[] => {
  const data = localStorage.getItem('keter_transfers');
  return data ? JSON.parse(data) : [];
};
