// frontend/lib/api/projects.ts
import { API_URL, getHeaders, handleResponse } from "./config";
import { ProjectData, ProjectDetailsResponse  } from "./types";

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
   * NEW: Fetches deep analytics, workers, and history for a single project.
   * Ovo nam treba za onaj "Lutka" interfejs detalja.
   */
   getDetails: (id: string): Promise<ProjectDetailsResponse> =>
    fetch(`${API_URL}/projects/${id}/details`, { 
      headers: getHeaders() 
    }).then(res => handleResponse<ProjectDetailsResponse>(res)),

  /**
   * Registers a new project.
   * Correctly omits id and companyId as they are handled by the backend.
   */
   create: (data: Omit<ProjectData, 'id' | 'companyId'>): Promise<ProjectData> =>
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
   * Removes a project from the record (Cascade deletes work logs).
   */
  delete: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(res => handleResponse<{ success: boolean }>(res)),
};