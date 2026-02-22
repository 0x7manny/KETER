'use client';

// === String to Field encoding (for Noir circuit compatibility) ===
export const stringToField = (str: string): string => {
  let result = 0n;
  const bytes = new TextEncoder().encode(str);
  // Pack up to 31 bytes into a single Field element (bn254 field is ~254 bits)
  const len = Math.min(bytes.length, 31);
  for (let i = 0; i < len; i++) {
    result = result * 256n + BigInt(bytes[i]);
  }
  return result.toString();
};

// === Types ===

export interface InvestorCredentials {
  name: string;         // Field-encoded string
  surname: string;      // Field-encoded string
  age: string;          // Field-encoded number
  address: string;      // Field-encoded physical address
  wallet: string;       // Ethereum wallet address (as Field)
  countryCode: number;
  kycFace: string;      // Placeholder biometric hash (Field)
  investorType: number; // 1=Qualified, 2=Retail
  maxAmount: string;    // Bank-set transfer limit (Field)
  salt: string;         // 256-bit random (stored as string)
  nonce: number;        // Incrementing counter for nullifier
  leafIndex: number;
}

export interface KYCRequest {
  address: string;      // Ethereum wallet address
  alephiumAddress?: string;
  name: string;
  surname: string;
  age: number;
  physicalAddress: string;
  country: number;      // 1-27 EU country code
  investorType: number; // 1=Qualified, 2=Retail
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const COUNTRIES: Record<number, string> = {
  1: 'Austria',
  2: 'Belgium',
  3: 'Bulgaria',
  4: 'Croatia',
  5: 'Cyprus',
  6: 'Czech Republic',
  7: 'Denmark',
  8: 'Estonia',
  9: 'Finland',
  10: 'France',
  11: 'Germany',
  12: 'Greece',
  13: 'Hungary',
  14: 'Ireland',
  15: 'Italy',
  16: 'Latvia',
  17: 'Lithuania',
  18: 'Luxembourg',
  19: 'Malta',
  20: 'Netherlands',
  21: 'Poland',
  22: 'Portugal',
  23: 'Romania',
  24: 'Slovakia',
  25: 'Slovenia',
  26: 'Spain',
  27: 'Sweden',
};

export const INVESTOR_TYPES: Record<number, string> = {
  1: 'Qualified',
  2: 'Retail',
};

// === Credentials CRUD ===
export const saveCredentials = (walletAddress: string, creds: InvestorCredentials) => {
  const key = `keter_creds_${walletAddress.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(creds));
};

export const loadCredentials = (walletAddress: string): InvestorCredentials | null => {
  const key = `keter_creds_${walletAddress.toLowerCase()}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const hasCredentials = (walletAddress: string): boolean => {
  return loadCredentials(walletAddress) !== null;
};

// === KYC Requests CRUD ===
export const submitKYCRequest = (request: KYCRequest) => {
  const requests = getKYCRequests();
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
  transfers.unshift(record);
  localStorage.setItem('keter_transfers', JSON.stringify(transfers));
};

export const getTransfers = (): TransferRecord[] => {
  const data = localStorage.getItem('keter_transfers');
  return data ? JSON.parse(data) : [];
};
