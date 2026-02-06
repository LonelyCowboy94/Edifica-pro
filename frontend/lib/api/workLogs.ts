import { API_URL, getHeaders, handleResponse } from "./config";

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
  worker?: {
    firstName: string;
    lastName: string;
  };
  project?: {
    name: string;
  };
}

export interface WorkerPayout {
  id: string;
  workerId: string;
  totalAmount: string;
  paidAt: string;
  worker?: {
    firstName: string;
    lastName: string;
  };
}
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
  worker?: {
    firstName: string;
    lastName: string;
  };
  project?: {
    name: string;
  };
}

export interface WorkerPayout {
  id: string;
  workerId: string;
  totalAmount: string;
  paidAt: string;
  worker?: {
    firstName: string;
    lastName: string;
  };
}

export const workLogApi = {
  // --- KARNET (Work Logs) ---
  
  createBulk: (data: CreateBulkWorkLogPayload): Promise<WorkLog[]> =>
    fetch(`${API_URL}/work-logs/bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<WorkLog[]>(res)),

  // Svi logovi (Skladište) - opciono dodajemo filtere za datume
  getAll: (from?: string, to?: string): Promise<WorkLog[]> => {
    const url = from && to 
      ? `${API_URL}/work-logs?from=${from}&to=${to}` 
      : `${API_URL}/work-logs`;
    return fetch(url, { headers: getHeaders() })
      .then(res => handleResponse<WorkLog[]>(res));
  },

  getPending: (): Promise<WorkLog[]> =>
    fetch(`${API_URL}/work-logs/pending`, { headers: getHeaders() })
      .then(res => handleResponse<WorkLog[]>(res)),

  // DOPUNA: Update za Edit funkciju
  update: (id: string, data: Partial<WorkLog>): Promise<WorkLog> =>
    fetch(`${API_URL}/work-logs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<WorkLog>(res)),

  // DOPUNA: Delete za brisanje pogrešnog unosa
  delete: (id: string): Promise<{ message: string }> =>
    fetch(`${API_URL}/work-logs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(res => handleResponse<{ message: string }>(res)),

  // --- ISPLATE (Payouts) ---

  settleWorker: (workerId: string, note?: string): Promise<{ message: string }> =>
    fetch(`${API_URL}/payouts/settle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ workerId, note }),
    }).then(res => handleResponse<{ message: string }>(res)),

  getHistory: (): Promise<WorkerPayout[]> =>
    fetch(`${API_URL}/payouts/history`, { headers: getHeaders() })
      .then(res => handleResponse<WorkerPayout[]>(res)),

  // DOPUNA: Storniranje isplate (ako se pogreši dugme "Isplati")
  voidPayout: (id: string): Promise<{ message: string }> =>
    fetch(`${API_URL}/payouts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(res => handleResponse<{ message: string }>(res)),
};