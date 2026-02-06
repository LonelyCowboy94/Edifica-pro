import { API_URL, getHeaders, handleResponse } from "./config";
import { DashboardResponse } from "./types";

export const dashboardApi = {
  getStats: (): Promise<DashboardResponse> =>
    fetch(`${API_URL}/dashboard/stats`, {
      headers: getHeaders(),
    }).then(handleResponse<DashboardResponse>),
};