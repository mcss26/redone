import React, { useState, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './layouts/Login';
import AdminIndex from './layouts/AdminIndex';
import OperativoIndex from './layouts/OperativoIndex';
import ContadorIndex from './layouts/ContadorIndex';
import EncargadoIndex from './layouts/EncargadoIndex';
import { LogOut, User } from 'lucide-react';
import ViewLoader from './components/ViewLoader';

const ProfilesModule = React.lazy(() => import('./layouts/ProfilesModule'));
const SuppliersModule = React.lazy(() => import('./layouts/SuppliersModule'));
const SkuModule = React.lazy(() => import('./layouts/SkuModule'));
const MasterVouchersModule = React.lazy(() => import('./layouts/MasterVouchersModule'));
const BarInventoryModule = React.lazy(() => import('./layouts/BarInventoryModule'));
const StaffRolesModule = React.lazy(() => import('./layouts/StaffRolesModule'));
const CostTemplatesModule = React.lazy(() => import('./layouts/CostTemplatesModule'));
const FixedCostTemplatesModule = React.lazy(() => import('./layouts/FixedCostTemplatesModule'));
const PosTerminalsModule = React.lazy(() => import('./layouts/PosTerminalsModule'));
const WorkDaysModule = React.lazy(() => import('./layouts/WorkDaysModule'));
const OpeningCostsModule = React.lazy(() => import('./layouts/OpeningCostsModule'));
const StaffPlanModule = React.lazy(() => import('./layouts/StaffPlanModule'));
const StockRequestsModule = React.lazy(() => import('./layouts/StockRequestsModule'));
const PaymentsModule = React.lazy(() => import('./layouts/PaymentsModule'));
const NightOpsModule = React.lazy(() => import('./layouts/NightOpsModule'));
const NightReportModule = React.lazy(() => import('./layouts/NightReportModule'));
const AuditoriaBarraModule = React.lazy(() => import('./layouts/AuditoriaBarraModule'));
const MonthlyReportModule = React.lazy(() => import('./layouts/MonthlyReportModule'));
const AnnualReportModule = React.lazy(() => import('./layouts/AnnualReportModule'));
const FixedCostsModule = React.lazy(() => import('./layouts/FixedCostsModule'));

function AppShell() {
  const { user, logout, canAccess } = useAuth();
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('mc_active_view') || 'index';
  });
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If not logged in, show PIN screen
  if (!user) return <Login />;

  const handleNavigation = (view) => {
    setActiveView(view);
    localStorage.setItem('mc_active_view', view);
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
    fixed_cost_templates: FixedCostTemplatesModule,
    pos_terminals:  PosTerminalsModule,
    work_days:      WorkDaysModule,
    opening_costs:  OpeningCostsModule,
    staff_plan:     StaffPlanModule,
    stock_requests: StockRequestsModule,
    payments:       PaymentsModule,
    fixed_costs:    FixedCostsModule,
    workday:        NightOpsModule,
    night_report:   NightReportModule,
    auditoria_barra: AuditoriaBarraModule,
    monthly_report: MonthlyReportModule,
    annual_report:  AnnualReportModule,
  };

  const renderView = () => {
    if (activeView === 'index') {
      if (user.role === 'operativo') {
        return <OperativoIndex onNavigate={handleNavigation} />;
      }
      if (user.role === 'contador') {
        return <ContadorIndex onNavigate={handleNavigation} />;
      }
      if (user.role === 'encargado') {
        return <EncargadoIndex onNavigate={handleNavigation} />;
      }
      return <AdminIndex onNavigate={handleNavigation} />;
    }

    // Role-gating: bounce unauthorized access back to index
    if (!canAccess(activeView)) return <AdminIndex onNavigate={handleNavigation} />;

    const Component = ROUTE_MAP[activeView];
    if (Component) {
      return (
        <Suspense fallback={<ViewLoader />}>
          <Component onNavigate={handleNavigation} />
        </Suspense>
      );
    }

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
      
      {/* OFFLINE BADGE */}
      {isOffline && (
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-danger shadow-[0_0_10px_rgba(239,68,68,0.8)] z-[60]" />
      )}

      {/* TOP BAR */}
      <header className="h-14 flex items-center justify-between px-8 bg-brand-bg shrink-0 z-50 border-b border-brand-border/20 relative">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => handleNavigation('index')}
            className="text-[11px] font-extrabold text-brand-muted tracking-[0.15em] uppercase hover:text-brand-text transition-colors cursor-pointer"
          >
            MIDNIGHT CLUB
          </button>

          {isOffline && (
            <span className="hidden sm:inline-block px-2 py-0.5 border border-brand-danger text-brand-danger text-[8px] font-bold tracking-widest uppercase bg-brand-danger/10 shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse">
              SYS_OFFLINE
            </span>
          )}
        </div>

        {/* Center: Operative Sub-Nav (Admin Only) */}
        {user?.role === 'admin' && activeView !== 'index' && ['work_days', 'opening_costs', 'stock_requests', 'staff_plan'].includes(activeView) && (
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 animate-fade-in">
            {[
              { id: 'work_days', label: 'WORKDAYS' },
              { id: 'opening_costs', label: 'COST. APERTURA' },
              { id: 'stock_requests', label: 'PEDIDOS' },
              { id: 'staff_plan', label: 'STAFF' },
            ].map(mod => (
              <button
                key={mod.id}
                onClick={() => handleNavigation(mod.id)}
                className={`text-[9px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer ${
                  activeView === mod.id ? 'text-brand-text' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {mod.label}
              </button>
            ))}
          </div>
        )}

        {/* Center: Night Chief Sub-Nav (Admin Only) */}
        {user?.role === 'admin' && activeView !== 'index' && ['workday', 'auditoria_barra', 'bar_inventory'].includes(activeView) && (
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 animate-fade-in">
            {[
              { id: 'workday', label: 'NIGHT CHIEF' },
              { id: 'auditoria_barra', label: 'AUDITORIA CONSUMO' },
              { id: 'bar_inventory', label: 'APERTURA/CIERRE BARRA' },
            ].map(mod => (
              <button
                key={mod.id}
                onClick={() => handleNavigation(mod.id)}
                className={`text-[9px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer ${
                  activeView === mod.id ? 'text-brand-text' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {mod.label}
              </button>
            ))}
          </div>
        )}

        {/* Center: Pagos Sub-Nav (Admin Only) */}
        {user?.role === 'admin' && activeView !== 'index' && ['payments', 'fixed_costs'].includes(activeView) && (
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 animate-fade-in">
            {[
              { id: 'payments', label: 'PAGOS SEMANA' },
              { id: 'fixed_costs', label: 'PAGOS MES' },
            ].map(mod => (
              <button
                key={mod.id}
                onClick={() => handleNavigation(mod.id)}
                className={`text-[9px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer ${
                  activeView === mod.id ? 'text-brand-text' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {mod.label}
              </button>
            ))}
          </div>
        )}

        {/* Center: Reportes Sub-Nav */}
        {activeView !== 'index' && ['night_report', 'monthly_report', 'annual_report'].includes(activeView) && (
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-6 animate-fade-in">
            {[
              { id: 'night_report', label: 'R. NOCHE' },
              { id: 'monthly_report', label: 'R. MES' },
              { id: 'annual_report', label: 'R. ANUAL' },
            ].map(mod => (
              <button
                key={mod.id}
                onClick={() => handleNavigation(mod.id)}
                className={`text-[9px] font-bold tracking-[0.2em] uppercase transition-colors cursor-pointer ${
                  activeView === mod.id ? 'text-brand-text' : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {mod.label}
              </button>
            ))}
          </div>
        )}

        {/* Right: User */}
        <div className="relative">
          <button 
            onClick={() => setIsAvatarOpen(!isAvatarOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-brand-surface transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center group-hover:bg-brand-muted/10">
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
