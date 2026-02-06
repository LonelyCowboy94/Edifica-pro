import { API_URL, getHeaders, handleResponse } from "./config";
import { 
  Country, 
  Region, 
  PriceCategory, 
  PriceItem, 
  BulkUpdateResponse,
  DeleteResponse,
} from "@/app/[locale]/dashboard/admin/components/prices/types";
import { MasterPriceList } from "@/types/prices";

export const pricesApi = {
  // --- CREATE ---
  createCountry: (name: string, code: string): Promise<Country> =>
    fetch(`${API_URL}/prices/countries`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, code }),
    }).then(res => handleResponse<Country>(res)),

  createRegion: (countryId: number, name: string): Promise<Region> =>
    fetch(`${API_URL}/prices/regions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ countryId, name }),
    }).then(res => handleResponse<Region>(res)),

  createCategory: (masterListId: number, name: string): Promise<PriceCategory> =>
    fetch(`${API_URL}/prices/categories`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ masterListId, name }),
    }).then(res => handleResponse<PriceCategory>(res)),

  // --- READ ---
  getCountries: (): Promise<Country[]> => 
    fetch(`${API_URL}/prices/countries`, { 
      headers: getHeaders() 
    }).then(res => handleResponse<Country[]>(res)),
    
  getRegions: (countryId: number): Promise<Region[]> => 
    fetch(`${API_URL}/prices/regions/${countryId}`, { 
      headers: getHeaders() 
    }).then(res => handleResponse<Region[]>(res)),
    
  getCategories: (masterListId: number): Promise<PriceCategory[]> => 
    fetch(`${API_URL}/prices/categories/${masterListId}`, { 
      headers: getHeaders() 
    }).then(res => handleResponse<PriceCategory[]>(res)),

  getMasterLists: (regionId: number): Promise<MasterPriceList[]> =>
    fetch(`${API_URL}/prices/master-lists?regionId=${regionId}`, {
      headers: getHeaders()
    }).then(res => handleResponse<MasterPriceList[]>(res)),

  getItems: (categoryId: number, page: number, search: string = ""): Promise<PriceItem[]> =>
    fetch(`${API_URL}/prices/items?categoryId=${categoryId}&page=${page}&search=${search}`, {
      headers: getHeaders()
    }).then(res => handleResponse<PriceItem[]>(res)),

  // --- UPDATE ---
  bulkUpdateItems: (items: PriceItem[]): Promise<BulkUpdateResponse> =>
    fetch(`${API_URL}/prices/items/bulk`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ items }),
    }).then(res => handleResponse<BulkUpdateResponse>(res)),

  // --- DELETE ---
  deleteCountry: (id: number): Promise<DeleteResponse> =>
    fetch(`${API_URL}/prices/countries/${id}`, { 
      method: "DELETE",
      headers: getHeaders()
    }).then(res => handleResponse<DeleteResponse>(res)),

  deleteRegion: (id: number): Promise<DeleteResponse> =>
    fetch(`${API_URL}/prices/regions/${id}`, { 
      method: "DELETE",
      headers: getHeaders()
    }).then(res => handleResponse<DeleteResponse>(res)),

  deleteCategory: (id: number): Promise<DeleteResponse> =>
    fetch(`${API_URL}/prices/categories/${id}`, { 
      method: "DELETE",
      headers: getHeaders()
    }).then(res => handleResponse<DeleteResponse>(res)),

  deleteItem: (id: number): Promise<DeleteResponse> =>
    fetch(`${API_URL}/prices/items/${id}`, { 
      method: "DELETE",
      headers: getHeaders()
    }).then(res => handleResponse<DeleteResponse>(res)),
};