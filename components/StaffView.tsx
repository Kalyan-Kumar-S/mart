import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { Scan, Plus, Minus, X, CheckCircle, Search } from 'lucide-react';

const StaffView: React.FC = () => {
  const { products, stockItems, stores, currentStoreId, setStore, updateStock, setStockExact } = useStock();
  const [activeTab, setActiveTab] = useState<'scan' | 'list'>('scan');
  const [scannedProduct, setScannedProduct] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentStore = stores.find(s => s.id === currentStoreId);
  
  // Simulate Scanning
  const handleScan = () => {
    // Pick a random product to simulate a successful barcode scan
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    setScannedProduct(randomProduct.id);
  };

  const getProductStock = (productId: string) => {
    return stockItems.find(s => s.productId === productId && s.storeId === currentStoreId);
  };

  const currentProductInfo = scannedProduct ? products.find(p => p.id === scannedProduct) : null;
  const currentStockInfo = scannedProduct ? getProductStock(scannedProduct) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Bar */}
      <div className="p-4 bg-slate-800 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="font-bold text-lg">Staff Scanner</h2>
          <select 
            className="bg-transparent text-sm text-slate-400 border-none outline-none cursor-pointer"
            value={currentStoreId}
            onChange={(e) => setStore(e.target.value)}
          >
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex bg-slate-700 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${activeTab === 'scan' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
          >
            Scan
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${activeTab === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}
          >
            List
          </button>
        </div>
      </div>

      {activeTab === 'scan' ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {!scannedProduct ? (
            <div className="w-full max-w-sm flex flex-col items-center">
              <div 
                onClick={handleScan}
                className="w-64 h-64 border-4 border-dashed border-slate-600 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800/50 transition-all group"
              >
                <Scan size={48} className="text-slate-500 group-hover:text-indigo-500 mb-4 transition-colors" />
                <p className="text-slate-400 font-medium group-hover:text-white">Tap to Simulate Scan</p>
                <p className="text-xs text-slate-600 mt-2">Accesses Camera in Prod</p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700 animate-fade-in-up">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wide">Product Detected</p>
                  <h3 className="text-xl font-bold mt-1">{currentProductInfo?.name}</h3>
                  <p className="text-slate-500 text-sm font-mono mt-1">{currentProductInfo?.barcode}</p>
                </div>
                <button onClick={() => setScannedProduct(null)} className="p-2 bg-slate-700 rounded-full hover:bg-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 mb-6 text-center">
                <p className="text-slate-400 text-sm mb-2">Current Inventory</p>
                <div className="text-5xl font-bold text-white tracking-tight">{currentStockInfo?.quantity || 0}</div>
                <p className="text-xs text-slate-500 mt-2">Units in stock</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button 
                  onClick={() => updateStock(scannedProduct, currentStoreId, -1)}
                  className="bg-slate-700 hover:bg-rose-900/30 hover:border-rose-800 hover:text-rose-500 border border-transparent p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Minus size={24} />
                  <span className="font-semibold">Reduce</span>
                </button>
                <button 
                  onClick={() => updateStock(scannedProduct, currentStoreId, 1)}
                  className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-900/50"
                >
                  <Plus size={24} />
                  <span className="font-semibold">Add Stock</span>
                </button>
              </div>
              
              <button 
                onClick={() => setStockExact(scannedProduct, currentStoreId, 0)}
                className="w-full py-3 bg-slate-900/50 border border-slate-700 text-rose-400 rounded-xl font-medium hover:bg-rose-900/20 hover:border-rose-900/50 transition-colors"
              >
                Mark as Out of Stock
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="space-y-3">
             {stockItems.filter(s => s.storeId === currentStoreId)
               .map(item => {
                 const p = products.find(prod => prod.id === item.productId);
                 if (!p || (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()))) return null;
                 
                 return (
                   <div key={p.id} className="bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-700">
                     <div>
                       <h4 className="font-medium text-slate-200">{p.name}</h4>
                       <p className="text-xs text-slate-500">{p.barcode}</p>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="font-mono text-xl font-bold">{item.quantity}</span>
                       <button 
                         onClick={() => setScannedProduct(p.id)}
                         className="p-2 bg-slate-700 rounded-lg text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                       >
                         Edit
                       </button>
                     </div>
                   </div>
                 )
               })
             }
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffView;
