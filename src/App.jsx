import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './layouts/Login';
import IndexLayout from './layouts/IndexLayout';
import MasterProveedores from './layouts/MasterProveedores';
import MasterSKU from './layouts/MasterSKU';
import MasterTarifario from './layouts/MasterTarifario';
import Configuraciones from './layouts/Configuraciones';
import OperacionesStock from './layouts/OperacionesStock';
import SolicitudesStock from './layouts/SolicitudesStock';
import WorkdaysPlanner from './layouts/WorkdaysPlanner';
import WorkdaysNightChief from './layouts/WorkdaysNightChief';
import EncargadoBarra from './layouts/EncargadoBarra';
import MasterNomina from './layouts/MasterNomina';
import WorkdaysBreakEven from './layouts/WorkdaysBreakEven';
import ReportesLayout from './layouts/ReportesLayout';
import { User, LogOut } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState('index');
  const [navigationContext, setNavigationContext] = useState(null);
  const [isMastersOpen, setIsMastersOpen] = useState(false);
  const [isWorkdaysOpen, setIsWorkdaysOpen] = useState(false);
  const [isEncargadosOpen, setIsEncargadosOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isReportesOpen, setIsReportesOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  
  // Shared Workdays Date Context
  const [globalDate, setGlobalDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isAuthLoading) {
    return <div className="h-screen w-full bg-[#0A0A0A]"></div>;
  }

  if (!session) {
    return <Login />;
  }

  const activeSession = session;

  const renderView = () => {
    switch (activeView) {
      case 'index': return <IndexLayout />;
      case 'proveedores': return <MasterProveedores />;
      case 'sku': return <MasterSKU />;
      case 'tarifario': return <MasterTarifario />;
      case 'nomina': return <MasterNomina />;
      case 'configuraciones': return <Configuraciones />;
      case 'operaciones_stock': return <OperacionesStock />;
      case 'solicitudes': return <SolicitudesStock />;
      case 'planner': return <WorkdaysPlanner globalDate={globalDate} setGlobalDate={setGlobalDate} onNavigate={handleNavigation} />;
      case 'night_chief': return <WorkdaysNightChief globalDate={globalDate} setGlobalDate={setGlobalDate} />;
      case 'break_even': return <WorkdaysBreakEven globalDate={globalDate} setGlobalDate={setGlobalDate} />;
      case 'encargado_barra': return <EncargadoBarra />;
      case 'reportes_generales': return <ReportesLayout globalDate={globalDate} setGlobalDate={setGlobalDate} />;
      default: return <IndexLayout />;
    }
  };

  const handleNavigation = (view, context = null) => {
    setActiveView(view);
    setNavigationContext(context);
    setIsMastersOpen(false);
    setIsWorkdaysOpen(false);
    setIsEncargadosOpen(false);
    setIsStockOpen(false);
    setIsReportesOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0A0A] overflow-hidden relative">
      
      {/* PRIMARY TOP BAR */}
      <header className="h-16 flex items-center justify-between px-8 bg-[#0A0A0A] shrink-0 z-50">
        
        {/* Left: Brand */}
        <div 
          className="w-48 text-sm font-extrabold text-brand-text tracking-widest uppercase cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleNavigation('index')}
        >
          MIDNIGHT CLUB
        </div>

        {/* Center: Dropdown Trigger */}
        <div className="flex-1 flex justify-center gap-4">
          <button 
            onClick={() => {
              setIsWorkdaysOpen(!isWorkdaysOpen);
              setIsMastersOpen(false);
              setIsEncargadosOpen(false);
              setIsStockOpen(false);
              setIsReportesOpen(false);
              setIsAvatarOpen(false);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              isWorkdaysOpen 
                ? 'bg-brand-surface text-brand-text' 
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface/50'
            }`}
          >
            WORKDAYS
          </button>
          <button 
            onClick={() => {
              setIsEncargadosOpen(!isEncargadosOpen);
              setIsWorkdaysOpen(false);
              setIsMastersOpen(false);
              setIsStockOpen(false);
              setIsReportesOpen(false);
              setIsAvatarOpen(false);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              isEncargadosOpen 
                ? 'bg-brand-surface text-brand-text' 
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface/50'
            }`}
          >
            ENCARGADOS
          </button>
          <button 
            onClick={() => {
              setIsStockOpen(!isStockOpen);
              setIsEncargadosOpen(false);
              setIsWorkdaysOpen(false);
              setIsMastersOpen(false);
              setIsReportesOpen(false);
              setIsAvatarOpen(false);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              isStockOpen 
                ? 'bg-brand-surface text-brand-text' 
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface/50'
            }`}
          >
            STOCK
          </button>
          <button 
            onClick={() => {
              setIsMastersOpen(!isMastersOpen);
              setIsWorkdaysOpen(false);
              setIsEncargadosOpen(false);
              setIsStockOpen(false);
              setIsReportesOpen(false);
              setIsAvatarOpen(false);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              isMastersOpen 
                ? 'bg-brand-surface text-brand-text' 
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface/50'
            }`}
          >
            MASTERS
          </button>
          <button 
            onClick={() => {
              setIsReportesOpen(!isReportesOpen);
              setIsMastersOpen(false);
              setIsWorkdaysOpen(false);
              setIsEncargadosOpen(false);
              setIsStockOpen(false);
              setIsAvatarOpen(false);
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-200 cursor-pointer ${
              isReportesOpen 
                ? 'bg-brand-surface text-brand-text' 
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface/50'
            }`}
          >
            REPORTE
          </button>
        </div>

        {/* Right: Avatar Dropdown */}
        <div className="w-48 flex justify-end relative">
          <button 
            onClick={() => {
              setIsAvatarOpen(!isAvatarOpen);
              setIsMastersOpen(false);
              setIsWorkdaysOpen(false);
              setIsEncargadosOpen(false);
              setIsStockOpen(false);
              setIsReportesOpen(false);
            }}
            className="w-9 h-9 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center hover:bg-brand-text hover:text-brand-bg transition-all cursor-pointer focus:outline-none"
          >
            <User size={16} className={isAvatarOpen ? 'text-brand-bg' : 'text-brand-text'} />
          </button>

          {/* Avatar Dropdown Menu */}
          {isAvatarOpen && (
            <div className="absolute top-12 right-0 w-56 bg-brand-bg border border-brand-border rounded-xl shadow-2xl py-2 z-50">
               <div className="px-4 py-3 border-b border-brand-border/50 mb-2">
                 <div className="text-[10px] font-bold text-brand-success uppercase tracking-widest mb-1">Operador Activo</div>
               <div className="text-xs font-semibold text-brand-text truncate">{activeSession.user.email}</div>
             </div>
             <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-brand-error text-xs font-bold hover:bg-brand-error/10 transition-colors cursor-pointer uppercase tracking-widest"
             >
               <LogOut size={16} />
               Cerrar Sesión
             </button>
          </div>
          )}
        </div>
      </header>

      {/* SECONDARY TOP BAR (MASTERS SUB-NAV) */}
      <div 
        className={`absolute top-16 left-0 w-full bg-[#0A0A0A] overflow-hidden transition-all duration-300 ease-in-out z-40 flex justify-center ${
          isMastersOpen ? 'max-h-16 opacity-100 py-1 px-8 border-b border-brand-border/30 shadow-lg' : 'max-h-0 opacity-0 py-0 px-8'
        }`}
      >
        <div className="flex items-center gap-4">
          {[
            { id: 'proveedores', label: 'PROVEEDORES' },
            { id: 'sku', label: 'CATÁLOGO SKU' },
            { id: 'nomina', label: 'NÓMINA PERSONAL' },
            { id: 'tarifario', label: 'TARIFARIO STAFF' },
            { id: 'configuraciones', label: 'SISTEMA & POS' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-widest transition-all duration-200 cursor-pointer ${
                activeView === item.id 
                  ? 'bg-brand-text text-brand-bg shadow-md' 
                  : 'bg-transparent text-brand-muted hover:text-brand-text border border-transparent hover:border-brand-text/30'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECONDARY TOP BAR (WORKDAYS SUB-NAV) */}
      <div 
        className={`absolute top-16 left-0 w-full bg-[#0A0A0A] overflow-hidden transition-all duration-300 ease-in-out z-40 flex justify-center ${
          isWorkdaysOpen ? 'max-h-16 opacity-100 py-1 px-8 border-b border-brand-border/30 shadow-lg' : 'max-h-0 opacity-0 py-0 px-8'
        }`}
      >
        <div className="flex items-center gap-4">
          {[
            { id: 'planner', label: 'PLANNER' },
            { id: 'night_chief', label: 'NIGHT CHIEF' },
            { id: 'break_even', label: 'BREAK EVEN' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-widest transition-all duration-200 cursor-pointer ${
                activeView === item.id 
                  ? 'bg-brand-text text-brand-bg shadow-md' 
                  : 'bg-transparent text-brand-muted hover:text-brand-text border border-transparent hover:border-brand-text/30'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECONDARY TOP BAR (STOCK SUB-NAV) */}
      <div 
        className={`absolute top-16 left-0 w-full bg-[#0A0A0A] overflow-hidden transition-all duration-300 ease-in-out z-40 flex justify-center ${
          isStockOpen ? 'max-h-16 opacity-100 py-1 px-8 border-b border-brand-border/30 shadow-lg' : 'max-h-0 opacity-0 py-0 px-8'
        }`}
      >
        <div className="flex items-center gap-4">
          {[
            { id: 'operaciones_stock', label: 'STOCK' },
            { id: 'solicitudes', label: 'SOLICITUDES' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-widest transition-all duration-200 cursor-pointer ${
                activeView === item.id 
                  ? 'bg-brand-text text-brand-bg shadow-md' 
                  : 'bg-transparent text-brand-muted hover:text-brand-text border border-transparent hover:border-brand-text/30'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECONDARY TOP BAR (ENCARGADOS SUB-NAV) */}
      <div 
        className={`absolute top-16 left-0 w-full bg-[#0A0A0A] overflow-hidden transition-all duration-300 ease-in-out z-40 flex justify-center ${
          isEncargadosOpen ? 'max-h-16 opacity-100 py-1 px-8 border-b border-brand-border/30 shadow-lg' : 'max-h-0 opacity-0 py-0 px-8'
        }`}
      >
        <div className="flex items-center gap-4">
          {[
            { id: 'encargado_barra', label: 'BARRA NOCHE' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-widest transition-all duration-200 cursor-pointer ${
                activeView === item.id 
                  ? 'bg-brand-text text-brand-bg shadow-md' 
                  : 'bg-transparent text-brand-muted hover:text-brand-text border border-transparent hover:border-brand-text/30'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECONDARY TOP BAR (REPORTES SUB-NAV) */}
      <div 
        className={`absolute top-16 left-0 w-full bg-[#0A0A0A] overflow-hidden transition-all duration-300 ease-in-out z-40 flex justify-center ${
          isReportesOpen ? 'max-h-16 opacity-100 py-1 px-8 border-b border-brand-border/30 shadow-lg' : 'max-h-0 opacity-0 py-0 px-8'
        }`}
      >
        <div className="flex items-center gap-4">
          {[
            { id: 'reportes_generales', label: 'REPORTES GENERALES' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold tracking-widest transition-all duration-200 cursor-pointer ${
                activeView === item.id 
                  ? 'bg-brand-text text-brand-bg shadow-md' 
                  : 'bg-transparent text-brand-muted hover:text-brand-text border border-transparent hover:border-brand-text/30'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-4">
        <div className="h-full bg-brand-surface/10 border border-brand-border/30 rounded-[2rem] overflow-hidden shadow-2xl relative">
          {renderView()}
        </div>
      </main>
      
    </div>
  );
}

export default App;
