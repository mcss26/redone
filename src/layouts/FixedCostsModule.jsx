import React, { useRef,  useState, useEffect, useCallback  } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, Pencil, Calendar, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { sanitizePayload } from '../lib/sanitizer';

export default function FixedCostsModule() {
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const { canMutate } = useAuth();
  const hasMutateAccess = canMutate('fixed_costs');

  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [costs, setCosts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | cost object
  const [slideOverType, setSlideOverType] = useState(null); // 'create' | 'edit' | 'pay'
  const [form, setForm] = useState({ title: '', supplier_id: '', amount: '0', payment_method: 'digital', voucher_type: '' });
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    supabase.from('voucher_types').select('*').eq('active', true).order('name')
      .then(({data}) => setVouchers(data || []));
  }, []);

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  // Generar lista de meses
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

  // Fetch initial suppliers
  useEffect(() => {
    let isMounted = true;
    const fetchInit = async () => {
      try {
        const { data, error } = await supabase.from('suppliers').select('id, name').eq('active', true).order('name');
        if (error) throw error;
        if (isMounted) setSuppliers(data || []);
      } catch (err) {
        console.error('Error fetching suppliers:', err);
      }
    };
    fetchInit();
    return () => { isMounted = false; };
  }, []);

  // Fetch costs when month changes
  const fetchCosts = useCallback(async (silent = false) => {
    if (!selectedMonth) return;
    try {
      if (!silent) setIsFetchingBackground(true);
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
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      if (!silent) (setIsFetchingBackground(false), setLoading(false));
    }
  }, [selectedMonth]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!selectedMonth) return;
      try {
        setIsFetchingBackground(true);
        const { data, error } = await supabase
          .from('monthly_fixed_costs')
          .select(`*, suppliers ( name )`)
          .eq('billing_month', selectedMonth)
          .order('created_at', { ascending: true });
        if (error) throw error;
        
        // Auto-poblado silencioso
        if (data.length === 0) {
          const { data: masters } = await supabase.from('fixed_cost_templates').select('*').eq('active', true);
          if (masters && masters.length > 0) {
            const payload = masters.map(m => ({
              billing_month: selectedMonth,
              title: m.title,
              amount: m.default_amount,
              supplier_id: m.supplier_id,
              status: 'pending'
            }));
            const { error: insertError } = await supabase.from('monthly_fixed_costs').insert(sanitizePayload(payload));
            
            if (!insertError) {
              const { data: refetched } = await supabase
                .from('monthly_fixed_costs')
                .select(`*, suppliers ( name )`)
                .eq('billing_month', selectedMonth)
                .order('created_at', { ascending: true });
              if (isMounted) setCosts(refetched || []);
              return;
            }
          }
        }
        
        if (isMounted) setCosts(data || []);
      } catch (err) {
        console.error('Error fetching costs:', err);
        if (isMounted) triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
      } finally {
        if (isMounted) (setIsFetchingBackground(false), setLoading(false));
      }
    };
    load();
    return () => { isMounted = false; };
  }, [selectedMonth]);

  const openCreate = () => {
    if (!selectedMonth) return;
    setForm({ title: '', supplier_id: '', amount: '0', payment_method: 'digital', voucher_type: '' });
    setSlideOver('create');
    setSlideOverType('create');
  };

  const openEdit = (c) => {
    setForm({ 
      title: c.title, 
      supplier_id: c.supplier_id || '', 
      amount: c.amount.toString(),
      payment_method: 'digital',
      voucher_type: ''
    });
    setSlideOver(c);
    setSlideOverType('edit');
  };

  const handleSave = async () => {
    if (slideOverType === 'pay') {
      try {
        setSaving(true);
        const payload = {
          status: 'paid',
          payment_method: form.payment_method || null,
          voucher_type: form.voucher_type || null,
          paid_at: new Date().toISOString()
        };
        const { error } = await supabase.from('monthly_fixed_costs').update(sanitizePayload(payload)).eq('id', slideOver.id);
        if (error) throw error;
        triggerFlash('success');
        setSlideOver(null);
        setSlideOverType(null);
        fetchCosts(true);
      } catch (err) {
        console.error('Error saving payment:', err);
        triggerFlash('error');
        window.UI?.toast?.(err.message || "Error al procesar", 'danger');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!form.title.trim()) return;
    try {
      setSaving(true);
      const payload = {
        billing_month: selectedMonth,
        title: form.title.trim(),
        supplier_id: form.supplier_id || null,
        amount: parseFloat(form.amount) || 0,
      };

      if (slideOverType === 'create') {
        const { error } = await supabase.from('monthly_fixed_costs').insert(sanitizePayload({ ...payload, status: 'pending' }));
        if (error) throw error;
      } else {
        const { error } = await supabase.from('monthly_fixed_costs').update(sanitizePayload(payload)).eq('id', slideOver.id);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(null);
      setSlideOverType(null);
      fetchCosts(true);
    } catch (err) {
      console.error('Error saving cost:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await window.UI.confirm('¿Eliminar este costo fijo mensual?'))) return;
    try {
      const { error } = await supabase.from('monthly_fixed_costs').delete().eq('id', id);
      if (error) throw error;
      triggerFlash('success');
      fetchCosts(true);
    } catch (err) {
      console.error('Error deleting cost:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    }
  };

  const handleMarkPaid = (c) => {
    setForm({ 
      title: c.title,
      supplier_id: c.supplier_id || '',
      amount: c.amount.toString(),
      payment_method: 'digital',
      voucher_type: vouchers.length > 0 ? vouchers[0].code : ''
    });
    setSlideOver(c);
    setSlideOverType('pay');
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

      <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Actions & Title (Above Table) */}
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">
            PAGOS MES
          </h2>
          
          <div className="flex items-center gap-6">
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted hover:text-brand-text transition-colors focus:outline-none appearance-none cursor-pointer text-right"
            >
              {months.map(m => (
                <option key={m} value={m} className="bg-brand-bg text-brand-text">{formatMonth(m)}</option>
              ))}
            </select>

            {hasMutateAccess && (
              <button
                onClick={openCreate}
                disabled={!selectedMonth}
                className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer flex items-center justify-end gap-2 text-[10px] font-bold tracking-[0.2em] uppercase disabled:opacity-30"
              >
                + NUEVO GASTO FIJO
              </button>
            )}
          </div>
        </div>

        {/* Table (Raw Data) */}
        <div className="mb-6">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">CONCEPTO / SERVICIO</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">PROVEEDOR</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">MONTO</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-24">ESTADO</th>
                {hasMutateAccess && (
                  <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-20"></th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={hasMutateAccess ? 5 : 4} className="text-center py-12 text-brand-muted text-xs uppercase tracking-widest">Cargando...</td></tr>
              ) : !selectedMonth ? (
                <tr><td colSpan={hasMutateAccess ? 5 : 4} className="text-center py-12 text-brand-muted/50 text-xs italic">Seleccione un mes para ver los costos.</td></tr>
              ) : costs.length === 0 ? (
                <tr><td colSpan={hasMutateAccess ? 5 : 4} className="text-center py-12 text-brand-muted/50 text-xs uppercase tracking-widest">NO HAY COSTOS REGISTRADOS ESTE MES.</td></tr>
              ) : costs.map((c) => (
                <tr key={c.id} className="border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-brand-text">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-brand-muted/50" />
                      {c.title}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-brand-muted">
                    {c.suppliers?.name ? (
                      <span>{c.suppliers.name}</span>
                    ) : (
                      <span className="text-brand-muted/50">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-right text-brand-text">
                    {formatCurrency(c.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex justify-center">
                      <div 
                        className={`w-2 h-2 rounded-full ${c.status === 'pending' ? 'bg-brand-warning shadow-[0_0_6px_rgba(250,204,21,0.5)]' : 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]'}`}
                        title={c.status === 'pending' ? 'PENDIENTE' : 'PAGADO'}
                      />
                    </div>
                  </td>
                  {hasMutateAccess && (
                    <td className="px-5 py-2 text-right">
                      <div className="flex items-center justify-end">
                        {c.status === 'pending' && (
                          <button onClick={() => handleMarkPaid(c)} className="text-brand-success/70 hover:text-brand-success transition-colors cursor-pointer p-3 min-w-[44px] min-h-[44px] flex items-center justify-center" title="Marcar como Pagado">
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        <button onClick={() => openEdit(c)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer p-3 min-w-[44px] min-h-[44px] flex items-center justify-center" title="Editar Costo">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="text-brand-error/50 hover:text-brand-error transition-colors cursor-pointer p-3 min-w-[44px] min-h-[44px] flex items-center justify-center" title="Eliminar Costo">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost KPI Grid (Flattened) */}
        {selectedMonth && costs.length > 0 && (
          <div className="mt-8 flex justify-end border-t border-brand-border/30 pt-4">
            <div className="flex items-center gap-12">
              <div className="text-right">
                <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-1">PAGADO</div>
                <div className="text-2xl font-mono font-bold text-blue-500">{formatCurrency(paidAmount)}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-1">PENDIENTE (PASIVO)</div>
                <div className={`text-2xl font-mono font-bold ${pendingAmount > 0 ? 'text-brand-warning' : 'text-brand-muted'}`}>
                  {formatCurrency(pendingAmount)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-1">TOTAL ESTRUCTURA</div>
                <div className="text-2xl font-mono font-bold text-brand-text">{formatCurrency(totalAmount)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-Over Panel */}
      {slideOver && hasMutateAccess && (
        <>
          <div className="absolute inset-0 bg-black/30 z-40" onClick={() => setSlideOver(null)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-brand-bg border-l border-brand-border z-50 flex flex-col animate-slide-in">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border shrink-0">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-muted">
                {slideOver === 'create' ? 'NUEVO GASTO ESTRUCTURAL' : 'EDITAR GASTO FIJO'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto p-6 space-y-8 mt-4 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
              {slideOverType === 'pay' ? (
                <>
                  <div className="mb-6">
                    <div className="text-[9px] font-bold tracking-[0.3em] text-brand-muted uppercase mb-1">Costo Estimado</div>
                    <div className="text-sm font-semibold text-brand-text mb-6">{slideOver.title}</div>
                    
                    <div className="text-[9px] font-bold tracking-[0.3em] text-brand-muted uppercase mb-1">Monto a Pagar</div>
                    <div className="text-2xl font-mono text-brand-warning mb-6">${Number(form.amount).toLocaleString()}</div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-2">Método *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setForm({ ...form, payment_method: 'digital' })}
                        className={`flex items-center justify-center gap-2 rounded-xl py-3 border text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                          form.payment_method === 'digital' 
                            ? 'bg-brand-surface border-brand-text text-brand-text' 
                            : 'bg-transparent border-brand-border/50 text-brand-muted hover:border-brand-muted'
                        }`}
                      >
                        Digital
                      </button>
                      <button
                        onClick={() => setForm({ ...form, payment_method: 'efectivo' })}
                        className={`flex items-center justify-center gap-2 rounded-xl py-3 border text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                          form.payment_method === 'efectivo' 
                            ? 'bg-brand-surface border-brand-text text-brand-text' 
                            : 'bg-transparent border-brand-border/50 text-brand-muted hover:border-brand-muted'
                        }`}
                      >
                        Efectivo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-2">Comprobante</label>
                    <select
                      value={form.voucher_type}
                      onChange={(e) => setForm({ ...form, voucher_type: e.target.value })}
                      className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-brand-bg text-brand-text">SIN DETALLE</option>
                      {vouchers.map(v => (
                        <option key={v.id} value={v.code} className="bg-brand-bg text-brand-text">{v.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Concepto *</label>
                    <input id="fc_title" autoComplete="off"
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                      placeholder="Ej: Alquiler, Edenor..."
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Monto</label>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-muted font-mono">$</span>
                      <input id="fc_amount" autoComplete="off"
                        type="number"
                        min="0"
                        step="100"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        className="w-full bg-transparent border-b border-brand-border/50 pl-4 pr-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Proveedor</label>
                    <select id="fc_supplier"
                      value={form.supplier_id}
                      onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                      className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-brand-bg text-brand-text">-- Sin proveedor --</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id} className="bg-brand-bg text-brand-text">{s.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-brand-border shrink-0 flex">
              <button
                onClick={handleSave}
                disabled={saving || (slideOverType !== 'pay' && !form.title.trim())}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-text text-brand-bg py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : (slideOverType === 'pay' ? <CheckCircle2 size={13} /> : <Save size={13} />)}
                {saving ? 'PROCESANDO...' : (slideOverType === 'pay' ? 'CONFIRMAR PAGO' : 'GUARDAR COSTO FIJO')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
