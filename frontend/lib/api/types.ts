export interface ClientData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface WorkerMinimal {
  firstName: string;
  lastName: string;
  position: string; 
  currency: string;
}

export interface WorkerData extends WorkerMinimal {
  id: string;
  email?: string;
  phone?: string;
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

// --- WORK LOG TYPES ---

export interface WorkLogEntry {
  workerId: string;
  regularHours: number;
  overtimeHours: number;
}

export interface CreateBulkWorkLogPayload {
  projectId: string;
  date: string;
  entries: WorkLogEntry[];
}

export interface WorkLog {
  id: string;
  companyId: string;
  workerId: string;
  projectId: string;
  date: string;
  regularHours: number;
  overtimeHours: number;
  status: "PENDING" | "SETTLED";
  hourlyRateAtTime: string; 
  payoutId: string | null;
  createdAt: string;
  worker?: WorkerMinimal;
  project?: {
    name: string;
  };
}

// --- PAYOUT TYPES ---

export interface WorkerPayout {
  id: string;
  workerId: string;
  totalAmount: string;
  paidAt: string;
  worker?: WorkerMinimal;
}

// --- ANALYTICS TYPES ---

export interface WorkerProjectAnalytics extends WorkerMinimal {
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
  workLogs: Array<WorkLog>;
  analytics: ProjectAnalytics;
  baseCurrency: string;
}

export interface DashboardStats {
  activeProjects: number;
  totalWorkers: number;
  pendingLaborCost: number;
  baseCurrency: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentLogs: WorkLog[]; 
}

export interface UserMeResponse {
  id: string;
  email: string;
  role: string;
  companyName: string;
  baseCurrency: string;
}

export interface ChartDataPoint {
  date: string;
  cost: number;
  hours: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentLogs: WorkLog[];
  chartData: ChartDataPoint[]; 
}

export interface CompanySettings {
  id: string;
  name: string;
  country: string;
  baseCurrency: string;
  logoUrl: string | null;
  defaultWeekdayHours: string;
  defaultWeekendHours: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  baseCurrency?: string;
  logoUrl?: string;
  defaultWeekdayHours?: string;
  defaultWeekendHours?: string;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  oldPassword?: string;
}