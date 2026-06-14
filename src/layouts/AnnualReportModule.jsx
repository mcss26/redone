import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { fetchAll } from '../../lib/queryHelper';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function AnnualReportModule({ onNavigate }) {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [flashColor, setFlashColor] = useState('');
  
  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const [yearData, setYearData] = useState({
    workDaysCount: 0,
    openDaysCount: 0,
    inflows: { total: 0, cash: 0, digital: 0, surplus: 0 },
    outflows: { total: 0, weeklyCosts: 0, monthlyCosts: 0, taxes: 0, stockDiscrepancies: 0, tillDiscrepancies: 0 },
    netProfit: 0,
    margin: 0,
    breakdowns: []
  });

  const fetchAvailableYears = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_days')
        .select('work_date')
        .order('work_date', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const uniqueYears = [...new Set(data.map(d => d.work_date.substring(0, 4)))];
        setYears(uniqueYears);
        setSelectedYear(uniqueYears[0]);
      } else {
        // Fallback to current year if no work_days exist
        const currYear = dayjs().format('YYYY');
        setYears([currYear]);
        setSelectedYear(currYear);
      }
    } catch (error) {
      console.error('Error fetching available years:', error);
      triggerFlash('error');
      window.UI?.toast?.(error.message || "Error al procesar", 'danger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableYears();
  }, [fetchAvailableYears]);

  const fetchYearDetails = useCallback(async () => {
    if (!selectedYear) return;
    setLoading(true);

    try {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      const [wdsRes, settingsRes, fixedCostsRes] = await Promise.all([
        supabase.from('work_days')
          .select('id, work_date, event_name, status')
          .gte('work_date', startDate)
          .lte('work_date', endDate)
          .order('work_date', { ascending: true }),
        supabase.from('global_settings').select('*').single(),
        fetchAll(supabase.from('monthly_fixed_costs').select('amount, status, billing_month').like('billing_month', `${selectedYear}-%`))
      ]);

      if (wdsRes.error) throw wdsRes.error;
      if (settingsRes.error && settingsRes.error.code !== 'PGRST116') throw settingsRes.error;
      if (fixedCostsRes.error) throw fixedCostsRes.error;

      let totalFixedCosts = 0;
      const monthlyFixedCosts = {};
      for(let i=1; i<=12; i++) monthlyFixedCosts[i] = 0;

      (fixedCostsRes.data || []).forEach(fc => {
        if (fc.status === 'paid' && fc.billing_month) {
          totalFixedCosts += Number(fc.amount);
          const mStr = fc.billing_month.split('-')[1];
          const m = parseInt(mStr, 10);
          if (m >= 1 && m <= 12) {
            monthlyFixedCosts[m] += Number(fc.amount);
          }
        }
      });

      const wds = wdsRes.data || [];
      if (wds.length === 0 && totalFixedCosts === 0) {
        setYearData({
          workDaysCount: 0, openDaysCount: 0, 
          inflows: { total: 0, cash: 0, digital: 0, surplus: 0 },
          outflows: { total: 0, weeklyCosts: 0, monthlyCosts: 0, taxes: 0, stockDiscrepancies: 0, tillDiscrepancies: 0 },
          netProfit: 0, margin: 0, breakdowns: []
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

      let grandInflows = { total: 0, cash: 0, digital: 0, surplus: 0 };
      let grandOutflows = { total: 0, weeklyCosts: 0, monthlyCosts: totalFixedCosts, taxes: 0, stockDiscrepancies: 0, tillDiscrepancies: 0 };
      let grandNet = 0;
      let openCount = 0;

      const monthlyBreakdownsMap = {};
      for (let i = 1; i <= 12; i++) {
        monthlyBreakdownsMap[i] = { revenue: 0, costs: 0, hasData: false, hasOpenDays: false };
      }

      wds.forEach(wd => {
        if (wd.status === 'open') openCount++;
        const m = parseInt(wd.work_date.split('-')[1], 10);

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

        monthlyBreakdownsMap[m].revenue += revTotal;
        monthlyBreakdownsMap[m].costs += dayOpCosts;
        monthlyBreakdownsMap[m].hasData = true;
        if (wd.status === 'open') monthlyBreakdownsMap[m].hasOpenDays = true;
      });

      const finalBreakdowns = [];
      const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];

      for(let i=1; i<=12; i++) {
        const monthFixed = monthlyFixedCosts[i] || 0;
        
        if (monthlyBreakdownsMap[i].hasData || monthFixed > 0) {
           const rev = monthlyBreakdownsMap[i].revenue;
           const cst = monthlyBreakdownsMap[i].costs + monthFixed;
           const net = rev - cst;

           finalBreakdowns.push({
             id: i,
             name: monthNames[i-1],
             revenue: rev,
             costs: cst,
             net: net,
             hasOpenDays: monthlyBreakdownsMap[i].hasOpenDays
           });
        }
      }

      grandOutflows.total = grandOutflows.weeklyCosts + grandOutflows.monthlyCosts + grandOutflows.taxes + grandOutflows.stockDiscrepancies + grandOutflows.tillDiscrepancies;
      grandNet = grandInflows.total - grandOutflows.total;
      const margin = grandInflows.total > 0 ? (grandNet / grandInflows.total) * 100 : 0;

      setYearData({
        workDaysCount: wds.length,
        openDaysCount: openCount,
        inflows: grandInflows,
        outflows: grandOutflows,
        netProfit: grandNet,
        margin: margin,
        breakdowns: finalBreakdowns
      });

    } catch (error) {
      console.error('Error fetching year details:', error);
      triggerFlash('error');
      window.UI?.toast?.(error.message || "Error al procesar", 'danger');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchYearDetails();
  }, [fetchYearDetails]);

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

  const marginPct = yearData.margin;

  const renderTrendLine = () => {
    if (yearData.breakdowns.length < 2) return null;
    
    const maxVal = Math.max(...yearData.breakdowns.map(d => Math.max(d.revenue, d.costs)));
    const minVal = 0;
    if (maxVal === 0) return null;

    const width = 400;
    const height = 120;
    const paddingX = 20;
    const paddingY = 20;
    
    const scaleX = (index) => paddingX + (index / (yearData.breakdowns.length - 1)) * (width - 2 * paddingX);
    const scaleY = (val) => height - paddingY - (val / maxVal) * (height - 2 * paddingY);

    const revPoints = yearData.breakdowns.map((d, i) => `${scaleX(i)},${scaleY(d.revenue)}`).join(' ');
    const costPoints = yearData.breakdowns.map((d, i) => `${scaleX(i)},${scaleY(d.costs)}`).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <polyline points={revPoints} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {yearData.breakdowns.map((d, i) => (
          <circle key={`r-${i}`} cx={scaleX(i)} cy={scaleY(d.revenue)} r="3" fill="#22c55e" />
        ))}
        <polyline points={costPoints} fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4" />
        {yearData.breakdowns.map((d, i) => (
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
              <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">R. ANUAL</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">Reporte Consolidado Vivo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-xs font-bold text-brand-text focus:outline-none appearance-none cursor-pointer uppercase tracking-wider min-w-[200px]"
            >
              {years.length === 0 ? <option value="">SIN DATOS</option> : null}
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {years.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-brand-muted opacity-50">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p className="text-xs tracking-widest uppercase font-bold">No hay información histórica disponible.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="animate-pulse text-brand-muted text-xs tracking-widest uppercase">Consolidando Año...</div>
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
                    -{formatCurrency(yearData.outflows.total)}
                  </div>
                </div>
                
                <div className="bg-brand-surface/30 border border-brand-border/50 rounded-2xl p-4">
                  <table className="w-full text-xs font-mono">
                    <tbody className="divide-y divide-brand-border/30">
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Costos Semana (Inc. RRHH)</td><td className="py-3 text-right">-{formatCurrency(yearData.outflows.weeklyCosts)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Costos Mes (Fijos)</td><td className="py-3 text-right">-{formatCurrency(yearData.outflows.monthlyCosts)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Impuestos Proyectados</td><td className="py-3 text-right text-brand-warning">-{formatCurrency(yearData.outflows.taxes)}</td></tr>
                      {yearData.outflows.stockDiscrepancies > 0 && (
                        <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Mermas de Barra</td><td className="py-3 text-right text-brand-error">-{formatCurrency(yearData.outflows.stockDiscrepancies)}</td></tr>
                      )}
                      {yearData.outflows.tillDiscrepancies > 0 && (
                        <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Diferencias de Arqueo</td><td className="py-3 text-right text-brand-error">-{formatCurrency(yearData.outflows.tillDiscrepancies)}</td></tr>
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
                    {formatCurrency(yearData.inflows.total)}
                  </div>
                </div>
                
                <div className="bg-brand-surface/30 border border-brand-border/50 rounded-2xl p-4">
                  <table className="w-full text-xs font-mono">
                    <tbody className="divide-y divide-brand-border/30">
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Efectivo (POS)</td><td className="py-3 text-right">{formatCurrency(yearData.inflows.cash)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Digital (POS + Passline)</td><td className="py-3 text-right">{formatCurrency(yearData.inflows.digital)}</td></tr>
                      {yearData.inflows.surplus > 0 && (
                        <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Otros / Ajustes</td><td className="py-3 text-right text-brand-success">+{formatCurrency(yearData.inflows.surplus)}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* COL 3: MARGEN NETO */}
              <div className="flex flex-col gap-4">
                <div className={`border rounded-2xl p-6 flex flex-col justify-between h-[116px] ${
                  yearData.netProfit >= 0 ? 'bg-brand-success/5 border-brand-success/30' : 'bg-brand-error/5 border-brand-error/30'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-extrabold tracking-widest uppercase text-brand-muted mb-2">MARGEN NETO</div>
                    <div className={`text-xs font-bold px-2 py-1 rounded bg-[#111111] font-mono tracking-widest ${yearData.margin >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>
                      {yearData.margin > 0 ? '+' : ''}{yearData.margin.toFixed(1)}% MRG
                    </div>
                  </div>
                  <div className={`text-4xl font-mono tracking-tight ${yearData.netProfit >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>
                    {formatCurrency(yearData.netProfit)}
                  </div>
                </div>

                <div className="bg-brand-surface/30 border border-brand-border/50 rounded-2xl p-4">
                  <table className="w-full text-xs font-mono">
                    <tbody className="divide-y divide-brand-border/30">
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Ingresos Totales</td><td className="py-3 text-right text-brand-success">{formatCurrency(yearData.inflows.total)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Egresos Totales</td><td className="py-3 text-right text-brand-error">-{formatCurrency(yearData.outflows.total)}</td></tr>
                      <tr className="bg-brand-surface/50"><td className="py-3 px-2 text-brand-text font-sans font-bold uppercase tracking-wider text-[10px]">Beneficio Operativo</td><td className={`py-3 px-2 text-right font-bold ${yearData.netProfit >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>{formatCurrency(yearData.netProfit)}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* ZONA B: GRÁFICOS */}
            
            {/* Tendencia Historica Mes */}
            <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-6 flex flex-col justify-between min-h-[220px]">
              <div className="text-[10px] font-bold tracking-widest uppercase text-brand-muted mb-6">TENDENCIA HISTÓRICA ANUAL (INGRESOS vs EGRESOS POR MES)</div>
              <div className="flex-1 w-full flex items-end justify-center relative">
                {yearData.breakdowns.length >= 2 ? renderTrendLine() : (
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
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-text">Tabla Viva Consolidada (Agrupación Mensual)</h3>
                <div className="text-[10px] text-brand-muted tracking-widest uppercase font-bold">
                  {yearData.openDaysCount > 0 ? (
                    <span className="text-brand-accent flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                      CONTIENE JORNADAS ABIERTAS
                    </span>
                  ) : (
                    "AÑO TOTALMENTE CERRADO"
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-brand-border">
                      <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted whitespace-nowrap">Mes</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted whitespace-nowrap text-right">Ingreso Total</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted whitespace-nowrap text-right">Egreso Total</th>
                      <th className="px-6 py-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted whitespace-nowrap text-right">Resultado Neto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {yearData.breakdowns.map((month) => (
                      <tr key={month.id} className="hover:bg-brand-bg transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-brand-text whitespace-nowrap uppercase tracking-wider flex items-center gap-3">
                          {month.name}
                          {month.hasOpenDays && (
                            <span className="text-[9px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded border border-brand-accent/20 tracking-widest">
                              PROYECTADO
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-brand-text text-right whitespace-nowrap">
                          {formatCurrency(month.revenue)}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-brand-muted text-right whitespace-nowrap">
                          -{formatCurrency(month.costs)}
                        </td>
                        <td className={`px-6 py-4 text-xs font-mono font-bold text-right whitespace-nowrap ${
                          month.net >= 0 ? 'text-brand-success' : 'text-brand-error'
                        }`}>
                          {formatCurrency(month.net)}
                        </td>
                      </tr>
                    ))}
                    {yearData.breakdowns.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-brand-muted text-xs uppercase tracking-widest">
                          Sin operaciones registradas en este año
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
