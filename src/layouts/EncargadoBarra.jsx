import React, { useState, useEffect } from 'react';
import TabRecepciones from '../components/barra/TabRecepciones';
import TabInventario from '../components/barra/TabInventario';
import { supabase } from '../lib/supabase';

const EncargadoBarra = () => {
  const [activeTab, setActiveTab] = useState('INVENTARIO'); // RECEPCIONES, INVENTARIO
  const [workDayId, setWorkDayId] = useState(null);

  useEffect(() => {
    fetchActiveWorkday();
  }, []);

  const fetchActiveWorkday = async () => {
    try {
      const { data: workDay } = await supabase
        .from('work_days')
        .select('id')
        .eq('status', 'ACTIVE')
        .single();
        
      if (workDay) {
        setWorkDayId(workDay.id);
      }
    } catch (err) {
      console.error('Error fetching active workday:', err);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'RECEPCIONES': return <TabRecepciones />;
      case 'INVENTARIO': return <TabInventario workDayId={workDayId} />;
      default: return <TabInventario workDayId={workDayId} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0A0A0A] text-brand-text relative">
      
      {/* GLOBAL HEADER */}
      <div className="shrink-0 flex items-center justify-between p-6 border-b border-brand-border/30 bg-brand-surface/20">
        <div>
          <h1 className="text-xl font-extrabold uppercase tracking-widest text-brand-text">Control de Barra</h1>
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mt-1">
            Gestión de Inventario {/* y Recepciones */}
          </p>
        </div>

        {/* STATUS INDICATORS */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-brand-muted font-bold mb-1">Workday State</span>
            <div className="flex items-center gap-2 bg-brand-surface/50 px-3 py-1.5 rounded-lg border border-brand-border/50">
              {workDayId ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-xs font-bold tracking-widest uppercase">OPEN</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-brand-error shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  <span className="text-xs font-bold tracking-widest uppercase">CLOSED</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* INTERNAL NAVIGATION (TABS) */}
      <div className="shrink-0 flex items-center gap-2 px-6 pt-4">
        {[
          /* { id: 'RECEPCIONES', label: 'RECEPCIONES' }, */
          { id: 'INVENTARIO', label: 'INVENTARIO (APER/CIERRE)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-t-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-200 border-b-2 ${
              activeTab === tab.id 
                ? 'text-brand-text border-brand-text bg-brand-surface/30' 
                : 'text-brand-muted border-transparent hover:text-brand-text hover:bg-brand-surface/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT RENDERER */}
      <div className="flex-1 overflow-hidden border-t border-brand-border/30">
        {renderTab()}
      </div>

    </div>
  );
};

export default EncargadoBarra;
