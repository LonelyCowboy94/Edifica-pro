// frontend/lib/api/clientPricesApi.ts
import { ClientPriceList, ClientPriceCategory, ClientPriceItem } from "@/types/prices";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const getAuthHeader = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const clientPricesApi = {
  getLists: async (): Promise<ClientPriceList[]> => {
    const res = await fetch(`${API_URL}/client-prices`, { headers: getAuthHeader() });
    if (!res.ok) throw new Error("Failed to fetch lists");
    return res.json();
  },

  createList: async (name: string): Promise<ClientPriceList> => {
    const res = await fetch(`${API_URL}/client-prices`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error("Failed to create list");
    return res.json();
  },

  importMaster: async (masterListId: number, name: string): Promise<ClientPriceList> => {
    const res = await fetch(`${API_URL}/client-prices/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ masterListId, name })
    });
    if (!res.ok) throw new Error("Import failed");
    return res.json();
  },

  setActive: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/client-prices/${id}/set-active`, {
      method: "PATCH",
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error("Failed to set active");
  },

  deleteList: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/client-prices/${id}`, {
      method: "DELETE",
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error("Delete failed");
  },

  // --- CATEGORIES ---
  getCategories: async (listId: number): Promise<ClientPriceCategory[]> => {
    const res = await fetch(`${API_URL}/client-prices/${listId}/categories`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  },

  // NOVO: Omogućava klijentu da doda svoju kategoriju
  createCategory: async (listId: number, name: string): Promise<ClientPriceCategory> => {
    const res = await fetch(`${API_URL}/client-prices/${listId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error("Failed to create category");
    return res.json();
  },

  // --- ITEMS ---
  getItems: async (categoryId: number): Promise<ClientPriceItem[]> => {
    const res = await fetch(`${API_URL}/client-prices/categories/${categoryId}/items`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error("Failed to fetch items");
    return res.json();
  },

  bulkUpdateItems: async (items: ClientPriceItem[]): Promise<void> => {
    const res = await fetch(`${API_URL}/client-prices/items/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ items })
    });
    if (!res.ok) throw new Error("Bulk update failed");
  }
};