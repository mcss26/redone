import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, DollarSign, TrendingDown, TrendingUp, Save, BarChart2 } from 'lucide-react';

export default function WorkdaysBreakEven({ globalDate, setGlobalDate }) {
  const selectedDate = globalDate;
  const setSelectedDate = setGlobalDate;
  const [activeWorkday, setActiveWorkday] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);

  // Financial State
  const [financials, setFinancials] = useState({
    egresos: {
      costosFijosAdhoc: 0,
      nomina: 0,
      mercaderia: 0,
      impactoDiferencias: 0,
      total: 0
    },
    ingresos: {
      passlineGeneral: 0,
      cajasOperativas: 0,
      total: 0
    },
    netResult: 0
  });

  // Efficiency State
  const [efficiencyData, setEfficiencyData] = useState([]);

  useEffect(() => {
    fetchFinancialData(selectedDate);
  }, [selectedDate]);

  const fetchFinancialData = async (dateStr) => {
    try {
      setIsFetchingBackground(true);
      
      const { data: workday, error: workdayError } = await supabase
        .from('work_days')
        .select('*')
        .eq('work_date', dateStr)
        .maybeSingle();

      if (workday) {
        setActiveWorkday(workday);
        
        let costosFijosAdhoc = 0;
        let nomina = 0;
        let mercaderia = 0;
        let passlineGeneral = 0;
        let sistemaGbol = 0;
        let real = 0;

        // Egresos: finance_payments
        const { data: payments } = await supabase
          .from('finance_payments')
          .select('amount_total, source_type')
          .eq('work_day_id', workday.id)
          .in('source_type', ['OPENING', 'AD_HOC']);
          
        if (payments) {
          costosFijosAdhoc = payments.reduce((acc, curr) => acc + Number(curr.amount_total || 0), 0);
        }

        // Egresos: Nómina (Calculada desde Planner, asumida como liquidada)
        const { data: staffPlanning } = await supabase
          .from('work_day_staff_planning')
          .select('role_id, quantity')
          .eq('work_day_id', workday.id);
          
        if (staffPlanning && staffPlanning.length > 0) {
          const roleIds = staffPlanning.map(s => s.role_id);
          const { data: roles } = await supabase
            .from('master_staff_roles')
            .select('id, base_rate')
            .in('id', roleIds);
            
          if (roles) {
            nomina = staffPlanning.reduce((acc, curr) => {
              const role = roles.find(r => r.id === curr.role_id);
              const rate = role ? Number(role.base_rate || 0) : 0;
              return acc + (Number(curr.quantity || 0) * rate);
            }, 0);
          }
        }

        // Egresos: Mercadería
        let cDetailsArray = [];
        const { data: cReport } = await supabase
          .from('consumption_reports')
          .select('id')
          .eq('operational_date', dateStr)
          .maybeSingle();
          
        if (cReport) {
          const { data: cDetails } = await supabase
            .from('consumption_details')
            .select('sku_id, sku_name, total_cost, quantity')
            .eq('report_id', cReport.id);
          if (cDetails) {
            cDetailsArray = cDetails;
            mercaderia = cDetails.reduce((acc, curr) => acc + Number(curr.total_cost || 0), 0);
          }
        }

        // Eficiencia de Barra (Consumo Físico vs Sistema)
        let effData = [];
        const { data: barSession } = await supabase
          .from('bar_sessions')
          .select('id')
          .eq('work_day_id', workday.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (barSession) {
          const { data: snapshots } = await supabase
            .from('bar_stock_snapshots')
            .select('sku_id, quantity, type')
            .eq('session_id', barSession.id);

          const { data: allSkus } = await supabase
            .from('master_sku')
            .select('id, nombre, costo');

          if (snapshots && allSkus) {
            // Mapeo Físico
            const physicalBySku = {};
            snapshots.forEach(s => {
              if (!physicalBySku[s.sku_id]) physicalBySku[s.sku_id] = { opening: 0, closing: 0 };
              if (s.type === 'opening') physicalBySku[s.sku_id].opening = Number(s.quantity);
              if (s.type === 'closing') physicalBySku[s.sku_id].closing = Number(s.quantity);
            });

            // Resolver sku_id faltantes por nombre (Fallback para CSVs legacy sin sku_id)
            cDetailsArray.forEach(c => {
              if (!c.sku_id && c.sku_name) {
                const matched = allSkus.find(s => s.nombre.toLowerCase().trim() === c.sku_name.toLowerCase().trim());
                if (matched) c.sku_id = matched.id;
              }
            });

            // Cruzar con Sistema
            const skuIdsToProcess = new Set([
              ...Object.keys(physicalBySku),
              ...cDetailsArray.map(c => c.sku_id).filter(Boolean)
            ]);

            effData = Array.from(skuIdsToProcess).map(skuId => {
              const sku = allSkus.find(s => s.id === skuId);
              const skuName = sku ? sku.nombre : cDetailsArray.find(c => c.sku_id === skuId)?.sku_name || 'Desconocido';
              const costo = sku ? Number(sku.costo || 0) : 0;
              
              const physical = physicalBySku[skuId] || { opening: 0, closing: 0 };
              const physicalConsumption = physical.opening - physical.closing;
              
              const sysDetails = cDetailsArray.find(c => c.sku_id === skuId);
              const systemConsumption = sysDetails ? Number(sysDetails.quantity || 0) : 0;
              
              const diferenciaUnits = physicalConsumption - systemConsumption;
              const impacto = diferenciaUnits * costo;

              return {
                skuId,
                skuName,
                systemConsumption,
                physicalConsumption,
                diferenciaUnits,
                impacto
              };
            }).filter(item => item.systemConsumption !== 0 || item.physicalConsumption !== 0)
              .sort((a, b) => b.impacto - a.impacto); // Mayor faltante arriba
          }
        }
        setEfficiencyData(effData);

        // Ingresos: Passline General (Excludes MEMBER)
        let allPasslineTickets = [];
        let fetchMore = true;
        let from = 0;
        const limit = 1000;
        while (fetchMore) {
          const { data: chunk } = await supabase
            .from('stg_passline_tickets')
            .select('estado_ticket, total_raw')
            .eq('operational_date', dateStr)
            .neq('tipo_ticket', 'MEMBER')
            .ilike('estado_ticket', '%validada%')
            .range(from, from + limit - 1);
            
          if (chunk && chunk.length > 0) {
            allPasslineTickets = [...allPasslineTickets, ...chunk];
            from += limit;
            if (chunk.length < limit) fetchMore = false;
          } else {
            fetchMore = false;
          }
        }
        
        passlineGeneral = allPasslineTickets.reduce((acc, curr) => {
          const val = parseFloat((curr.total_raw || '').replace(/[^0-9.-]/g, '')) || 0;
          return acc + val;
        }, 0);

        // Ingresos: Cajas Operativas (Declarado Real)
        let cajasOperativas = 0;
        const { data: cashClosing } = await supabase
          .from('cash_closings')
          .select('total_declared')
          .eq('work_day_id', workday.id)
          .maybeSingle();
          
        if (cashClosing && cashClosing.total_declared !== undefined) {
          cajasOperativas = Number(cashClosing.total_declared || 0);
        } else {
          // Fallback if not consolidated yet in Night Chief
          const { data: closings } = await supabase
            .from('closing_terminals')
            .select('declared_cash, declared_digital')
            .eq('work_day_id', workday.id);
            
          if (closings) {
            cajasOperativas = closings.reduce((acc, curr) => {
              const declared = Number(curr.declared_cash || 0) + Number(curr.declared_digital || 0);
              return acc + declared;
            }, 0);
          }
        }

        const impactoDiferencias = effData.filter(d => d.impacto > 0).reduce((acc, curr) => acc + curr.impacto, 0);

        const totalEgresos = costosFijosAdhoc + nomina + mercaderia + impactoDiferencias;
        const totalIngresos = passlineGeneral + cajasOperativas;
        const netResult = totalIngresos - totalEgresos;

        setFinancials({
          egresos: {
            costosFijosAdhoc,
            nomina,
            mercaderia,
            impactoDiferencias,
            total: totalEgresos
          },
          ingresos: {
            passlineGeneral,
            cajasOperativas,
            total: totalIngresos
          },
          netResult
        });

      } else {
        setActiveWorkday(null);
        setEfficiencyData([]);
        setFinancials({
          egresos: { costosFijosAdhoc: 0, nomina: 0, mercaderia: 0, impactoDiferencias: 0, total: 0 },
          ingresos: { passlineGeneral: 0, cajasOperativas: 0, total: 0 },
          netResult: 0
        });
      }
    } catch (err) {
      console.error('Error fetching financials:', err);
    } finally {
      setIsLoading(false);
      setIsFetchingBackground(false);
    }
  };

  const handleConsolidate = async () => {
    if (!activeWorkday) return;
    try {
      const { error } = await supabase
        .from('work_days')
        .update({ net_result: financials.netResult })
        .eq('id', activeWorkday.id);
        
      if (error) throw error;
      
      // Update local state to reflect changes if necessary
      setActiveWorkday(prev => ({ ...prev, net_result: financials.netResult }));
    } catch (err) {
      console.error("Error al consolidar el resultado:", err);
      alert("Error al consolidar el resultado.");
    }
  };

  // formatting
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-brand-muted font-bold tracking-widest uppercase text-sm">Calculando Estado Financiero...</div>;
  }

  if (!activeWorkday) {
    return (
      <div className="h-full flex flex-col relative overflow-hidden bg-brand-bg">
        <div className="shrink-0 bg-[#0A0A0A] border-b border-brand-border/50 px-8 py-6 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-text mb-1">Break Even</h2>
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
              Estado de Resultados (P&L)
            </p>
          </div>
          <div className="flex items-center gap-4 bg-brand-surface/30 border border-brand-border/50 p-2 rounded-xl">
            <div className="flex items-center gap-3 px-3">
              <Calendar size={18} className="text-brand-text" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xl font-mono font-bold text-brand-text focus:outline-none cursor-pointer appearance-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="h-8 w-[1px] bg-brand-border/50"></div>
            <div className="pr-3 pl-1 flex items-center gap-2">
              {isFetchingBackground && (
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest animate-pulse mr-2">
                  Actualizando...
                </span>
              )}
              <span className="px-3 py-1.5 bg-brand-surface/30 text-brand-muted text-[10px] font-black uppercase tracking-widest rounded-lg border border-brand-border/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-muted"></div>
                SIN PLAN
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-brand-surface/30 flex items-center justify-center mb-6">
            <BarChart2 size={32} className="text-brand-muted opacity-80" />
          </div>
          <h3 className="text-xl font-black text-brand-text tracking-tight mb-2">No hay jornada planificada</h3>
          <p className="text-brand-muted text-sm leading-relaxed mb-6">
            No se encontró un registro operativo para la fecha <strong className="text-brand-text">{selectedDate}</strong>.
          </p>
        </div>
      </div>
    );
  }

  const isNetPositive = financials.netResult >= 0;

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-brand-bg">
      {/* HEADER */}
      <div className="shrink-0 bg-[#0A0A0A] border-b border-brand-border/50 px-8 py-6 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text mb-1">Break Even</h2>
          <p className="text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
            Estado de Resultados (P&L)
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-brand-surface/30 border border-brand-border/50 p-2 rounded-xl">
          <div className="flex items-center gap-3 px-3">
            <Calendar size={18} className="text-brand-text" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xl font-mono font-bold text-brand-text focus:outline-none cursor-pointer appearance-none"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div className="h-8 w-[1px] bg-brand-border/50"></div>
          <div className="pr-3 pl-1 flex items-center gap-2">
            {isFetchingBackground && (
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest animate-pulse mr-2">
                Actualizando...
              </span>
            )}
            <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 ${
              activeWorkday.status === 'ACTIVE' 
                ? 'bg-brand-success/20 text-brand-success shadow-[0_0_8px_rgba(34,197,94,0.3)]' 
                : activeWorkday.status === 'CLOSED'
                ? 'bg-brand-surface text-brand-text'
                : 'bg-brand-surface/30 text-brand-muted border border-brand-border/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                activeWorkday.status === 'ACTIVE' ? 'bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                activeWorkday.status === 'CLOSED' ? 'bg-brand-text' : 'bg-brand-muted'
              }`}></div>
              {activeWorkday.status}
            </span>
          </div>
        </div>
        
        {/* ACTIONS */}
        <div className="flex justify-between items-center px-8 py-4 bg-brand-surface border-b border-brand-border absolute bottom-0 translate-y-full w-full hidden">
          {/* We'll put the save button in the main layout instead to keep the top bar clean */}
        </div>
      </div>

      {/* BODY */}
      <div className={`flex-1 overflow-y-auto px-8 py-8 relative transition-opacity duration-300 ${isFetchingBackground ? 'opacity-50' : 'opacity-100'}`}>
        
        {/* KPI: Net Result */}
        <div className="mb-8">
          <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl p-8 flex items-center justify-between shadow-2xl">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-brand-muted mb-2">Resultado Neto Consolidado</div>
              <div className={`text-5xl font-mono font-black tracking-tight ${isNetPositive ? 'text-brand-success' : 'text-brand-muted'}`}>
                {formatCurrency(financials.netResult)}
              </div>
              <div className="mt-2 text-xs font-bold text-brand-muted uppercase tracking-widest">
                Estado guardado: <span className="text-brand-text font-mono">{activeWorkday.net_result !== null ? formatCurrency(activeWorkday.net_result) : 'NO CONSOLIDADO'}</span>
              </div>
            </div>
            <div>
              <button 
                onClick={handleConsolidate}
                className={`px-8 py-4 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-xs transition-all ${
                  activeWorkday.net_result === financials.netResult
                    ? 'bg-brand-surface text-brand-muted border border-brand-border/50 cursor-default'
                    : 'bg-brand-text border border-brand-text text-[#0A0A0A] hover:opacity-90 shadow-[0_0_15px_rgba(229,229,229,0.3)]'
                }`}
                disabled={activeWorkday.net_result === financials.netResult}
              >
                <Save size={18} />
                {activeWorkday.net_result === financials.netResult ? 'Al Día' : 'Consolidar Resultado'}
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* EGRESOS */}
          <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-brand-border/50 flex items-center justify-between bg-brand-surface/20">
              <div className="flex items-center gap-3">
                <TrendingDown size={20} className="text-brand-muted" />
                <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Egresos Reales</h3>
              </div>
              <div className="text-xl font-mono font-black text-brand-muted">
                {formatCurrency(financials.egresos.total)}
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <tbody className="text-sm font-semibold divide-y divide-brand-border/50">
                  <tr className="hover:bg-brand-surface/30 transition-colors">
                    <td className="p-5 text-brand-text uppercase tracking-widest text-[11px] font-bold">Costos Fijos y Ad-hoc</td>
                    <td className="p-5 text-right font-mono text-brand-muted">{formatCurrency(financials.egresos.costosFijosAdhoc)}</td>
                  </tr>
                  <tr className="hover:bg-brand-surface/30 transition-colors">
                    <td className="p-5 text-brand-text uppercase tracking-widest text-[11px] font-bold">Nómina Liquidada</td>
                    <td className="p-5 text-right font-mono text-brand-muted">{formatCurrency(financials.egresos.nomina)}</td>
                  </tr>
                  <tr className="hover:bg-brand-surface/30 transition-colors">
                    <td className="p-5 text-brand-text uppercase tracking-widest text-[11px] font-bold">Costo de Mercadería (CMV)</td>
                    <td className="p-5 text-right font-mono text-brand-muted">{formatCurrency(financials.egresos.mercaderia)}</td>
                  </tr>
                  <tr className="hover:bg-brand-surface/30 transition-colors">
                    <td className="p-5 flex flex-col justify-center">
                      <span className="text-brand-text uppercase tracking-widest text-[11px] font-bold">Faltantes de Barra</span>
                      <span className="text-[9px] uppercase tracking-widest mt-1 text-brand-muted">
                        Impacto Económico de Diferencias
                      </span>
                    </td>
                    <td className="p-5 text-right font-mono text-brand-muted">{formatCurrency(financials.egresos.impactoDiferencias)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* INGRESOS */}
          <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-brand-border/50 flex items-center justify-between bg-brand-surface/20">
              <div className="flex items-center gap-3">
                <TrendingUp size={20} className="text-brand-success" />
                <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Ingresos Totales</h3>
              </div>
              <div className="text-xl font-mono font-black text-brand-success">
                {formatCurrency(financials.ingresos.total)}
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <tbody className="text-sm font-semibold divide-y divide-brand-border/50">
                  <tr className="hover:bg-brand-surface/30 transition-colors">
                    <td className="p-5 text-brand-text uppercase tracking-widest text-[11px] font-bold">Passline General</td>
                    <td className="p-5 text-right font-mono text-brand-text">{formatCurrency(financials.ingresos.passlineGeneral)}</td>
                  </tr>
                  <tr className="hover:bg-brand-surface/30 transition-colors bg-brand-surface/10 border-t border-brand-border/50">
                    <td className="p-5 flex flex-col justify-center">
                      <span className="text-brand-text uppercase tracking-widest text-[11px] font-bold">Cajas Operativas (POS)</span>
                      <span className="text-[9px] uppercase tracking-widest mt-1 text-brand-muted">
                        Ingreso Declarado Real
                      </span>
                    </td>
                    <td className="p-5 text-right font-mono font-bold text-brand-text">
                      {formatCurrency(financials.ingresos.cajasOperativas)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* TABLA DE EFICIENCIA DE BARRA */}
        <div className="mt-8 bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-brand-border/50 flex items-center justify-between bg-brand-surface/20">
            <div className="flex items-center gap-3">
              <BarChart2 size={20} className="text-brand-text" />
              <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Eficiencia de Barra (Físico vs Sistema)</h3>
            </div>
            <div className="text-sm font-mono font-black text-brand-muted uppercase tracking-widest">
              Impacto Faltantes: <span className="text-brand-text">{formatCurrency(
                efficiencyData.filter(d => d.impacto > 0).reduce((acc, curr) => acc + curr.impacto, 0)
              )}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border/30 bg-[#111111]">
                  <th className="py-4 px-6 text-[10px] font-extrabold text-brand-muted uppercase tracking-[0.2em]">Producto</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-brand-text uppercase tracking-[0.2em] text-center">Consumo Sistema</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-brand-text uppercase tracking-[0.2em] text-center">Consumo Físico</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-brand-text uppercase tracking-[0.2em] text-center">Diferencia (U.)</th>
                  <th className="py-4 px-6 text-[10px] font-extrabold text-brand-text uppercase tracking-[0.2em] text-right">Impacto ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/30">
                {efficiencyData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-xs font-bold tracking-widest uppercase text-brand-muted">
                      No hay datos de eficiencia para esta jornada
                    </td>
                  </tr>
                ) : (
                  efficiencyData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-brand-surface/20 transition-colors">
                      <td className="py-3 px-6 text-xs font-bold text-brand-text">{item.skuName}</td>
                      <td className="py-3 px-6 text-xs font-mono font-semibold text-brand-muted text-center">{item.systemConsumption}</td>
                      <td className="py-3 px-6 text-xs font-mono font-semibold text-brand-muted text-center">{item.physicalConsumption}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest font-mono ${
                          item.diferenciaUnits > 0 
                            ? 'bg-brand-surface border border-brand-border/50 text-brand-muted' 
                            : item.diferenciaUnits < 0
                            ? 'bg-brand-surface/50 text-brand-text'
                            : 'text-brand-success/50'
                        }`}>
                          {item.diferenciaUnits > 0 ? `+${item.diferenciaUnits} (Faltante)` : item.diferenciaUnits < 0 ? `${item.diferenciaUnits} (Sobrante)` : 'OK'}
                        </span>
                      </td>
                      <td className={`py-3 px-6 text-xs font-mono font-bold text-right ${
                        item.impacto > 0 ? 'text-brand-muted' : item.impacto < 0 ? 'text-brand-text' : 'text-brand-muted/50'
                      }`}>
                        {item.impacto > 0 ? `-${formatCurrency(item.impacto)}` : item.impacto < 0 ? `+${formatCurrency(Math.abs(item.impacto))}` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
