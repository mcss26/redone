import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import dayjs from 'dayjs';
import GlobalMessagesBoard from '../components/GlobalMessagesBoard';

export default function ContadorIndex({ onNavigate }) {
  const { user } = useAuth();
  const [activeDay, setActiveDay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportesOpen, setIsReportesOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchActiveDay = async () => {
      try {
        if (isMounted) setIsLoading(true);
        // Obtener jornada activa
        const { data: wdData, error: wdErr } = await supabase
          .from('work_days')
          .select('id, work_date, event_name')
          .eq('status', 'open')
          .order('work_date', { ascending: false })
          .limit(1)
          .single();

        if (wdErr && wdErr.code !== 'PGRST116') throw wdErr;

        if (wdData) {
          if (isMounted) setActiveDay(wdData);
        } else {
          if (isMounted) setActiveDay(null);
        }
      } catch (err) {
        console.error("Error fetching active day:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchActiveDay();

    return () => {
      isMounted = false;
    };
  }, []);

  // Extraemos el primer nombre del usuario, fallback a CONTADOR
  const firstName = user?.full_name ? user.full_name.split(' ')[0].toUpperCase() : 'CONTADOR';

  const PRIMARY_MODULES = [
    { id: 'payments',    label: 'PAGOS VARIABLES' },
    { id: 'fixed_costs', label: 'GASTOS FIJOS' },
  ];

  const REPORT_MODULES = [
    { id: 'night_report',   label: 'REPORTE DE NOCHE' },
    { id: 'monthly_report', label: 'REPORTE MENSUAL' },
    { id: 'annual_report',  label: 'REPORTE ANUAL' },
  ];

  return (
    <div className="h-full relative overflow-y-auto p-6 md:p-10 pt-24 md:pt-32 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col items-center">
        
        {/* Subtítulo de Rol */}
        <span className="text-[8px] md:text-[10px] font-bold tracking-[0.4em] uppercase text-brand-muted mb-4 text-center animate-fade-in">
          ADMINISTRACION Y FINANZAS - MIDNIGHT CLUB
        </span>

        {/* Header - Nombre Grande */}
        <h1 className="text-6xl md:text-[8rem] leading-none font-extrabold tracking-[0.1em] uppercase text-brand-text mb-16 text-center animate-fade-in">
          {firstName}
        </h1>

        {/* Menú de Módulos */}
        <div className="flex flex-col items-center gap-6 animate-fade-in delay-100">
          
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-6 md:gap-8">
            {PRIMARY_MODULES.map((mod, idx) => (
              <React.Fragment key={mod.id}>
                <button
                  onClick={() => onNavigate(mod.id)}
                  className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase transition-colors duration-200 cursor-pointer text-brand-muted hover:text-brand-text"
                >
                  {mod.label}
                </button>
                <span className="hidden md:inline-block text-brand-border/30">
                  |
                </span>
              </React.Fragment>
            ))}
            
            {/* Botón Desplegable Reportes */}
            <button
              onClick={() => setIsReportesOpen(!isReportesOpen)}
              className={`text-xs md:text-sm font-bold tracking-[0.3em] uppercase transition-colors duration-200 cursor-pointer flex items-center gap-2 ${isReportesOpen ? 'text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}
            >
              REPORTES
              <span className={`text-[8px] transform transition-transform duration-300 ${isReportesOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
          </div>

          {/* Sub-menú de Reportes (Inline) */}
          {isReportesOpen && (
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mt-2 animate-fade-in">
              {REPORT_MODULES.map((mod, idx) => (
                <React.Fragment key={mod.id}>
                  <button
                    onClick={() => onNavigate(mod.id)}
                    className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-200 cursor-pointer text-brand-muted/70 hover:text-brand-text"
                  >
                    {mod.label}
                  </button>
                  {idx < REPORT_MODULES.length - 1 && (
                    <span className="hidden md:inline-block text-brand-border/20 text-xs">
                      ·
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

        </div>

        <GlobalMessagesBoard />
      </div>

      {/* Footer Ticker (Data Line) */}
      <div className="fixed bottom-0 left-0 w-full py-4 bg-brand-bg border-t border-brand-border/30 flex justify-center z-40">
        <div className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase flex flex-wrap items-center justify-center gap-3 px-4 text-center animate-fade-in">
          {isLoading ? (
             <span className="text-brand-muted/50">SINCRONIZANDO JORNADA...</span>
          ) : activeDay ? (
            <>
              <span className="text-brand-text">JORNADA ACTIVA:</span>
              <span className="text-brand-muted">{dayjs(activeDay.work_date).format('DD/MM')} - {activeDay.event_name}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-brand-success shadow-[0_0_6px_rgba(74,222,128,0.5)] mx-1" />
            </>
          ) : (
             <>
              <span className="text-brand-muted">SIN JORNADA ACTIVA</span>
              <div className="w-1.5 h-1.5 rounded-full bg-brand-border/30 mx-1" />
             </>
          )}
        </div>
      </div>
    </div>
  );
}
