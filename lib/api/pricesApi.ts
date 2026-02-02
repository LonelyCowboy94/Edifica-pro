import { handleResponse } from "./handleResponse";
import { 
  Country, 
  Region, 
  PriceCategory, 
  PriceItem, 
  BulkUpdateResponse,
  DeleteResponse // Dodajemo ovaj tip u types.ts ako ga nemaš
} from "@/app/[locale]/dashboard/admin/components/prices/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const pricesApi = {
  // --- CREATE ---
  createCountry: (name: string, code: string): Promise<Country> =>
    fetch(`${API_URL}/prices/countries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    }).then(res => handleResponse<Country>(res)),

  createRegion: (countryId: number, name: string): Promise<Region> =>
    fetch(`${API_URL}/prices/regions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryId, name }),
    }).then(res => handleResponse<Region>(res)),

  createCategory: (masterListId: number, name: string): Promise<PriceCategory> =>
    fetch(`${API_URL}/prices/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ masterListId, name }),
    }).then(res => handleResponse<PriceCategory>(res)),

  // --- READ ---
  getCountries: (): Promise<Country[]> => 
    fetch(`${API_URL}/prices/countries`).then(res => handleResponse<Country[]>(res)),
    
  getRegions: (countryId: number): Promise<Region[]> => 
    fetch(`${API_URL}/prices/regions/${countryId}`).then(res => handleResponse<Region[]>(res)),
    
  getCategories: (masterListId: number): Promise<PriceCategory[]> => 
    fetch(`${API_URL}/prices/categories/${masterListId}`).then(res => handleResponse<PriceCategory[]>(res)),

  getItems: (categoryId: number, page: number, search: string = ""): Promise<PriceItem[]> =>
    fetch(`${API_URL}/prices/items?categoryId=${categoryId}&page=${page}&search=${search}`)
      .then(res => handleResponse<PriceItem[]>(res)),

  // --- UPDATE ---
  bulkUpdateItems: (items: PriceItem[]): Promise<BulkUpdateResponse> =>
    fetch(`${API_URL}/prices/items/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    }).then(res => handleResponse<BulkUpdateResponse>(res)),

  // --- DELETE (Ispravljeno sa Generics i bez Any) ---
  deleteCountry: (id: number): Promise<DeleteResponse> =>
    fetch(`${API_URL}/prices/countries/${id}`, { 
      method: "DELETE" 
    }).then(res => handleResponse<DeleteResponse>(res)),

  deleteRegion: (id: number): Promise<DeleteResponse> =>
    fetch(`${API_URL}/prices/regions/${id}`, { 
      method: "DELETE" 
    }).then(res => handleResponse<DeleteResponse>(res)),

  deleteCategory: (id: number): Promise<DeleteResponse> =>
    fetch(`${API_URL}/prices/categories/${id}`, { 
      method: "DELETE" 
    }).then(res => handleResponse<DeleteResponse>(res)),

  deleteItem: (id: number): Promise<DeleteResponse> =>
    fetch(`${API_URL}/prices/items/${id}`, { 
      method: "DELETE" 
    }).then(res => handleResponse<DeleteResponse>(res)),
};