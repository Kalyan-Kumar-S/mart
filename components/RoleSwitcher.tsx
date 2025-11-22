import React from 'react';
import { useStock } from '../context/StockContext';
import { UserRole } from '../types';
import { Users, Briefcase, ShoppingCart } from 'lucide-react';

const RoleSwitcher: React.FC = () => {
  const { currentUserRole, setRole } = useStock();

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white shadow-xl rounded-full p-2 border border-slate-200 flex gap-2">
      <button
        onClick={() => setRole(UserRole.CUSTOMER)}
        className={`p-3 rounded-full transition-all ${currentUserRole === UserRole.CUSTOMER ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        title="Customer View"
      >
        <ShoppingCart size={20} />
      </button>
      <button
        onClick={() => setRole(UserRole.MANAGER)}
        className={`p-3 rounded-full transition-all ${currentUserRole === UserRole.MANAGER ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        title="Manager View"
      >
        <Briefcase size={20} />
      </button>
      <button
        onClick={() => setRole(UserRole.STAFF)}
        className={`p-3 rounded-full transition-all ${currentUserRole === UserRole.STAFF ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
        title="Staff View"
      >
        <Users size={20} />
      </button>
    </div>
  );
};

export default RoleSwitcher;
