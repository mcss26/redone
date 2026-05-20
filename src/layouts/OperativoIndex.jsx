import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CalendarDays, DollarSign, Users, Package } from 'lucide-react';

export default function OperativoIndex({ onNavigate }) {
  const { user } = useAuth();

  const MODULES = [
    { id: 'work_days',      label: 'Jornadas',         icon: CalendarDays, description: 'Apertura y Cierre' },
    { id: 'opening_costs',  label: 'Costos Apertura',  icon: DollarSign,   description: 'Caja chica y viáticos' },
    { id: 'staff_plan',     label: 'Plan Staff',       icon: Users,        description: 'Asistencias y bajas' },
    { id: 'stock_requests', label: 'Solicitud Stock',  icon: Package,      description: 'Pedidos a botellero' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-sm font-extrabold tracking-[0.4em] uppercase text-brand-success mb-2">
            [ PANEL OPERATIVO ]
          </h1>
          <div className="text-[10px] tracking-[0.3em] uppercase text-brand-muted/40">
            CONTROL DE LA JORNADA ACTUAL
          </div>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                onClick={() => onNavigate(mod.id)}
                className="group relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-muted hover:bg-brand-card transition-all duration-200 cursor-pointer text-center"
              >
                <div className="w-16 h-16 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={24} className="text-brand-text" />
                </div>
                
                <span className="text-sm font-bold tracking-widest text-brand-text uppercase">
                  {mod.label}
                </span>
                
                <span className="text-[10px] tracking-widest text-brand-muted uppercase">
                  {mod.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
