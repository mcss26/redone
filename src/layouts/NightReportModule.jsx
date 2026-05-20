import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle, CheckCircle2, Lock, Upload, Loader2, Save, Plus, X, Copy } from 'lucide-react';
import dayjs from 'dayjs';

const parseCsvLine = (text, sep = ',') => {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { inQuotes = !inQuotes; continue; }
    if (c === sep && !inQuotes) { result.push(cur); cur = ''; continue; }
    cur += c;
  }
  result.push(cur);
  return result;
};

export default function NightReportModule({ onNavigate }) {
  const [workDays, setWorkDays] = useState([]);
  const [selectedWorkDay, setSelectedWorkDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [flashColor, setFlashColor] = useState(null);
  
  const [isAdjOpen, setIsAdjOpen] = useState(false);
  const [adjType, setAdjType] = useState('income');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjDesc, setAdjDesc] = useState('');
  const [savingAdj, setSavingAdj] = useState(false);

  const [globalSettings, setGlobalSettings] = useState({ digital_tax_rate: 38 });

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(null), 300);
  };

  const [reportData, setReportData] = useState({
    inflows: { posCash: 0, posDigital: 0, passline: 0, discrepancies: 0, manual: 0, total: 0 },
    outflows: { costsPaid: 0, recurrentCostsPaid: 0, adHocCostsPaid: 0, supplyCostsPaid: 0, costsPending: 0, payroll: 0, efficiencyImpact: 0, tax: 0, manual: 0, total: 0 },
    manualAdjustments: [],
    netProfit: 0,
    margin: 0
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [wdRes, settingsRes] = await Promise.all([
        supabase.from('work_days').select('*').in('status', ['open', 'closed']).order('work_date', { ascending: false }),
        supabase.from('global_settings').select('*')
      ]);
      
      if (wdRes.error) throw wdRes.error;
      if (settingsRes.error) throw settingsRes.error;

      if (settingsRes.data) {
        const taxSetting = settingsRes.data.find(s => s.key === 'digital_tax_rate');
        if (taxSetting) setGlobalSettings({ digital_tax_rate: Number(taxSetting.value) || 38 });
      }

      const wdData = wdRes.data || [];
      setWorkDays(wdData);
      
      if (wdData.length > 0) {
        if (!selectedWorkDay) {
          setSelectedWorkDay(wdData[0]);
        } else {
          const stillExists = wdData.find(w => w.id === selectedWorkDay.id);
          setSelectedWorkDay(stillExists || wdData[0]);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      triggerFlash('error');
      setLoading(false);
    }
  }, [selectedWorkDay]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchReportData = useCallback(async () => {
    if (!selectedWorkDay) return;
    try {
      setLoading(true);
      
      const wdId = selectedWorkDay.id;

      const [closingRes, costsRes, staffRes, passlineRes, adjRes] = await Promise.all([
        supabase.from('night_cash_closing').select('diff_cash, diff_digital, system_cash, system_digital').eq('work_day_id', wdId),
        supabase.from('opening_costs').select('status, amount, title, template_id').eq('work_day_id', wdId),
        supabase.from('staff_plan').select('quantity_approved, staff_roles(base_rate)').eq('work_day_id', wdId),
        supabase.from('stg_passline_tickets').select('total_raw, tipo_ticket').eq('operational_date', selectedWorkDay.work_date),
        supabase.from('financial_adjustments').select('*').eq('work_day_id', wdId)
      ]);

      if (closingRes.error) throw closingRes.error;
      if (costsRes.error) throw costsRes.error;
      if (staffRes.error) throw staffRes.error;
      if (passlineRes.error) throw passlineRes.error;
      if (adjRes.error) throw adjRes.error;

    // 1. POS Inflows
    let posCash = 0, posDigital = 0, dCash = 0, dDigital = 0;
    (closingRes.data || []).forEach(c => {
      posCash += Number(c.system_cash || 0);
      posDigital += Number(c.system_digital || 0);
      dCash += Number(c.diff_cash || 0);
      dDigital += Number(c.diff_digital || 0);
    });
    const discrepancies = dCash + dDigital;

    // 2. Passline Inflows
    let passline = 0;
    (passlineRes.data || []).forEach(t => {
      if (t.tipo_ticket !== 'MEMBER' && t.total_raw) {
        passline += parseFloat(t.total_raw.replace(/[^0-9.-]/g, '')) || 0;
      }
    });

    // 3. Costs Outflows
    let costsPaid = 0, costsPending = 0;
    let recurrentCostsPaid = 0, adHocCostsPaid = 0, supplyCostsPaid = 0;
    (costsRes.data || []).forEach(c => {
      const amt = Number(c.amount);
      if (c.status === 'paid') {
        costsPaid += amt;
        if (c.title === 'Pedido de Insumos (Lote)') supplyCostsPaid += amt;
        else if (c.template_id) recurrentCostsPaid += amt;
        else adHocCostsPaid += amt;
      }
      else if (c.status === 'approved') costsPending += amt;
    });

    // 4. Payroll Outflows
    let payroll = 0;
    (staffRes.data || []).forEach(s => {
      const rate = s.staff_roles ? Number(s.staff_roles.base_rate) : 0;
      payroll += Number(s.quantity_approved) * rate;
    });

    // 6. Adjustments & Taxes
    const adjustments = adjRes.data || [];
    let manualIncome = 0;
    let manualExpense = 0;
    let storedTax = null;

    adjustments.forEach(adj => {
      if (adj.category === 'tax_estimation') {
        storedTax = Number(adj.amount);
      } else {
        if (adj.type === 'income') manualIncome += Number(adj.amount);
        if (adj.type === 'expense') manualExpense += Number(adj.amount);
      }
    });

    let tax = 0;
    if (selectedWorkDay.status === 'open' && storedTax === null) {
      tax = (posDigital + passline) * (globalSettings.digital_tax_rate / 100);
    } else {
      tax = storedTax || 0;
    }

    // Totals
    const totalInflows = posCash + posDigital + passline + discrepancies + manualIncome;
    const totalOutflows = costsPaid + costsPending + payroll + tax + manualExpense;
    const netProfit = totalInflows - totalOutflows;
    const margin = totalInflows > 0 ? (netProfit / totalInflows) * 100 : 0;

      setReportData({
        inflows: { posCash, posDigital, passline, discrepancies, manual: manualIncome, total: totalInflows },
        outflows: { costsPaid, recurrentCostsPaid, adHocCostsPaid, supplyCostsPaid, costsPending, payroll, efficiencyImpact: 0, tax, manual: manualExpense, total: totalOutflows },
        manualAdjustments: adjustments.filter(a => a.category !== 'tax_estimation'),
        netProfit,
        margin
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching report data:', err);
      triggerFlash('error');
      setLoading(false);
    }
  }, [selectedWorkDay, globalSettings]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // (CSV Upload and Inventory Replicate logic removed in favor of Stock Requests workflow)

  const handleCloseDay = async () => {
    if (!selectedWorkDay || selectedWorkDay.status === 'closed') return;
    if (!window.confirm('¿Desea cerrar definitivamente la jornada? Esto congelará el cálculo de impuestos y volverá los datos inmutables.')) return;
    
    setClosing(true);
    try {
      // Congelar el impuesto como un ajuste financiero fijo
      const { error: adjErr } = await supabase.from('financial_adjustments').insert({
        work_day_id: selectedWorkDay.id,
        type: 'expense',
        category: 'tax_estimation',
        description: `Impuesto Estimado Automático (${globalSettings.digital_tax_rate}%)`,
        amount: reportData.outflows.tax
      });
      if (adjErr) throw adjErr;

      const { error } = await supabase.from('work_days').update({ 
        status: 'closed', 
        closed_at: new Date().toISOString() 
      }).eq('id', selectedWorkDay.id);
      if (error) throw error;
      
      triggerFlash('success');
      fetchData();
    } catch(err) {
      triggerFlash('error');
      alert("Error al cerrar: " + err.message);
    } finally {
      setClosing(false);
    }
  };

  const saveAdjustment = async () => {
    if (!selectedWorkDay || selectedWorkDay.status === 'closed') return;
    if (!adjDesc || !adjAmount) return alert("Completá descripción y monto.");
    
    setSavingAdj(true);
    try {
      const { error } = await supabase.from('financial_adjustments').insert({
        work_day_id: selectedWorkDay.id,
        type: adjType,
        category: 'manual_adjustment',
        description: adjDesc.trim() || null,
        amount: parseFloat(adjAmount)
      });
      if (error) throw error;
      triggerFlash('success');
      setIsAdjOpen(false);
      setAdjDesc('');
      setAdjAmount('');
      fetchReportData();
    } catch (err) {
      triggerFlash('error');
      alert("Error: " + err.message);
    } finally {
      setSavingAdj(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-brand-bg">
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('index')} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-brand-muted">AUDITORÍA FINANCIERA</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">Reporte Consolidado (Lunes)</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedWorkDay?.id || ''}
              onChange={(e) => {
                const wd = workDays.find(w => w.id === e.target.value);
                setSelectedWorkDay(wd);
              }}
              className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-xs font-bold text-brand-text focus:outline-none appearance-none cursor-pointer uppercase tracking-wider min-w-[200px]"
            >
              {workDays.length === 0 ? <option value="">SIN JORNADAS</option> : null}
              {workDays.map(wd => (
                <option key={wd.id} value={wd.id}>
                  {dayjs(wd.work_date).format('DD/MM/YYYY')} - {wd.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedWorkDay ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-brand-muted opacity-50">
            <Lock size={48} className="mb-4 opacity-20" />
            <p className="text-xs tracking-widest uppercase font-bold">No hay jornadas para auditar.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="animate-pulse text-brand-muted text-xs tracking-widest uppercase">Calculando P&L...</div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* 3 COLUMNS P&L */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* COL 1: EGRESOS */}
              <div className="flex flex-col gap-4">
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 relative">
                  <div className="text-[10px] font-extrabold tracking-widest uppercase text-brand-muted mb-2">TOTAL EGRESOS</div>
                  <div className="text-4xl font-mono text-brand-text">
                    -{formatCurrency(reportData.outflows.total)}
                  </div>
                  {selectedWorkDay.status === 'open' && (
                    <button onClick={() => { setAdjType('expense'); setIsAdjOpen(true); }} className="absolute top-6 right-6 text-[10px] border border-brand-border px-3 py-1.5 rounded bg-brand-bg hover:bg-brand-border transition-colors font-bold tracking-widest uppercase flex items-center gap-1 cursor-pointer">
                      <Plus size={12}/> AJUSTE
                    </button>
                  )}
                </div>
                
                <div className="bg-brand-surface/30 border border-brand-border/50 rounded-2xl p-4">
                  <table className="w-full text-xs font-mono">
                    <tbody className="divide-y divide-brand-border/30">
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Costos Recurrentes Pagados</td><td className="py-3 text-right">{formatCurrency(reportData.outflows.recurrentCostsPaid)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Costos Ad-Hoc Pagados</td><td className="py-3 text-right">{formatCurrency(reportData.outflows.adHocCostsPaid)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Insumos Pagados</td><td className="py-3 text-right">{formatCurrency(reportData.outflows.supplyCostsPaid)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Costos Pendientes</td><td className="py-3 text-right">{formatCurrency(reportData.outflows.costsPending)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Nómina Operativa</td><td className="py-3 text-right">{formatCurrency(reportData.outflows.payroll)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Impacto Mermas Barra</td><td className="py-3 text-right">{formatCurrency(reportData.outflows.efficiencyImpact)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Impuestos Estimados ({globalSettings.digital_tax_rate}%)</td><td className="py-3 text-right text-brand-warning/80">{formatCurrency(reportData.outflows.tax)}</td></tr>
                      {reportData.manualAdjustments.filter(a => a.type === 'expense').map(adj => (
                        <tr key={adj.id}>
                          <td className="py-3 font-sans uppercase tracking-wider text-[10px] text-brand-error flex items-center gap-2">
                            {adj.description}
                          </td>
                          <td className="py-3 text-right text-brand-error">{formatCurrency(adj.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* COL 2: INGRESOS */}
              <div className="flex flex-col gap-4">
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 relative">
                  <div className="text-[10px] font-extrabold tracking-widest uppercase text-brand-muted mb-2">TOTAL INGRESOS</div>
                  <div className="text-4xl font-mono text-brand-success">
                    {formatCurrency(reportData.inflows.total)}
                  </div>
                  {selectedWorkDay.status === 'open' && (
                    <button onClick={() => { setAdjType('income'); setIsAdjOpen(true); }} className="absolute top-6 right-6 text-[10px] border border-brand-border px-3 py-1.5 rounded bg-brand-bg hover:bg-brand-border transition-colors font-bold tracking-widest uppercase flex items-center gap-1 cursor-pointer">
                      <Plus size={12}/> AJUSTE
                    </button>
                  )}
                </div>
                
                <div className="bg-brand-surface/30 border border-brand-border/50 rounded-2xl p-4">
                  <table className="w-full text-xs font-mono">
                    <tbody className="divide-y divide-brand-border/30">
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">POS Físico (Efectivo)</td><td className="py-3 text-right">{formatCurrency(reportData.inflows.posCash)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">POS Físico (Digital)</td><td className="py-3 text-right">{formatCurrency(reportData.inflows.posDigital)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Venta Passline (Digital)</td><td className="py-3 text-right">{formatCurrency(reportData.inflows.passline)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Diferencia de Arqueo</td><td className={`py-3 text-right ${reportData.inflows.discrepancies < 0 ? 'text-brand-error' : reportData.inflows.discrepancies > 0 ? 'text-brand-success' : ''}`}>
                        {reportData.inflows.discrepancies > 0 ? '+' : ''}{formatCurrency(reportData.inflows.discrepancies)}
                      </td></tr>
                      {reportData.manualAdjustments.filter(a => a.type === 'income').map(adj => (
                        <tr key={adj.id}>
                          <td className="py-3 font-sans uppercase tracking-wider text-[10px] text-brand-success flex items-center gap-2">
                            {adj.description}
                          </td>
                          <td className="py-3 text-right text-brand-success">{formatCurrency(adj.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* COL 3: BREAK EVEN */}
              <div className="flex flex-col gap-4">
                <div className={`border rounded-2xl p-6 flex flex-col justify-between h-[116px] ${
                  reportData.netProfit >= 0 ? 'bg-brand-success/5 border-brand-success/30' : 'bg-brand-error/5 border-brand-error/30'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-extrabold tracking-widest uppercase text-brand-muted mb-2">RESULTADO NETO</div>
                    <div className={`text-xs font-bold px-2 py-1 rounded bg-[#111111] font-mono tracking-widest ${reportData.margin >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>
                      {reportData.margin.toFixed(1)}% MRG
                    </div>
                  </div>
                  <div className={`text-4xl font-mono tracking-tight ${reportData.netProfit >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>
                    {formatCurrency(reportData.netProfit)}
                  </div>
                </div>

                <div className="bg-brand-surface/30 border border-brand-border/50 rounded-2xl p-4">
                  <table className="w-full text-xs font-mono">
                    <tbody className="divide-y divide-brand-border/30">
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Ingresos Totales</td><td className="py-3 text-right text-brand-success">{formatCurrency(reportData.inflows.total)}</td></tr>
                      <tr><td className="py-3 text-brand-muted font-sans font-bold uppercase tracking-wider text-[10px]">Egresos Totales</td><td className="py-3 text-right text-brand-error">-{formatCurrency(reportData.outflows.total)}</td></tr>
                      <tr className="bg-brand-surface/50"><td className="py-3 px-2 text-brand-text font-sans font-bold uppercase tracking-wider text-[10px]">Beneficio Operativo</td><td className={`py-3 px-2 text-right font-bold ${reportData.netProfit >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>{formatCurrency(reportData.netProfit)}</td></tr>
                    </tbody>
                  </table>
                  
                  {selectedWorkDay.status === 'open' && (
                    <button
                      onClick={handleCloseDay}
                      disabled={closing}
                      className="w-full mt-4 px-6 py-4 bg-brand-text text-[#0A0A0A] font-black uppercase tracking-widest text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(229,229,229,0.3)] disabled:opacity-50"
                    >
                      {closing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      CONSOLIDAR Y CERRAR
                    </button>
                  )}
                </div>
              </div>

            </div>


            {selectedWorkDay.status === 'closed' && (
              <div className="bg-brand-surface border border-brand-border rounded-xl p-6 opacity-60 hover:opacity-100 transition-opacity">
                <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-4 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Auditoría Final Lock
                </h3>
                <p className="text-xs text-brand-muted max-w-2xl leading-relaxed">
                  Esta jornada se encuentra <strong>CERRADA</strong>. Los montos expresados aquí son inmutables y consolidados por la operación nocturna y el equipo de administración.
                </p>
              </div>
            )}
            
          </div>
        )}
      </div>

      {/* Slide-Over Adjustment */}
      {isAdjOpen && (
        <div className="absolute inset-y-0 right-0 w-full md:w-[400px] bg-brand-surface border-l border-brand-border shadow-2xl z-50 flex flex-col transform transition-transform">
          <div className="p-6 border-b border-brand-border flex items-center justify-between">
            <h3 className="text-xs font-extrabold tracking-widest uppercase text-brand-text flex items-center gap-2">
              <Plus size={14} /> {adjType === 'income' ? 'NUEVO INGRESO' : 'NUEVO EGRESO'}
            </h3>
            <button onClick={() => setIsAdjOpen(false)} className="text-brand-muted hover:text-brand-text transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2">Detalle del Ajuste</label>
              <input
                type="text"
                value={adjDesc}
                onChange={(e) => setAdjDesc(e.target.value)}
                placeholder="Ej. Devolución de mercadería"
                className="w-full bg-[#0A0A0A] border border-brand-border rounded-xl px-4 py-3 text-xs text-brand-text focus:outline-none focus:border-brand-text transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-2">Monto ($)</label>
              <input
                type="number"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-[#0A0A0A] border border-brand-border rounded-xl px-4 py-3 text-xs font-mono text-brand-text focus:outline-none focus:border-brand-text transition-colors"
              />
            </div>
          </div>
          
          <div className="p-6 border-t border-brand-border bg-[#0A0A0A]">
            <button
              onClick={saveAdjustment}
              disabled={savingAdj || !adjDesc || !adjAmount}
              className={`w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl text-[#0A0A0A] shadow-[0_0_15px_rgba(229,229,229,0.3)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 cursor-pointer ${adjType === 'income' ? 'bg-brand-success' : 'bg-brand-error text-white shadow-brand-error/20'}`}
            >
              {savingAdj ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              GUARDAR {adjType === 'income' ? 'INGRESO' : 'EGRESO'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
