import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { GbolService } from '../../lib/gbolService';
import { Plus, X, Save, TerminalSquare, Receipt, Lock, CheckCircle2, AlertTriangle, Upload, Ticket, Users, Loader2, Copy } from 'lucide-react';
import dayjs from 'dayjs';

const publicSupabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

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

export default function NightOpsModule({ onNavigate }) {
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const [workDays, setWorkDays] = useState([]);
  const [selectedWorkDay, setSelectedWorkDay] = useState(null);
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closingNight, setClosingNight] = useState(false);
  const [syncingGbol, setSyncingGbol] = useState(false);
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const [membersData, setMembersData] = useState(null);
  const [generalData, setGeneralData] = useState(null);
  const gbolCsvRef = useRef(null);
  const membersCsvRef = useRef(null);
  const generalCsvRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setIsFetchingBackground(true);
      const { data: wdData, error } = await supabase
        .from('work_days')
        .select('*')
        .in('status', ['open', 'closed', 'OPEN', 'CLOSED'])
        .order('work_date', { ascending: false });
      
      if (error) throw error;
      setWorkDays(wdData || []);
      
      if (wdData && wdData.length > 0) {
        const targetWd = wdData.find(w => w.status.toLowerCase() === 'open') || wdData[0];
        setSelectedWorkDay(targetWd);
      } else {
        (setIsFetchingBackground(false), setLoading(false));
      }
    } catch (err) {
      window.UI?.toast?.(err.message, 'danger');
      triggerFlash('error');
      (setIsFetchingBackground(false), setLoading(false));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchNightDetails = useCallback(async () => {
    if (!selectedWorkDay) return;
    try {
      setIsFetchingBackground(true);
      
      const [termRes, closeRes] = await Promise.all([
        supabase.from('pos_terminals').select('*').eq('active', true).order('name'),
        supabase.from('night_cash_closing').select('*').eq('work_day_id', selectedWorkDay.id)
      ]);
      
      if (termRes.error) throw termRes.error;
      if (closeRes.error) throw closeRes.error;

      const posData = termRes.data || [];
      const closings = closeRes.data || [];
    
    const mappedTerminals = posData.map(pt => {
      const match = closings.find(c => c.terminal_id === pt.id) || {};
      return {
        ...pt,
        system_cash: match.system_cash !== undefined ? match.system_cash : 0,
        system_digital: match.system_digital !== undefined ? match.system_digital : 0,
        declared_cash: match.declared_cash,
        declared_digital: match.declared_digital,
        diff_cash: match.declared_cash !== undefined && match.system_cash !== undefined ? match.declared_cash - match.system_cash : null,
        diff_digital: match.declared_digital !== undefined && match.system_digital !== undefined ? match.declared_digital - match.system_digital : null
      };
    });
    setTerminals(mappedTerminals);

    let allPasslineTickets = [];
    let fetchMore = true;
    let from = 0;
    const limit = 1000;
    
    while (fetchMore) {
      const { data: passlineTicketsChunk, error } = await supabase
        .from('stg_passline_tickets')
        .select('tipo_ticket, estado_ticket, total_raw')
        .eq('operational_date', selectedWorkDay.work_date)
        .range(from, from + limit - 1);
        
      if (error) throw error;
      
      if (passlineTicketsChunk && passlineTicketsChunk.length > 0) {
        allPasslineTickets = [...allPasslineTickets, ...passlineTicketsChunk];
        from += limit;
        if (passlineTicketsChunk.length < limit) {
          fetchMore = false;
        }
      } else {
        fetchMore = false;
      }
    }
      
    if (allPasslineTickets.length > 0) {
      const members = allPasslineTickets.filter(t => t.tipo_ticket === 'MEMBER');
      if (members.length > 0) {
        const validated = members.filter(t => t.estado_ticket?.toLowerCase() === 'validada').length;
        setMembersData({ total: members.length, validated, notValidated: members.length - validated });
      } else {
        setMembersData(null);
      }
      
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

      (setIsFetchingBackground(false), setLoading(false));
    } catch (err) {
      window.UI?.toast?.(err.message, 'danger');
      triggerFlash('error');
      (setIsFetchingBackground(false), setLoading(false));
    }
  }, [selectedWorkDay]);

  useEffect(() => {
    fetchNightDetails();
  }, [fetchNightDetails]);

  const handleDeclaredChange = (terminalId, field, value) => {
    setTerminals(prev => prev.map(t => 
      t.id === terminalId ? { ...t, [field]: value } : t
    ));
  };

  const handleDeclaredSave = async (terminalId, field, value) => {
    if (!selectedWorkDay) return;
    const numValue = value === '' ? null : Number(value);
    
    try {
      const term = terminals.find(t => t.id === terminalId);
      
      const payload = {
        work_day_id: selectedWorkDay.id,
        terminal_id: terminalId,
        system_cash: term.system_cash || 0,
        system_digital: term.system_digital || 0,
        declared_cash: field === 'declared_cash' ? numValue : (term.declared_cash === undefined ? null : term.declared_cash),
        declared_digital: field === 'declared_digital' ? numValue : (term.declared_digital === undefined ? null : term.declared_digital),
        closed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('night_cash_closing')
        .upsert(payload, { onConflict: 'work_day_id,terminal_id' });
        
      if (error) throw error;
      
      triggerFlash('success');
      fetchNightDetails();
    } catch (err) {
      triggerFlash('error');
      window.UI?.toast?.(err.message, 'danger');
    }
  };

  const handleReplicateSystem = async () => {
    if (!selectedWorkDay) return;
    if (!(await window.UI.confirm('¿Seguro deseas auto-completar el Arqueo Físico usando los valores del sistema? Esto sobrescribirá lo que hayas ingresado.'))) return;
    
    setSaving(true);
    try {
      const payloads = terminals.map(term => ({
        work_day_id: selectedWorkDay.id,
        terminal_id: term.id,
        system_cash: term.system_cash || 0,
        system_digital: term.system_digital || 0,
        declared_cash: term.system_cash || 0,
        declared_digital: term.system_digital || 0,
        closed_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('night_cash_closing')
        .upsert(payloads, { onConflict: 'work_day_id,terminal_id' });
        
      if (error) throw error;
      
      triggerFlash('success');
      await fetchNightDetails();
    } catch (err) {
      triggerFlash('error');
      window.UI?.toast?.(err.message, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedWorkDay) return;
    
    setSyncingGbol(true);
    try {
      const res = await GbolService.syncNightFromCsv(file, selectedWorkDay.work_date);
      if (res.success) {
        await GbolService.populateSystemAmounts(selectedWorkDay.id, selectedWorkDay.work_date);
        await fetchNightDetails();
        triggerFlash('success');
      } else {
        triggerFlash('error');
        window.UI?.toast?.("Error procesando CSV de GBOL: " + (res.error?.message || res.error), 'danger');
      }
    } catch(err) {
      triggerFlash('error');
      window.UI?.toast?.(err.message, 'danger');
    } finally {
      setSyncingGbol(false);
      if (gbolCsvRef.current) gbolCsvRef.current.value = '';
    }
  };

  const handleMembersCsv = (event) => {
    if (!selectedWorkDay) return;
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return;
      const sep = lines[0].includes(';') ? ';' : ',';
      const headers = parseCsvLine(lines[0], sep).map(h => h.toLowerCase().trim());
      const statusIdx = headers.indexOf('estado del eticket');
      const ticketIdIdx = headers.findIndex(h => h === 'id ticket' || h === 'ticket id' || h === 'id' || h === 'id_ticket' || h.includes('código'));
      
      if (statusIdx === -1) { 
        window.UI?.toast?.('No se encontró la columna "Estado del eticket" en el CSV.', 'danger'); 
        return; 
      }
      
      const ticketsMap = new Map();
      
      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i], sep);
        if (row.length <= statusIdx) continue;
        const estado = row[statusIdx];
        if (!estado) continue;
        
        const ticketId = (ticketIdIdx !== -1 && row[ticketIdIdx]) ? row[ticketIdIdx] : `tmp_${i}`;
        
        if (!ticketsMap.has(ticketId) || (estado.toLowerCase() === 'validada')) {
          ticketsMap.set(ticketId, { estado });
        }
      }

      const dbRows = Array.from(ticketsMap.entries()).map(([id, data]) => ({
        external_ticket_id: id,
        estado_ticket: data.estado,
        tipo_ticket: 'MEMBER',
        operational_date: selectedWorkDay.work_date
      }));

      if (dbRows.length > 0) {
        (async () => {
          try {
            setSaving(true);
            const { error: delError } = await publicSupabase.from('stg_passline_tickets')
              .delete()
              .eq('operational_date', selectedWorkDay.work_date)
              .eq('tipo_ticket', 'MEMBER');
            if (delError) throw delError;
            
            const chunkSize = 500;
            for (let i = 0; i < dbRows.length; i += chunkSize) {
              const { error: insError } = await supabase.from('stg_passline_tickets').insert(dbRows.slice(i, i + chunkSize));
              if (insError) throw insError;
            }
            triggerFlash('success');
            await fetchNightDetails();
          } catch (err) {
            triggerFlash('error');
            window.UI?.toast?.(err.message, 'danger');
          } finally {
            setSaving(false);
          }
        })();
      }
    };
    reader.readAsText(file, 'UTF-8');
    if (membersCsvRef.current) membersCsvRef.current.value = '';
  };

  const handleGeneralCsv = (event) => {
    if (!selectedWorkDay) return;
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return;
      const sep = lines[0].includes(';') ? ';' : ',';
      const headers = parseCsvLine(lines[0], sep).map(h => h.toLowerCase().trim());
      const tipoIdx = headers.indexOf('tipo');
      const statusIdx = headers.indexOf('estado del eticket');
      const totalIdx = headers.indexOf('total');
      const ticketIdIdx = headers.findIndex(h => h === 'id ticket' || h === 'ticket id' || h === 'id' || h === 'id_ticket' || h.includes('código'));
      if (tipoIdx === -1 || statusIdx === -1) { 
        window.UI?.toast?.('No se encontraron columnas necesarias.', 'danger'); 
        return; 
      }

      const ticketsMap = new Map();
      
      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i], sep);
        if (row.length <= Math.max(tipoIdx, statusIdx)) continue;
        const tipo = row[tipoIdx];
        const estado = row[statusIdx];
        if (!tipo || !estado) continue;
        
        const ticketId = (ticketIdIdx !== -1 && row[ticketIdIdx]) ? row[ticketIdIdx] : `tmp_${i}`;
        
        if (!ticketsMap.has(ticketId) || (estado.toLowerCase() === 'validada')) {
          ticketsMap.set(ticketId, { tipo, estado, totalVal: totalIdx !== -1 ? row[totalIdx] : '0' });
        }
      }

      const dbRows = Array.from(ticketsMap.entries()).map(([id, data]) => ({
        external_ticket_id: id,
        estado_ticket: data.estado,
        tipo_ticket: data.tipo,
        total_raw: data.totalVal,
        operational_date: selectedWorkDay.work_date
      }));

      if (dbRows.length > 0) {
        (async () => {
          try {
            setSaving(true);
            const uniqueTipos = [...new Set(dbRows.map(r => r.tipo_ticket))];
            
            const { error: delError } = await publicSupabase.from('stg_passline_tickets')
              .delete()
              .eq('operational_date', selectedWorkDay.work_date)
              .in('tipo_ticket', uniqueTipos);
            if (delError) throw delError;
            
            const chunkSize = 500;
            for (let i = 0; i < dbRows.length; i += chunkSize) {
              const { error: insError } = await supabase.from('stg_passline_tickets').insert(dbRows.slice(i, i + chunkSize));
              if (insError) throw insError;
            }
            triggerFlash('success');
            await fetchNightDetails();
          } catch (err) {
            triggerFlash('error');
            window.UI?.toast?.(err.message, 'danger');
          } finally {
            setSaving(false);
          }
        })();
      }
    };
    reader.readAsText(file, 'UTF-8');
    if (generalCsvRef.current) generalCsvRef.current.value = '';
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  const calculateTotals = () => {
    return terminals.reduce((acc, t) => ({
      system_cash: acc.system_cash + (t.system_cash || 0),
      system_digital: acc.system_digital + (t.system_digital || 0),
      declared_cash: acc.declared_cash + (Number(t.declared_cash) || 0),
      declared_digital: acc.declared_digital + (Number(t.declared_digital) || 0),
      diff_cash: acc.diff_cash + (t.diff_cash || 0),
      diff_digital: acc.diff_digital + (t.diff_digital || 0),
    }), { system_cash: 0, system_digital: 0, declared_cash: 0, declared_digital: 0, diff_cash: 0, diff_digital: 0 });
  };
  const totals = calculateTotals();
  const allTerminalsClosed = terminals.length > 0 && terminals.every(t => t.declared_cash !== undefined && t.declared_digital !== undefined);
  const isActive = selectedWorkDay && selectedWorkDay.status.toLowerCase() === 'open';

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-brand-bg">
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      <div className="shrink-0 bg-[#0A0A0A] border-b border-brand-border/50 px-8 py-6 z-10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">NIGHT CHIEF</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-transparent border border-brand-border/50 p-2 rounded-xl">
          <select
            value={selectedWorkDay?.id || ''}
            onChange={(e) => {
              const wd = workDays.find(w => w.id === e.target.value);
              setSelectedWorkDay(wd);
            }}
            className="bg-transparent border-none text-sm font-bold text-brand-text focus:outline-none appearance-none cursor-pointer uppercase tracking-wider px-4"
            disabled={saving}
          >
            {workDays.length === 0 ? <option value="">SIN JORNADAS</option> : null}
            {workDays.map(wd => (
              <option key={wd.id} value={wd.id} className="bg-brand-surface text-brand-text">
                {dayjs(wd.work_date).format('DD/MM/YYYY')} - {wd.status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-8 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
        {selectedWorkDay && (
          <>
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              selectedWorkDay.status.toLowerCase() === 'open' 
                ? 'bg-brand-accent/10 border-brand-accent/30 text-brand-accent' 
                : 'bg-brand-success/10 border-brand-success/30 text-brand-success'
            }`}>
              <div className="flex items-center gap-3">
                {selectedWorkDay.status.toLowerCase() === 'open' ? <Lock size={18} className="opacity-70" /> : <CheckCircle2 size={18} />}
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase">
                    ESTADO: {selectedWorkDay.status.toLowerCase() === 'open' ? 'ABIERTA' : 'CERRADA'}
                  </div>
                </div>
              </div>
              

            </div>

            <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 md:p-6 border-b border-brand-border/50 bg-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                    <TerminalSquare size={20} className="text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-brand-text uppercase tracking-widest">Arqueo de Cajas</h3>
                  </div>
                </div>
                
                {isActive && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReplicateSystem}
                      disabled={saving || syncingGbol}
                      className="flex items-center gap-2 bg-brand-surface border border-brand-border hover:border-brand-text px-4 py-2 rounded-xl text-[10px] font-bold text-brand-text tracking-widest uppercase transition-all cursor-pointer disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
                      IGUALAR SISTEMA
                    </button>
                    <input autoComplete="off" type="file" accept=".csv" ref={gbolCsvRef} onChange={handleCsvUpload} className="hidden" />
                    <button 
                      onClick={() => gbolCsvRef.current?.click()}
                      disabled={syncingGbol || saving}
                      className="flex items-center gap-2 bg-brand-surface border border-brand-border hover:border-brand-accent/50 px-4 py-2 rounded-xl text-[10px] font-bold text-brand-text tracking-widest uppercase transition-all cursor-pointer disabled:opacity-50"
                    >
                      {syncingGbol ? <Loader2 size={14} className="animate-spin text-brand-accent" /> : <Upload size={14} className="text-brand-accent" />}
                      {syncingGbol ? 'IMPORTANDO...' : 'IMPORTAR CSV GBOL'}
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-transparent border-b border-brand-border/50 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">
                      <th className="px-6 py-4">Terminal</th>
                      <th className="px-6 py-4 text-right">Efectivo Físico (Declarado)</th>
                      <th className="px-6 py-4 text-right">Cupones Digital (Declarado)</th>
                      <th className="px-6 py-4 text-right bg-transparent">Sistema (Ef.)</th>
                      <th className="px-6 py-4 text-right bg-transparent">Sistema (Dig.)</th>
                      <th className="px-6 py-4 text-right">Diferencia Neta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30">
                    {terminals.map(t => (
                      <tr key={t.id} className="hover:bg-transparent transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-brand-text uppercase">{t.name}</div>
                          <div className="text-[10px] text-brand-muted tracking-widest uppercase">{t.terminal_id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <input autoComplete="off" 
                              type="number"
                              disabled={!isActive}
                              value={t.declared_cash === undefined ? '' : t.declared_cash}
                              onChange={(e) => handleDeclaredChange(t.id, 'declared_cash', e.target.value)}
                              onBlur={(e) => handleDeclaredSave(t.id, 'declared_cash', e.target.value)}
                              className="w-32 bg-transparent border-b border-brand-border/50 rounded-none focus:border-brand-accent focus:bg-brand-bg rounded-lg px-3 py-2 text-right font-mono text-brand-text text-sm transition-colors"
                              placeholder="0"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <input autoComplete="off" 
                              type="number"
                              disabled={!isActive}
                              value={t.declared_digital === undefined ? '' : t.declared_digital}
                              onChange={(e) => handleDeclaredChange(t.id, 'declared_digital', e.target.value)}
                              onBlur={(e) => handleDeclaredSave(t.id, 'declared_digital', e.target.value)}
                              className="w-32 bg-transparent border-b border-brand-border/50 rounded-none focus:border-brand-accent focus:bg-brand-bg rounded-lg px-3 py-2 text-right font-mono text-brand-text text-sm transition-colors"
                              placeholder="0"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right bg-transparent font-mono text-brand-muted">
                          {formatCurrency(t.system_cash)}
                        </td>
                        <td className="px-6 py-4 text-right bg-transparent font-mono text-brand-muted">
                          {formatCurrency(t.system_digital)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          <div className="flex flex-col items-end gap-1">
                            {t.diff_cash !== null && t.diff_cash !== 0 && (
                              <span className={`text-[10px] px-2 py-0.5 rounded ${t.diff_cash < 0 ? 'bg-brand-error/10 text-brand-error' : 'bg-brand-success/10 text-brand-success'}`}>
                                EF: {t.diff_cash > 0 ? '+' : ''}{formatCurrency(t.diff_cash)}
                              </span>
                            )}
                            {t.diff_digital !== null && t.diff_digital !== 0 && (
                              <span className={`text-[10px] px-2 py-0.5 rounded ${t.diff_digital < 0 ? 'bg-brand-error/10 text-brand-error' : 'bg-brand-success/10 text-brand-success'}`}>
                                DI: {t.diff_digital > 0 ? '+' : ''}{formatCurrency(t.diff_digital)}
                              </span>
                            )}
                            {t.diff_cash === 0 && t.diff_digital === 0 && (
                              <span className="text-[10px] text-brand-success">OK</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {terminals.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-brand-muted/50 text-xs italic">
                          No hay terminales configuradas en el sistema.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {terminals.length > 0 && (
                    <tfoot className="bg-brand-surface border-t border-brand-border/50 font-mono">
                      <tr>
                        <td className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">TOTALES</td>
                        <td className="px-6 py-4 text-right text-brand-text font-bold">{formatCurrency(totals.declared_cash)}</td>
                        <td className="px-6 py-4 text-right text-brand-text font-bold">{formatCurrency(totals.declared_digital)}</td>
                        <td className="px-6 py-4 text-right text-brand-muted">{formatCurrency(totals.system_cash)}</td>
                        <td className="px-6 py-4 text-right text-brand-muted">{formatCurrency(totals.system_digital)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded ${totals.diff_cash < 0 ? 'bg-brand-error/20 text-brand-error' : totals.diff_cash > 0 ? 'bg-brand-success/20 text-brand-success' : 'text-brand-muted'}`}>
                              Σ EF: {totals.diff_cash > 0 ? '+' : ''}{formatCurrency(totals.diff_cash)}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded ${totals.diff_digital < 0 ? 'bg-brand-error/20 text-brand-error' : totals.diff_digital > 0 ? 'bg-brand-success/20 text-brand-success' : 'text-brand-muted'}`}>
                              Σ DI: {totals.diff_digital > 0 ? '+' : ''}{formatCurrency(totals.diff_digital)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* PASSLINE IMPORT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* MEMBERS */}
              <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 md:p-6 border-b border-brand-border/50 bg-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <Users size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-brand-text uppercase tracking-widest">Members</h3>
                    </div>
                  </div>
                  {isActive && (
                    <div>
                      <input autoComplete="off" type="file" accept=".csv" ref={membersCsvRef} onChange={handleMembersCsv} className="hidden" />
                      <button 
                        onClick={() => membersCsvRef.current?.click()}
                        disabled={saving}
                        className="flex items-center gap-2 bg-brand-surface border border-brand-border hover:border-purple-400/50 px-4 py-2 rounded-xl text-[10px] font-bold text-brand-text tracking-widest uppercase transition-all cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin text-purple-400" /> : <Upload size={14} className="text-purple-400" />}
                        SUBIR CSV MEMBERS
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {membersData ? (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-transparent p-4 rounded-xl border border-brand-border/50">
                          <div className="text-[10px] uppercase text-brand-muted tracking-widest mb-1">Total Emitidos</div>
                          <div className="text-2xl font-mono text-brand-text">{membersData.total}</div>
                        </div>
                        <div className="bg-brand-success/10 p-4 rounded-xl border border-brand-success/30">
                          <div className="text-[10px] uppercase text-brand-success tracking-widest mb-1">Validados</div>
                          <div className="text-2xl font-mono text-brand-success">{membersData.validated}</div>
                        </div>
                        <div className="bg-brand-warning/10 p-4 rounded-xl border border-brand-warning/30">
                          <div className="text-[10px] uppercase text-brand-warning tracking-widest mb-1">No Show</div>
                          <div className="text-2xl font-mono text-brand-warning">{membersData.notValidated}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-brand-muted/50 text-xs italic text-center py-4">Sin datos de Members.</div>
                  )}
                </div>
              </div>

              {/* GENERAL */}
              <div className="bg-[#0A0A0A] border border-brand-border/50 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 md:p-6 border-b border-brand-border/50 bg-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Ticket size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-brand-text uppercase tracking-widest">Passline</h3>
                    </div>
                  </div>
                  {isActive && (
                    <div>
                      <input autoComplete="off" type="file" accept=".csv" ref={generalCsvRef} onChange={handleGeneralCsv} className="hidden" />
                      <button 
                        onClick={() => generalCsvRef.current?.click()}
                        disabled={saving}
                        className="flex items-center gap-2 bg-brand-surface border border-brand-border hover:border-blue-400/50 px-4 py-2 rounded-xl text-[10px] font-bold text-brand-text tracking-widest uppercase transition-all cursor-pointer disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin text-blue-400" /> : <Upload size={14} className="text-blue-400" />}
                        SUBIR CSV GENERAL
                      </button>
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-transparent border-b border-brand-border/50 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">
                        <th className="px-6 py-4">Tipo de Ticket</th>
                        <th className="px-6 py-4 text-right">Comprados</th>
                        <th className="px-6 py-4 text-right">Validados</th>
                        <th className="px-6 py-4 text-right">Total Facturado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border/30">
                      {generalData ? generalData.map((g, i) => (
                        <tr key={i} className="hover:bg-transparent transition-colors">
                          <td className="px-6 py-4 font-bold text-brand-text uppercase text-xs">{g.tipo}</td>
                          <td className="px-6 py-4 text-right font-mono text-brand-muted">{g.comprados}</td>
                          <td className="px-6 py-4 text-right font-mono text-brand-success">{g.validados}</td>
                          <td className="px-6 py-4 text-right font-mono text-brand-text">{formatCurrency(g.totalAmount)}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-brand-muted/50 text-xs italic">
                            Sin datos de Passline.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    {generalData && generalData.length > 0 && (
                      <tfoot className="bg-brand-surface border-t border-brand-border/50 font-mono">
                        <tr>
                          <td className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">TOTAL GENERAL</td>
                          <td className="px-6 py-4 text-right text-brand-text">{generalData.reduce((acc, curr) => acc + curr.comprados, 0)}</td>
                          <td className="px-6 py-4 text-right text-brand-text">{generalData.reduce((acc, curr) => acc + curr.validados, 0)}</td>
                          <td className="px-6 py-4 text-right text-brand-text font-bold">{formatCurrency(generalData.reduce((acc, curr) => acc + curr.totalAmount, 0))}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

            </div>

          </>
        )}
      </div>
    </div>
  );
}
