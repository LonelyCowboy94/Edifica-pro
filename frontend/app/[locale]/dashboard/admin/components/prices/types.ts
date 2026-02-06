export interface Country {
  id: number;
  name: string;
  code: string;
}

export interface Region {
  id: number;
  countryId: number;
  name: string;
}

export interface PriceCategory {
  id: number;
  masterPriceListId: number;
  name: string;
  order: number;
}

export interface PriceItem {
  id?: number;
  categoryId: number;
  description: string;
  unit: string;
  price: number;
  currency: string;
}

export interface BulkUpdateResponse {
  message: string;
  success?: boolean;
}

export interface DeleteResponse {
  message: string;
  success: boolean;
}