import { API_URL, getHeaders, handleResponse } from "./config";
import { CompanySettings, UpdateCompanyPayload, UpdateUserPayload } from "./types";

export const companyApi = {
  getSettings: (): Promise<CompanySettings> =>
    fetch(`${API_URL}/company/settings`, { 
      headers: getHeaders() 
    }).then(res => handleResponse<CompanySettings>(res)),

  updateSettings: (data: UpdateCompanyPayload): Promise<CompanySettings> =>
    fetch(`${API_URL}/company/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<CompanySettings>(res)),

  updateAccount: (data: UpdateUserPayload): Promise<{ message: string }> =>
    fetch(`${API_URL}/company/account`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<{ message: string }>(res)),
};