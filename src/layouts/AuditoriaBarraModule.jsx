import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Loader2, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';

const parseCsvLine = (line, separator) => {
  const result = [];
  let inQuotes = false, current = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === separator && !inQuotes) { result.push(current.trim().replace(/^"|"$/g, '')); current = ''; }
    else { current += char; }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

export default function AuditoriaBarraModule({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [workDays, setWorkDays] = useState([]);
  const [selectedWorkDayId, setSelectedWorkDayId] = useState('');
  
  const [skus, setSkus] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({}); // sku.id -> { stock_open, stock_close }
  
  const [csvData, setCsvData] = useState([]); // Array of { system_id, quantity, detail }
  const [comparisonResults, setComparisonResults] = useState([]);
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');
  const [isConsolidated, setIsConsolidated] = useState(false);
  
  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 300);
  };
  
  const csvRef = useRef(null);

  // Initial Fetch: Workdays and SKUs
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        setLoading(true);
        const { data: wdData, error: wdError } = await supabase
          .from('work_days')
          .select('id, work_date, status, event_name')
          .in('status', ['open', 'closed'])
          .order('work_date', { ascending: false });
          
        if (wdError) throw wdError;
        setWorkDays(wdData || []);
        if (wdData && wdData.length > 0) {
          setSelectedWorkDayId(wdData[0].id);
        }

        const { data: skuData, error: skuError } = await supabase
          .from('skus')
          .select('*')
          .eq('active', true);
          
        if (skuError) throw skuError;
        setSkus(skuData || []);
      } catch (err) {
        window.UI?.toast?.(err.message, 'danger');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBaseData();
  }, []);

  // Fetch Inventory and Saved Audit when Workday changes
  const fetchInventoryAndAudit = useCallback(async () => {
    if (!selectedWorkDayId) return;
    try {
      setLoading(true);
      const { data: invData, error: invError } = await supabase
        .from('bar_inventory')
        .select('*')
        .eq('work_day_id', selectedWorkDayId);

      if (invError) throw invError;

      const map = {};
      (invData || []).forEach(inv => {
        map[inv.sku_id] = {
          stock_open: Number(inv.stock_open) || 0,
          stock_close: Number(inv.stock_close) || 0
        };
      });
      setInventoryMap(map);

      // Fetch Saved Audit (from import_system_consumption)
      const { data: auditData, error: auditError } = await supabase
        .from('import_system_consumption')
        .select('*')
        .eq('work_day_id', selectedWorkDayId);

      if (auditError) throw auditError;

      if (auditData && auditData.length > 0) {
        const reconstructedCsv = auditData.map(row => {
          const [sysId, det] = (row.sku_name_raw || '').split('||');
          return {
            system_id: sysId || row.sku_name_raw,
            detail: det || 'Desconocido',
            quantity: Number(row.quantity)
          };
        });
        setCsvData(reconstructedCsv);
        setIsConsolidated(true);
      } else {
        setCsvData([]);
        setIsConsolidated(false);
      }
    } catch (err) {
      window.UI?.toast?.(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [selectedWorkDayId]);

  useEffect(() => {
    fetchInventoryAndAudit();
  }, [fetchInventoryAndAudit]);

  // Compare CSV against Inventory
  useEffect(() => {
    if (!csvData.length || !skus.length) {
      setComparisonResults([]);
      return;
    }

    const results = csvData.map(csvRow => {
      // Find matching SKU by system_id (CSV "Articulo")
      // Remove leading zeros or spaces for robust comparison
      const matchSku = skus.find(s => {
        const sId = (s.system_id || '').toString().trim().replace(/^0+/, '');
        const cId = (csvRow.system_id || '').toString().trim().replace(/^0+/, '');
        return sId === cId;
      });

      if (!matchSku) {
        return {
          ...csvRow,
          skuFound: false,
          diff_units: null,
          monetized_diff: null,
          systemConsumption: csvRow.quantity
        };
      }

      const inv = inventoryMap[matchSku.id] || { stock_open: 0, stock_close: 0 };
      const realConsumption = inv.stock_open - inv.stock_close;
      const systemConsumption = csvRow.quantity;
      const diff_units = systemConsumption - realConsumption;
      const cost = matchSku.cost || 0;
      const monetized_diff = diff_units * cost;

      return {
        ...csvRow,
        skuFound: true,
        skuId: matchSku.id,
        skuName: matchSku.name,
        cost: cost,
        realConsumption,
        systemConsumption,
        diff_units,
        monetized_diff,
        stock_open: inv.stock_open,
        stock_close: inv.stock_close
      };
    });

    setComparisonResults(results);

  }, [csvData, skus, inventoryMap]);

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return;
      
      const sep = lines.some(l => l.includes(';')) ? ';' : ',';
      
      // Find the actual header row
      let headers = [];
      let headerIdx = 0;
      for (let i = 0; i < lines.length; i++) {
        const row = parseCsvLine(lines[i], sep).map(h => h.toLowerCase().trim());
        if (row.some(h => h.includes('articulo') || h.includes('código') || h === 'id' || h === 'articulo')) {
          headers = row;
          headerIdx = i;
          break;
        }
      }

      const artIdx = headers.findIndex(h => h.includes('articulo') || h === 'código' || h === 'id');
      const detIdx = headers.findIndex(h => h.includes('detalle') || h === 'nombre' || h === 'name');
      const qtyIdx = headers.findIndex(h => h.includes('cantidad') || h === 'qty' || h === 'consumo');

      if (artIdx === -1 || qtyIdx === -1) {
        window.UI?.toast?.('El archivo CSV debe tener columnas "Articulo" y "Cantidad".', 'danger');
        return;
      }

      const parsedData = [];
      // Start parsing from the line after the headers
      for (let i = headerIdx + 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i], sep);
        if (row.length <= Math.max(artIdx, qtyIdx)) continue;
        
        const articulo = row[artIdx];
        if (!articulo) continue;

        const rawQty = row[qtyIdx];
        // Parse numbers formatted as "1,013.00" -> remove commas, keep dot
        const cleanQty = rawQty.replace(/,/g, '');
        const qtyNum = parseFloat(cleanQty) || 0;
        const detalle = detIdx !== -1 ? row[detIdx] : 'Desconocido';

        parsedData.push({
          system_id: articulo,
          detail: detalle,
          quantity: qtyNum
        });
      }

      setCsvData(parsedData);
      setIsConsolidated(false);
      window.UI?.toast?.(`CSV cargado: ${parsedData.length} registros`, 'success');
      
      if (csvRef.current) csvRef.current.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  const handleSaveAuditoria = async () => {
    if (!selectedWorkDayId) return;
    if (!window.confirm('¿Deseas consolidar esta auditoría en la caja de la jornada seleccionada? Esto sobrescribirá cualquier auditoría de barra previa para esta jornada.')) return;

    setSaving(true);
    try {
      // Create adjustments array
      const adjustments = comparisonResults
        .filter(r => r.skuFound && r.diff_units !== 0)
        .map(r => ({
          work_day_id: selectedWorkDayId,
          type: r.monetized_diff > 0 ? 'income' : 'expense',
          category: 'auditoria_barra',
          description: `Ajuste Barra: ${r.skuName} (${r.diff_units > 0 ? '+' : ''}${r.diff_units.toFixed(2)} unidades)`,
          amount: Math.abs(r.monetized_diff)
        }));

      const importData = csvData.map(r => ({
        work_day_id: selectedWorkDayId,
        sku_name_raw: `${r.system_id}||${r.detail}`,
        quantity: r.quantity
      }));

      const nightConsData = comparisonResults
        .filter(r => r.skuFound)
        .map(r => ({
          work_day_id: selectedWorkDayId,
          sku_id: r.skuId,
          system_quantity: r.systemConsumption
        }));

      // Delete existing
      const { error: delError } = await supabase
        .from('financial_adjustments')
        .delete()
        .eq('work_day_id', selectedWorkDayId)
        .eq('category', 'auditoria_barra');

      if (delError) throw delError;

      const { error: delImpError } = await supabase
        .from('import_system_consumption')
        .delete()
        .eq('work_day_id', selectedWorkDayId);
      if (delImpError) throw delImpError;

      const { error: delNightError } = await supabase
        .from('night_consumption')
        .delete()
        .eq('work_day_id', selectedWorkDayId);
      if (delNightError) throw delNightError;

      // Insert new
      if (adjustments.length > 0) {
        const { error: insError } = await supabase
          .from('financial_adjustments')
          .insert(adjustments);
        if (insError) throw insError;
      }
      
      if (importData.length > 0) {
        const { error: insImpError } = await supabase
          .from('import_system_consumption')
          .insert(importData);
        if (insImpError) throw insImpError;
      }
      
      if (nightConsData.length > 0) {
        const { error: insNightError } = await supabase
          .from('night_consumption')
          .insert(nightConsData);
        if (insNightError) throw insNightError;
      }

      triggerFlash('success');
      window.UI?.toast?.('Auditoría guardada exitosamente.', 'success');
      setIsConsolidated(true);
    } catch (err) {
      triggerFlash('error');
      window.UI?.toast?.(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const totalMonetizedDiff = comparisonResults.reduce((acc, r) => acc + (r.monetized_diff || 0), 0);

  return (
    <div className="h-full flex flex-col relative bg-brand-bg overflow-hidden">
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      <div className="shrink-0 p-6 border-b border-brand-border/30 bg-[#0A0A0A] z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-[10px] md:text-[11px] font-extrabold tracking-[0.4em] uppercase text-brand-text">AUDITORIA CONSUMO</h2>
            <p className="text-[8px] text-brand-muted/50 tracking-[0.3em] mt-1 uppercase">CONCILIACIÓN SISTEMA VS REAL</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <select
            value={selectedWorkDayId}
            onChange={(e) => {
              setSelectedWorkDayId(e.target.value);
            }}
            className="bg-transparent border-b border-brand-border/50 pb-1 text-[10px] font-bold text-brand-text focus:outline-none focus:border-brand-text appearance-none cursor-pointer uppercase tracking-widest min-w-[200px]"
          >
            {workDays.length === 0 && <option value="">SIN JORNADAS</option>}
            {workDays.map((wd) => (
              <option key={wd.id} value={wd.id} className="bg-[#0A0A0A] text-brand-text">
                {dayjs(wd.work_date).format('DD/MM/YYYY')} — {wd.event_name || 'SIN EVENTO'}
              </option>
            ))}
          </select>

          <input type="file" accept=".csv" ref={csvRef} onChange={handleCsvUpload} className="hidden" />
          <button 
            onClick={() => csvRef.current?.click()}
            disabled={!selectedWorkDayId || loading}
            className={`flex items-center gap-2 border-b pb-1 text-[9px] font-extrabold tracking-[0.3em] uppercase transition-all cursor-pointer disabled:opacity-50 hover:opacity-80 ${isConsolidated ? 'border-brand-warning text-brand-warning' : 'border-brand-accent text-brand-accent'}`}
          >
            <Upload size={12} />
            {isConsolidated ? 'RESUBIR CSV' : 'SUBIR CSV SISTEMA'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
        {loading ? (
          <div className="flex justify-center items-center h-full text-brand-muted">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : comparisonResults.length === 0 ? (
          <div className="text-center py-12 text-brand-muted/50 text-xs italic">
            {csvData.length === 0 
              ? "Sube el archivo CSV de consumo para iniciar la conciliación." 
              : "Calculando diferencias..."}
          </div>
        ) : (
          <div className="w-full">
            {/* Totals Summary Card - Raw Data Flow */}
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-brand-border/30 pb-6">
              <div>
                <div className="text-[8px] uppercase font-bold text-brand-muted tracking-[0.3em] mb-2">IMPACTO EN CAJA (FALTANTES/SOBRANTES)</div>
                <div className={`text-4xl md:text-5xl font-black font-mono tracking-tighter ${totalMonetizedDiff < 0 ? 'text-brand-error' : totalMonetizedDiff > 0 ? 'text-brand-success' : 'text-brand-text'}`}>
                  {totalMonetizedDiff > 0 ? '+' : ''}{formatCurrency(totalMonetizedDiff)}
                </div>
                <div className="text-[9px] uppercase tracking-widest text-brand-muted/70 mt-2">
                  Negativos: FALTANTE (Consumo Físico \u003e Sistema). Positivos: SOBRANTE.
                </div>
              </div>
              <div className="mt-6 md:mt-0 flex flex-col items-end gap-3">
                {isConsolidated && (
                  <div className="text-[10px] font-bold text-brand-warning tracking-widest uppercase border border-brand-warning/30 px-3 py-1 rounded bg-brand-warning/10">
                    AUDITORÍA CONSOLIDADA
                  </div>
                )}
                <button
                  onClick={handleSaveAuditoria}
                  disabled={saving || comparisonResults.length === 0}
                  className="bg-transparent border-b-2 border-brand-text text-brand-text hover:opacity-70 pb-1 text-[10px] font-extrabold tracking-[0.3em] uppercase transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {isConsolidated ? 'RE-CONSOLIDAR' : 'CONSOLIDAR AUDITORÍA'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-brand-border/50 text-[8px] font-bold uppercase tracking-[0.3em] text-brand-muted">
                    <th className="py-4 pr-6">ARTÍCULO</th>
                    <th className="px-6 py-4 text-right">SISTEMA</th>
                    <th className="px-6 py-4 text-right">REAL</th>
                    <th className="px-6 py-4 text-right">DIFERENCIA</th>
                    <th className="px-6 py-4 text-right">COSTO</th>
                    <th className="py-4 pl-6 text-right">MONETIZADO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20">
                  {comparisonResults.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#0A0A0A] transition-colors group">
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-3">
                          {!row.skuFound && <AlertTriangle size={12} className="text-brand-warning opacity-50" title="No mapeado" />}
                          <div>
                            <div className="font-bold text-brand-text truncate w-48 text-[10px] tracking-widest uppercase">{row.skuFound ? row.skuName : row.detail}</div>
                            <div className="text-[8px] text-brand-muted/50 tracking-[0.3em] uppercase font-mono mt-0.5">ID: {row.system_id}</div>
                          </div>
                        </div>
                      </td>
                        <td className="px-6 py-4 text-right font-mono text-brand-muted">
                          {row.systemConsumption.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-brand-text">
                          {row.skuFound ? (
                            <div className="flex flex-col items-end">
                              <span>{row.realConsumption.toFixed(2)}</span>
                              <span className="text-[8px] text-brand-muted/30 tracking-widest uppercase mt-0.5">({row.stock_open} - {row.stock_close})</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          {row.skuFound ? (
                            <span className={row.diff_units < 0 ? 'text-brand-error' : row.diff_units > 0 ? 'text-brand-success' : 'text-brand-muted/50'}>
                              {row.diff_units > 0 ? '+' : ''}{row.diff_units.toFixed(2)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-brand-muted/50">
                          {row.skuFound ? formatCurrency(row.cost) : '-'}
                        </td>
                        <td className="py-4 pl-6 text-right font-mono font-bold text-sm">
                          {row.skuFound ? (
                            <span className={row.monetized_diff < 0 ? 'text-brand-error' : row.monetized_diff > 0 ? 'text-brand-success' : 'text-brand-text'}>
                              {row.monetized_diff > 0 ? '+' : ''}{formatCurrency(row.monetized_diff)}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
