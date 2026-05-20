import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, Pencil, DollarSign, CheckCircle2, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function OpeningCostsModule({ onNavigate }) {
  const [workDays, setWorkDays] = useState([]);
  const [selectedWorkDayId, setSelectedWorkDayId] = useState('');
  const [costs, setCosts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | cost object
  const [form, setForm] = useState({ title: '', supplier_id: '', amount: '0' });
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  // Initial fetch of draft/planned work days
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [wdRes, supRes] = await Promise.all([
          supabase.from('work_days').select('*').in('status', ['open', 'closed']).order('work_date', { ascending: true }),
          supabase.from('suppliers').select('id, name').eq('active', true).order('name')
        ]);
        
        if (wdRes.error) throw wdRes.error;
        if (supRes.error) throw supRes.error;

        setWorkDays(wdRes.data || []);
        setSuppliers(supRes.data || []);
        
        if (wdRes.data && wdRes.data.length > 0) {
          setSelectedWorkDayId(wdRes.data[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in fetchInit:', err);
        setLoading(false);
      }
    };
    fetchInit();
  }, []);

  // Fetch costs when work day changes
  const fetchCosts = useCallback(async () => {
    if (!selectedWorkDayId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('opening_costs')
        .select(`*, suppliers ( name )`)
        .eq('work_day_id', selectedWorkDayId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setCosts(data || []);
    } catch (err) {
      console.error('Error fetching costs:', err);
      triggerFlash('error');
    } finally {
      setLoading(false);
    }
  }, [selectedWorkDayId]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  const openCreate = () => {
    if (!selectedWorkDayId) return;
    setForm({ title: '', supplier_id: '', amount: '0' });
    setSlideOver('create');
  };

  const openEdit = (c) => {
    setForm({ 
      title: c.title, 
      supplier_id: c.supplier_id || '', 
      amount: c.amount.toString()
    });
    setSlideOver(c);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    try {
      setSaving(true);
      const payload = {
        work_day_id: selectedWorkDayId,
        title: form.title.trim() || null,
        supplier_id: form.supplier_id || null,
        amount: parseFloat(form.amount) || 0,
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('opening_costs').insert({ ...payload, status: 'draft' });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('opening_costs').update(payload).eq('id', slideOver.id);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(null);
      fetchCosts();
    } catch (err) {
      console.error('Error saving cost:', err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este costo?')) return;
    try {
      const { error } = await supabase.from('opening_costs').delete().eq('id', id);
      if (error) throw error;
      triggerFlash('success');
      fetchCosts();
    } catch (err) {
      console.error('Error deleting cost:', err);
      triggerFlash('error');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('¿Aprobar este costo para pago?')) return;
    try {
      const { error } = await supabase.from('opening_costs').update({ status: 'approved' }).eq('id', id);
      if (error) throw error;
      triggerFlash('success');
      fetchCosts();
    } catch (err) {
      console.error('Error approving cost:', err);
      triggerFlash('error');
    }
  };

  const handleApproveAll = async () => {
    if (!window.confirm('¿Aprobar TODOS los costos pendientes para pago?')) return;
    try {
      const draftIds = costs.filter(c => c.status === 'draft').map(c => c.id);
      if (draftIds.length === 0) return;

      const { error } = await supabase.from('opening_costs').update({ status: 'approved' }).in('id', draftIds);
      if (error) throw error;
      triggerFlash('success');
      fetchCosts();
    } catch (err) {
      console.error('Error approving all costs:', err);
      triggerFlash('error');
    }
  };



  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  const totalAmount = costs.reduce((sum, c) => sum + Number(c.amount), 0);
  const isClosed = selectedWorkDayId ? workDays.find(wd => wd.id === selectedWorkDayId)?.status === 'closed' : true;

  return (
    <div className="h-full flex relative">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('index')} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-brand-muted">COSTOS DE APERTURA</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">Planificación operativa</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Work Day Selector */}
            <select
              value={selectedWorkDayId}
              onChange={(e) => setSelectedWorkDayId(e.target.value)}
              className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-xs font-bold text-brand-text focus:outline-none appearance-none cursor-pointer uppercase tracking-wider"
            >
              {workDays.length === 0 ? <option value="">SIN JORNADAS ACTIVAS</option> : null}
              {workDays.map(wd => (
                <option key={wd.id} value={wd.id}>
                  {dayjs(wd.work_date).format('DD/MM/YYYY')} - {wd.event_name || 'Regular'}
                </option>
              ))}
            </select>

            <button
              onClick={handleApproveAll}
              disabled={!selectedWorkDayId || isClosed || costs.filter(c => c.status === 'draft').length === 0}
              className="flex items-center gap-2 bg-brand-success/10 border border-brand-success/30 text-brand-success px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-success/20 hover:border-brand-success/50 transition-colors disabled:opacity-30 disabled:hover:bg-brand-success/10 disabled:hover:border-brand-success/30 cursor-pointer"
            >
              <CheckCircle2 size={13} />
              APROBAR TODO
            </button>

            <button
              onClick={openCreate}
              disabled={!selectedWorkDayId || isClosed}
              className="flex items-center gap-2 bg-brand-surface border border-brand-border text-brand-text px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-brand-muted transition-colors disabled:opacity-30 cursor-pointer"
            >
              <Plus size={13} />
              AD-HOC
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">CONCEPTO</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">PROVEEDOR</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">MONTO</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-28">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
              ) : !selectedWorkDayId ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted/50 text-xs italic">Seleccione una jornada para ver los costos.</td></tr>
              ) : costs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted/50 text-xs italic">No hay costos registrados.</td></tr>
              ) : costs.map((c) => (
                <tr key={c.id} className="border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-brand-text">
                    <div className="flex items-center gap-2">
                      {c.template_id ? <DollarSign size={12} className="text-brand-muted/50" /> : <AlertCircle size={12} className="text-brand-warning" title="Ad-Hoc" />}
                      {c.title}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-brand-muted">
                    {c.suppliers?.name ? (
                      <span className="bg-brand-border/30 px-2 py-1 rounded text-brand-text">{c.suppliers.name}</span>
                    ) : (
                      <span className="text-brand-muted/50">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-right text-brand-text">
                    {formatCurrency(c.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold tracking-[0.2em] uppercase ${
                      c.status === 'draft' ? 'bg-brand-warning/20 text-brand-warning' : 
                      c.status === 'approved' ? 'bg-brand-success/20 text-brand-success' : 
                      c.status === 'paid' ? 'bg-blue-500/20 text-blue-500' : 
                      'bg-brand-muted/20 text-brand-text'
                    }`}>
                      {c.status === 'draft' ? 'PENDIENTE' : c.status === 'approved' ? 'APROBADO' : c.status === 'paid' ? 'PAGADO' : c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right flex justify-end gap-2">
                    {!isClosed && (
                      <>
                        {c.status === 'draft' && (
                          <button onClick={() => handleApprove(c.id)} className="text-brand-success/70 hover:text-brand-success transition-colors cursor-pointer p-1" title="Aprobar Costo">
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                        <button onClick={() => openEdit(c)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer p-1">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-brand-error/50 hover:text-brand-error transition-colors cursor-pointer p-1">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost KPI */}
        {selectedWorkDayId && costs.length > 0 && (
          <div className="mt-6 flex justify-end">
            <div className="bg-brand-surface border border-brand-border rounded-xl px-6 py-4 flex items-center gap-5">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand-muted">TOTAL APERTURA</span>
              <span className="text-xl font-mono font-bold text-brand-text">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Slide-Over Panel */}
      {slideOver && (
        <>
          <div className="absolute inset-0 bg-black/30 z-40" onClick={() => setSlideOver(null)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-brand-bg border-l border-brand-border z-50 flex flex-col animate-slide-in">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border shrink-0">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-muted">
                {slideOver === 'create' ? 'NUEVO COSTO AD-HOC' : 'EDITAR COSTO'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Concepto *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Ej: Flete adicional..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Monto</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-mono">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl pl-8 pr-4 py-3 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Proveedor</label>
                <select
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                >
                  <option value="">-- Sin proveedor fijo --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-border shrink-0">
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="w-full flex items-center justify-center gap-2 bg-brand-text text-brand-bg rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? 'GUARDANDO...' : 'GUARDAR COSTO'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
