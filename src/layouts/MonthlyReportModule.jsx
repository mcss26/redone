import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { fetchAll } from '../../lib/queryHelper';
import { ArrowLeft, Calendar, DollarSign, Activity, FileText, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';

export default function MonthlyReportModule({ onNavigate }) {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [flashColor, setFlashColor] = useState('');
  
  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const [monthData, setMonthData] = useState({
    workDaysCount: 0,
    openDaysCount: 0,
    inflows: { total: 0, cash: 0, digital: 0, surplus: 0 },
    outflows: { total: 0, weeklyCosts: 0, monthlyCosts: 0, taxes: 0, stockDiscrepancies: 0, tillDiscrepancies: 0 },
    netProfit: 0,
    margin: 0,
    expenseDistribution: { staff: 0, supply: 0, recurrent: 0, adHoc: 0, fixed: 0 },
    breakdowns: [],
    terminalPerformance: [],
    mermasDetail: []
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
      window.UI?.toast?.(error.message || "Error al procesar", 'danger');
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
      const taxRate = settingsRes.data?.digital_tax_rate || 38;

      // Fetch fixed costs for the month
      const { data: fixedCostsData, error: fixedError } = await supabase
        .from('monthly_fixed_costs')
        .select('amount, status')
        .eq('billing_month', selectedMonth);
        
      if (fixedError) throw fixedError;
      
      const totalFixedCosts = (fixedCostsData || []).reduce((acc, curr) => acc + Number(curr.amount), 0);

      if (wds.length === 0) {
        setMonthData({
          workDaysCount: 0, openDaysCount: 0,
          inflows: { total: 0, cash: 0, digital: 0, surplus: 0 },
          outflows: { total: totalFixedCosts, weeklyCosts: 0, monthlyCosts: totalFixedCosts, taxes: 0, stockDiscrepancies: 0, tillDiscrepancies: 0 },
          netProfit: -totalFixedCosts, margin: 0,
          expenseDistribution: { staff: 0, supply: 0, recurrent: 0, adHoc: 0, fixed: totalFixedCosts }, breakdowns: []
        });
        return;
      }

      const wdIds = wds.map(w => w.id);
      const wdDates = wds.map(w => w.work_date);

      const [closingRes, passlineRes, costsRes, staffRes, adjRes, posRes] = await Promise.all([
        fetchAll(supabase.from('night_cash_closing').select('work_day_id, terminal_id, system_cash, system_digital, diff_cash, diff_digital').in('work_day_id', wdIds)),
        fetchAll(supabase.from('stg_passline_tickets').select('operational_date, total_raw, tipo_ticket').in('operational_date', wdDates)),
        fetchAll(supabase.from('opening_costs').select('work_day_id, amount, status, template_id, title').in('status', ['paid', 'approved']).in('work_day_id', wdIds)),
        fetchAll(supabase.from('staff_plan').select('work_day_id, quantity_approved, staff_roles(base_rate)').in('work_day_id', wdIds)),
        fetchAll(supabase.from('financial_adjustments').select('work_day_id, amount, type, category, description').in('work_day_id', wdIds)),
        supabase.from('pos_terminals').select('id, name')
      ]);

      if (closingRes.error) throw closingRes.error;
      if (passlineRes.error) throw passlineRes.error;
      if (costsRes.error) throw costsRes.error;
      if (staffRes.error) throw staffRes.error;
      if (adjRes.error) throw adjRes.error;
      if (posRes.error) throw posRes.error;

      let grandInflows = { total: 0, cash: 0, digital: 0, surplus: 0 };
      let grandOutflows = { total: 0, weeklyCosts: 0, monthlyCosts: totalFixedCosts, taxes: 0, stockDiscrepancies: 0, tillDiscrepancies: 0 };
      let grandNet = 0;
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
        const manualIncome = wdAdj.filter(x => x.type === 'income' && x.category !== 'auditoria_barra').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const manualExpense = wdAdj.filter(x => x.type === 'expense' && x.category !== 'tax_estimation' && x.category !== 'auditoria_barra').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const storedTaxRow = wdAdj.find(x => x.category === 'tax_estimation');

        const barraIncome = wdAdj.filter(x => x.category === 'auditoria_barra' && x.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const barraExpense = wdAdj.filter(x => x.category === 'auditoria_barra' && x.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
        
        const netBarra = barraIncome - barraExpense;
        const barraSobrante = netBarra > 0 ? netBarra : 0;
        const barraFaltante = netBarra < 0 ? Math.abs(netBarra) : 0;

        const discrepancies = diffCash + diffDigital;
        const arqueoSobrante = discrepancies > 0 ? discrepancies : 0;
        const arqueoFaltante = discrepancies < 0 ? Math.abs(discrepancies) : 0;

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
        if (wd.status === 'open' && !storedTaxRow) {
          dayTax = (posDigital + passline) * (taxRate / 100);
        } else {
          dayTax = storedTaxRow ? Number(storedTaxRow.amount) : 0;
        }

        const dayWeeklyCosts = daySupply + dayRecurrent + dayAdHoc + payroll + manualExpense;
        const dayOpCosts = dayWeeklyCosts + dayTax + barraFaltante + arqueoFaltante;

        const revCash = posCash;
        const revDigital = posDigital + passline;
        const revSurplus = barraSobrante + arqueoSobrante + manualIncome;
        const revTotal = revCash + revDigital + revSurplus;

        const net = revTotal - dayOpCosts;

        grandInflows.cash += revCash;
        grandInflows.digital += revDigital;
        grandInflows.surplus += revSurplus;
        grandInflows.total += revTotal;

        grandOutflows.weeklyCosts += dayWeeklyCosts;
        grandOutflows.taxes += dayTax;
        grandOutflows.stockDiscrepancies += barraFaltante;
        grandOutflows.tillDiscrepancies += arqueoFaltante;
        grandOutflows.total += dayOpCosts;
        
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
          revenue: revTotal,
          costs: dayOpCosts,
          net: net
        });
      });

      grandOutflows.total += totalFixedCosts;
      grandNet -= totalFixedCosts;
      const margin = grandInflows.total > 0 ? (grandNet / grandInflows.total) * 100 : 0;

      const posMap = {};
      (posRes.data || []).forEach(p => posMap[p.id] = p.name);

      const terminalSums = {};
      (closingRes.data || []).forEach(c => {
        if (!c.terminal_id) return;
        if (!terminalSums[c.terminal_id]) terminalSums[c.terminal_id] = 0;
        terminalSums[c.terminal_id] += (Number(c.diff_cash) || 0) + (Number(c.diff_digital) || 0);
      });
      const terminalPerformance = Object.entries(terminalSums)
        .map(([id, val]) => ({ name: posMap[id] || `Caja ${id}`, net: val }))
        .filter(t => Math.abs(t.net) > 0.01)
        .sort((a, b) => a.net - b.net);

      const mermasSums = {};
      (adjRes.data || []).filter(a => a.category === 'auditoria_barra').forEach(a => {
        const desc = a.description || '';
        const match = desc.match(/Ajuste Barra:\s*(.*)\s*\(([-+0-9.]+)\s*unidades\)/);
        const name = match ? match[1].trim() : (desc.replace('Ajuste Barra: ', '').trim() || 'Ítem Desconocido');
        const val = a.type === 'income' ? Number(a.amount) : -Number(a.amount);
        if (!mermasSums[name]) mermasSums[name] = 0;
        mermasSums[name] += val;
      });
      const mermasDetail = Object.entries(mermasSums)
        .map(([name, val]) => ({ name, net: val }))
        .filter(m => Math.abs(m.net) > 0.01)
        .sort((a, b) => a.net - b.net);

      setMonthData({
        workDaysCount: wds.length,
        openDaysCount: openCount,
        inflows: grandInflows,
        outflows: grandOutflows,
        netProfit: grandNet,
        margin: margin,
        expenseDistribution: { staff: distStaff, supply: distSupply, recurrent: distRecurrent, adHoc: distAdHoc, fixed: totalFixedCosts },
        breakdowns,
        terminalPerformance,
        mermasDetail
      });
    } catch (error) {
      console.error('Error fetching month details:', error);
      triggerFlash('error');
      window.UI?.toast?.(error.message || "Error al procesar", 'danger');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchMonthDetails();
  }, [fetchMonthDetails]);

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);
  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    const date = new Date(y, parseInt(m) - 1);
    return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date).toUpperCase();
  };

  const marginPct = monthData.margin;

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
      <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">R. MES</h2>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COL 1: EGRESOS */}
              <div className="flex flex-col gap-4">
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 relative">
                  <div className="text-[10px] font-extrabold tracking-widest uppercase text-brand-muted mb-2">TOTAL EGRESOS</div>
                  <div className="text-4xl font-mono text-brand-text">
                    -{formatCurrency(monthData.outflows.total)}
                  </div>
                </div>
                
                <div className="bg-brand-surface/30 border border-brand-border/50 rounded-2xl p-4">
                  <table className="w-full text-xs font-mono">
                    <tbody className="divide-y divide-brand-border/30">
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Costos Semana (Inc. RRHH)</td><td className="py-3 text-right">-{formatCurrency(monthData.outflows.weeklyCosts)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Costos Mes (Fijos)</td><td className="py-3 text-right">-{formatCurrency(monthData.outflows.monthlyCosts)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Impuestos Proyectados</td><td className="py-3 text-right text-brand-warning">-{formatCurrency(monthData.outflows.taxes)}</td></tr>
                      {monthData.outflows.stockDiscrepancies > 0 && (
                        <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Mermas de Barra</td><td className="py-3 text-right text-brand-error">-{formatCurrency(monthData.outflows.stockDiscrepancies)}</td></tr>
                      )}
                      {monthData.outflows.tillDiscrepancies > 0 && (
                        <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Diferencias de Arqueo</td><td className="py-3 text-right text-brand-error">-{formatCurrency(monthData.outflows.tillDiscrepancies)}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* COL 2: INGRESOS */}
              <div className="flex flex-col gap-4">
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 relative">
                  <div className="text-[10px] font-extrabold tracking-widest uppercase text-brand-muted mb-2">TOTAL INGRESOS</div>
                  <div className="text-4xl font-mono text-brand-success">
                    {formatCurrency(monthData.inflows.total)}
                  </div>
                </div>
                
                <div className="bg-brand-surface/30 border border-brand-border/50 rounded-2xl p-4">
                  <table className="w-full text-xs font-mono">
                    <tbody className="divide-y divide-brand-border/30">
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Efectivo (POS)</td><td className="py-3 text-right">{formatCurrency(monthData.inflows.cash)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Digital (POS + Passline)</td><td className="py-3 text-right">{formatCurrency(monthData.inflows.digital)}</td></tr>
                      {monthData.inflows.surplus > 0 && (
                        <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Otros / Ajustes</td><td className="py-3 text-right text-brand-success">+{formatCurrency(monthData.inflows.surplus)}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* COL 3: MARGEN NETO */}
              <div className="flex flex-col gap-4">
                <div className={`border rounded-2xl p-6 flex flex-col justify-between h-[116px] ${
                  monthData.netProfit >= 0 ? 'bg-brand-success/5 border-brand-success/30' : 'bg-brand-error/5 border-brand-error/30'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-extrabold tracking-widest uppercase text-brand-muted mb-2">MARGEN NETO</div>
                    <div className={`text-xs font-bold px-2 py-1 rounded bg-[#111111] font-mono tracking-widest ${monthData.margin >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>
                      {monthData.margin > 0 ? '+' : ''}{monthData.margin.toFixed(1)}% MRG
                    </div>
                  </div>
                  <div className={`text-4xl font-mono tracking-tight ${monthData.netProfit >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>
                    {formatCurrency(monthData.netProfit)}
                  </div>
                </div>

                <div className="bg-brand-surface/30 border border-brand-border/50 rounded-2xl p-4">
                  <table className="w-full text-xs font-mono">
                    <tbody className="divide-y divide-brand-border/30">
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Ingresos Totales</td><td className="py-3 text-right text-brand-success">{formatCurrency(monthData.inflows.total)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Egresos Totales</td><td className="py-3 text-right text-brand-error">-{formatCurrency(monthData.outflows.total)}</td></tr>
                      <tr className="bg-brand-surface/50"><td className="py-3 px-2 text-brand-text font-sans font-bold uppercase tracking-wider text-[10px]">Beneficio Operativo</td><td className={`py-3 px-2 text-right font-bold ${monthData.netProfit >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>{formatCurrency(monthData.netProfit)}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* ZONA B: GRÁFICOS */}
            
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

            {/* ZONA D: ANÁLISIS OPERATIVO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              
              {/* RENDIMIENTO CAJAS */}
              <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 md:p-6 border-b border-brand-border/50 bg-brand-surface/20">
                  <h3 className="text-base font-black text-brand-text uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-accent"></span>
                    RENDIMIENTO CAJAS
                  </h3>
                  <div className="text-[9px] text-brand-muted/70 tracking-widest mt-2 uppercase">
                    Desvíos Netos Acumulados
                  </div>
                </div>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border">
                        <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted">Terminal</th>
                        <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted text-right">Desvío Neto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {monthData.terminalPerformance.map((t) => (
                        <tr key={t.name} className="hover:bg-brand-bg transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-brand-text uppercase tracking-wider">{t.name}</td>
                          <td className={`px-6 py-4 text-xs font-mono font-bold text-right ${t.net < 0 ? 'text-brand-error' : 'text-brand-success'}`}>
                            {t.net > 0 ? '+' : ''}{formatCurrency(t.net)}
                          </td>
                        </tr>
                      ))}
                      {monthData.terminalPerformance.length === 0 && (
                        <tr>
                          <td colSpan="2" className="px-6 py-8 text-center text-brand-muted text-xs uppercase tracking-widest">
                            SIN DESVÍOS OPERATIVOS RELEVANTES
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DETALLE MERMAS */}
              <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 md:p-6 border-b border-brand-border/50 bg-brand-surface/20">
                  <h3 className="text-base font-black text-brand-text uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-warning"></span>
                    DETALLE MERMAS
                  </h3>
                  <div className="text-[9px] text-brand-muted/70 tracking-widest mt-2 uppercase">
                    Auditorías de Consumo Acumuladas
                  </div>
                </div>
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border">
                        <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted">Artículo</th>
                        <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted text-right">Monto Monetizado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {monthData.mermasDetail.map((m) => (
                        <tr key={m.name} className="hover:bg-brand-bg transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-brand-text uppercase tracking-wider">{m.name}</td>
                          <td className={`px-6 py-4 text-xs font-mono font-bold text-right ${m.net < 0 ? 'text-brand-error' : 'text-brand-success'}`}>
                            {m.net > 0 ? '+' : ''}{formatCurrency(m.net)}
                          </td>
                        </tr>
                      ))}
                      {monthData.mermasDetail.length === 0 && (
                        <tr>
                          <td colSpan="2" className="px-6 py-8 text-center text-brand-muted text-xs uppercase tracking-widest">
                            SIN DESVÍOS DE STOCK RELEVANTES
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
