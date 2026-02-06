import { API_URL, getHeaders, handleResponse } from "./config";
import { WorkerData } from "./types";

/**
 * Service for managing worker-related API calls.
 */
export const workersApi = {
  /**
   * Fetches all workers for the current company.
   */
  getAll: (): Promise<WorkerData[]> =>
    fetch(`${API_URL}/workers`, { 
      headers: getHeaders() 
    }).then(res => handleResponse<WorkerData[]>(res)),

  /**
   * Creates a new worker record.
   */
  create: (data: Omit<WorkerData, 'id'>): Promise<WorkerData> =>
    fetch(`${API_URL}/workers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<WorkerData>(res)),

  /**
   * Updates an existing worker's details.
   */
  update: (id: string, data: Partial<WorkerData>): Promise<WorkerData> =>
    fetch(`${API_URL}/workers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<WorkerData>(res)),

  /**
   * Deletes a worker from the system.
   */
  delete: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_URL}/workers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(res => handleResponse<{ success: boolean }>(res)),
};