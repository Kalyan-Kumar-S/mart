import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { getStatus, getStatusColor } from '../constants';
import { LayoutDashboard, AlertTriangle, TrendingUp, Package, RefreshCcw, Store, Sparkles, Users, Settings, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getInventoryInsights } from '../services/geminiService';

type ViewSection = 'dashboard' | 'inventory' | 'staff' | 'settings';

const ManagerView: React.FC = () => {
  const { products, stockItems, stores, currentStoreId, setStore, alerts } = useStock();
  const [insight, setInsight] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewSection>('dashboard');

  const currentStore = stores.find(s => s.id === currentStoreId);
  const storeStock = stockItems.filter(s => s.storeId === currentStoreId);

  // Stats
  const lowStockCount = storeStock.filter(s => s.quantity < 10 && s.quantity > 0).length;
  const outStockCount = storeStock.filter(s => s.quantity === 0).length;
  const totalItems = storeStock.reduce((acc, curr) => acc + curr.quantity, 0);

  // Chart Data Preparation
  const chartData = storeStock.map(s => {
    const product = products.find(p => p.id === s.productId);
    return {
      name: product?.name.substring(0, 10) + '...', // Truncate for chart
      stock: s.quantity,
      reserved: s.reserved
    };
  }).slice(0, 8); // Top 8 for display

  const handleAnalyze = async () => {
    if (!currentStore) return;
    setAnalyzing(true);
    const result = await getInventoryInsights(currentStore, storeStock, products);
    setInsight(result);
    setAnalyzing(false);
  };

  const renderDashboard = () => (
    <>
        {/* AI Insight Panel */}
        {insight && (
          <div className="mb-8 bg-white rounded-xl shadow border border-indigo-100 p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-500" /> Executive Summary
              </h3>
              <button onClick={() => setInsight(null)} className="text-slate-400 hover:text-slate-600">Close</button>
            </div>
            <div className="prose prose-indigo prose-sm max-w-none">
                <div className="whitespace-pre-line text-slate-700">{insight}</div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Stock</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalItems}</h3>
              </div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Package size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</h3>
              </div>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Out of Stock</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{outStockCount}</h3>
              </div>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <Store size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Alerts</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{alerts.filter(a => !a.read).length}</h3>
              </div>
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-6">Stock Level Distribution</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="stock" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Inventory List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-800">Critical Inventory</h3>
              <button onClick={() => setCurrentView('inventory')} className="text-indigo-600 text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="divide-y divide-slate-100">
              {storeStock.filter(s => s.quantity < 15).slice(0,5).map(item => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={item.productId} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden">
                        <img src={product?.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{product?.name}</p>
                        <p className="text-xs text-slate-500">{product?.barcode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(getStatus(item.quantity))}`}>
                         {item.quantity} units
                       </span>
                    </div>
                  </div>
                );
              })}
              {storeStock.filter(s => s.quantity < 15).length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  <Check size={24} className="mx-auto mb-2 text-emerald-500" />
                  <p>Stock levels look healthy.</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </>
  );

  const renderInventory = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">Full Inventory List</h3>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search inventory..." className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
            </div>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Barcode</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-right">Stock</th>
                    <th className="px-6 py-4 text-center">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {storeStock.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                        <tr key={item.productId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{product?.name}</td>
                            <td className="px-6 py-4 text-slate-500">{product?.category}</td>
                            <td className="px-6 py-4 font-mono text-slate-500">{product?.barcode}</td>
                            <td className="px-6 py-4 text-right">${item.price.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">{item.quantity}</td>
                            <td className="px-6 py-4 text-center">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(getStatus(item.quantity))}`}>
                                    {getStatus(item.quantity).replace('_', ' ')}
                                </span>
                            </td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
    </div>
  );

  const renderStaff = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Staff Management</h3>
        <p className="text-slate-500 max-w-md mx-auto mb-6">Manage access, shift schedules, and view activity logs for staff members assigned to {currentStore?.name}.</p>
        <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Add New Staff Member
        </button>
        
        <div className="mt-8 text-left border rounded-lg overflow-hidden">
             <div className="bg-slate-50 px-4 py-3 border-b font-medium text-sm text-slate-500">Active Staff</div>
             <div className="p-4 flex items-center justify-between hover:bg-slate-50 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    <div>
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-slate-500">Stock Clerk</p>
                    </div>
                </div>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Active Now</span>
             </div>
             <div className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    <div>
                        <p className="text-sm font-medium">Jane Smith</p>
                        <p className="text-xs text-slate-500">Manager</p>
                    </div>
                </div>
                <span className="text-xs text-slate-500">Last active 2h ago</span>
             </div>
        </div>
    </div>
  );

  const renderSettings = () => (
     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
         <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
             <Settings size={20} /> Store Settings
         </h3>
         
         <div className="space-y-6 max-w-2xl">
             <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Store Name</label>
                 <input type="text" value={currentStore?.name} disabled className="w-full p-2 border rounded bg-slate-50 text-slate-500" />
             </div>
             
             <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">Low Stock Alert Threshold</label>
                 <div className="flex items-center gap-4">
                    <input type="range" min="1" max="50" defaultValue="10" className="flex-1" />
                    <span className="font-mono font-bold text-slate-900">10 units</span>
                 </div>
                 <p className="text-xs text-slate-500 mt-1">Alerts will be triggered when stock falls below this level.</p>
             </div>

             <div className="flex items-center justify-between pt-4 border-t">
                 <div>
                     <h4 className="font-medium text-slate-900">Auto-Reorder</h4>
                     <p className="text-sm text-slate-500">Automatically generate purchase orders for low stock</p>
                 </div>
                 <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                     <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"/>
                 </button>
             </div>
         </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard /> Admin
          </h2>
        </div>
        <nav className="px-4 space-y-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full text-left px-4 py-2 rounded-lg cursor-pointer transition-colors ${currentView === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView('inventory')}
            className={`w-full text-left px-4 py-2 rounded-lg cursor-pointer transition-colors ${currentView === 'inventory' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setCurrentView('staff')}
            className={`w-full text-left px-4 py-2 rounded-lg cursor-pointer transition-colors ${currentView === 'staff' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            Staff
          </button>
          <button 
            onClick={() => setCurrentView('settings')}
            className={`w-full text-left px-4 py-2 rounded-lg cursor-pointer transition-colors ${currentView === 'settings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
          >
            Settings
          </button>
        </nav>
        <div className="p-6 mt-auto">
          <label className="text-xs font-semibold uppercase text-slate-500 mb-2 block">Select Store</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
            value={currentStoreId}
            onChange={(e) => setStore(e.target.value)}
          >
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{currentStore?.name}</h1>
            <p className="text-slate-500">
                {currentView === 'dashboard' && 'Real-time inventory overview'}
                {currentView === 'inventory' && 'Manage stock levels and pricing'}
                {currentView === 'staff' && 'Employee management portal'}
                {currentView === 'settings' && 'Configure store preferences'}
            </p>
          </div>
          {currentView === 'dashboard' && (
            <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
                <Sparkles size={18} />
                {analyzing ? 'Analyzing Data...' : 'AI Insights'}
            </button>
          )}
        </header>

        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'inventory' && renderInventory()}
        {currentView === 'staff' && renderStaff()}
        {currentView === 'settings' && renderSettings()}
        
      </main>
    </div>
  );
};

// Simple check icon for the empty state
const Check = ({size, className}: {size: number, className: string}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default ManagerView;