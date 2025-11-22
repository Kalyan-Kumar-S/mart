import React from 'react';
import { StockProvider, useStock } from './context/StockContext';
import RoleSwitcher from './components/RoleSwitcher';
import CustomerView from './components/CustomerView';
import ManagerView from './components/ManagerView';
import StaffView from './components/StaffView';
import { UserRole } from './types';

const MainLayout: React.FC = () => {
  const { currentUserRole } = useStock();

  const renderView = () => {
    switch (currentUserRole) {
      case UserRole.CUSTOMER:
        return <CustomerView />;
      case UserRole.MANAGER:
        return <ManagerView />;
      case UserRole.STAFF:
        return <StaffView />;
      default:
        return <CustomerView />;
    }
  };

  return (
    <div className="relative">
      {renderView()}
      <RoleSwitcher />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StockProvider>
      <MainLayout />
    </StockProvider>
  );
};

export default App;
