import Cookies from 'js-cookie';
import { API_URL, handleResponse, getHeaders } from "./config";
import { AuthResponse, UserMeResponse } from "./types";

export const authApi = {
  register: (data: Record<string, string>): Promise<AuthResponse> =>
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => handleResponse<AuthResponse>(res)),

  login: async (data: Record<string, string>): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<AuthResponse>(response);

    if (result.token) {
      Cookies.set('auth_token', result.token, { expires: 7 });
    }

    return result;
  },

  /**
   * Fetch current profile info to personalize the UI.
   */
  getMe: (): Promise<UserMeResponse> =>
    fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    }).then(res => handleResponse<UserMeResponse>(res)),

  logout: (): void => {
    Cookies.remove('auth_token');
  }
};