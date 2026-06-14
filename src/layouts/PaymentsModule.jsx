import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, DollarSign, Wallet, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function PaymentsModule() {
  const { canMutate } = useAuth();
  const hasMutateAccess = canMutate('payments');

  const [workDays, setWorkDays] = useState([]);
  const [selectedWorkDayId, setSelectedWorkDayId] = useState('');
  const [approvedCosts, setApprovedCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [slideOver, setSlideOver] = useState(null); // null | cost object
  const [form, setForm] = useState({ payment_method: 'digital', voucher_type: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');
  const [vouchers, setVouchers] = useState([]);

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchWorkDaysAndVouchers = async () => {
      try {
        // Fetch active voucher types
        const { data: vouchersData } = await supabase
          .from('voucher_types')
          .select('*')
          .eq('active', true)
          .order('name');
        
        if (isMounted) setVouchers(vouchersData || []);

        // Fetch only work days that are planned or active (or closed but still have unpaid costs)
        const { data } = await supabase
          .from('work_days')
          .select('*')
          .in('status', ['open', 'closed'])
          .order('work_date', { ascending: false });
        
        if (isMounted) {
          setWorkDays(data || []);
          if (data && data.length > 0) {
            setSelectedWorkDayId(data[0].id);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchWorkDaysAndVouchers();
    return () => { isMounted = false; };
  }, []);

  const fetchCosts = useCallback(async (silent = false) => {
    if (!selectedWorkDayId) return;
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from('opening_costs')
        .select(`*, suppliers ( name, tax_id, bank_name, bank_alias, contact_name, contact_phone )`)
        .eq('work_day_id', selectedWorkDayId)
        .in('status', ['approved', 'paid'])
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setApprovedCosts(data || []);
    } catch (err) {
      console.error('Error fetching costs:', err);
      triggerFlash('error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedWorkDayId]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!selectedWorkDayId) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('opening_costs')
          .select(`*, suppliers ( name, tax_id, bank_name, bank_alias, contact_name, contact_phone )`)
          .eq('work_day_id', selectedWorkDayId)
          .in('status', ['approved', 'paid'])
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        if (isMounted) setApprovedCosts(data || []);
      } catch (err) {
        console.error('Error fetching costs:', err);
        if (isMounted) triggerFlash('error');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [selectedWorkDayId]);

  const openPayment = (cost) => {
    setForm({ 
      payment_method: 'digital', 
      voucher_type: vouchers.length > 0 ? vouchers[0].code : '', 
      notes: '',
      amount: cost.amount
    });
    setSlideOver(cost);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        status: 'paid',
        amount: parseFloat(form.amount) || slideOver.amount,
        payment_method: form.payment_method || null,
        voucher_type: form.voucher_type || null,
        paid_at: new Date().toISOString(),
      };

      if (form.notes && form.notes.trim()) {
        payload.notes = slideOver.notes ? `${slideOver.notes} | Pago: ${form.notes.trim()}` : form.notes.trim();
      }

      const { error } = await supabase.from('opening_costs').update(sanitizePayload(payload)).eq('id', slideOver.id);
      if (error) throw error;

      triggerFlash('success');
      setSlideOver(null);
      fetchCosts(true);
    } catch (err) {
      console.error("Error saving payment:", err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = approvedCosts.reduce((sum, c) => sum + Number(c.amount), 0);
  const paidAmount = approvedCosts.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.amount), 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="h-full flex relative">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Actions & Title (Above Table) */}
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">
            PAGOS SEMANA
          </h2>

          <div className="flex items-center gap-6">
            <select
              value={selectedWorkDayId}
              onChange={(e) => setSelectedWorkDayId(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted hover:text-brand-text transition-colors focus:outline-none appearance-none cursor-pointer text-right"
            >
              {workDays.length === 0 ? <option value="">SIN JORNADAS</option> : null}
              {workDays.map(wd => (
                <option key={wd.id} value={wd.id} className="bg-brand-bg text-brand-text">
                  {dayjs(wd.work_date).format('DD/MM/YYYY')} - {wd.event_name || 'Regular'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table (Raw Data) */}
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">COSTO / PROVEEDOR</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">MONTO</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">MÉTODO / COMPROBANTE</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-28">ESTADO</th>
                {hasMutateAccess && (
                  <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-24">ACCIÓN</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={hasMutateAccess ? 5 : 4} className="text-center py-12 text-brand-muted text-xs uppercase tracking-widest">Cargando...</td></tr>
              ) : !selectedWorkDayId ? (
                <tr><td colSpan={hasMutateAccess ? 5 : 4} className="text-center py-12 text-brand-muted/50 text-xs italic">Seleccione una jornada.</td></tr>
              ) : approvedCosts.length === 0 ? (
                <tr><td colSpan={hasMutateAccess ? 5 : 4} className="text-center py-12 text-brand-muted/50 text-xs italic">No hay costos aprobados pendientes de pago.</td></tr>
              ) : approvedCosts.map((c) => (
                <tr key={c.id} className="border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-brand-text flex items-center gap-2">
                        <DollarSign size={12} className="text-brand-muted" /> {c.title}
                      </span>
                      <span className="text-[10px] text-brand-muted uppercase tracking-widest mt-1">
                        {c.suppliers?.name || 'SIN PROVEEDOR'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-brand-text text-sm">
                    ${Number(c.amount).toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {c.status === 'paid' ? (
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-brand-muted uppercase tracking-[0.2em] flex items-center gap-1">
                          <Wallet size={10} /> {c.payment_method}
                        </span>
                        <span className="text-[9px] text-brand-text uppercase tracking-widest mt-1">
                          {c.voucher_type?.replace('_', ' ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-brand-muted/50 italic">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center w-full">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          c.status === 'approved' ? 'bg-brand-warning shadow-[0_0_6px_rgba(250,204,21,0.5)]' : 
                          'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]'
                        }`}
                        title={c.status === 'approved' ? 'APROBADO (PENDIENTE)' : 'PAGADO'}
                      />
                    </div>
                  </td>
                  {hasMutateAccess && (
                    <td className="px-5 py-3.5 text-right">
                      {c.status === 'approved' ? (
                        <button 
                          onClick={() => openPayment(c)} 
                          className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer text-[10px] font-bold tracking-[0.2em] uppercase"
                        >
                          PAGAR
                        </button>
                      ) : (
                        <span className="text-brand-success flex justify-end">
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost KPI */}
        {selectedWorkDayId && approvedCosts.length > 0 && (
          <div className="mt-8 flex justify-end border-t border-brand-border/30 pt-4">
            <div className="flex items-center gap-12">
              <div className="text-right">
                <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-1">PAGADO</div>
                <div className="text-2xl font-mono font-bold text-blue-500">${paidAmount.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-1">PENDIENTE</div>
                <div className="text-2xl font-mono font-bold text-brand-warning">${pendingAmount.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-1">TOTAL A PAGAR</div>
                <div className="text-2xl font-mono font-bold text-brand-text">${totalAmount.toLocaleString()}</div>
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
                REGISTRAR PAGO
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 mt-4">
              
              <div className="mb-6">
                <div className="text-[9px] font-bold tracking-[0.3em] text-brand-muted uppercase mb-1">Costo Estimado</div>
                <div className="text-sm font-semibold text-brand-text mb-6">{slideOver.title}</div>
                
                <label className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-2">Monto Final a Pagar *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-warning font-mono">$</span>
                  <input autoComplete="off"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-warning/30 rounded-xl pl-8 pr-4 py-3 text-lg font-mono text-brand-warning focus:outline-none focus:border-brand-warning transition-colors"
                  />
                </div>
                <p className="text-[8px] text-brand-muted mt-2 uppercase tracking-widest">Podés ajustar el monto si difiere del original.</p>
              </div>

              {slideOver.suppliers && (
                <div className="mb-6">
                  <div className="text-[9px] font-bold tracking-[0.3em] text-brand-muted uppercase mb-3 flex items-center gap-2">
                    <FileText size={10} /> DATOS DEL PROVEEDOR
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-brand-border/30 pb-1">
                      <span className="text-[9px] uppercase tracking-widest text-brand-muted">Nombre</span>
                      <span className="text-[10px] font-semibold text-brand-text">{slideOver.suppliers.name}</span>
                    </div>
                    {slideOver.suppliers.bank_name && (
                      <div className="flex justify-between border-b border-brand-border/30 pb-1">
                        <span className="text-[9px] uppercase tracking-widest text-brand-muted">Banco</span>
                        <span className="text-[10px] font-mono text-brand-text">{slideOver.suppliers.bank_name}</span>
                      </div>
                    )}
                    {slideOver.suppliers.tax_id && (
                      <div className="flex justify-between border-b border-brand-border/30 pb-1">
                        <span className="text-[9px] uppercase tracking-widest text-brand-muted">CUIT/CUIL</span>
                        <span className="text-[10px] font-mono text-brand-text">{slideOver.suppliers.tax_id}</span>
                      </div>
                    )}
                    {slideOver.suppliers.bank_alias && (
                      <div className="flex justify-between border-b border-brand-border/30 pb-1">
                        <span className="text-[9px] uppercase tracking-widest text-brand-muted">CBU / Alias</span>
                        <span className="text-[10px] font-mono text-brand-success">{slideOver.suppliers.bank_alias}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-2">Método de Pago *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setForm({ ...form, payment_method: 'digital' })}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 border text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                      form.payment_method === 'digital' 
                        ? 'bg-brand-surface border-brand-text text-brand-text' 
                        : 'bg-transparent border-brand-border/50 text-brand-muted hover:border-brand-muted'
                    }`}
                  >
                    <Wallet size={12} /> Digital
                  </button>
                  <button
                    onClick={() => setForm({ ...form, payment_method: 'efectivo' })}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 border text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                      form.payment_method === 'efectivo' 
                        ? 'bg-brand-surface border-brand-text text-brand-text' 
                        : 'bg-transparent border-brand-border/50 text-brand-muted hover:border-brand-muted'
                    }`}
                  >
                    <DollarSign size={12} /> Efectivo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-2">Tipo de Comprobante *</label>
                <select
                  value={form.voucher_type}
                  onChange={(e) => setForm({ ...form, voucher_type: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none cursor-pointer"
                >
                  {vouchers.length === 0 && <option value="" className="bg-brand-bg text-brand-text">Sin comprobantes configurados</option>}
                  {vouchers.map(v => (
                    <option key={v.id} value={v.code} className="bg-brand-bg text-brand-text">{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-2">Notas de Pago</label>
                <input autoComplete="off"
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Ref. de transferencia, etc."
                />
              </div>

            </div>

            <div className="px-6 py-4 border-t border-brand-border shrink-0 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-text text-brand-bg rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                {saving ? 'PROCESANDO...' : 'CONFIRMAR PAGO'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
