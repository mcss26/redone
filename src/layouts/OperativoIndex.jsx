import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function OperativoIndex({ onNavigate }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Extraemos el primer nombre del usuario, fallback a CRISTIAN
  const firstName = user?.full_name ? user.full_name.split(' ')[0].toUpperCase() : 'CRISTIAN';

  const MODULES = [
    { id: 'work_days',      label: 'WORKDAYS' },
    { id: 'opening_costs',  label: 'COSTOS DE APERTURA' },
    { id: 'stock_requests', label: 'PEDIDOS' },
    { id: 'staff_plan',     label: 'STAFF' },
    { id: 'sku',            label: 'CONFIG' },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 pt-24 md:pt-32 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col items-center">
        
        {/* Header - Nombre Grande */}
        <h1 className="text-6xl md:text-[8rem] leading-none font-extrabold tracking-[0.2em] uppercase text-brand-text mb-6 text-center animate-fade-in">
          {firstName}
        </h1>

        {/* Link Desplegable */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-3 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-brand-muted hover:text-brand-text transition-colors duration-300 cursor-pointer"
        >
          OPERATIVO Y LOGISTICA - MIDNIGHT CLUB
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Tabs / Módulos Desplegables (Solo texto) */}
        {isOpen && (
          <div className="mt-16 flex flex-col md:flex-row flex-wrap items-center justify-center gap-8 md:gap-12 animate-slide-up">
            {MODULES.map((mod) => {
              return (
                <button
                  key={mod.id}
                  onClick={() => onNavigate(mod.id)}
                  className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-brand-muted hover:text-brand-text transition-colors duration-200 cursor-pointer"
                >
                  {mod.label}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

