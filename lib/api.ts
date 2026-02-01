// src/lib/api.ts
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Pomoćna funkcija za dobavljanje headera sa tokenom.
 * Koristimo je za sve zaštićene rute.
 */
const getHeaders = () => {
  const token = Cookies.get('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// --- AUTH ---

export async function registerCompany(data: any) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function loginUser(data: any) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (result.token) {
    // Token traje 7 dana kao i na backendu
    Cookies.set('auth_token', result.token, { expires: 7 });
  }
  return result;
}

// --- KLIJENTI (CRUD) ---

export async function getClients() {
  const response = await fetch(`${API_URL}/clients`, { headers: getHeaders() });
  return response.json();
}

export async function addClient(data: any) {
  const response = await fetch(`${API_URL}/clients`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateClient(id: string, data: any) {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteClient(id: string) {
  const response = await fetch(`${API_URL}/clients/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
}

// --- PROJEKTI (CRUD) ---

export async function getProjects() {
  const response = await fetch(`${API_URL}/projects`, { headers: getHeaders() });
  return response.json();
}

export async function addProject(data: any) {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteProject(id: string) {
  const response = await fetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
}

// --- RADNICI (CRUD + Tier Check) ---

export async function getWorkers() {
  const response = await fetch(`${API_URL}/workers`, { headers: getHeaders() });
  return response.json();
}

export async function addWorker(data: any) {
  const response = await fetch(`${API_URL}/workers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  // Napomena: Ovde backend može vratiti 403 ako je limit paketa dostignut
  return response.json();
}

export async function deleteWorker(id: string) {
  const response = await fetch(`${API_URL}/workers/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return response.json();
}