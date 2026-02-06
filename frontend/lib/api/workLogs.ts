import { API_URL, getHeaders, handleResponse } from "./config";
import { 
  WorkLog, 
  CreateBulkWorkLogPayload, 
  WorkerPayout 
} from "./types";

export const workLogApi = {
  /**
   * Bulk create work log entries for a specific project and date
   */
  createBulk: (data: CreateBulkWorkLogPayload): Promise<WorkLog[]> =>
    fetch(`${API_URL}/work-logs/bulk`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<WorkLog[]>(res)),

  /**
   * Fetch all work logs with optional date range filtering
   */
  getAll: (from?: string, to?: string): Promise<WorkLog[]> => {
    const url = from && to 
      ? `${API_URL}/work-logs?from=${from}&to=${to}` 
      : `${API_URL}/work-logs`;
    return fetch(url, { headers: getHeaders() })
      .then(res => handleResponse<WorkLog[]>(res));
  },

  /**
   * Fetch only pending (unpaid) work logs
   */
  getPending: (): Promise<WorkLog[]> =>
    fetch(`${API_URL}/work-logs/pending`, { headers: getHeaders() })
      .then(res => handleResponse<WorkLog[]>(res)),

  /**
   * Update an existing work log entry
   */
  update: (id: string, data: Partial<WorkLog>): Promise<WorkLog> =>
    fetch(`${API_URL}/work-logs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<WorkLog>(res)),

  /**
   * Permanently delete a work log entry
   */
  delete: (id: string): Promise<{ message: string }> =>
    fetch(`${API_URL}/work-logs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(res => handleResponse<{ message: string }>(res)),

  // --- PAYOUTS ---

  /**
   * Settle pending logs for a worker and archive them
   */
  settleWorker: (workerId: string, note?: string): Promise<{ message: string }> =>
    fetch(`${API_URL}/payouts/settle`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ workerId, note }),
    }).then(res => handleResponse<{ message: string }>(res)),

  /**
   * Fetch worker payout history
   */
  getHistory: (): Promise<WorkerPayout[]> =>
    fetch(`${API_URL}/payouts/history`, { headers: getHeaders() })
      .then(res => handleResponse<WorkerPayout[]>(res)),

  /**
   * Void a payout and return logs to PENDING status
   */
  voidPayout: (id: string): Promise<{ message: string }> =>
    fetch(`${API_URL}/payouts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(res => handleResponse<{ message: string }>(res)),
};