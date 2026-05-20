import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, DollarSign, Wallet, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function PaymentsModule({ onNavigate }) {
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
    const fetchWorkDaysAndVouchers = async () => {
      // Fetch active voucher types
      const { data: vouchersData } = await supabase
        .from('voucher_types')
        .select('*')
        .eq('active', true)
        .order('name');
      setVouchers(vouchersData || []);

      // Fetch only work days that are planned or active (or closed but still have unpaid costs)
      const { data } = await supabase
        .from('work_days')
        .select('*')
        .in('status', ['open', 'closed'])
        .order('work_date', { ascending: false });
      
      setWorkDays(data || []);
      if (data && data.length > 0) {
        setSelectedWorkDayId(data[0].id);
      } else {
        setLoading(false);
      }
    };
    fetchWorkDaysAndVouchers();
  }, []);

  const fetchCosts = useCallback(async () => {
    if (!selectedWorkDayId) return;
    setLoading(true);
    // Fetch both open and closed so we can see what's done and what's pending
    const { data } = await supabase
      .from('opening_costs')
      .select(`*, suppliers ( name, tax_id, bank_name, bank_alias, contact_name, contact_phone )`)
      .eq('work_day_id', selectedWorkDayId)
      .in('status', ['approved', 'paid'])
      .order('created_at', { ascending: true });
    
    setApprovedCosts(data || []);
    setLoading(false);
  }, [selectedWorkDayId]);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

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

      const { error } = await supabase.from('opening_costs').update(payload).eq('id', slideOver.id);

      if (error) throw error;

      triggerFlash('success');
      setSlideOver(null);
      fetchCosts();
    } catch (err) {
      console.error("Error saving payment:", err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

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
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-brand-muted">PAGOS (CONTADOR)</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">Ejecución y registro de pagos operativos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedWorkDayId}
              onChange={(e) => setSelectedWorkDayId(e.target.value)}
              className="bg-brand-surface border border-brand-border rounded-xl px-4 py-2 text-xs font-bold text-brand-text focus:outline-none appearance-none cursor-pointer uppercase tracking-wider"
            >
              {workDays.length === 0 ? <option value="">SIN JORNADAS</option> : null}
              {workDays.map(wd => (
                <option key={wd.id} value={wd.id}>
                  {dayjs(wd.work_date).format('DD/MM/YYYY')} - {wd.event_name || 'Regular'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">COSTO / PROVEEDOR</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">MONTO</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">MÉTODO / COMPROBANTE</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-28">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-24">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
              ) : !selectedWorkDayId ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted/50 text-xs italic">Seleccione una jornada.</td></tr>
              ) : approvedCosts.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted/50 text-xs italic">No hay costos aprobados pendientes de pago.</td></tr>
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
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold tracking-[0.2em] uppercase ${
                      c.status === 'approved' ? 'bg-brand-warning/20 text-brand-warning' : 
                      'bg-brand-success/20 text-brand-success'
                    }`}>
                      {c.status === 'approved' ? 'APROBADO' : 'PAGADO'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {c.status === 'approved' ? (
                      <button 
                        onClick={() => openPayment(c)} 
                        className="bg-brand-text text-brand-bg px-3 py-1.5 rounded uppercase text-[10px] font-bold tracking-widest hover:bg-white transition-colors cursor-pointer"
                      >
                        PAGAR
                      </button>
                    ) : (
                      <span className="text-brand-success flex justify-end">
                        <CheckCircle2 size={16} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Panel */}
      {slideOver && (
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

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="bg-brand-surface border border-brand-border p-4 rounded-xl mb-6">
                <div className="text-[10px] font-bold tracking-[0.2em] text-brand-muted uppercase mb-1">Costo Estimado / Original</div>
                <div className="text-sm font-semibold text-brand-text mb-4">{slideOver.title}</div>
                
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Monto Final a Pagar *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-warning/30 rounded-xl pl-8 pr-4 py-3 text-lg font-mono text-brand-warning focus:outline-none focus:border-brand-warning transition-colors"
                  />
                </div>
                <p className="text-[9px] text-brand-muted mt-2">Podés ajustar el monto si la factura final incluye impuestos, envíos u otros cargos.</p>
              </div>

              {slideOver.suppliers && (
                <div className="bg-brand-surface border border-brand-border p-4 rounded-xl mb-6">
                  <div className="text-[10px] font-bold tracking-[0.2em] text-brand-muted uppercase mb-3 flex items-center gap-2">
                    <FileText size={12} /> DATOS DEL PROVEEDOR
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-brand-border/30 pb-2">
                      <span className="text-[10px] uppercase tracking-widest text-brand-muted">Nombre</span>
                      <span className="text-xs font-semibold text-brand-text">{slideOver.suppliers.name}</span>
                    </div>
                    {slideOver.suppliers.bank_name && (
                      <div className="flex justify-between border-b border-brand-border/30 pb-2">
                        <span className="text-[10px] uppercase tracking-widest text-brand-muted">Banco</span>
                        <span className="text-xs font-mono text-brand-text">{slideOver.suppliers.bank_name}</span>
                      </div>
                    )}
                    {slideOver.suppliers.tax_id && (
                      <div className="flex justify-between border-b border-brand-border/30 pb-2">
                        <span className="text-[10px] uppercase tracking-widest text-brand-muted">CUIT/CUIL</span>
                        <span className="text-xs font-mono text-brand-text">{slideOver.suppliers.tax_id}</span>
                      </div>
                    )}
                    {slideOver.suppliers.bank_alias && (
                      <div className="flex justify-between border-b border-brand-border/30 pb-2">
                        <span className="text-[10px] uppercase tracking-widest text-brand-muted">CBU / Alias</span>
                        <span className="text-xs font-mono text-brand-success">{slideOver.suppliers.bank_alias}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Método de Pago *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setForm({ ...form, payment_method: 'digital' })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-colors ${
                      form.payment_method === 'digital' 
                        ? 'border-brand-text text-brand-text bg-brand-surface' 
                        : 'border-brand-border text-brand-muted hover:border-brand-muted'
                    }`}
                  >
                    <Wallet size={14} /> Digital
                  </button>
                  <button
                    onClick={() => setForm({ ...form, payment_method: 'efectivo' })}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-colors ${
                      form.payment_method === 'efectivo' 
                        ? 'border-brand-text text-brand-text bg-brand-surface' 
                        : 'border-brand-border text-brand-muted hover:border-brand-muted'
                    }`}
                  >
                    <DollarSign size={14} /> Efectivo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Tipo de Comprobante *</label>
                <select
                  value={form.voucher_type}
                  onChange={(e) => setForm({ ...form, voucher_type: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                >
                  {vouchers.length === 0 && <option value="">Sin comprobantes configurados</option>}
                  {vouchers.map(v => (
                    <option key={v.id} value={v.code}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Notas de Pago</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Referencia de transferencia, etc."
                />
              </div>

            </div>

            <div className="px-6 py-4 border-t border-brand-border shrink-0">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-brand-warning text-brand-bg rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-yellow-400 transition-colors disabled:opacity-30 cursor-pointer"
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
