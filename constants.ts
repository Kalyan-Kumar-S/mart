import { Product, Store, StockItem, StockStatus } from './types';

export const APP_NAME = "StockSync";

export const MOCK_STORES: Store[] = [
  { id: 's1', name: 'SuperMart Downtown', location: '123 Main St' },
  { id: 's2', name: 'FreshGrocer West', location: '456 West Ave' },
  { id: 's3', name: 'EcoMarket North', location: '789 North Blvd' },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Organic Bananas', category: 'Produce', barcode: '4011', image: 'https://picsum.photos/200/200?random=1', basePrice: 0.99 },
  { id: 'p2', name: 'Whole Milk 1Gal', category: 'Dairy', barcode: '123456', image: 'https://picsum.photos/200/200?random=2', basePrice: 3.49 },
  { id: 'p3', name: 'Sourdough Bread', category: 'Bakery', barcode: '789012', image: 'https://picsum.photos/200/200?random=3', basePrice: 4.99 },
  { id: 'p4', name: 'Free-Range Eggs', category: 'Dairy', barcode: '345678', image: 'https://picsum.photos/200/200?random=4', basePrice: 5.99 },
  { id: 'p5', name: 'Avocado', category: 'Produce', barcode: '4225', image: 'https://picsum.photos/200/200?random=5', basePrice: 1.50 },
  { id: 'p6', name: 'Pasta Sauce', category: 'Pantry', barcode: '901234', image: 'https://picsum.photos/200/200?random=6', basePrice: 2.99 },
];

// Initial stock generation
export const INITIAL_STOCK: StockItem[] = [];
MOCK_STORES.forEach(store => {
  MOCK_PRODUCTS.forEach(product => {
    // Randomize stock and slightly vary price per store
    const qty = Math.floor(Math.random() * 50); 
    const priceVariance = (Math.random() * 0.5) - 0.25;
    INITIAL_STOCK.push({
      storeId: store.id,
      productId: product.id,
      quantity: qty,
      price: Number((product.basePrice + priceVariance).toFixed(2)),
      reserved: 0
    });
  });
});

export const getStatus = (qty: number): StockStatus => {
  if (qty <= 0) return StockStatus.OUT_OF_STOCK;
  if (qty < 10) return StockStatus.LOW_STOCK;
  return StockStatus.IN_STOCK;
};

export const getStatusColor = (status: StockStatus): string => {
  switch (status) {
    case StockStatus.IN_STOCK: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case StockStatus.LOW_STOCK: return 'bg-amber-100 text-amber-800 border-amber-200';
    case StockStatus.OUT_OF_STOCK: return 'bg-rose-100 text-rose-800 border-rose-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};
