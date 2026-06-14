import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { FileText, Loader2, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

export default function PaymentsReportModule() {
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const { canRead } = useAuth();
  
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'year'
  const [selectedPeriod, setSelectedPeriod] = useState(dayjs().format('YYYY-MM')); // YYYY-MM or YYYY
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  
  const [reportData, setReportData] = useState([]); // aggregated rows
  const [kpiData, setKpiData] = useState({}); // voucher_type -> sum
  const [voucherTypes, setVoucherTypes] = useState([]);

  // Generate periods
  const periods = React.useMemo(() => {
    const p = [];
    if (viewMode === 'month') {
      let current = dayjs().subtract(12, 'month');
      for (let i = 0; i < 24; i++) {
        p.push(current.format('YYYY-MM'));
        current = current.add(1, 'month');
      }
    } else {
      let current = dayjs().subtract(3, 'year');
      for (let i = 0; i < 6; i++) {
        p.push(current.format('YYYY'));
        current = current.add(1, 'year');
      }
    }
    return p.reverse();
  }, [viewMode]);

  useEffect(() => {
    // Cuando cambia el view mode, ajustamos el selected period si es necesario
    if (viewMode === 'year' && selectedPeriod.length > 4) {
      setSelectedPeriod(selectedPeriod.substring(0, 4));
    } else if (viewMode === 'month' && selectedPeriod.length === 4) {
      setSelectedPeriod(`${selectedPeriod}-${dayjs().format('MM')}`);
    }
  }, [viewMode, selectedPeriod]);

  const fetchData = useCallback(async (silent = false) => {
    if (!selectedPeriod) return;
    try {
      if (!silent) setIsFetchingBackground(true);

      // We need to fetch from both opening_costs and monthly_fixed_costs
      // where status = 'paid' and paid_at is within selectedPeriod.
      // Since paid_at might be null for old records, we should filter correctly.

      let startDate, endDate;
      if (viewMode === 'month') {
        startDate = dayjs(`${selectedPeriod}-01`).startOf('month').toISOString();
        endDate = dayjs(`${selectedPeriod}-01`).endOf('month').toISOString();
      } else {
        startDate = dayjs(`${selectedPeriod}-01-01`).startOf('year').toISOString();
        endDate = dayjs(`${selectedPeriod}-01-01`).endOf('year').toISOString();
      }

      const [costsRes, fixedCostsRes] = await Promise.all([
        supabase
          .from('opening_costs')
          .select('amount, voucher_type, paid_at')
          .eq('status', 'paid')
          .gte('paid_at', startDate)
          .lte('paid_at', endDate),
        supabase
          .from('monthly_fixed_costs')
          .select('amount, voucher_type, paid_at')
          .eq('status', 'paid')
          .gte('paid_at', startDate)
          .lte('paid_at', endDate)
      ]);

      if (costsRes.error) throw costsRes.error;
      if (fixedCostsRes.error) throw fixedCostsRes.error;

      const combined = [...(costsRes.data || []), ...(fixedCostsRes.data || [])];
      
      // Process Data
      const rowsMap = {}; // key: YYYY-MM-DD or YYYY-MM -> sums by voucher
      const kpis = {};
      const uniqueVouchers = new Set();

      combined.forEach(item => {
        const vt = item.voucher_type ? item.voucher_type.replace('_', ' ').toUpperCase() : 'SIN DETALLE';
        uniqueVouchers.add(vt);
        
        const dateKey = viewMode === 'month' 
          ? dayjs(item.paid_at).format('YYYY-MM-DD') 
          : dayjs(item.paid_at).format('YYYY-MM');

        if (!rowsMap[dateKey]) rowsMap[dateKey] = { date: dateKey, total: 0 };
        if (!rowsMap[dateKey][vt]) rowsMap[dateKey][vt] = 0;
        
        rowsMap[dateKey][vt] += Number(item.amount);
        rowsMap[dateKey].total += Number(item.amount);

        if (!kpis[vt]) kpis[vt] = 0;
        kpis[vt] += Number(item.amount);
      });

      const aggregatedRows = Object.values(rowsMap).sort((a, b) => b.date.localeCompare(a.date));
      const sortedVouchers = Array.from(uniqueVouchers).sort();
      
      if (isMountedRef.current) {
        setReportData(aggregatedRows);
        setKpiData(kpis);
        setVoucherTypes(sortedVouchers);
      }

    } catch (err) {
      console.error('Error fetching payments:', err);
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      if (isMountedRef.current) {
        setIsFetchingBackground(false);
        setLoading(false);
      }
    }
  }, [selectedPeriod, viewMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  const formatDateLabel = (dateStr) => {
    if (viewMode === 'month') {
      return dayjs(dateStr).format('DD/MM/YYYY');
    }
    const [y, m] = dateStr.split('-');
    const d = new Date(y, parseInt(m) - 1);
    return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(d).toUpperCase();
  };

  const formatPeriodLabel = (p) => {
    if (p.length === 4) return p;
    const [y, m] = p.split('-');
    const d = new Date(y, parseInt(m) - 1);
    return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(d).toUpperCase();
  };

  if (!canRead('payments')) {
    return <div className="p-8 text-brand-error text-xs uppercase tracking-widest">Acceso denegado</div>;
  }

  const kpiEntries = Object.entries(kpiData).sort((a,b) => b[1] - a[1]);
  const totalPagado = kpiEntries.reduce((sum, [,val]) => sum + val, 0);

  return (
    <div className="h-full flex relative">
      <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">
              REPORTE DE PAGOS
            </h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setViewMode('month')}
                className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${viewMode === 'month' ? 'text-brand-text border-b border-brand-text' : 'text-brand-muted hover:text-brand-text/70'}`}
              >
                VISTA MENSUAL
              </button>
              <button 
                onClick={() => setViewMode('year')}
                className={`text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${viewMode === 'year' ? 'text-brand-text border-b border-brand-text' : 'text-brand-muted hover:text-brand-text/70'}`}
              >
                VISTA ANUAL
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent border-none text-xl font-mono font-bold text-brand-text hover:text-brand-text/70 transition-colors focus:outline-none appearance-none cursor-pointer text-right"
            >
              {periods.map(p => (
                <option key={p} value={p} className="bg-brand-bg text-brand-text font-sans">
                  {formatPeriodLabel(p)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* KPIs Brutalists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpiEntries.length === 0 && !loading && (
             <div className="text-[10px] text-brand-muted uppercase tracking-widest">Sin pagos registrados</div>
          )}
          {kpiEntries.map(([vt, amount]) => (
            <div key={vt} className="flex flex-col border-l border-brand-border/50 pl-4">
              <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-2 flex items-center gap-2">
                <FileText size={10} />
                {vt}
              </span>
              <span className="text-3xl font-mono font-bold text-brand-text">
                {formatCurrency(amount)}
              </span>
            </div>
          ))}
        </div>

        {/* Total KPI */}
        {totalPagado > 0 && (
           <div className="flex flex-col border-l-2 border-brand-text pl-4 mb-12">
             <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-2">TOTAL EGRESOS DEL PERIODO</span>
             <span className="text-4xl md:text-5xl font-mono font-black text-brand-warning">
               {formatCurrency(totalPagado)}
             </span>
           </div>
        )}

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-40">
                  {viewMode === 'month' ? 'FECHA' : 'MES'}
                </th>
                {voucherTypes.map(vt => (
                  <th key={vt} className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">
                    {vt}
                  </th>
                ))}
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-text px-5 py-3">
                  TOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={voucherTypes.length + 2} className="text-center py-12 text-brand-muted text-xs uppercase tracking-widest">Cargando...</td></tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan={voucherTypes.length + 2} className="text-center py-12 text-brand-muted/50 text-xs uppercase tracking-widest">NO HAY PAGOS EN ESTE PERIODO.</td></tr>
              ) : reportData.map((row) => (
                <tr key={row.date} className="border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-brand-text flex items-center gap-2">
                     <Calendar size={12} className="text-brand-muted/50" />
                     {formatDateLabel(row.date)}
                  </td>
                  {voucherTypes.map(vt => (
                    <td key={vt} className="px-5 py-4 text-right font-mono text-brand-muted/70 text-sm">
                      {row[vt] ? formatCurrency(row[vt]) : '—'}
                    </td>
                  ))}
                  <td className="px-5 py-4 text-right font-mono font-bold text-brand-text text-sm">
                    {formatCurrency(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
