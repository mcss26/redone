import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, Pencil, Package, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function StockRequestsModule({ onNavigate }) {
  const [workDays, setWorkDays] = useState([]);
  const [selectedWorkDayId, setSelectedWorkDayId] = useState('');
  const [stockRequests, setStockRequests] = useState([]);
  const [skus, setSkus] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | request object
  const [form, setForm] = useState({ sku_id: '', quantity_requested: '0', quantity_approved: '0', status: 'draft', notes: '' });
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [wdRes, skusRes] = await Promise.all([
          supabase.from('work_days').select('*').in('status', ['open', 'closed']).order('work_date', { ascending: true }),
          supabase.from('skus').select('id, name, unit, category, cost, supplier_id').eq('active', true).order('name')
        ]);
        
        if (wdRes.error) throw wdRes.error;
        if (skusRes.error) throw skusRes.error;

        setWorkDays(wdRes.data || []);
        setSkus(skusRes.data || []);
        
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

  const fetchRequests = useCallback(async () => {
    if (!selectedWorkDayId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stock_requests')
        .select(`*, skus ( name, unit, category, cost, supplier_id )`)
        .eq('work_day_id', selectedWorkDayId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setStockRequests(data || []);
    } catch (err) {
      console.error('Error fetching stock requests:', err);
      triggerFlash('error');
    } finally {
      setLoading(false);
    }
  }, [selectedWorkDayId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openCreate = () => {
    if (!selectedWorkDayId) return;
    setForm({ sku_id: '', quantity_requested: '0', quantity_approved: '0', status: 'draft', notes: '' });
    setSlideOver('create');
  };

  const openEdit = (r) => {
    setForm({ 
      sku_id: r.sku_id, 
      quantity_requested: r.quantity_requested.toString(), 
      quantity_approved: r.quantity_approved.toString(),
      status: r.status,
      notes: r.notes || ''
    });
    setSlideOver(r);
  };

  const handleSave = async () => {
    if (!form.sku_id) return;
    try {
      setSaving(true);
      const isApproveAction = form.status === 'approved';

      const payload = {
        work_day_id: selectedWorkDayId,
        sku_id: form.sku_id,
        quantity_requested: parseFloat(form.quantity_requested) || 0,
        quantity_approved: isApproveAction ? (parseFloat(form.quantity_approved) || parseFloat(form.quantity_requested) || 0) : 0,
        status: form.status,
        notes: form.notes.trim() || null
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('stock_requests').insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('stock_requests').update(payload).eq('id', slideOver.id);
        if (error) throw error;
      }

      if (form.status === 'approved') {
        const selectedSku = skus.find(s => s.id === form.sku_id);
        const supplierId = selectedSku?.supplier_id || null;
        const amount = (parseFloat(form.quantity_approved) || 0) * (selectedSku?.cost || 0);

        const { error: costError } = await supabase.from('opening_costs').insert({
          work_day_id: selectedWorkDayId,
          title: 'Pedido Insumos (Indiv)',
          supplier_id: supplierId,
          amount: amount,
          status: 'approved',
          notes: `Generado auto. SKU: ${selectedSku?.name || 'Desconocido'} (${parseFloat(form.quantity_approved)} un.)`
        });
        if (costError) throw costError;
      }

      triggerFlash('success');
      setSlideOver(null);
      fetchRequests();
    } catch (err) {
      console.error('Error saving stock request:', err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta solicitud de stock?')) return;
    try {
      const { error } = await supabase.from('stock_requests').delete().eq('id', id);
      if (error) throw error;
      triggerFlash('success');
      fetchRequests();
    } catch (err) {
      console.error('Error deleting stock request:', err);
      triggerFlash('error');
    }
  };

  const approveAll = async () => {
    if (!window.confirm('¿Aprobar todas las solicitudes en borrador? Se generarán los pagos agrupados por proveedor.')) return;
    
    try {
      const draftRequests = stockRequests.filter(r => r.status === 'draft');
      if (draftRequests.length === 0) return;

      setLoading(true);

      const supplierGroups = {};
      draftRequests.forEach(r => {
        const supId = r.skus?.supplier_id || 'unassigned';
        if (!supplierGroups[supId]) supplierGroups[supId] = { amount: 0, items: [] };
        const qty = parseFloat(r.quantity_requested) || 0;
        supplierGroups[supId].amount += qty * (r.skus?.cost || 0);
        supplierGroups[supId].items.push(`${r.skus?.name} (${qty})`);
      });

      await Promise.all(draftRequests.map(r => 
        supabase.from('stock_requests').update({ 
          status: 'approved',
          quantity_approved: r.quantity_requested
        }).eq('id', r.id)
      ));

      const costsToInsert = Object.entries(supplierGroups).map(([supId, group]) => ({
        work_day_id: selectedWorkDayId,
        title: 'Pedido de Insumos (Lote)',
        supplier_id: supId === 'unassigned' ? null : supId,
        amount: group.amount,
        status: 'approved',
        notes: `Generado auto. Incluye: ${group.items.join(', ')}`
      }));

      if (costsToInsert.length > 0) {
        const { error } = await supabase.from('opening_costs').insert(costsToInsert);
        if (error) throw error;
      }
      
      triggerFlash('success');
      fetchRequests();
    } catch (err) {
      console.error('Error approving all stock requests:', err);
      triggerFlash('error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  const totalCost = stockRequests.reduce((sum, r) => {
    const qty = r.status === 'rejected' ? 0 : (r.status === 'approved' ? r.quantity_approved : r.quantity_requested);
    return sum + (qty * (r.skus?.cost || 0));
  }, 0);

  const allApproved = stockRequests.length > 0 && stockRequests.every(r => r.status === 'approved');
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
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-brand-muted">SOLICITUD DE STOCK</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">Planificación de insumos por jornada</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
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
              onClick={openCreate}
              disabled={!selectedWorkDayId}
              className="flex items-center gap-2 bg-brand-surface border border-brand-border text-brand-text px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-brand-muted transition-colors disabled:opacity-30 cursor-pointer"
            >
              <Plus size={13} />
              SOLICITAR SKU
            </button>
            <button
              onClick={approveAll}
              disabled={stockRequests.length === 0 || allApproved || isClosed}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                allApproved 
                  ? 'bg-brand-success/20 text-brand-success border border-brand-success/30' 
                  : 'bg-brand-text text-brand-bg hover:bg-white disabled:opacity-30'
              }`}
            >
              <CheckCircle2 size={13} />
              {allApproved ? 'APROBADOS' : 'APROBAR TODOS'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">SKU</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">SOLICITADO</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">APROBADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">COSTO</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-28">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
              ) : !selectedWorkDayId ? (
                <tr><td colSpan={6} className="text-center py-12 text-brand-muted/50 text-xs italic">Seleccione una jornada.</td></tr>
              ) : stockRequests.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-brand-muted/50 text-xs italic">No hay stock solicitado.</td></tr>
              ) : stockRequests.map((r) => (
                <tr key={r.id} className="border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-brand-text flex items-center gap-2">
                        <Package size={12} className="text-brand-muted" /> {r.skus?.name}
                      </span>
                      <span className="text-[10px] text-brand-muted uppercase tracking-widest mt-1">
                        {r.skus?.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono text-brand-text text-sm">
                    {r.quantity_requested} <span className="text-[10px] text-brand-muted">{r.skus?.unit}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono text-brand-success text-sm">
                    {r.status === 'approved' ? r.quantity_approved : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-brand-text text-sm">
                    {formatCurrency(
                      (r.status === 'rejected' ? 0 : (r.status === 'approved' ? r.quantity_approved : r.quantity_requested)) * (r.skus?.cost || 0)
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold tracking-[0.2em] uppercase ${
                      r.status === 'draft' ? 'bg-brand-warning/20 text-brand-warning' : 
                      r.status === 'approved' ? 'bg-brand-success/20 text-brand-success' : 
                      'bg-brand-error/20 text-brand-error'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right flex justify-end gap-2 items-center h-full">
                    {!isClosed && r.status !== 'approved' && (
                      <>
                        <button onClick={() => openEdit(r)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer p-1">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="text-brand-error/50 hover:text-brand-error transition-colors cursor-pointer p-1">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                    {r.status === 'approved' && (
                      <span className="text-[10px] text-brand-muted italic uppercase tracking-widest px-2">Bloqueado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic KPIs */}
        {selectedWorkDayId && stockRequests.length > 0 && (
          <div className="mt-6 flex justify-end">
            <div className="bg-brand-surface border border-brand-border rounded-xl px-6 py-4 flex items-center gap-5">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-brand-muted">TOTAL PROYECTADO</span>
              <span className="text-xl font-mono font-bold text-brand-success">{formatCurrency(totalCost)}</span>
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
                {slideOver === 'create' ? 'SOLICITAR STOCK' : 'EDITAR SOLICITUD'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">SKU Requerido *</label>
                <select
                  value={form.sku_id}
                  onChange={(e) => setForm({ ...form, sku_id: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                  disabled={slideOver !== 'create'}
                >
                  <option value="">-- Seleccionar SKU --</option>
                  {skus.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Cantidad Solicitada *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity_requested}
                  onChange={(e) => setForm({ ...form, quantity_requested: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Notas Operativas</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Opcional..."
                />
              </div>

              {slideOver !== 'create' && (
                <>
                  <div className="pt-6 border-t border-brand-border mt-6">
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-accent mb-4">Aprobación (Admin)</h4>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Estado</label>
                    <select
                      value={form.status}
                      onChange={(e) => {
                        const s = e.target.value;
                        setForm({ 
                          ...form, 
                          status: s,
                          quantity_approved: s === 'approved' ? (form.quantity_approved === '0' ? form.quantity_requested : form.quantity_approved) : '0'
                        });
                      }}
                      className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                    >
                      <option value="draft">Borrador</option>
                      <option value="approved">Aprobado</option>
                      <option value="rejected">Rechazado</option>
                    </select>
                  </div>

                  {form.status === 'approved' && (
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Cantidad Aprobada</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.quantity_approved}
                        onChange={(e) => setForm({ ...form, quantity_approved: e.target.value })}
                        className="w-full bg-brand-surface border border-brand-success/30 rounded-xl px-4 py-3 text-sm text-brand-success font-mono focus:outline-none focus:border-brand-success transition-colors"
                      />
                    </div>
                  )}
                </>
              )}

            </div>

            <div className="px-6 py-4 border-t border-brand-border shrink-0">
              <button
                onClick={handleSave}
                disabled={saving || !form.sku_id}
                className="w-full flex items-center justify-center gap-2 bg-brand-text text-brand-bg rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? 'GUARDANDO...' : 'GUARDAR STOCK'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
