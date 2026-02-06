import Cookies from 'js-cookie';
import { API_URL, handleResponse } from "./config";
import { AuthResponse } from "./types";

/**
 * Service for user authentication and company registration.
 */
export const authApi = {
  /**
   * Registers a new company and admin user.
   */
  register: (data: Record<string, string>): Promise<AuthResponse> =>
    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => handleResponse<AuthResponse>(res)),

  /**
   * Logs in a user and stores the session token in cookies.
   */
  login: async (data: Record<string, string>): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<AuthResponse>(response);

    if (result.token) {
      // Persist the token for 7 days
      Cookies.set('auth_token', result.token, { expires: 7 });
    }

    return result;
  },

  /**
   * Removes the session token (Logout).
   */
  logout: (): void => {
    Cookies.remove('auth_token');
  }
};