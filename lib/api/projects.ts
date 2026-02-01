import { API_URL, getHeaders, handleResponse } from "./config";
import { ProjectData } from "./types";

/**
 * Service for managing construction projects.
 */
export const projectsApi = {
  /**
   * Retrieves the full list of company projects.
   */
  getAll: (): Promise<ProjectData[]> =>
    fetch(`${API_URL}/projects`, { 
      headers: getHeaders() 
    }).then(res => handleResponse<ProjectData[]>(res)),

  /**
   * Registers a new project.
   */
  create: (data: Omit<ProjectData, 'id'>): Promise<ProjectData> =>
    fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<ProjectData>(res)),

  /**
   * Updates project status or details.
   */
  update: (id: string, data: Partial<ProjectData>): Promise<ProjectData> =>
    fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(res => handleResponse<ProjectData>(res)),

  /**
   * Removes a project from the record.
   */
  delete: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(res => handleResponse<{ success: boolean }>(res)),
};