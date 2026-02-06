// frontend/types/prices.ts

export type Currency = 'EUR' | 'RSD' | 'USD';

export interface ClientPriceList {
  id: number;
  companyId: string;
  name: string;
  isActive: boolean;
  createdAt: string | Date;
}

export interface ClientPriceCategory {
  id: number;
  clientPriceListId: number;
  name: string;
  order: number;
}

export interface ClientPriceItem {
  id?: number; // Optional for new rows
  categoryId: number;
  description: string;
  unit: string;
  price: number;
  currency: Currency;
}

// For the Master Import selection
export interface MasterRegion {
  id: number;
  name: string;
  countryName: string;
}

export interface PriceTableProps {
  categoryId: number;
  title: string;
  isReadOnly?: boolean; // Added optional prop
}

export interface MasterPriceList {
  id: number;
  regionId: number;
  name: string;
  updatedAt?: string | Date;
}

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

export interface PriceTableProps {
  categoryId: number;
  title: string;
  isReadOnly?: boolean;
}