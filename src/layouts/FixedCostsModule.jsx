import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, Pencil, DollarSign, CheckCircle2, Trash2, Loader2, Calendar } from 'lucide-react';
import dayjs from 'dayjs';

export default function FixedCostsModule({ onNavigate }) {
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
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

  // Generar lista de meses (ultimos 6 meses y proximos 2)
  useEffect(() => {
    const generateMonths = () => {
      const generated = [];
      let current = dayjs().subtract(6, 'month');
      for (let i = 0; i < 9; i++) {
        generated.push(current.format('YYYY-MM'));
        current = current.add(1, 'month');
      }
      setMonths(generated.reverse());
      setSelectedMonth(dayjs().format('YYYY-MM'));
    };
    generateMonths();
  }, []);

  const fetchInit = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('suppliers').select('id, name').eq('active', true).order('name');
      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  }, []);

  useEffect(() => {
    fetchInit();
  }, [fetchInit]);

  // Fetch costs when month changes
  const fetchCosts = useCallback(async () => {
    if (!selectedMonth) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('monthly_fixed_costs')
        .select(`*, suppliers ( name )`)
        .eq('billing_month', selectedMonth)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setCosts(data || []);
    } catch (err) {
      console.error('Error fetching costs:', err);
      triggerFlash('error');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  const openCreate = () => {
    if (!selectedMonth) return;
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
        billing_month: selectedMonth,
        title: form.title.trim(),
        supplier_id: form.supplier_id || null,
        amount: parseFloat(form.amount) || 0,
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('monthly_fixed_costs').insert({ ...payload, status: 'pending' });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('monthly_fixed_costs').update(payload).eq('id', slideOver.id);
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
    if (!window.confirm('¿Eliminar este costo fijo mensual?')) return;
    try {
      const { error } = await supabase.from('monthly_fixed_costs').delete().eq('id', id);
      if (error) throw error;
      triggerFlash('success');
      fetchCosts();
    } catch (err) {
      console.error('Error deleting cost:', err);
      triggerFlash('error');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      const { error } = await supabase.from('monthly_fixed_costs').update({ status: 'paid' }).eq('id', id);
      if (error) throw error;
      triggerFlash('success');
      fetchCosts();
    } catch (err) {
      console.error('Error updating cost status:', err);
      triggerFlash('error');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);
  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    const date = new Date(y, parseInt(m) - 1);
    return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(date).toUpperCase();
  };

  const totalAmount = costs.reduce((sum, c) => sum + Number(c.amount), 0);
  const paidAmount = costs.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingAmount = totalAmount - paidAmount;

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
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-brand-muted">ESTRUCTURA Y OVERHEADS</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">Costos Fijos Mensuales</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-xs font-bold text-brand-text focus:outline-none appearance-none cursor-pointer uppercase tracking-wider min-w-[200px]"
            >
              {months.map(m => (
                <option key={m} value={m}>{formatMonth(m)}</option>
              ))}
            </select>

            <button
              onClick={openCreate}
              disabled={!selectedMonth}
              className="flex items-center gap-2 bg-brand-surface border border-brand-border text-brand-text px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-brand-muted transition-colors disabled:opacity-30 cursor-pointer"
            >
              <Plus size={13} />
              NUEVO GASTO FIJO
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden mb-6">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg/50">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">CONCEPTO / SERVICIO</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">PROVEEDOR</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">MONTO</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-28">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted text-xs uppercase tracking-widest">Cargando...</td></tr>
              ) : !selectedMonth ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted/50 text-xs italic">Seleccione un mes para ver los costos.</td></tr>
              ) : costs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted/50 text-xs uppercase tracking-widest">NO HAY COSTOS REGISTRADOS ESTE MES.</td></tr>
              ) : costs.map((c) => (
                <tr key={c.id} className="hover:bg-brand-card/50 transition-colors group">
                  <td className="px-5 py-4 text-sm font-semibold text-brand-text">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-brand-muted/50" />
                      {c.title}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-brand-muted">
                    {c.suppliers?.name ? (
                      <span className="bg-brand-border/30 px-2 py-1 rounded text-brand-text">{c.suppliers.name}</span>
                    ) : (
                      <span className="text-brand-muted/50">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-mono text-right text-brand-text">
                    {formatCurrency(c.amount)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold tracking-[0.2em] uppercase ${
                      c.status === 'pending' ? 'bg-brand-warning/20 text-brand-warning' : 
                      'bg-brand-success/20 text-brand-success'
                    }`}>
                      {c.status === 'pending' ? 'PENDIENTE' : 'PAGADO'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {c.status === 'pending' && (
                      <button onClick={() => handleMarkPaid(c.id)} className="text-brand-success/70 hover:text-brand-success transition-colors cursor-pointer p-1" title="Marcar como Pagado">
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    <button onClick={() => openEdit(c)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer p-1">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-brand-error/50 hover:text-brand-error transition-colors cursor-pointer p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost KPI Grid */}
        {selectedMonth && costs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-brand-surface border border-brand-border rounded-xl px-6 py-5">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">TOTAL ESTRUCTURA</div>
              <div className="text-2xl font-mono font-bold text-brand-text">{formatCurrency(totalAmount)}</div>
            </div>
            <div className="bg-brand-surface border border-brand-border rounded-xl px-6 py-5">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">PAGADO</div>
              <div className="text-2xl font-mono font-bold text-brand-success">{formatCurrency(paidAmount)}</div>
            </div>
            <div className="bg-brand-surface border border-brand-border rounded-xl px-6 py-5 relative overflow-hidden">
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">PENDIENTE (PASIVO)</div>
              <div className={`text-2xl font-mono font-bold ${pendingAmount > 0 ? 'text-brand-warning' : 'text-brand-muted'}`}>
                {formatCurrency(pendingAmount)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-Over Panel */}
      {slideOver && (
        <>
          <div className="absolute inset-0 bg-black/30 z-40" onClick={() => setSlideOver(null)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-brand-bg border-l border-brand-border z-50 flex flex-col animate-slide-in">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border shrink-0 bg-brand-surface">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-muted">
                {slideOver === 'create' ? 'NUEVO GASTO ESTRUCTURAL' : 'EDITAR GASTO FIJO'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Servicio / Concepto *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Ej: Alquiler, Edenor, Telecentro..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Monto Fijo</label>
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
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Proveedor Asociado (Opcional)</label>
                <select
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                >
                  <option value="">-- Sin proveedor específico --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-brand-border shrink-0 bg-brand-surface">
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="w-full flex items-center justify-center gap-2 bg-brand-text text-brand-bg rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? 'GUARDANDO...' : 'GUARDAR COSTO FIJO'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
