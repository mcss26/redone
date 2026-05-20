import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, Package, Truck, DollarSign, CalendarDays, 
  ClipboardList, CreditCard, PackageCheck, 
  BarChart3, TrendingUp, PlayCircle, Eye
} from 'lucide-react';

const MODULE_MAP = [
  {
    phase: 'MASTERS',
    description: 'Datos base del sistema',
    color: 'brand-muted',
    modules: [
      { id: 'profiles',       label: 'Equipo',            icon: Users,         status: 'live' },
      { id: 'suppliers',      label: 'Proveedores',       icon: Truck,         status: 'live' },
      { id: 'sku',            label: 'Catálogo SKU',      icon: Package,       status: 'live' },
      { id: 'staff_roles',    label: 'Tarifario Staff',   icon: DollarSign,    status: 'live' },
      { id: 'cost_templates', label: 'Plantillas Costos', icon: ClipboardList, status: 'live' },
      { id: 'pos_terminals',  label: 'Terminales POS',    icon: CreditCard,    status: 'live' },
      { id: 'master_vouchers',label: 'Tipos Comprobante', icon: ClipboardList, status: 'live' },
    ]
  },
  {
    phase: 'PLANIFICACIÓN',
    description: 'Mar–Mié: Operativo propone, Admin aprueba',
    color: 'brand-accent',
    modules: [
      { id: 'work_days',       label: 'Jornadas',          icon: CalendarDays,  status: 'live' },
      { id: 'opening_costs',   label: 'Costos Apertura',   icon: DollarSign,    status: 'live' },
      { id: 'staff_plan',      label: 'Plan Staff',        icon: Users,         status: 'live' },
      { id: 'stock_requests',  label: 'Solicitud Stock',   icon: Package,       status: 'live' },
    ]
  },
  {
    phase: 'EJECUCIÓN',
    description: 'Mié–Vie: Contador paga, Operativo recibe',
    color: 'brand-warning',
    modules: [
      { id: 'payments',       label: 'Pagos',              icon: CreditCard,    status: 'live' },
    ]
  },
  {
    phase: 'LA NOCHE',
    description: 'Sáb: Work Day en vivo',
    color: 'brand-success',
    modules: [
      { id: 'bar_inventory',  label: 'Inventario Barra',   icon: PackageCheck,  status: 'live' },
      { id: 'workday',        label: 'Operación Nocturna', icon: PlayCircle,    status: 'live' },
    ]
  },
  {
    phase: 'REPORTES',
    description: 'Lun + Mensual: Cierre y análisis',
    color: 'brand-error',
    modules: [
      { id: 'night_report',   label: 'Auditoría Jornada', icon: ClipboardList, status: 'live' },
      { id: 'monthly_report', label: 'Reporte Mensual',  icon: TrendingUp,    status: 'live' },
      { id: 'annual_report',  label: 'Auditoría Anual',   icon: BarChart3,     status: 'live' },
    ]
  },
];

const STATUS_DOT = {
  live:    'bg-brand-success',
  wip:     'bg-brand-warning',
  pending: 'bg-brand-border',
};

const STATUS_LABEL = {
  live:    'LIVE',
  wip:     'WIP',
  pending: '—',
};

export default function AdminIndex({ onNavigate }) {
  const { canAccess, canMutate, isReadOnly } = useAuth();

  // Filter MODULE_MAP: only show phases that have at least one accessible module
  const filteredMap = useMemo(() => {
    return MODULE_MAP
      .map((phase) => ({
        ...phase,
        modules: phase.modules.filter((mod) => canAccess(mod.id)),
      }))
      .filter((phase) => phase.modules.length > 0);
  }, [canAccess]);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10">
      
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xs font-extrabold tracking-[0.4em] uppercase text-brand-muted">
            MIDNIGHT CLUB OS
          </h1>
          {isReadOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-warning/10 border border-brand-warning/20">
              <Eye size={10} className="text-brand-warning" />
              <span className="text-[8px] font-bold tracking-widest uppercase text-brand-warning">SOLO LECTURA</span>
            </span>
          )}
        </div>
        <div className="mt-1 text-[10px] tracking-[0.3em] uppercase text-brand-muted/40">
          MÓDULOS DEL SISTEMA · V2 REDONE
        </div>
      </div>

      {/* Phase Grid */}
      <div className="space-y-8">
        {filteredMap.map((phase) => (
          <div key={phase.phase}>
            
            {/* Phase Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-1.5 h-1.5 rounded-full bg-${phase.color}`} />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-muted">
                {phase.phase}
              </span>
              <span className="text-[10px] text-brand-muted/40 tracking-wide">
                {phase.description}
              </span>
            </div>

            {/* Module Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {phase.modules.map((mod) => {
                const Icon = mod.icon;
                const isLive = mod.status === 'live';
                const readOnly = !canMutate(mod.id);
                return (
                  <button
                    key={mod.id}
                    onClick={() => isLive && onNavigate(mod.id)}
                    className={`group relative flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isLive
                        ? 'bg-brand-surface border-brand-border hover:border-brand-muted hover:bg-brand-card'
                        : 'bg-brand-bg border-brand-border/30 opacity-40 cursor-not-allowed'
                    }`}
                    disabled={!isLive}
                  >
                    {/* Status dot + read-only indicator */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {readOnly && isLive && (
                        <Eye size={8} className="text-brand-muted/50" />
                      )}
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[mod.status]}`} />
                      <span className="text-[8px] font-bold tracking-widest text-brand-muted/50 uppercase">
                        {STATUS_LABEL[mod.status]}
                      </span>
                    </div>

                    <Icon size={16} className={`${isLive ? 'text-brand-text' : 'text-brand-muted/30'}`} />
                    
                    <span className={`text-[11px] font-semibold tracking-wide ${
                      isLive ? 'text-brand-text' : 'text-brand-muted/30'
                    }`}>
                      {mod.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export the module map so App.jsx can use it for routing validation
export { MODULE_MAP };
