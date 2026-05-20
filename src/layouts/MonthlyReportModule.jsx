import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { fetchAll } from '../../lib/queryHelper';
import { ArrowLeft, Calendar, DollarSign, Activity, FileText, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';

export default function MonthlyReportModule({ onNavigate }) {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [flashColor, setFlashColor] = useState('');
  
  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const [monthData, setMonthData] = useState({
    workDaysCount: 0,
    openDaysCount: 0,
    totalRevenue: 0,
    totalCosts: 0,
    totalTaxes: 0,
    netProfit: 0,
    expenseDistribution: { staff: 0, supply: 0, recurrent: 0, adHoc: 0 },
    breakdowns: []
  });

  const fetchAvailableMonths = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_days')
        .select('work_date')
        .order('work_date', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const uniqueMonths = [...new Set(data.map(d => d.work_date.substring(0, 7)))];
        setMonths(uniqueMonths);
        setSelectedMonth(uniqueMonths[0]);
      }
    } catch (error) {
      console.error('Error fetching available months:', error);
      triggerFlash('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableMonths();
  }, [fetchAvailableMonths]);

  const fetchMonthDetails = useCallback(async () => {
    if (!selectedMonth) return;
    setLoading(true);

    try {
      const startDate = `${selectedMonth}-01`;
      const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');

      const [wdsRes, settingsRes] = await Promise.all([
        supabase.from('work_days')
          .select('id, work_date, event_name, status')
          .gte('work_date', startDate)
          .lte('work_date', endDate)
          .order('work_date', { ascending: true }),
        supabase.from('global_settings').select('*').single()
      ]);

      if (wdsRes.error) throw wdsRes.error;
      if (settingsRes.error && settingsRes.error.code !== 'PGRST116') throw settingsRes.error;

      const wds = wdsRes.data || [];
      if (wds.length === 0) {
        setMonthData({
          workDaysCount: 0, openDaysCount: 0, totalRevenue: 0, totalCosts: 0, totalTaxes: 0, netProfit: 0,
          expenseDistribution: { staff: 0, supply: 0, recurrent: 0, adHoc: 0 }, breakdowns: []
        });
        return;
      }

      const taxRate = settingsRes.data?.digital_tax_rate || 38;
      const wdIds = wds.map(w => w.id);
      const wdDates = wds.map(w => w.work_date);

      const [closingRes, passlineRes, costsRes, staffRes, adjRes] = await Promise.all([
        fetchAll(supabase.from('night_cash_closing').select('work_day_id, system_cash, system_digital, diff_cash, diff_digital').in('work_day_id', wdIds)),
        fetchAll(supabase.from('stg_passline_tickets').select('operational_date, total_raw, tipo_ticket').in('operational_date', wdDates)),
        fetchAll(supabase.from('opening_costs').select('work_day_id, amount, status, template_id, title').in('status', ['paid', 'approved']).in('work_day_id', wdIds)),
        fetchAll(supabase.from('staff_plan').select('work_day_id, quantity_approved, staff_roles(base_rate)').in('work_day_id', wdIds)),
        fetchAll(supabase.from('financial_adjustments').select('work_day_id, amount, type, category').in('work_day_id', wdIds))
      ]);

      if (closingRes.error) throw closingRes.error;
      if (passlineRes.error) throw passlineRes.error;
      if (costsRes.error) throw costsRes.error;
      if (staffRes.error) throw staffRes.error;
      if (adjRes.error) throw adjRes.error;

      let grandRev = 0, grandCosts = 0, grandNet = 0, grandTax = 0;
    let distStaff = 0, distSupply = 0, distRecurrent = 0, distAdHoc = 0;
    let openCount = 0;
    const breakdowns = [];

    wds.forEach(wd => {
      if (wd.status === 'open') openCount++;

      // Incomes
      const wdClose = (closingRes.data || []).filter(x => x.work_day_id === wd.id);
      const posCash = wdClose.reduce((acc, curr) => acc + Number(curr.system_cash || 0), 0);
      const posDigital = wdClose.reduce((acc, curr) => acc + Number(curr.system_digital || 0), 0);
      const diffCash = wdClose.reduce((acc, curr) => acc + Number(curr.diff_cash || 0), 0);
      const diffDigital = wdClose.reduce((acc, curr) => acc + Number(curr.diff_digital || 0), 0);

      const wdPassline = (passlineRes.data || []).filter(x => x.operational_date === wd.work_date && x.tipo_ticket !== 'MEMBER');
      const passline = wdPassline.reduce((acc, curr) => acc + (parseFloat(curr.total_raw.replace(/[^0-9.-]/g, '')) || 0), 0);

      const wdAdj = (adjRes.data || []).filter(x => x.work_day_id === wd.id);
      const manualIncome = wdAdj.filter(x => x.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const manualExpense = wdAdj.filter(x => x.type === 'expense' && x.category !== 'tax_estimation').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const storedTaxRow = wdAdj.find(x => x.category === 'tax_estimation');

      const rev = posCash + posDigital + diffCash + diffDigital + passline + manualIncome;

      // Expenses
      const wdStaff = (staffRes.data || []).filter(s => s.work_day_id === wd.id);
      const payroll = wdStaff.reduce((acc, curr) => {
        const rate = curr.staff_roles ? Number(curr.staff_roles.base_rate) : 0;
        return acc + (Number(curr.quantity_approved) * rate);
      }, 0);

      const wdCosts = (costsRes.data || []).filter(x => x.work_day_id === wd.id);
      let daySupply = 0, dayRecurrent = 0, dayAdHoc = 0;
      
      wdCosts.forEach(cost => {
        const amt = Number(cost.amount);
        if (cost.title && cost.title.includes('Pedido de Insumos')) {
          daySupply += amt;
        } else if (cost.template_id) {
          dayRecurrent += amt;
        } else {
          dayAdHoc += amt;
        }
      });

      // Tax projection
      let dayTax = 0;
      if (wd.status === 'open') {
        dayTax = (posDigital + passline) * (taxRate / 100);
      } else {
        dayTax = storedTaxRow ? Number(storedTaxRow.amount) : 0;
      }

      // Add tax to operational costs so 'Total Egresos' matches math
      const dayOpCosts = daySupply + dayRecurrent + dayAdHoc + payroll + manualExpense + dayTax;

      const net = rev - dayOpCosts;

      grandRev += rev;
      grandCosts += dayOpCosts;
      grandTax += dayTax;
      grandNet += net;

      distStaff += payroll;
      distSupply += daySupply;
      distRecurrent += dayRecurrent;
      distAdHoc += dayAdHoc + manualExpense;

      breakdowns.push({
        id: wd.id,
        date: wd.work_date,
        name: wd.event_name || 'SIN NOMBRE',
        status: wd.status,
        revenue: rev,
        costs: dayOpCosts,
        net: net
      });
    });

      setMonthData({
        workDaysCount: wds.length,
        openDaysCount: openCount,
        totalRevenue: grandRev,
        totalCosts: grandCosts,
        totalTaxes: grandTax,
        netProfit: grandNet,
        expenseDistribution: { staff: distStaff, supply: distSupply, recurrent: distRecurrent, adHoc: distAdHoc },
        breakdowns
      });
    } catch (error) {
      console.error('Error fetching month details:', error);
      triggerFlash('error');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchMonthDetails();
  }, [fetchMonthDetails]);

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    const date = new Date(y, parseInt(m) - 1);
    return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date).toUpperCase();
  };

  const marginPct = monthData.totalRevenue > 0 ? (monthData.netProfit / monthData.totalRevenue) * 100 : 0;
  const costRatio = monthData.totalRevenue > 0 ? (monthData.totalCosts / monthData.totalRevenue) * 100 : 0;
  const clampedCostRatio = Math.min(costRatio, 100);
  
  const totalOpCosts = monthData.totalCosts;
  const getDistPct = (val) => totalOpCosts > 0 ? (val / totalOpCosts) * 100 : 0;

  const distSorted = [
    { name: 'Staff', value: monthData.expenseDistribution.staff, pct: getDistPct(monthData.expenseDistribution.staff) },
    { name: 'Insumos', value: monthData.expenseDistribution.supply, pct: getDistPct(monthData.expenseDistribution.supply) },
    { name: 'Recurrentes', value: monthData.expenseDistribution.recurrent, pct: getDistPct(monthData.expenseDistribution.recurrent) },
    { name: 'Ad-Hocs', value: monthData.expenseDistribution.adHoc, pct: getDistPct(monthData.expenseDistribution.adHoc) }
  ].sort((a, b) => b.value - a.value);

  const rankBgColors = ['bg-[#ef4444]', 'bg-[#f97316]', 'bg-[#eab308]', 'bg-[#e5e5e5]'];
  const rankTextColors = ['text-[#ef4444]', 'text-[#f97316]', 'text-[#eab308]', 'text-[#e5e5e5]'];

  distSorted.forEach((item, idx) => {
    item.bgClass = rankBgColors[idx];
    item.textClass = rankTextColors[idx];
  });

  const renderTrendLine = () => {
    if (monthData.breakdowns.length < 2) return null;
    
    const maxVal = Math.max(...monthData.breakdowns.map(d => Math.max(d.revenue, d.costs)));
    const minVal = 0;
    if (maxVal === 0) return null;

    const width = 400;
    const height = 120;
    const paddingX = 20;
    const paddingY = 20;
    
    const scaleX = (index) => paddingX + (index / (monthData.breakdowns.length - 1)) * (width - 2 * paddingX);
    const scaleY = (val) => height - paddingY - (val / maxVal) * (height - 2 * paddingY);

    const revPoints = monthData.breakdowns.map((d, i) => `${scaleX(i)},${scaleY(d.revenue)}`).join(' ');
    const costPoints = monthData.breakdowns.map((d, i) => `${scaleX(i)},${scaleY(d.costs)}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <polyline points={revPoints} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {monthData.breakdowns.map((d, i) => (
          <circle key={`r-${i}`} cx={scaleX(i)} cy={scaleY(d.revenue)} r="3" fill="#22c55e" />
        ))}
        <polyline points={costPoints} fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
        {monthData.breakdowns.map((d, i) => (
          <circle key={`c-${i}`} cx={scaleX(i)} cy={scaleY(d.costs)} r="3" fill="#737373" />
        ))}
      </svg>
    );
  };

  return (
    <div className={`h-full flex flex-col relative overflow-hidden bg-brand-bg transition-colors duration-150 ${flashColor}`}>
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('index')} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-brand-muted">AUDITORÍA MENSUAL</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">Reporte Consolidado Vivo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-xs font-bold text-brand-text focus:outline-none appearance-none cursor-pointer uppercase tracking-wider min-w-[200px]"
            >
              {months.length === 0 ? <option value="">SIN DATOS</option> : null}
              {months.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>
          </div>
        </div>

        {months.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-brand-muted opacity-50">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p className="text-xs tracking-widest uppercase font-bold">No hay información histórica disponible.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="animate-pulse text-brand-muted text-xs tracking-widest uppercase">Consolidando Mes...</div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* ZONA A: KPIs ESTRATÉGICOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pasivo Impositivo */}
              <div className="border border-brand-border bg-brand-surface rounded-2xl p-6 relative overflow-hidden group">
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-2">IMPUESTOS PROYECTADOS (PASIVO A RETENER)</div>
                <div className="text-4xl md:text-5xl font-mono tracking-tight text-brand-text mb-3">
                  {formatCurrency(monthData.totalTaxes)}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-brand-muted/80 uppercase tracking-widest font-bold">
                  <AlertTriangle size={12} className="text-brand-warning" /> RETENER LÍQUIDEZ PARA LIQUIDACIÓN
                </div>
              </div>

              {/* Resultado Neto */}
              <div className={`border rounded-2xl p-6 ${
                monthData.netProfit >= 0 
                  ? 'bg-brand-success/5 border-brand-success/30' 
                  : 'bg-brand-surface border-brand-border'
              }`}>
                <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-2">RESULTADO NETO ESTIMADO</div>
                <div className={`text-4xl md:text-5xl font-mono tracking-tight ${monthData.netProfit >= 0 ? 'text-brand-success' : 'text-brand-text'} mb-3`}>
                  {formatCurrency(monthData.netProfit)}
                </div>
                <div className={`text-[10px] uppercase tracking-widest font-bold ${monthData.netProfit >= 0 ? 'text-brand-success/80' : 'text-brand-muted'}`}>
                  MARGEN OPERATIVO: {marginPct > 0 ? '+' : ''}{marginPct.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* ZONA B: GRÁFICOS */}
            
            {/* Termómetro de rentabilidad Minimalista */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border border-brand-border bg-brand-surface rounded-xl p-4 gap-4">
              <div className="flex items-center gap-4 w-full">
                <span className="text-[10px] font-bold tracking-widest uppercase text-brand-muted whitespace-nowrap">RENTABILIDAD</span>
                <div className="flex-1 h-1 bg-brand-border rounded-full overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-brand-success/50 w-full"></div>
                  <div className="absolute top-0 left-0 h-full bg-brand-muted" style={{ width: `${clampedCostRatio}%` }}></div>
                </div>
                <div className="text-[10px] uppercase tracking-widest font-mono font-bold text-brand-text whitespace-nowrap">
                  <span className="text-brand-muted mr-3">EGR: {costRatio.toFixed(1)}%</span>
                  {marginPct >= 20 ? <span className="text-brand-success">SALUDABLE</span> : marginPct >= 0 ? <span className="text-brand-warning">AJUSTADA</span> : <span className="text-brand-error">EN PÉRDIDA</span>}
                </div>
              </div>
            </div>

            {/* Tendencia Historica Mes */}
            <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-6 flex flex-col justify-between min-h-[220px]">
              <div className="text-[10px] font-bold tracking-widest uppercase text-brand-muted mb-6">TENDENCIA HISTÓRICA MES (INGRESOS vs EGRESOS)</div>
              <div className="flex-1 w-full flex items-end justify-center relative">
                {monthData.breakdowns.length >= 2 ? renderTrendLine() : (
                  <div className="text-[10px] text-brand-muted uppercase tracking-widest h-full flex items-center">NO HAY SUFICIENTES DATOS AÚN</div>
                )}
              </div>
              <div className="flex justify-center gap-6 mt-6 text-[10px] uppercase tracking-widest text-brand-muted font-bold">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-brand-success inline-block"></span> Ingresos</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-brand-muted inline-block"></span> Egresos</span>
              </div>
            </div>

            {/* Distribucion del gasto Minimalista */}
            <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-6">
              <div className="text-[10px] font-bold tracking-widest uppercase text-brand-muted mb-4">DISTRIBUCIÓN DE GASTOS EJECUTADOS (EXCLUYE PASIVOS/IMPUESTOS)</div>
              
              <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-brand-border">
                {distSorted.map(item => (
                  <div key={item.name} className={`h-full ${item.bgClass}`} style={{ width: `${item.pct}%` }} title={item.name}></div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-6 mt-4 text-[10px] uppercase tracking-widest font-mono font-bold">
                {distSorted.map(item => (
                  <span key={item.name} className={`flex items-center gap-2 ${item.textClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.bgClass} inline-block`}></span> {item.name} ({item.pct.toFixed(0)}%)
                  </span>
                ))}
              </div>
            </div>

            {/* ZONA C: TABLA VIVA SIMPLIFICADA */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-brand-border flex justify-between items-center bg-brand-bg/50">
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-text">Tabla Viva Consolidada</h3>
                <div className="text-[10px] text-brand-muted tracking-widest uppercase font-bold">
                  {monthData.openDaysCount > 0 ? (
                    <span className="text-brand-accent flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                      {monthData.openDaysCount} Jornadas Vivas (Proyección)
                    </span>
                  ) : (
                    "MES TOTALMENTE CERRADO"
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border">
                      <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted whitespace-nowrap">Fecha</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted whitespace-nowrap">Evento</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted whitespace-nowrap text-right">Ingreso Total</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted whitespace-nowrap text-right">Egreso Total</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted whitespace-nowrap text-right">Resultado Neto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {monthData.breakdowns.map((wd) => (
                      <tr key={wd.id} className="hover:bg-brand-bg transition-colors">
                        <td className="px-6 py-4 text-[11px] font-mono text-brand-muted whitespace-nowrap">
                          {dayjs(wd.date).format('DD/MM/YYYY')}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-brand-text whitespace-nowrap uppercase tracking-wider flex items-center gap-3">
                          {wd.name}
                          {wd.status === 'open' && (
                            <span className="text-[9px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded border border-brand-accent/20 tracking-widest">
                              VIVA
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-brand-text text-right whitespace-nowrap">
                          {formatCurrency(wd.revenue)}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-brand-muted text-right whitespace-nowrap">
                          -{formatCurrency(wd.costs)}
                        </td>
                        <td className={`px-6 py-4 text-xs font-mono font-bold text-right whitespace-nowrap ${
                          wd.net >= 0 ? 'text-brand-success' : 'text-brand-error'
                        }`}>
                          {formatCurrency(wd.net)}
                        </td>
                      </tr>
                    ))}
                    {monthData.breakdowns.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-brand-muted text-xs uppercase tracking-widest">
                          Sin jornadas registradas en este mes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
