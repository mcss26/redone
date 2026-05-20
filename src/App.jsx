import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './layouts/Login';
import AdminIndex from './layouts/AdminIndex';
import OperativoIndex from './layouts/OperativoIndex';
import ProfilesModule from './layouts/ProfilesModule';
import SuppliersModule from './layouts/SuppliersModule';
import SkuModule from './layouts/SkuModule';
import MasterVouchersModule from './layouts/MasterVouchersModule';
import BarInventoryModule from './layouts/BarInventoryModule';
import StaffRolesModule from './layouts/StaffRolesModule';
import CostTemplatesModule from './layouts/CostTemplatesModule';
import PosTerminalsModule from './layouts/PosTerminalsModule';
import WorkDaysModule from './layouts/WorkDaysModule';
import OpeningCostsModule from './layouts/OpeningCostsModule';
import StaffPlanModule from './layouts/StaffPlanModule';
import StockRequestsModule from './layouts/StockRequestsModule';
import PaymentsModule from './layouts/PaymentsModule';
import NightOpsModule from './layouts/NightOpsModule';
import NightReportModule from './layouts/NightReportModule';
import MonthlyReportModule from './layouts/MonthlyReportModule';
import AnnualReportModule from './layouts/AnnualReportModule';
import { LogOut, User } from 'lucide-react';

function AppShell() {
  const { user, logout, canAccess } = useAuth();
  const [activeView, setActiveView] = useState('index');
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);

  // If not logged in, show PIN screen
  if (!user) return <Login />;

  const handleNavigation = (view) => {
    setActiveView(view);
    setIsAvatarOpen(false);
  };

  const ROUTE_MAP = {
    profiles:       ProfilesModule,
    suppliers:      SuppliersModule,
    sku:            SkuModule,
    master_vouchers: MasterVouchersModule,
    bar_inventory:  BarInventoryModule,
    staff_roles:    StaffRolesModule,
    cost_templates: CostTemplatesModule,
    pos_terminals:  PosTerminalsModule,
    work_days:      WorkDaysModule,
    opening_costs:  OpeningCostsModule,
    staff_plan:     StaffPlanModule,
    stock_requests: StockRequestsModule,
    payments:       PaymentsModule,
    workday:        NightOpsModule,
    night_report:   NightReportModule,
    monthly_report: MonthlyReportModule,
    annual_report:  AnnualReportModule,
  };

  const renderView = () => {
    if (activeView === 'index') {
      if (user.role === 'operativo') {
        return <OperativoIndex onNavigate={handleNavigation} />;
      }
      return <AdminIndex onNavigate={handleNavigation} />;
    }

    // Role-gating: bounce unauthorized access back to index
    if (!canAccess(activeView)) return <AdminIndex onNavigate={handleNavigation} />;

    const Component = ROUTE_MAP[activeView];
    if (Component) return <Component onNavigate={handleNavigation} />;

    return <AdminIndex onNavigate={handleNavigation} />;
  };

  const ROLE_COLOR = {
    admin:     'text-brand-success',
    operativo: 'text-brand-accent',
    contador:  'text-brand-warning',
    encargado: 'text-brand-accent',
    viewer:    'text-brand-muted',
  };

  return (
    <div className="flex flex-col h-screen w-full bg-brand-bg overflow-hidden relative">
      
      {/* TOP BAR */}
      <header className="h-14 flex items-center justify-between px-8 bg-brand-bg shrink-0 z-50 border-b border-brand-border/20">
        
        {/* Left: Brand */}
        <button 
          onClick={() => handleNavigation('index')}
          className="text-[11px] font-extrabold text-brand-muted tracking-[0.3em] uppercase hover:text-brand-text transition-colors cursor-pointer"
        >
          MIDNIGHT CLUB
        </button>

        {/* Right: User */}
        <div className="relative">
          <button 
            onClick={() => setIsAvatarOpen(!isAvatarOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-brand-surface transition-colors cursor-pointer"
          >
            <span className={`text-[10px] font-bold uppercase tracking-widest ${ROLE_COLOR[user.role]}`}>
              {user.role}
            </span>
            <div className="w-7 h-7 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center">
              <User size={12} className="text-brand-muted" />
            </div>
          </button>

          {/* Avatar Dropdown */}
          {isAvatarOpen && (
            <div className="absolute top-11 right-0 w-52 bg-brand-bg border border-brand-border rounded-xl shadow-2xl py-1 z-50">
              <div className="px-4 py-3 border-b border-brand-border/30">
                <div className="text-xs font-semibold text-brand-text truncate">{user.full_name}</div>
                <div className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${ROLE_COLOR[user.role]}`}>{user.role}</div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-brand-error text-[10px] font-bold hover:bg-brand-error/5 transition-colors cursor-pointer uppercase tracking-widest"
              >
                <LogOut size={12} />
                Salir
              </button>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
