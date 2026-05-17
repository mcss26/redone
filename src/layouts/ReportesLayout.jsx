import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, ShieldCheck, Wine, ChevronRight, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNightReport } from '../hooks/useNightReport';

// SUB-COMPONENT: Detail Dashboard
const ReportDetail = ({ date, onBack }) => {
  const { isLoading, workday, ingresos, egresos, auditoria, netResult, healthScore } = useNightReport(date);
  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[600px]">
        <div className="text-brand-muted font-bold tracking-widest uppercase text-sm animate-pulse">
          Ejecutando Data Engine...
        </div>
      </div>
    );
  }

  if (!workday) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[600px] text-center">
         <div className="w-20 h-20 rounded-full bg-brand-surface/30 flex items-center justify-center mb-6">
           <BarChart3 size={32} className="text-brand-muted opacity-80" />
         </div>
         <h3 className="text-xl font-black text-brand-text tracking-tight mb-2">No hay datos de jornada</h3>
         <button onClick={onBack} className="text-xs font-bold text-brand-text uppercase tracking-widest hover:text-brand-muted mt-4">
           Volver al Histórico
         </button>
      </div>
    );
  }

  const isProfitable = netResult >= 0;

  return (
    <div className="flex-1 overflow-y-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="px-4 py-2 bg-brand-surface border border-brand-border/50 text-xs font-bold text-brand-text uppercase tracking-widest rounded-xl hover:bg-brand-border transition-all">
          ← Volver al Histórico
        </button>
        <div className="flex items-center gap-4 bg-brand-surface/30 border border-brand-border/50 p-2 rounded-xl">
           <div className="flex items-center gap-3 px-3">
             <Calendar size={18} className="text-brand-text" />
             <span className="text-xl font-mono font-bold text-brand-text">{date}</span>
           </div>
           <div className="h-8 w-[1px] bg-brand-border/50"></div>
           <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border bg-brand-success/10 text-brand-success border-brand-success/30 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-brand-success"></div>
             CERRADA
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Health Score */}
        <div className="bg-brand-surface border border-brand-border/50 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-4 -top-4 opacity-5"><Activity size={120} /></div>
          <div>
            <h3 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1 flex items-center gap-2">
              <Activity size={14} /> Health Score
            </h3>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-5xl font-black tracking-tighter ${healthScore >= 90 ? 'text-brand-success' : healthScore >= 70 ? 'text-brand-warning' : 'text-brand-error'}`}>
              {healthScore}
            </span>
            <span className="text-brand-muted text-sm font-bold">/100</span>
          </div>
        </div>

        {/* Ingresos Reales */}
        <div className="bg-brand-surface border border-brand-border/50 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
           <div className="absolute -right-4 -top-4 opacity-5"><TrendingUp size={120} /></div>
          <div>
            <h3 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1 flex items-center gap-2">
              <TrendingUp size={14} className="text-brand-success" /> Ingresos Totales
            </h3>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black tracking-tighter text-brand-text font-mono">
              {formatMoney(ingresos.total)}
            </span>
          </div>
        </div>

        {/* Egresos Operativos */}
        <div className="bg-brand-surface border border-brand-border/50 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
           <div className="absolute -right-4 -top-4 opacity-5"><TrendingDown size={120} /></div>
          <div>
            <h3 className="text-xs font-bold text-brand-muted uppercase tracking-widest mb-1 flex items-center gap-2">
              <TrendingDown size={14} className="text-brand-warning" /> Egresos & Fugas
            </h3>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black tracking-tighter text-brand-text font-mono">
              {formatMoney(egresos.total)}
            </span>
          </div>
        </div>

        {/* Resultado Neto */}
        <div className={`border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between ${isProfitable ? 'bg-brand-success/5 border-brand-success/20' : 'bg-brand-error/5 border-brand-error/20'}`}>
           <div className="absolute -right-4 -top-4 opacity-5"><DollarSign size={120} /></div>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2 ${isProfitable ? 'text-brand-success' : 'text-brand-error'}`}>
              <DollarSign size={14} /> P&L Neto
            </h3>
          </div>
          <div className="mt-4">
            <span className={`text-4xl font-black tracking-tighter font-mono ${isProfitable ? 'text-brand-success' : 'text-brand-error'}`}>
              {formatMoney(netResult)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* AUDITORÍA DE INGRESOS */}
        <div className="bg-brand-surface border border-brand-border/50 rounded-2xl p-6">
           <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-6 flex items-center gap-2 pb-4 border-b border-brand-border/50">
              <ShieldCheck size={18} className="text-brand-success" /> Desglose de Ingresos
           </h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-brand-border/30">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Efectivo Facturado (Blanco)</span>
                <span className="font-mono text-sm text-brand-text font-bold">{formatMoney(ingresos.efectivoFacturado)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-brand-border/30">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Efectivo No Facturado (Negro)</span>
                <span className="font-mono text-sm text-brand-text font-bold">{formatMoney(ingresos.efectivoNoFacturado)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-brand-border/30">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Ingresos Digitales (Tarjetas/MP/Transf)</span>
                <span className="font-mono text-sm text-brand-text font-bold">{formatMoney(ingresos.digitales)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-brand-border/30">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Passline (Tickets Validados)</span>
                <span className="font-mono text-sm text-brand-text font-bold">{formatMoney(ingresos.passlineGeneral)}</span>
              </div>
              
              {ingresos.diferenciaCaja > 0 && (
                <div className="flex justify-between items-center py-3 mt-4 bg-brand-bg rounded-lg px-4 border border-brand-success/30">
                  <span className="text-xs font-bold text-brand-success uppercase tracking-widest flex items-center gap-2">
                     <AlertTriangle size={14} />
                     Sobrante de Caja Reportado (Ingreso Extra)
                  </span>
                  <span className="font-mono text-sm font-bold text-brand-success">
                    {formatMoney(ingresos.diferenciaCaja)}
                  </span>
                </div>
              )}
           </div>
        </div>

        {/* ESTRUCTURA DE EGRESOS */}
        <div className="bg-brand-surface border border-brand-border/50 rounded-2xl p-6">
           <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest mb-6 flex items-center gap-2 pb-4 border-b border-brand-border/50">
              <TrendingDown size={18} className="text-brand-warning" /> Estructura de Costos
           </h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-brand-border/30">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Costos de Apertura y Ad-Hoc</span>
                <span className="font-mono text-sm text-brand-text font-bold">{formatMoney(egresos.costosFijosAdhoc)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-brand-border/30">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Nómina Liquidada</span>
                <span className="font-mono text-sm text-brand-text font-bold">{formatMoney(egresos.nomina)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-brand-border/30">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Egresos por Consumo Real (COGS)</span>
                <span className="font-mono text-sm text-brand-text font-bold">{formatMoney(egresos.consumoReal)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-brand-border/30">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">Comisiones Zoco/MP/Tarjetas</span>
                <span className="font-mono text-sm text-brand-text font-bold">{formatMoney(egresos.comisionesPasarela)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-brand-border/30 bg-brand-bg/50 px-2 rounded">
                <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">Impuestos (21% sobre Blanco + Digital)</span>
                <span className="font-mono text-sm text-brand-text font-bold">{formatMoney(egresos.impuestos)}</span>
              </div>
              {egresos.fugaCaja > 0 && (
                <div className="flex justify-between items-center py-3 mt-4 bg-brand-bg rounded-lg px-4 border border-brand-error/30">
                  <span className="text-xs font-bold text-brand-error uppercase tracking-widest flex items-center gap-2">
                     <AlertTriangle size={14} />
                     Pérdida por Faltante de Caja (Robo/Descuadre)
                  </span>
                  <span className="font-mono text-sm font-bold text-brand-error">
                    {formatMoney(egresos.fugaCaja)}
                  </span>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* AUDITORÍA DE BARRA (SISTEMA VS REAL) */}
      <div className="bg-brand-surface border border-brand-border/50 rounded-2xl p-6">
         <div className="flex justify-between items-end mb-6 pb-4 border-b border-brand-border/50">
           <div>
             <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest flex items-center gap-2 mb-1">
                <Wine size={18} className="text-brand-muted" /> Conciliación de Barra (Sistema vs Real)
             </h3>
             <p className="text-xs text-brand-muted">Cruce de consumo reportado en POS vs Faltante de inventario físico</p>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Impacto Total Diferencias</p>
              <p className="text-xl font-black font-mono text-brand-error">{formatMoney(egresos.impactoDiferencias)}</p>
           </div>
         </div>

         {auditoria.consumoBarra.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-brand-border/50 rounded-xl">
               <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">No hay datos de consumo para conciliar</p>
            </div>
         ) : (
            <div className="overflow-x-auto">
               <table className="w-full">
                 <thead>
                   <tr className="border-b border-brand-border/50">
                     <th className="text-left text-[10px] font-bold text-brand-muted uppercase tracking-widest py-3 px-4">SKU</th>
                     <th className="text-right text-[10px] font-bold text-brand-muted uppercase tracking-widest py-3 px-4">Cons. Sistema (POS)</th>
                     <th className="text-right text-[10px] font-bold text-brand-muted uppercase tracking-widest py-3 px-4">Cons. Real (Físico)</th>
                     <th className="text-right text-[10px] font-bold text-brand-muted uppercase tracking-widest py-3 px-4">Diferencia</th>
                     <th className="text-right text-[10px] font-bold text-brand-muted uppercase tracking-widest py-3 px-4">Impacto Económico</th>
                   </tr>
                 </thead>
                 <tbody>
                   {auditoria.consumoBarra.map(item => {
                     const hasShortage = item.diferenciaUnits > 0;
                     const hasSurplus = item.diferenciaUnits < 0;
                     return (
                       <tr key={item.skuId} className={`border-b border-brand-border/30 last:border-0 hover:bg-brand-bg/50 transition-colors ${hasShortage ? 'bg-brand-error/5' : ''}`}>
                         <td className="py-3 px-4 text-xs font-bold text-brand-text">{item.skuName}</td>
                         <td className="py-3 px-4 text-right text-xs font-mono text-brand-muted">{item.systemConsumption}</td>
                         <td className="py-3 px-4 text-right text-xs font-mono text-brand-text">{item.physicalConsumption}</td>
                         <td className={`py-3 px-4 text-right text-xs font-mono font-bold ${hasShortage ? 'text-brand-error' : hasSurplus ? 'text-brand-warning' : 'text-brand-muted'}`}>
                           {item.diferenciaUnits > 0 ? `${item.diferenciaUnits} (Faltante)` : item.diferenciaUnits < 0 ? `${Math.abs(item.diferenciaUnits)} (Sobrante)` : '0'}
                         </td>
                         <td className={`py-3 px-4 text-right text-xs font-mono font-bold ${hasShortage ? 'text-brand-error' : 'text-brand-muted'}`}>
                           {hasShortage ? formatMoney(item.impacto) : '-'}
                         </td>
                       </tr>
                     )
                   })}
                 </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
};

// MAIN COMPONENT
const ReportesLayout = ({ globalDate, setGlobalDate }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
  const [closedWorkdays, setClosedWorkdays] = useState([]);
  const [selectedDateLocal, setSelectedDateLocal] = useState(null);
  const [isLoadingList, setIsLoadingList] = useState(true);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchClosedWorkdays();
    }
  }, [viewMode]);

  const fetchClosedWorkdays = async () => {
    setIsLoadingList(true);
    const { data, error } = await supabase
      .from('work_days')
      .select('*')
      .eq('status', 'CLOSED')
      .order('work_date', { ascending: false });
      
    if (data) {
      setClosedWorkdays(data);
    }
    setIsLoadingList(false);
  };

  const handleSelectReport = (date) => {
    setSelectedDateLocal(date);
    setViewMode('detail');
  };

  const formatMoney = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-brand-bg">
      <div className="shrink-0 bg-[#0A0A0A] border-b border-brand-border/50 px-8 py-6 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text mb-1 flex items-center gap-3">
            <BarChart3 className="text-brand-muted" size={28} />
            {viewMode === 'list' ? 'Histórico de Jornadas' : 'Reporte de Jornada'}
          </h2>
          <p className="text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
            {viewMode === 'list' ? 'Seleccione una jornada cerrada para auditar' : 'Dashboard Analítico & Auditoría'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1600px] mx-auto">
          {viewMode === 'list' && (
            <div className="bg-brand-surface border border-brand-border/50 rounded-2xl overflow-hidden">
               {isLoadingList ? (
                 <div className="p-12 text-center text-brand-muted font-bold tracking-widest uppercase text-xs animate-pulse">
                   Cargando jornadas históricas...
                 </div>
               ) : closedWorkdays.length === 0 ? (
                 <div className="p-12 text-center">
                   <div className="w-16 h-16 rounded-full bg-brand-bg flex items-center justify-center mx-auto mb-4 border border-brand-border/50">
                     <FileText size={24} className="text-brand-muted" />
                   </div>
                   <p className="text-brand-text font-bold">No hay jornadas cerradas</p>
                   <p className="text-xs text-brand-muted mt-2">Solo las noches con cierre final (Break Even) aparecen aquí.</p>
                 </div>
               ) : (
                 <table className="w-full">
                   <thead>
                     <tr className="bg-[#0A0A0A] border-b border-brand-border/50">
                       <th className="text-left py-4 px-6 text-xs font-bold text-brand-muted uppercase tracking-widest">Fecha</th>
                       <th className="text-left py-4 px-6 text-xs font-bold text-brand-muted uppercase tracking-widest">Estado</th>
                       <th className="text-right py-4 px-6 text-xs font-bold text-brand-muted uppercase tracking-widest">Net Result Guardado</th>
                       <th className="py-4 px-6"></th>
                     </tr>
                   </thead>
                   <tbody>
                     {closedWorkdays.map(day => (
                       <tr 
                         key={day.id} 
                         onClick={() => handleSelectReport(day.work_date)}
                         className="border-b border-brand-border/30 hover:bg-brand-bg/50 cursor-pointer transition-colors group"
                       >
                         <td className="py-4 px-6">
                           <div className="flex items-center gap-3">
                             <Calendar size={16} className="text-brand-muted" />
                             <span className="font-mono font-bold text-brand-text text-sm">{day.work_date}</span>
                           </div>
                         </td>
                         <td className="py-4 px-6">
                           <span className="px-2 py-1 bg-brand-success/10 text-brand-success border border-brand-success/30 rounded text-[10px] font-black uppercase tracking-widest">
                             Cerrada
                           </span>
                         </td>
                         <td className="py-4 px-6 text-right font-mono font-bold text-brand-text text-sm">
                           {day.net_result ? formatMoney(day.net_result) : '-'}
                         </td>
                         <td className="py-4 px-6 text-right">
                           <button className="text-brand-muted group-hover:text-brand-text transition-colors">
                             <ChevronRight size={18} />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
            </div>
          )}

          {viewMode === 'detail' && selectedDateLocal && (
            <ReportDetail date={selectedDateLocal} onBack={() => setViewMode('list')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportesLayout;
