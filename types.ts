export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

export interface Product {
  id: string;
  name: string;
  category: string;
  barcode: string;
  image: string; // Placeholder URL
  basePrice: number;
}

export interface Store {
  id: string;
  name: string;
  location: string;
}

export interface StockItem {
  productId: string;
  storeId: string;
  quantity: number;
  price: number; // Store specific price
  reserved: number;
}

export interface Reservation {
  id: string;
  productId: string;
  storeId: string;
  quantity: number;
  expiresAt: number;
}

export interface Alert {
  id: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'SYSTEM';
  message: string;
  timestamp: number;
  read: boolean;
}
