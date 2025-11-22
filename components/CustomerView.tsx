import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { getStatus, getStatusColor } from '../constants';
import { Search, MapPin, ShoppingBag, ChefHat, Check, X, Clock, Trash2, ArrowRight } from 'lucide-react';
import { getRecipeSuggestions } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const CustomerView: React.FC = () => {
  const { products, stockItems, stores, reserveItem, reservations, cancelReservation } = useStock();
  const [searchTerm, setSearchTerm] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<Set<string>>(new Set());
  const [recipeIdea, setRecipeIdea] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showReservations, setShowReservations] = useState(false);

  // Enhanced Search Logic: Token-based matching (simulate fuzzy)
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    const tokens = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    
    return products.filter(p => {
      const searchString = `${p.name} ${p.category} ${p.barcode}`.toLowerCase();
      // All tokens must match
      return tokens.every(token => searchString.includes(token));
    });
  }, [searchTerm, products]);

  // Suggestions Logic
  const suggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 5);
  }, [searchTerm, products]);

  const handleGenerateRecipe = async () => {
    if (recipeIngredients.size === 0) return;
    setLoadingRecipe(true);
    setRecipeIdea(null);
    const selectedProds = products.filter(p => recipeIngredients.has(p.id));
    const result = await getRecipeSuggestions(selectedProds);
    setRecipeIdea(result);
    setLoadingRecipe(false);
  };

  const toggleRecipeIngredient = (id: string) => {
    const newSet = new Set(recipeIngredients);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRecipeIngredients(newSet);
  };

  // calculate total value of reservations
  const totalReservationValue = reservations.reduce((acc, res) => {
     const itemStock = stockItems.find(s => s.productId === res.productId && s.storeId === res.storeId);
     return acc + (itemStock?.price || 0) * res.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="text-blue-600" /> StockSync
            </h1>
            <div className="flex gap-2">
               {/* Cart / Reservations Button */}
              <button 
                onClick={() => setShowReservations(true)}
                className="relative p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                title="My Reservations"
              >
                <ShoppingBag size={20} />
                {reservations.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {reservations.length}
                  </span>
                )}
              </button>

              <button 
                onClick={handleGenerateRecipe}
                disabled={recipeIngredients.size === 0 || loadingRecipe}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${recipeIngredients.size > 0 ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                <ChefHat size={18} />
                {loadingRecipe ? 'Thinking...' : 'AI Recipe'}
              </button>
            </div>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="relative z-20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search for apples, milk, pasta..."
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X size={16} />
                </button>
              )}
            </div>
            
            {/* Search Suggestions Dropdown */}
            {isSearchFocused && searchTerm.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                   {suggestions.length > 0 ? (
                       <div className="py-2">
                           <p className="px-4 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Suggestions</p>
                           {suggestions.map(p => (
                               <button
                                   key={p.id}
                                   onClick={() => setSearchTerm(p.name)}
                                   className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 transition-colors border-l-2 border-transparent hover:border-blue-500"
                               >
                                   <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                       <img src={p.image} alt="" className="w-full h-full object-cover" />
                                   </div>
                                   <span className="text-slate-700 font-medium">{p.name}</span>
                               </button>
                           ))}
                       </div>
                   ) : (
                       <div className="p-4 text-center text-slate-500 text-sm italic">
                           No direct matches found. Searching keywords...
                       </div>
                   )}
                </div>
            )}
          </div>
        </div>
      </header>

      {/* Reservations Modal (Cart) */}
      {showReservations && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300">
             <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                   <ShoppingBag size={24} className="text-blue-600" /> My Reservations
                </h2>
                <button onClick={() => setShowReservations(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                   <X size={20} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {reservations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-slate-900 font-medium">No active reservations</h3>
                    <p className="text-slate-500 text-sm mt-1">Items you reserve will appear here.</p>
                  </div>
                ) : (
                  reservations.map(res => {
                    const product = products.find(p => p.id === res.productId);
                    const store = stores.find(s => s.id === res.storeId);
                    const stockInfo = stockItems.find(s => s.productId === res.productId && s.storeId === res.storeId);
                    if (!product || !store) return null;
                    
                    const minutesLeft = Math.ceil((res.expiresAt - Date.now()) / 60000);

                    return (
                      <div key={res.id} className="flex gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-slate-200 shrink-0">
                           <img src={product.image} alt="" className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-slate-900 truncate">{product.name}</h4>
                              <span className="text-sm font-bold text-slate-700">${stockInfo?.price.toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                               <MapPin size={12} /> {store.name}
                            </p>
                            <div className="flex justify-between items-end mt-2">
                               <div className="flex items-center gap-3 text-xs">
                                  <span className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 font-medium">Qty: {res.quantity}</span>
                                  <span className="text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                     <Clock size={12} /> Expires in {minutesLeft}m
                                  </span>
                               </div>
                               <button 
                                 onClick={() => cancelReservation(res.id)}
                                 className="text-rose-500 text-xs font-medium hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                               >
                                 <Trash2 size={12} /> Remove
                               </button>
                            </div>
                         </div>
                      </div>
                    );
                  })
                )}
             </div>

             {reservations.length > 0 && (
               <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500">Total Reserved Value</span>
                    <span className="text-xl font-bold text-slate-900">${totalReservationValue.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => setShowReservations(false)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex justify-center items-center gap-2"
                  >
                    Continue Shopping <ArrowRight size={18} />
                  </button>
                  <p className="text-xs text-center text-slate-400 mt-3">
                    Please pick up items before they expire. Payment is made in-store.
                  </p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        
        {/* AI Recipe Result */}
        {recipeIdea && (
          <div className="mb-8 bg-purple-50 border border-purple-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                <ChefHat size={18} /> Gemini Chef Suggests:
              </h3>
              <button onClick={() => setRecipeIdea(null)} className="text-purple-400 hover:text-purple-700">
                <X size={20} />
              </button>
            </div>
            <div className="prose prose-purple prose-sm text-slate-700">
             <ReactMarkdown>{recipeIdea}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="space-y-6">
            {filteredProducts.length === 0 ? (
                 <div className="text-center py-12">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-slate-900 font-medium mb-1">No products found</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your search terms</p>
                 </div>
            ) : (
                filteredProducts.map(product => {
                    const productStocks = stockItems.filter(s => s.productId === product.id);
                    const bestPrice = Math.min(...productStocks.map(s => s.price));
                    const isSelectedForRecipe = recipeIngredients.has(product.id);

                    return (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex p-4 gap-4">
                        <div className="w-24 h-24 bg-slate-100 rounded-lg shrink-0 overflow-hidden relative group">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            <button 
                              onClick={() => toggleRecipeIngredient(product.id)}
                              title={isSelectedForRecipe ? "Remove from Recipe Ideas" : "Add to Recipe Ideas"}
                              className={`absolute top-1 right-1 p-1.5 rounded-full shadow-sm transition-all ${isSelectedForRecipe ? 'bg-purple-600 text-white' : 'bg-white/80 backdrop-blur text-slate-400 opacity-0 group-hover:opacity-100'}`}
                            >
                              <ChefHat size={14} />
                            </button>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                            <div>
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{product.category}</span>
                                <h3 className="font-semibold text-lg text-slate-900 truncate">{product.name}</h3>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm text-slate-500">from</span>
                                <span className="font-bold text-lg text-blue-600">${bestPrice.toFixed(2)}</span>
                            </div>
                            </div>

                            <div className="mt-4 space-y-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase">Availability Nearby</p>
                            {productStocks.map(stock => {
                                const store = stores.find(s => s.id === stock.storeId);
                                const status = getStatus(stock.quantity);
                                if (!store) return null;

                                return (
                                <div key={stock.storeId} className="flex items-center justify-between text-sm py-1 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-slate-700">
                                    <MapPin size={14} className="text-slate-400" />
                                    <span className="truncate max-w-[120px] sm:max-w-none">{store.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                    <span className="text-slate-600 font-medium">${stock.price.toFixed(2)}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(status)}`}>
                                        {status.replace('_', ' ')}
                                    </span>
                                    <button
                                        disabled={stock.quantity === 0}
                                        onClick={() => {
                                            reserveItem(product.id, store.id, 1);
                                            setShowReservations(true);
                                        }}
                                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Reserve
                                    </button>
                                    </div>
                                </div>
                                );
                            })}
                            </div>
                        </div>
                        </div>
                    </div>
                    );
                })
            )}
        </div>
      </main>
    </div>
  );
};

export default CustomerView;