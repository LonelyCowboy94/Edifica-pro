export interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface WorkerData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position: string;
  joinedAt: string;
  contractType: "permanent" | "limited";
  contractUntil?: string | null;
  bankAccount: string;
  hourlyRate: string | number;
  currency: string;
}

export interface ProjectData {
  id: string;
  name: string;
  clientId: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuthResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    companyId: string;
  };
  error?: string;
}

