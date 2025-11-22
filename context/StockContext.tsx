import React, { createContext, useContext, useState, ReactNode, PropsWithChildren } from 'react';
import { Product, Store, StockItem, Reservation, Alert, UserRole } from '../types';
import { MOCK_PRODUCTS, MOCK_STORES, INITIAL_STOCK } from '../constants';

interface StockContextType {
  products: Product[];
  stores: Store[];
  stockItems: StockItem[];
  reservations: Reservation[];
  alerts: Alert[];
  currentUserRole: UserRole;
  currentStoreId: string; // For manager/staff view
  setRole: (role: UserRole) => void;
  setStore: (storeId: string) => void;
  updateStock: (productId: string, storeId: string, delta: number) => void;
  setStockExact: (productId: string, storeId: string, qty: number) => void;
  reserveItem: (productId: string, storeId: string, quantity: number) => void;
  cancelReservation: (reservationId: string) => void;
  addAlert: (message: string, type: Alert['type']) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [stores] = useState<Store[]>(MOCK_STORES);
  const [stockItems, setStockItems] = useState<StockItem[]>(INITIAL_STOCK);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // App State
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [currentStoreId, setCurrentStoreId] = useState<string>(MOCK_STORES[0].id);

  // Helper to add alert
  const addAlert = (message: string, type: Alert['type']) => {
    const newAlert: Alert = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now(),
      read: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const updateStock = (productId: string, storeId: string, delta: number) => {
    setStockItems(prev => prev.map(item => {
      if (item.productId === productId && item.storeId === storeId) {
        const newQty = Math.max(0, item.quantity + delta);
        if (newQty < 5 && item.quantity >= 5) {
          addAlert(`Low stock detected for ${products.find(p=>p.id===productId)?.name}`, 'LOW_STOCK');
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const setStockExact = (productId: string, storeId: string, qty: number) => {
    setStockItems(prev => prev.map(item => {
      if (item.productId === productId && item.storeId === storeId) {
        return { ...item, quantity: Math.max(0, qty) };
      }
      return item;
    }));
  };

  const reserveItem = (productId: string, storeId: string, quantity: number) => {
    setStockItems(prev => prev.map(item => {
      if (item.productId === productId && item.storeId === storeId) {
        if (item.quantity >= quantity) {
          const newReservation: Reservation = {
            id: Math.random().toString(36).substr(2, 9),
            productId,
            storeId,
            quantity,
            expiresAt: Date.now() + 3600000 // 1 hour
          };
          setReservations(curr => [...curr, newReservation]);
          return { ...item, quantity: item.quantity - quantity, reserved: item.reserved + quantity };
        }
      }
      return item;
    }));
  };

  const cancelReservation = (reservationId: string) => {
    const res = reservations.find(r => r.id === reservationId);
    if (res) {
      // Return stock to inventory
      updateStock(res.productId, res.storeId, res.quantity);
      // Remove from reservations
      setReservations(prev => prev.filter(r => r.id !== reservationId));
    }
  };

  return (
    <StockContext.Provider value={{
      products,
      stores,
      stockItems,
      reservations,
      alerts,
      currentUserRole,
      currentStoreId,
      setRole: setCurrentUserRole,
      setStore: setCurrentStoreId,
      updateStock,
      setStockExact,
      reserveItem,
      cancelReservation,
      addAlert
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};