import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, RefreshCw, TerminalSquare, AlertTriangle, CheckCircle, Database, Calendar, Upload, Ticket, Users, ShoppingCart, BarChart3 } from 'lucide-react';
import { GbolService } from '../lib/gbolService';

export default function WorkdaysNightChief({ globalDate, setGlobalDate }) {
  const selectedDate = globalDate;
  const setSelectedDate = setGlobalDate;
  const [activeWorkday, setActiveWorkday] = useState(null);
  const [terminals, setTerminals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLog, setSyncLog] = useState(null);
  const [showOverwriteWarning, setShowOverwriteWarning] = useState(false);
  const [pendingSync, setPendingSync] = useState(null); // { type: 'api' | 'csv', file?: File }
  const fileInputRef = React.useRef(null);
  
  // Cierre Final State
  const [isClosingPanelOpen, setIsClosingPanelOpen] = useState(false);
  const [isSubmittingClosing, setIsSubmittingClosing] = useState(false);
  
  // Passline ticket state
  const [membersData, setMembersData] = useState(null);
  const [generalData, setGeneralData] = useState(null);
  const membersCsvRef = React.useRef(null);
  const generalCsvRef = React.useRef(null);

  // Consumo & Recaudación state
  const [consumoData, setConsumoData] = useState(null); // [{ producto, cantidad, costoTotal }]
  const [recaudacionData, setRecaudacionData] = useState(null); // [{ articulo, qPaga, qSinCargo, total }]
  const consumoCsvRef = React.useRef(null);
  const recaudacionCsvRef = React.useRef(null);

  useEffect(() => {
    fetchNightChiefData(selectedDate);
  }, [selectedDate]);

  const fetchNightChiefData = async (dateStr) => {
    try {
      setIsFetchingBackground(true);
      // 1. Fetch Workday by selected date, regardless of status
      const { data: workday, error: workdayError } = await supabase
        .from('work_days')
        .select('*')
        .eq('work_date', dateStr)
        .maybeSingle();

      if (workday) {
        setActiveWorkday(workday);
        
        // 2. Fetch POS Terminals & Closing Terminals info
        // (For now, fetching base pos_terminals. Will join with closing_terminals as we advance)
        
        const { data: posData, error: posError } = await supabase
          .from('pos_terminals')
          .select('*')
          .eq('is_active', true)
          .order('friendly_name', { ascending: true });
          
        if (posData) {
          // Fetch existing closing terminals
          const { data: closings } = await supabase
            .from('closing_terminals')
            .select('*')
            .eq('work_day_id', workday.id);
            
          const mappedTerminals = posData.map(pt => {
            const match = closings?.find(c => c.terminal_id === pt.id) || {};
            return {
              ...pt,
              system_cash: match.system_cash,
              system_digital: match.system_digital,
              system_total: (match.system_cash !== undefined && match.system_digital !== undefined) ? Number(match.system_cash) + Number(match.system_digital) : undefined,
              declared_cash: match.declared_cash,
              declared_digital: match.declared_digital
            };
          });
          setTerminals(mappedTerminals);
        }

      } else {
        setActiveWorkday(null);
        setTerminals([]);
        setRecaudacionData(null);
        setConsumoData(null);
      }

      // 3. Load persisted Recaudación & Consumo (independent of workday for now, by date)
      const { data: revReport } = await supabase
        .from('revenue_reports')
        .select('id')
        .eq('operational_date', dateStr)
        .maybeSingle();
      if (revReport) {
        const { data: revDetails } = await supabase
          .from('revenue_details')
          .select('recipe_name, q_paga, q_sin_cargo, total_amount')
          .eq('report_id', revReport.id);
        if (revDetails && revDetails.length > 0) {
          setRecaudacionData(revDetails.map(r => ({
            articulo: r.recipe_name,
            qPaga: Number(r.q_paga) || 0,
            qSinCargo: Number(r.q_sin_cargo) || 0,
            total: Number(r.total_amount) || 0,
          })));
        } else { setRecaudacionData(null); }
      } else { setRecaudacionData(null); }

      const { data: conReport } = await supabase
        .from('consumption_reports')
        .select('id')
        .eq('operational_date', dateStr)
        .maybeSingle();
      if (conReport) {
        const { data: conDetails } = await supabase
          .from('consumption_details')
          .select('sku_name, quantity, total_cost')
          .eq('report_id', conReport.id);
        if (conDetails && conDetails.length > 0) {
          setConsumoData(conDetails.map(c => ({
            producto: c.sku_name,
            cantidad: Number(c.quantity) || 0,
            costoTotal: Number(c.total_cost) || 0,
          })));
        } else { setConsumoData(null); }
      } else { setConsumoData(null); }

      // 4. Load persisted Passline data (With pagination to bypass 1000 row limit)
      let allPasslineTickets = [];
      let fetchMore = true;
      let from = 0;
      const limit = 1000;
      
      while (fetchMore) {
        const { data: passlineTicketsChunk, error } = await supabase
          .from('stg_passline_tickets')
          .select('tipo_ticket, estado_ticket, total_raw')
          .eq('operational_date', dateStr)
          .range(from, from + limit - 1);
          
        if (error) {
          console.error('Error fetching passline tickets:', error);
          break;
        }
        
        if (passlineTicketsChunk && passlineTicketsChunk.length > 0) {
          allPasslineTickets = [...allPasslineTickets, ...passlineTicketsChunk];
          from += limit;
          if (passlineTicketsChunk.length < limit) {
            fetchMore = false; // We got less than the limit, so this is the last page
          }
        } else {
          fetchMore = false; // No more rows
        }
      }
        
      if (allPasslineTickets.length > 0) {
        // Members
        const members = allPasslineTickets.filter(t => t.tipo_ticket === 'MEMBER');
        if (members.length > 0) {
          const validated = members.filter(t => t.estado_ticket?.toLowerCase() === 'validada').length;
          setMembersData({ total: members.length, validated, notValidated: members.length - validated });
        } else {
          setMembersData(null);
        }
        
        // General
        const general = allPasslineTickets.filter(t => t.tipo_ticket !== 'MEMBER');
        if (general.length > 0) {
          const groups = {};
          general.forEach(t => {
            const tipo = t.tipo_ticket;
            if (!groups[tipo]) groups[tipo] = { tipo, comprados: 0, validados: 0, totalAmount: 0 };
            groups[tipo].comprados++;
            if (t.estado_ticket?.toLowerCase() === 'validada') groups[tipo].validados++;
            if (t.total_raw) groups[tipo].totalAmount += parseFloat(t.total_raw.replace(/[^0-9.-]/g, '')) || 0;
          });
          setGeneralData(Object.values(groups).sort((a, b) => b.comprados - a.comprados));
        } else {
          setGeneralData(null);
        }
      } else {
        setMembersData(null);
        setGeneralData(null);
      }
    } catch (err) {
      console.error('Error fetching Night Chief data:', err);
    } finally {
      setIsLoading(false);
      setIsFetchingBackground(false);
    }
  };

  const handleDeclaredChange = (terminalId, field, value) => {
    setTerminals(prev => prev.map(t => 
      t.id === terminalId 
        ? { ...t, [field]: value === '' ? undefined : Number(value) } 
        : t
    ));
  };

  const handleDeclaredSave = async (terminalId, field, value) => {
    if (!activeWorkday) return;
    
    const numValue = value === '' ? 0 : Number(value);
    
    try {
      // Upsert into closing_terminals (Assumes work_day_id and terminal_id are a unique pair)
      const { error } = await supabase
        .from('closing_terminals')
        .upsert({
          work_day_id: activeWorkday.id,
          terminal_id: terminalId,
          [field]: numValue
        }, { onConflict: 'work_day_id,terminal_id' });
        
      if (error) throw error;
    } catch (err) {
      console.error('Error saving declared amount:', err);
    }
  };

  const handleGbolSyncInit = async (type, file = null) => {
    if (!activeWorkday) return;
    
    // Check if data already exists to prevent accidental overwrite without warning
    const { count, error } = await supabase
      .from('import_gbol_facturacion')
      .select('*', { count: 'exact', head: true })
      .eq('noche', activeWorkday.work_date);
      
    if (!error && count > 0) {
      setPendingSync({ type, file });
      setShowOverwriteWarning(true);
    } else {
      executeSync({ type, file });
    }
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    handleGbolSyncInit('csv', file);
    event.target.value = ''; // Reset input
  };

  const executeSync = async (syncConfig) => {
    setShowOverwriteWarning(false);
    setPendingSync(null);
    if (!activeWorkday) return;
    setIsSyncing(true);
    
    try {
      let syncResult;
      // 1. Etapa de Extracción a Staging (import_gbol_facturacion)
      if (syncConfig.type === 'csv') {
        syncResult = await GbolService.syncNightFromCsv(syncConfig.file, activeWorkday.work_date);
      } else {
        syncResult = await GbolService.syncNight(activeWorkday.work_date);
      }
      
      if (syncResult && syncResult.success) {
        // 2. Etapa de Consolidación (populateSystemAmounts)
        await GbolService.populateSystemAmounts(activeWorkday.id, activeWorkday.work_date);
        
        setSyncLog({ 
          status: 'success', 
          time: new Date().toLocaleTimeString(), 
          records: syncResult.records_imported 
        });
        
        // Fetch real data from DB now that sync is complete
        await fetchNightChiefData(activeWorkday.work_date);
      } else {
        console.error("Sync Result Failed:", syncResult?.error);
      }
    } catch (err) {
      console.error('Error in GBOL sync flow:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Passline CSV Parsers ---
  const handleMembersCsv = (event) => {
    if (!activeWorkday) {
      alert("Debes seleccionar una jornada válida (abierta o cerrada) antes de importar datos.");
      return;
    }
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const statusIdx = headers.indexOf('estado del eticket');
      if (statusIdx === -1) { alert('No se encontró la columna "Estado del eticket" en el CSV.'); return; }
      
      let total = 0, validated = 0;
      const dbRows = [];
      for (let i = 1; i < lines.length; i++) {
        // Handle CSV fields with commas inside quotes
        const row = lines[i].match(/(".*?"|[^,]*),?/g)?.map(f => f.replace(/,$/, '').replace(/^"|"$/g, '').trim()) || [];
        if (row.length <= statusIdx) continue;
        const estado = row[statusIdx];
        if (!estado) continue;
        total++;
        if (estado.toLowerCase() === 'validada') validated++;
        
        dbRows.push({
          external_ticket_id: crypto.randomUUID(),
          estado_ticket: estado,
          tipo_ticket: 'MEMBER',
          operational_date: activeWorkday?.work_date || selectedDate
        });
      }
      setMembersData({ total, validated, notValidated: total - validated });

      // Persist to DB
      if (activeWorkday && dbRows.length > 0) {
        (async () => {
          try {
            await supabase.from('stg_passline_tickets')
              .delete()
              .eq('operational_date', activeWorkday.work_date)
              .eq('tipo_ticket', 'MEMBER');
            
            // Insert in chunks to avoid URL length / payload limits
            const chunkSize = 500;
            for (let i = 0; i < dbRows.length; i += chunkSize) {
              const chunk = dbRows.slice(i, i + chunkSize);
              const { error } = await supabase.from('stg_passline_tickets').insert(chunk);
              if (error) console.error('Error inserting passline members chunk:', error);
            }
            // Reload from DB to ensure UI is in sync
            await fetchNightChiefData(selectedDate);
          } catch (err) {
            console.error('Error persisting members:', err);
          }
        })();
      }
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  const handleGeneralCsv = (event) => {
    if (!activeWorkday) {
      alert("Debes seleccionar una jornada válida antes de importar datos.");
      return;
    }
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const tipoIdx = headers.indexOf('tipo');
      const statusIdx = headers.indexOf('estado del eticket');
      const totalIdx = headers.indexOf('total');
      if (tipoIdx === -1 || statusIdx === -1) { alert('No se encontraron las columnas "Tipo" o "Estado del eticket" en el CSV.'); return; }

      const groups = {};
      const dbRows = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^,]*),?/g)?.map(f => f.replace(/,$/, '').replace(/^"|"$/g, '').trim()) || [];
        if (row.length <= Math.max(tipoIdx, statusIdx)) continue;
        const tipo = row[tipoIdx];
        const estado = row[statusIdx];
        if (!tipo || !estado) continue;
        
        if (!groups[tipo]) groups[tipo] = { tipo, comprados: 0, validados: 0, totalAmount: 0 };
        groups[tipo].comprados++;
        if (estado.toLowerCase() === 'validada') groups[tipo].validados++;
        
        let totalVal = '0';
        if (totalIdx !== -1 && row[totalIdx]) {
          totalVal = row[totalIdx];
          groups[tipo].totalAmount += parseFloat(row[totalIdx].replace(/[^0-9.-]/g, '')) || 0;
        }

        dbRows.push({
          external_ticket_id: crypto.randomUUID(),
          estado_ticket: estado,
          tipo_ticket: tipo,
          total_raw: totalVal,
          operational_date: activeWorkday?.work_date || selectedDate
        });
      }
      setGeneralData(Object.values(groups).sort((a, b) => b.comprados - a.comprados));

      // Persist to DB
      if (activeWorkday && dbRows.length > 0) {
        (async () => {
          try {
            await supabase.from('stg_passline_tickets')
              .delete()
              .eq('operational_date', activeWorkday.work_date)
              .neq('tipo_ticket', 'MEMBER');
            
            // Insert in chunks
            const chunkSize = 500;
            for (let i = 0; i < dbRows.length; i += chunkSize) {
              const chunk = dbRows.slice(i, i + chunkSize);
              const { error } = await supabase.from('stg_passline_tickets').insert(chunk);
              if (error) console.error('Error inserting passline general chunk:', error);
            }
            // Reload from DB to ensure UI is in sync
            await fetchNightChiefData(selectedDate);
          } catch (err) {
            console.error('Error persisting general tickets:', err);
          }
        })();
      }
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  // --- Consumo CSV Parser ---
  const handleConsumoCsv = (event) => {
    if (!activeWorkday) {
      alert("Debes seleccionar una jornada válida antes de importar datos.");
      return;
    }
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      // Find header row dynamically (contains "Detalle" and "Cantidad")
      let headerIdx = -1;
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const lower = lines[i].toLowerCase();
        if (lower.includes('detalle') && lower.includes('cantidad')) { headerIdx = i; break; }
      }
      if (headerIdx === -1) { alert('No se encontró la fila de encabezados (Detalle, Cantidad) en el CSV.'); return; }
      const headers = lines[headerIdx].split(',').map(h => h.trim().toLowerCase());
      const detalleIdx = headers.indexOf('detalle');
      const cantidadIdx = headers.indexOf('cantidad');
      const cTotalIdx = headers.indexOf('c.total');
      if (detalleIdx === -1 || cantidadIdx === -1 || cTotalIdx === -1) { alert('Columnas faltantes en el CSV de Consumo.'); return; }

      const rows = [];
      for (let i = headerIdx + 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const producto = cols[detalleIdx];
        if (!producto) continue;
        rows.push({
          producto,
          cantidad: parseFloat(cols[cantidadIdx]) || 0,
          costoTotal: parseFloat(cols[cTotalIdx]) || 0,
        });
      }
      setConsumoData(rows);

      // Persist to DB
      if (activeWorkday) {
        try {
          // Fetch master SKUs to map names to IDs
          const { data: skus } = await supabase.from('master_sku').select('id, nombre');

          // Delete existing report for this date (idempotent)
          const { data: existing } = await supabase
            .from('consumption_reports')
            .select('id')
            .eq('operational_date', activeWorkday.work_date)
            .maybeSingle();
          if (existing) {
            await supabase.from('consumption_details').delete().eq('report_id', existing.id);
            await supabase.from('consumption_reports').delete().eq('id', existing.id);
          }
          // Insert new report
          const { data: newReport, error: repErr } = await supabase
            .from('consumption_reports')
            .insert({ operational_date: activeWorkday.work_date, file_name: file.name, report_type: 'consumption' })
            .select('id')
            .single();
          if (repErr) throw repErr;
          
          // Insert details with mapped sku_id
          const details = rows.map(r => {
            const matchedSku = skus?.find(s => s.nombre.toLowerCase().trim() === r.producto.toLowerCase().trim());
            return {
              report_id: newReport.id,
              sku_id: matchedSku ? matchedSku.id : null,
              sku_name: r.producto,
              quantity: r.cantidad,
              total_cost: r.costoTotal,
            };
          });
          
          const { error: detErr } = await supabase.from('consumption_details').insert(details);
          if (detErr) throw detErr;
          
          // Trigger a global reload to sync the UI across all modules
          fetchNightChiefData(activeWorkday.work_date);
        } catch (err) { console.error('Error persisting consumo:', err); }
      }
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  // --- Recaudación CSV Parser ---
  const handleRecaudacionCsv = (event) => {
    if (!activeWorkday) {
      alert("Debes seleccionar una jornada válida antes de importar datos.");
      return;
    }
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      // Find header row dynamically (contains "Articulo" and "Q Paga")
      let headerIdx = -1;
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const lower = lines[i].toLowerCase();
        if (lower.includes('articulo') && lower.includes('q paga')) { headerIdx = i; break; }
      }
      if (headerIdx === -1) { alert('No se encontró la fila de encabezados (Articulo, Q Paga) en el CSV.'); return; }
      const headers = lines[headerIdx].split(',').map(h => h.trim().toLowerCase());
      const artIdx = headers.indexOf('articulo');
      const qPagaIdx = headers.indexOf('q paga');
      const qSinCargoIdx = headers.indexOf('q sin cargo');
      const totalIdx = headers.indexOf('total caja');
      if (artIdx === -1 || qPagaIdx === -1 || totalIdx === -1) { alert('Columnas faltantes en el CSV de Recaudación.'); return; }

      const rows = [];
      for (let i = headerIdx + 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const articulo = cols[artIdx];
        if (!articulo) continue;
        const codeIdx = headers.indexOf('codigo');
        rows.push({
          articulo,
          qPaga: parseInt(cols[qPagaIdx]) || 0,
          qSinCargo: qSinCargoIdx !== -1 ? (parseInt(cols[qSinCargoIdx]) || 0) : 0,
          total: parseFloat(cols[totalIdx]) || 0,
          externalCode: codeIdx !== -1 ? cols[codeIdx] : null,
        });
      }
      setRecaudacionData(rows);

      // Persist to DB
      if (activeWorkday) {
        try {
          const totalRevenue = rows.reduce((s, r) => s + r.total, 0);
          // Delete existing report for this date (idempotent)
          const { data: existing } = await supabase
            .from('revenue_reports')
            .select('id')
            .eq('operational_date', activeWorkday.work_date)
            .maybeSingle();
          if (existing) {
            await supabase.from('revenue_details').delete().eq('report_id', existing.id);
            await supabase.from('revenue_reports').delete().eq('id', existing.id);
          }
          // Insert new report
          const { data: newReport, error: repErr } = await supabase
            .from('revenue_reports')
            .insert({
              operational_date: activeWorkday.work_date,
              file_name: file.name,
              total_revenue: totalRevenue,
              work_day_id: activeWorkday.id,
            })
            .select('id')
            .single();
          if (repErr) throw repErr;
          // Insert details
          const details = rows.map(r => ({
            report_id: newReport.id,
            recipe_name: r.articulo,
            external_code: r.externalCode,
            q_paga: r.qPaga,
            q_sin_cargo: r.qSinCargo,
            q_vip: 0,
            total_quantity: r.qPaga + r.qSinCargo,
            total_amount: r.total,
          }));
          const { error: detErr } = await supabase.from('revenue_details').insert(details);
          if (detErr) throw detErr;
        } catch (err) { console.error('Error persisting recaudacion:', err); }
      }
    };
    reader.readAsText(file, 'UTF-8');
    event.target.value = '';
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-brand-muted font-bold tracking-widest uppercase text-sm">Cargando entorno...</div>;
  }

  if (!activeWorkday) {
    return (
      <div className="h-full flex flex-col relative overflow-hidden bg-brand-bg">
        {/* HEADER FOR EMPTY STATE */}
        <div className="shrink-0 bg-[#0A0A0A] border-b border-brand-border/50 px-8 py-6 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-text mb-1">Night Chief</h2>
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
              Reconciliación y Cierre Financiero
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
                <div className="w-2 h-2 rounded-full bg-brand-error shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                SIN PLAN
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-brand-surface/30 flex items-center justify-center mb-6">
            <AlertTriangle size={32} className="text-brand-error opacity-80" />
          </div>
          <h3 className="text-xl font-black text-brand-text tracking-tight mb-2">No hay jornada planificada</h3>
          <p className="text-brand-muted text-sm leading-relaxed mb-6">
            No se encontró un registro operativo para la fecha <strong className="text-brand-text">{selectedDate}</strong>. Ve al Planner para crear o confirmar la jornada antes de acceder al módulo de cierre.
          </p>
        </div>
      </div>
    );
  }

  // Pre-Cierre Validation Logic
  const hasRecaudacion = recaudacionData !== null && recaudacionData.length > 0;
  const hasConsumo = consumoData !== null && consumoData.length > 0;
  const hasPassline = (membersData !== null) || (generalData !== null && generalData.length > 0);
  const canClose = hasRecaudacion && hasConsumo && hasPassline;
  const isAlreadyClosed = activeWorkday?.status === 'CLOSED';

  const handleFinalClose = async () => {
    setIsSubmittingClosing(true);
    try {
      // 1. Cierre de Caja (cash_closings)
      const totals = terminals.reduce((acc, t) => ({
        system_cash: acc.system_cash + (Number(t.system_cash) || 0),
        system_digital: acc.system_digital + (Number(t.system_digital) || 0),
        declared_cash: acc.declared_cash + (Number(t.declared_cash) || 0),
        declared_digital: acc.declared_digital + (Number(t.declared_digital) || 0),
      }), { system_cash: 0, system_digital: 0, declared_cash: 0, declared_digital: 0 });

      const system_total = totals.system_cash + totals.system_digital;
      const declared_total = totals.declared_cash + totals.declared_digital;
      const diffTotal = declared_total - system_total;

      const { error: cashError } = await supabase
        .from('cash_closings')
        .upsert({
          work_day_id: activeWorkday.id,
          event_date: activeWorkday.work_date,
          total_system: system_total,
          total_declared: declared_total,
          total_difference: diffTotal
        }, { onConflict: 'event_date' });
        
      if (cashError) throw new Error("Error guardando cierre de caja: " + cashError.message);

      // 2. Cierre Operativo (staff_accruals)
      // Call standard RPC for generating accruals
      const { error: rpcError } = await supabase.rpc('admin_generate_workday_accruals', { p_work_day_id: activeWorkday.id });
      if (rpcError) {
        console.warn("RPC admin_generate_workday_accruals falló. Intentando fallback JS...", rpcError);
        // Fallback: Si no hay RPC, se podría iterar work_day_staff_planning e insertar en staff_accruals
        // Este bloque se mantiene como seguridad si la función DB no está migrada.
        const { data: staffData } = await supabase.from('work_day_staff_planning').select('*').eq('work_day_id', activeWorkday.id);
        if (staffData && staffData.length > 0) {
          const accruals = staffData.map(s => ({
            work_day_id: activeWorkday.id,
            role_id: s.role_id,
            status: 'PENDING',
            amount: 0 // Requiere cruzar con master_staff_roles si fuese 100% JS
          }));
          await supabase.from('staff_accruals').insert(accruals);
        }
      }

      // 3. Actualizar work_days a CLOSED
      const { error: updateError } = await supabase
        .from('work_days')
        .update({ status: 'CLOSED' })
        .eq('id', activeWorkday.id);
        
      if (updateError) throw new Error("Error actualizando estado de jornada: " + updateError.message);

      // Actualizar UI
      setActiveWorkday(prev => ({ ...prev, status: 'CLOSED' }));
      setIsClosingPanelOpen(false);
      
    } catch (err) {
      console.error("Error en Cierre Final:", err);
      alert(err.message);
    } finally {
      setIsSubmittingClosing(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-brand-bg">
      {/* HEADER */}
      <div className="shrink-0 bg-[#0A0A0A] border-b border-brand-border/50 px-8 py-6 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text mb-1">Night Chief</h2>
          <p className="text-xs font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
            Reconciliación y Cierre Financiero
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
        <div className="flex justify-end items-center px-8 py-4 bg-brand-surface border-b border-brand-border">
          <div className="flex items-center gap-4">
            {!isAlreadyClosed && !canClose && (
              <div className="text-[10px] font-bold text-brand-error uppercase tracking-widest text-right flex flex-col items-end">
                <span>Acción Bloqueada</span>
                <span className="opacity-70">
                  Falta: 
                  {!hasPassline && ' Passline'}
                  {!hasRecaudacion && ' Recaudación'}
                  {!hasConsumo && ' Consumo'}
                </span>
              </div>
            )}
            <button 
              onClick={() => setIsClosingPanelOpen(true)}
              disabled={!canClose || isAlreadyClosed}
              className={`px-6 py-2.5 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[11px] transition-all ${
                isAlreadyClosed 
                  ? 'bg-brand-surface border border-brand-border text-brand-muted'
                  : canClose 
                    ? 'bg-brand-success border border-brand-success text-[#0A0A0A] hover:opacity-90'
                    : 'bg-brand-surface/50 border border-brand-error/50 text-brand-error/50 cursor-not-allowed'
              }`}
            >
              {isAlreadyClosed ? 'Jornada Cerrada' : 'Cierre Final'}
            </button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className={`flex-1 overflow-y-auto px-8 py-8 relative transition-opacity duration-300 ${isFetchingBackground ? 'opacity-50' : 'opacity-100'}`}>

        {/* OVERWRITE WARNING MODAL */}
        {showOverwriteWarning && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-brand-surface border border-brand-error/50 p-6 rounded-2xl max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-brand-error/10 flex items-center justify-center text-brand-error shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">¿Sobreescribir Datos?</h3>
              </div>
              <p className="text-sm text-brand-muted mb-6 leading-relaxed">
                Ya existen registros de facturación importados para la jornada <strong className="text-brand-text">{activeWorkday.work_date}</strong>. 
                Sincronizar nuevamente borrará los datos anteriores e insertará los nuevos de forma segura para evitar duplicados.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => {
                    setShowOverwriteWarning(false);
                    setPendingSync(null);
                  }}
                  className="px-4 py-2 font-bold text-xs uppercase tracking-widest text-brand-muted hover:text-brand-text"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => executeSync(pendingSync)}
                  className="px-4 py-2 bg-brand-error text-brand-bg rounded-lg font-black text-xs uppercase tracking-widest hover:opacity-90"
                >
                  Confirmar y Reemplazar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* SYNC STATUS NOTIFICATION */}
        {syncLog && (
          <div className="mb-8 p-4 bg-brand-success/10 border border-brand-success/20 rounded-xl flex items-center gap-4 text-brand-success">
            <CheckCircle size={20} />
            <div>
              <div className="text-sm font-bold tracking-tight">Sincronización Exitosa</div>
              <div className="text-xs font-semibold opacity-80 uppercase tracking-widest mt-1">
                {syncLog.time} - {syncLog.records} registros de facturación importados.
              </div>
            </div>
          </div>
        )}

        {/* CIERRE FINAL SLIDE-OVER */}
        {isClosingPanelOpen && (
          <div className="absolute inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-md transition-opacity">
            <div className="w-full max-w-md bg-[#0A0A0A] border-l border-brand-border/50 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
              
              <div className="p-6 border-b border-brand-border/50 bg-brand-surface/30 shrink-0">
                <h3 className="text-xl font-black text-brand-text uppercase tracking-widest mb-1">Confirmar Cierre</h3>
                <p className="text-xs text-brand-muted uppercase tracking-widest font-bold">
                  Día Operativo: <span className="text-brand-text">{activeWorkday?.work_date}</span>
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  
                  <div className="bg-brand-surface/20 border border-brand-border/50 rounded-xl p-5">
                    <h4 className="text-xs font-black text-brand-text uppercase tracking-widest mb-4 flex items-center gap-2">
                      <TerminalSquare size={14} className="text-brand-success" /> Conciliación de Cajas
                    </h4>
                    <ul className="space-y-3 text-sm font-bold">
                      <li className="flex justify-between items-center border-b border-brand-border/30 pb-2">
                        <span className="text-brand-muted">Total Cajas Activas</span>
                        <span className="text-brand-text">{terminals.length}</span>
                      </li>
                      <li className="flex justify-between items-center border-b border-brand-border/30 pb-2">
                        <span className="text-brand-muted">Total Declarado</span>
                        <span className="text-brand-text font-mono">
                          $ {terminals.reduce((acc, t) => acc + (Number(t.declared_cash) || 0) + (Number(t.declared_digital) || 0), 0).toLocaleString('es-AR')}
                        </span>
                      </li>
                      <li className="flex justify-between items-center border-b border-brand-border/30 pb-2">
                        <span className="text-brand-muted">Total Sistema</span>
                        <span className="text-brand-text font-mono">
                          $ {terminals.reduce((acc, t) => acc + (Number(t.system_cash) || 0) + (Number(t.system_digital) || 0), 0).toLocaleString('es-AR')}
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-brand-surface/20 border border-brand-border/50 rounded-xl p-5">
                    <h4 className="text-xs font-black text-brand-text uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Users size={14} className="text-brand-success" /> Cierre Operativo
                    </h4>
                    <p className="text-xs text-brand-muted font-bold leading-relaxed mb-3">
                      Se consolidarán los datos importados y se calcularán las obligaciones de nómina y los márgenes brutos.
                    </p>
                    <ul className="space-y-2 text-xs font-bold">
                      <li className="flex items-center gap-2 text-brand-text">
                        <CheckCircle size={12} className="text-brand-success" /> Passline Importado
                      </li>
                      <li className="flex items-center gap-2 text-brand-text">
                        <CheckCircle size={12} className="text-brand-success" /> Consumo Importado
                      </li>
                      <li className="flex items-center gap-2 text-brand-text">
                        <CheckCircle size={12} className="text-brand-success" /> Recaudación Importada
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-brand-error/10 border border-brand-error/30 rounded-xl text-brand-error text-xs font-bold leading-relaxed">
                    Al confirmar, el estado de la jornada pasará a CLOSED. No se podrán modificar las cajas ni importar nuevos CSVs para este día.
                  </div>

                </div>
              </div>

              <div className="p-6 border-t border-brand-border/50 bg-brand-surface/50 shrink-0 flex gap-4">
                <button 
                  onClick={() => setIsClosingPanelOpen(false)}
                  disabled={isSubmittingClosing}
                  className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all bg-transparent border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleFinalClose}
                  disabled={isSubmittingClosing}
                  className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[11px] transition-all bg-brand-success text-[#0A0A0A] hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmittingClosing ? (
                    <><RefreshCw size={14} className="animate-spin" /> Procesando...</>
                  ) : (
                    'Confirmar Cierre'
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TERMINALS TABLE */}
        <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-brand-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TerminalSquare size={20} className="text-brand-muted" />
              <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Cajas Operativas (POS)</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleCsvUpload} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isSyncing}
                className="px-4 py-2.5 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all bg-transparent border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text disabled:opacity-50"
              >
                <Upload size={16} /> Subir CSV
              </button>
              
              <button 
                onClick={() => handleGbolSyncInit('api')}
                disabled={isSyncing}
                className="px-6 py-2.5 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[11px] transition-all bg-brand-text border border-brand-text text-[#0A0A0A] hover:opacity-90 disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw size={16} className="animate-spin" /> : <Database size={16} />}
                {isSyncing ? 'Sincronizando...' : 'Sincronizar API'}
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-surface/20 text-[10px] uppercase tracking-widest text-brand-muted">
                <th className="p-4 font-black">Caja</th>
                <th className="p-4 font-black">ID Terminal</th>
                <th className="p-4 font-black text-right">Total (Sistema)</th>
                <th className="p-4 font-black text-right">Efectivo (Sist.)</th>
                <th className="p-4 font-black text-right">Digital (Sist.)</th>
                <th className="p-4 font-black text-right">Efectivo (Decl.)</th>
                <th className="p-4 font-black text-right">Digital (Decl.)</th>
                <th className="p-4 font-black text-right">Conciliación</th>
              </tr>
            </thead>
            <tbody className="text-sm text-brand-text font-semibold divide-y divide-brand-border/50">
              {terminals.map((terminal) => {
                // Calculation logic for reconciliation
                const diffEfectivo = (terminal.declared_cash || 0) - (terminal.system_cash || 0);
                const diffDigital = (terminal.declared_digital || 0) - (terminal.system_digital || 0);
                const diffTotal = diffEfectivo + diffDigital;
                const isConciliated = diffTotal === 0 && terminal.system_total !== undefined;

                return (
                <tr key={terminal.id} className="hover:bg-brand-surface/30 transition-colors group">
                  <td className="p-4 font-bold">{terminal.friendly_name}</td>
                  <td className="p-4 font-mono text-brand-muted text-xs">{terminal.external_id || terminal.gbol_alias || 'N/A'}</td>
                  
                  {/* SISTEMA */}
                  <td className={`p-4 text-right font-mono font-bold ${terminal.system_total !== undefined ? 'text-brand-text' : 'text-brand-muted'}`}>
                    {terminal.system_total !== undefined ? `$ ${terminal.system_total.toLocaleString('es-AR')}` : '--'}
                  </td>
                  <td className="p-4 text-right font-mono text-brand-muted">
                    {terminal.system_cash !== undefined ? `$ ${terminal.system_cash.toLocaleString('es-AR')}` : '--'}
                  </td>
                  <td className="p-4 text-right font-mono text-brand-muted">
                    {terminal.system_digital !== undefined ? `$ ${terminal.system_digital.toLocaleString('es-AR')}` : '--'}
                  </td>
                  
                  {/* DECLARADO (Editables) */}
                  <td className="p-4 text-right font-mono">
                    <div className="flex items-center justify-end gap-1 group/input">
                      <span className="text-brand-muted group-focus-within/input:text-brand-text transition-colors">$</span>
                      <input 
                        type="number" 
                        className="bg-transparent text-right outline-none w-24 text-brand-text font-bold border-b border-transparent hover:border-brand-border focus:border-brand-text focus:bg-brand-surface rounded-sm px-1 py-0.5 transition-all focus:shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                        value={terminal.declared_cash !== undefined ? terminal.declared_cash : ''}
                        onChange={(e) => handleDeclaredChange(terminal.id, 'declared_cash', e.target.value)}
                        onBlur={(e) => handleDeclaredSave(terminal.id, 'declared_cash', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono">
                    <div className="flex items-center justify-end gap-1 group/input">
                      <span className="text-brand-muted group-focus-within/input:text-brand-text transition-colors">$</span>
                      <input 
                        type="number" 
                        className="bg-transparent text-right outline-none w-24 text-brand-text font-bold border-b border-transparent hover:border-brand-border focus:border-brand-text focus:bg-brand-surface rounded-sm px-1 py-0.5 transition-all focus:shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                        value={terminal.declared_digital !== undefined ? terminal.declared_digital : ''}
                        onChange={(e) => handleDeclaredChange(terminal.id, 'declared_digital', e.target.value)}
                        onBlur={(e) => handleDeclaredSave(terminal.id, 'declared_digital', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </td>
                  
                  {/* CONCILIACIÓN */}
                  <td className="p-4 text-right">
                    {terminal.system_total === undefined ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-brand-muted">
                        <Activity size={12} /> Esperando GBOL
                      </span>
                    ) : terminal.declared_cash === undefined ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-brand-error">
                        <AlertTriangle size={12} /> Esperando Cajero
                      </span>
                    ) : isConciliated ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-success">
                        $ 0
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold ${diffTotal < 0 ? 'text-brand-error' : 'text-blue-500'}`}>
                        $ {diffTotal.toLocaleString('es-AR')}
                      </span>
                    )}
                  </td>
                </tr>
              )})}
              {terminals.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-brand-muted text-xs font-bold uppercase tracking-widest">
                    No hay cajas operativas configuradas.
                  </td>
                </tr>
              )}
            </tbody>
              {terminals.length > 0 && (() => {
                const totals = terminals.reduce((acc, t) => ({
                  system_total: acc.system_total + (Number(t.system_total) || 0),
                  system_cash: acc.system_cash + (Number(t.system_cash) || 0),
                  system_digital: acc.system_digital + (Number(t.system_digital) || 0),
                  declared_cash: acc.declared_cash + (Number(t.declared_cash) || 0),
                  declared_digital: acc.declared_digital + (Number(t.declared_digital) || 0),
                }), { system_total: 0, system_cash: 0, system_digital: 0, declared_cash: 0, declared_digital: 0 });
                const hasSystem = terminals.some(t => t.system_total !== undefined);
                const hasDeclared = terminals.some(t => t.declared_cash !== undefined);
                const diffTotal = (totals.declared_cash + totals.declared_digital) - (totals.system_cash + totals.system_digital);
                return (
                  <tfoot>
                    <tr className="bg-brand-surface/60 border-t-2 border-brand-border text-sm font-black text-brand-text">
                      <td className="p-4 uppercase tracking-widest text-[11px]">Total</td>
                      <td className="p-4"></td>
                      <td className="p-4 text-right font-mono">
                        {hasSystem ? `$ ${totals.system_total.toLocaleString('es-AR')}` : '--'}
                      </td>
                      <td className="p-4 text-right font-mono text-brand-muted">
                        {hasSystem ? `$ ${totals.system_cash.toLocaleString('es-AR')}` : '--'}
                      </td>
                      <td className="p-4 text-right font-mono text-brand-muted">
                        {hasSystem ? `$ ${totals.system_digital.toLocaleString('es-AR')}` : '--'}
                      </td>
                      <td className="p-4 text-right font-mono text-brand-muted">
                        {hasDeclared ? `$ ${totals.declared_cash.toLocaleString('es-AR')}` : '--'}
                      </td>
                      <td className="p-4 text-right font-mono text-brand-muted">
                        {hasDeclared ? `$ ${totals.declared_digital.toLocaleString('es-AR')}` : '--'}
                      </td>
                      <td className="p-4 text-right font-mono">
                        {hasSystem && hasDeclared ? (
                          <span className={`font-bold ${diffTotal === 0 ? 'text-brand-success' : diffTotal < 0 ? 'text-brand-error' : 'text-blue-500'}`}>
                            $ {diffTotal.toLocaleString('es-AR')}
                          </span>
                        ) : '--'}
                      </td>
                    </tr>
                  </tfoot>
                );
              })()}
          </table>
        </div>

        {/* PASSLINE SECTIONS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
          
          {/* PASSLINE MEMBERS TABLE */}
          <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-brand-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={18} className="text-brand-muted" />
                <h3 className="text-xs font-black text-brand-text uppercase tracking-widest">Passline Members</h3>
              </div>
              <div>
                <input type="file" accept=".csv" className="hidden" ref={membersCsvRef} onChange={handleMembersCsv} />
                <button 
                  onClick={() => membersCsvRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all bg-transparent border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text"
                >
                  <Upload size={16} /> Importar CSV
                </button>
              </div>
            </div>
            
            {membersData ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-surface/20 text-[10px] uppercase tracking-widest text-brand-muted">
                    <th className="p-4 font-black">Tickets Solicitados</th>
                    <th className="p-4 font-black text-right">Tickets Validados</th>
                    <th className="p-4 font-black text-right">No Validados</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-brand-text font-semibold">
                  <tr className="hover:bg-brand-surface/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-lg">{membersData.total.toLocaleString('es-AR')}</td>
                    <td className="p-4 text-right font-mono font-bold text-lg text-brand-success">{membersData.validated.toLocaleString('es-AR')}</td>
                    <td className="p-4 text-right font-mono font-bold text-lg text-brand-muted">{membersData.notValidated.toLocaleString('es-AR')}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className="p-10 text-center">
                <Ticket size={28} className="mx-auto text-brand-muted/40 mb-3" />
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Sin datos · Importar CSV de Members</p>
              </div>
            )}
          </div>

          {/* PASSLINE GENERAL TABLE */}
          <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-brand-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ticket size={18} className="text-brand-muted" />
                <h3 className="text-xs font-black text-brand-text uppercase tracking-widest">Passline General</h3>
              </div>
              <div>
                <input type="file" accept=".csv" className="hidden" ref={generalCsvRef} onChange={handleGeneralCsv} />
                <button 
                  onClick={() => generalCsvRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all bg-transparent border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text"
                >
                  <Upload size={16} /> Importar CSV
                </button>
              </div>
            </div>
            
            {generalData ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-surface/20 text-[10px] uppercase tracking-widest text-brand-muted">
                    <th className="p-4 font-black">Tipo</th>
                    <th className="p-4 font-black text-right">Comprados</th>
                    <th className="p-4 font-black text-right">Validados</th>
                    <th className="p-4 font-black text-right">No Validados</th>
                    <th className="p-4 font-black text-right">Total $</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-brand-text font-semibold divide-y divide-brand-border/50">
                  {generalData.map((row, i) => (
                    <tr key={i} className="hover:bg-brand-surface/30 transition-colors">
                      <td className="p-4 font-bold text-xs">{row.tipo}</td>
                      <td className="p-4 text-right font-mono font-bold">{row.comprados.toLocaleString('es-AR')}</td>
                      <td className="p-4 text-right font-mono font-bold text-brand-success">{row.validados.toLocaleString('es-AR')}</td>
                      <td className="p-4 text-right font-mono font-bold text-brand-muted">{(row.comprados - row.validados).toLocaleString('es-AR')}</td>
                      <td className="p-4 text-right font-mono font-bold text-brand-text">$ {row.totalAmount.toLocaleString('es-AR')}</td>
                    </tr>
                  ))}
                </tbody>
                {generalData.length > 1 && (
                  <tfoot>
                    <tr className="bg-brand-surface/60 border-t-2 border-brand-border text-sm font-black text-brand-text">
                      <td className="p-4 uppercase tracking-widest text-[11px]">Total</td>
                      <td className="p-4 text-right font-mono">{generalData.reduce((s, r) => s + r.comprados, 0).toLocaleString('es-AR')}</td>
                      <td className="p-4 text-right font-mono text-brand-success">{generalData.reduce((s, r) => s + r.validados, 0).toLocaleString('es-AR')}</td>
                      <td className="p-4 text-right font-mono text-brand-muted">{generalData.reduce((s, r) => s + (r.comprados - r.validados), 0).toLocaleString('es-AR')}</td>
                      <td className="p-4 text-right font-mono font-bold">$ {generalData.reduce((s, r) => s + r.totalAmount, 0).toLocaleString('es-AR')}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            ) : (
              <div className="p-10 text-center">
                <Ticket size={28} className="mx-auto text-brand-muted/40 mb-3" />
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Sin datos · Importar CSV General</p>
              </div>
            )}
          </div>
        </div>

        {/* RECAUDACIÓN TABLE */}
        <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-2xl mt-8">
          <div className="p-5 border-b border-brand-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 size={18} className="text-brand-muted" />
              <h3 className="text-xs font-black text-brand-text uppercase tracking-widest">Recaudación</h3>
            </div>
            <div>
              <input type="file" accept=".csv" className="hidden" ref={recaudacionCsvRef} onChange={handleRecaudacionCsv} />
              <button
                onClick={() => recaudacionCsvRef.current?.click()}
                className="px-4 py-2.5 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all bg-transparent border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text"
              >
                <Upload size={16} /> Importar CSV
              </button>
            </div>
          </div>

          {recaudacionData ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/20 text-[10px] uppercase tracking-widest text-brand-muted">
                  <th className="p-4 font-black">Artículo</th>
                  <th className="p-4 font-black text-right">Q. Paga</th>
                  <th className="p-4 font-black text-right">Q. Sin Cargo</th>
                  <th className="p-4 font-black text-right">Total $</th>
                </tr>
              </thead>
              <tbody className="text-sm text-brand-text font-semibold divide-y divide-brand-border/50">
                {recaudacionData.map((row, i) => (
                  <tr key={i} className="hover:bg-brand-surface/30 transition-colors">
                    <td className="p-4 font-bold text-xs">{row.articulo}</td>
                    <td className="p-4 text-right font-mono font-bold">{row.qPaga.toLocaleString('es-AR')}</td>
                    <td className="p-4 text-right font-mono font-bold text-brand-muted">{row.qSinCargo.toLocaleString('es-AR')}</td>
                    <td className="p-4 text-right font-mono font-bold text-brand-text">$ {row.total.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-brand-surface/60 border-t-2 border-brand-border text-sm font-black text-brand-text">
                  <td className="p-4 uppercase tracking-widest text-[11px]">Total</td>
                  <td className="p-4 text-right font-mono">{recaudacionData.reduce((s, r) => s + r.qPaga, 0).toLocaleString('es-AR')}</td>
                  <td className="p-4 text-right font-mono text-brand-muted">{recaudacionData.reduce((s, r) => s + r.qSinCargo, 0).toLocaleString('es-AR')}</td>
                  <td className="p-4 text-right font-mono font-bold">$ {recaudacionData.reduce((s, r) => s + r.total, 0).toLocaleString('es-AR')}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="p-10 text-center">
              <BarChart3 size={28} className="mx-auto text-brand-muted/40 mb-3" />
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Sin datos · Importar CSV de Recaudación</p>
            </div>
          )}
        </div>

        {/* CONSUMO TABLE */}
        <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-2xl mt-6">
          <div className="p-5 border-b border-brand-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} className="text-brand-muted" />
              <h3 className="text-xs font-black text-brand-text uppercase tracking-widest">Consumo</h3>
            </div>
            <div>
              <input type="file" accept=".csv" className="hidden" ref={consumoCsvRef} onChange={handleConsumoCsv} />
              <button
                onClick={() => consumoCsvRef.current?.click()}
                className="px-4 py-2.5 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all bg-transparent border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text"
              >
                <Upload size={16} /> Importar CSV
              </button>
            </div>
          </div>

          {consumoData ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/20 text-[10px] uppercase tracking-widest text-brand-muted">
                  <th className="p-4 font-black">Producto</th>
                  <th className="p-4 font-black text-right">Cantidad</th>
                  <th className="p-4 font-black text-right">Costo Total</th>
                </tr>
              </thead>
              <tbody className="text-sm text-brand-text font-semibold divide-y divide-brand-border/50">
                {consumoData.map((row, i) => (
                  <tr key={i} className="hover:bg-brand-surface/30 transition-colors">
                    <td className="p-4 font-bold text-xs">{row.producto}</td>
                    <td className="p-4 text-right font-mono font-bold">{row.cantidad.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</td>
                    <td className="p-4 text-right font-mono font-bold text-brand-text">$ {row.costoTotal.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-brand-surface/60 border-t-2 border-brand-border text-sm font-black text-brand-text">
                  <td className="p-4 uppercase tracking-widest text-[11px]">Total</td>
                  <td className="p-4 text-right font-mono">{consumoData.reduce((s, r) => s + r.cantidad, 0).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</td>
                  <td className="p-4 text-right font-mono font-bold">$ {consumoData.reduce((s, r) => s + r.costoTotal, 0).toLocaleString('es-AR', { maximumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="p-10 text-center">
              <ShoppingCart size={28} className="mx-auto text-brand-muted/40 mb-3" />
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Sin datos · Importar CSV de Consumo</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

