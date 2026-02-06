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
  clientId: string | null;
  status: string;
  companyId: string;
  createdAt?: string;
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

export interface WorkerProjectAnalytics {
  name: string;
  totalHours: number;
  totalCost: number;
}

export interface ProjectAnalytics {
  totalHours: number;
  totalCost: number;
  workers: Record<string, WorkerProjectAnalytics>;
}

export interface ProjectDetailsResponse extends ProjectData {
  client: {
    name: string;
  } | null;
  workLogs: Array<{
    id: string;
    date: string;
    regularHours: number;
    overtimeHours: number;
    hourlyRateAtTime: string;
    worker: {
      firstName: string;
      lastName: string;
    };
  }>;
  analytics: ProjectAnalytics;
}
