import { API_URL, getHeaders, handleResponse } from "./config";
import { ClientData } from "./types";

export const clientsApi = {
  getAll: (): Promise<ClientData[]> => 
    fetch(`${API_URL}/clients`, { headers: getHeaders() }).then(res => handleResponse<ClientData[]>(res)),

  create: (data: Omit<ClientData, 'id'>): Promise<ClientData> =>
    fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<ClientData>(res)),

  update: (id: string, data: Partial<ClientData>): Promise<ClientData> =>
    fetch(`${API_URL}/clients/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<ClientData>(res)),

  delete: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(res => handleResponse<{ success: boolean }>(res)),
};