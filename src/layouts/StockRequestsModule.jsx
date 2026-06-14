import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, Pencil, Package, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function StockRequestsModule({ onNavigate }) {
  const { user } = useAuth();
  const [workDays, setWorkDays] = useState([]);
  const [selectedWorkDayId, setSelectedWorkDayId] = useState('');
  const [stockRequests, setStockRequests] = useState([]);
  const [skus, setSkus] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | request object
  const [form, setForm] = useState({ sku_id: '', supplier_id: '', quantity_requested: '0', quantity_approved: '0', status: 'draft', notes: '' });
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [wdRes, skusRes, supRes] = await Promise.all([
          supabase.from('work_days').select('*').eq('status', 'open').order('work_date', { ascending: false }),
          supabase.from('skus').select('id, name, unit, category, cost, supplier_id').eq('active', true).order('name'),
          supabase.from('suppliers').select('id, name').eq('active', true).order('name')
        ]);
        
        if (wdRes.error) throw wdRes.error;
        if (skusRes.error) throw skusRes.error;
        if (supRes.error) throw supRes.error;

        setWorkDays(wdRes.data || []);
        setSkus(skusRes.data || []);
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

  const fetchRequests = useCallback(async () => {
    if (!selectedWorkDayId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stock_requests')
        .select(`*, skus ( name, unit, category, cost, supplier_id ), suppliers ( name )`)
        .eq('work_day_id', selectedWorkDayId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setStockRequests(data || []);
    } catch (err) {
      console.error('Error fetching stock requests:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      setLoading(false);
    }
  }, [selectedWorkDayId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const openCreate = () => {
    if (!selectedWorkDayId) return;
    setForm({ sku_id: '', supplier_id: '', quantity_requested: '0', quantity_approved: '0', status: 'draft', notes: '' });
    setSlideOver('create');
  };

  const openEdit = (r) => {
    setForm({ 
      sku_id: r.sku_id, 
      supplier_id: r.supplier_id || '',
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
        supplier_id: form.supplier_id || null,
        quantity_requested: parseFloat(form.quantity_requested) || 0,
        quantity_approved: isApproveAction ? (parseFloat(form.quantity_approved) || parseFloat(form.quantity_requested) || 0) : 0,
        status: form.status,
        notes: form.notes.trim() || null
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('stock_requests').insert(sanitizePayload(payload));
        if (error) throw error;
      } else {
        const { error } = await supabase.from('stock_requests').update(sanitizePayload(payload)).eq('id', slideOver.id);
        if (error) throw error;
      }

      if (form.status === 'approved') {
        const selectedSku = skus.find(s => s.id === form.sku_id);
        const supplierId = form.supplier_id || selectedSku?.supplier_id || null;
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
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
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
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
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
        const supId = r.supplier_id || r.skus?.supplier_id || 'unassigned';
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
        const { error } = await supabase.from('opening_costs').insert(sanitizePayload(costsToInsert));
        if (error) throw error;
      }
      
      triggerFlash('success');
      fetchRequests();
    } catch (err) {
      console.error('Error approving all stock requests:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
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

      <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Actions & Title (Above Table) */}
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">
            PEDIDOS DE STOCK
          </h2>

          <div className="flex items-center gap-6">
            <select
              value={selectedWorkDayId}
              onChange={(e) => setSelectedWorkDayId(e.target.value)}
              className="bg-transparent border-none text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted hover:text-brand-text transition-colors focus:outline-none appearance-none cursor-pointer text-right"
            >
              {workDays.length === 0 ? <option value="">SIN JORNADAS ACTIVAS</option> : null}
              {workDays.map(wd => (
                <option key={wd.id} value={wd.id} className="bg-brand-bg text-brand-text">
                  {dayjs(wd.work_date).format('DD/MM')} - {wd.event_name || 'REGULAR'}
                </option>
              ))}
            </select>

            {user?.role === 'admin' && (
              <button
                onClick={approveAll}
                disabled={stockRequests.length === 0 || allApproved || isClosed}
                className={`transition-colors cursor-pointer flex items-center justify-end gap-2 text-[10px] font-bold tracking-[0.2em] uppercase disabled:opacity-30 ${
                  allApproved ? 'text-brand-success' : 'text-brand-success/70 hover:text-brand-success'
                }`}
                title="Aprobar todas las solicitudes"
              >
                <CheckCircle2 size={13} /> {allApproved ? 'APROBADOS' : 'APROBAR'}
              </button>
            )}

            <button
              onClick={openCreate}
              disabled={!selectedWorkDayId || isClosed}
              className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer flex items-center justify-end gap-2 text-[10px] font-bold tracking-[0.2em] uppercase disabled:opacity-30"
            >
              + SOLICITAR SKU
            </button>
          </div>
        </div>

        {/* Table (Raw Data Format) */}
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">SKU</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">PROVEEDOR</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">CANTIDAD</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">COSTO</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-28">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
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
                  <td className="px-5 py-3.5 text-xs text-brand-muted">
                    {r.supplier_id ? (
                      <span className="bg-brand-border/30 px-2 py-1 rounded text-brand-text">{suppliers.find(s => s.id === r.supplier_id)?.name || 'Desconocido'}</span>
                    ) : r.skus?.supplier_id ? (
                      <span className="bg-brand-border/30 px-2 py-1 rounded text-brand-text/50" title="Heredado del SKU">{suppliers.find(s => s.id === r.skus.supplier_id)?.name || 'Predeterminado'}</span>
                    ) : (
                      <span className="text-brand-muted/50">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono text-brand-text text-sm">
                    {r.status === 'approved' ? r.quantity_approved : r.quantity_requested} <span className="text-[10px] text-brand-muted">{r.skus?.unit}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-brand-text text-sm">
                    {formatCurrency(
                      (r.status === 'rejected' ? 0 : (r.status === 'approved' ? r.quantity_approved : r.quantity_requested)) * (r.skus?.cost || 0)
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center w-full">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          r.status === 'draft' ? 'bg-brand-warning shadow-[0_0_6px_rgba(250,204,21,0.5)]' : 
                          r.status === 'approved' ? 'bg-brand-success shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 
                          'bg-brand-error shadow-[0_0_6px_rgba(248,113,113,0.5)]'
                        }`} 
                        title={r.status === 'draft' ? 'PENDIENTE' : r.status === 'approved' ? 'APROBADO' : 'RECHAZADO'}
                      />
                    </div>
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
          <div className="mt-8 flex justify-end border-t border-brand-border/30 pt-4">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-muted">TOTAL PROYECTADO</span>
              <span className="text-2xl font-mono font-bold text-brand-text">{formatCurrency(totalCost)}</span>
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

            <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
              
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">SKU Requerido *</label>
                <select
                  value={form.sku_id}
                  onChange={(e) => {
                    const selectedSku = skus.find(s => s.id === e.target.value);
                    setForm({ ...form, sku_id: e.target.value, supplier_id: selectedSku?.supplier_id || '' });
                  }}
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
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Proveedor</label>
                <select
                  value={form.supplier_id || ''}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                >
                  <option value="">-- Heredado del SKU --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Cantidad Solicitada *</label>
                <input autoComplete="off"
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
                <input autoComplete="off"
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Opcional..."
                />
              </div>

              {/* Calculadora Operativa */}
              <SimpleCalculator onUseResult={(val) => setForm({ ...form, quantity_requested: val })} />

              {slideOver !== 'create' && user?.role === 'admin' && (
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
                      <input autoComplete="off"
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

const SimpleCalculator = ({ onUseResult }) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(null);
  const [op, setOp] = useState(null);
  const [newNum, setNewNum] = useState(false);

  const handleNum = (e, n) => {
    e.preventDefault();
    if (newNum) {
      setDisplay(n);
      setNewNum(false);
    } else {
      setDisplay(display === '0' ? n : display + n);
    }
  };

  const handleOp = (e, o) => {
    e.preventDefault();
    if (op && !newNum) calculate(e);
    setMemory(display);
    setOp(o);
    setNewNum(true);
  };

  const calculate = (e) => {
    if (e) e.preventDefault();
    if (!op || !memory) return;
    const a = parseFloat(memory);
    const b = parseFloat(display);
    let res = 0;
    if (op === '+') res = a + b;
    if (op === '-') res = a - b;
    if (op === '*') res = a * b;
    if (op === '/') res = b !== 0 ? a / b : 0;
    
    res = Math.round(res * 10000) / 10000;
    setDisplay(res.toString());
    setOp(null);
    setMemory(null);
    setNewNum(true);
  };

  const clear = (e) => {
    e.preventDefault();
    setDisplay('0');
    setMemory(null);
    setOp(null);
    setNewNum(false);
  };

  return (
    <div className="select-none mt-4">
      <div className="flex gap-2 mb-2">
        <div className="flex-1 bg-brand-bg border border-brand-border/50 rounded-lg p-3 text-right font-mono text-xl text-brand-text overflow-hidden">
          {display}
        </div>
        <button 
          onClick={(e) => { e.preventDefault(); onUseResult(display); }}
          className="w-14 bg-brand-success/10 text-brand-success hover:bg-brand-success/20 border border-brand-success/20 rounded-lg flex items-center justify-center transition-colors text-sm font-bold"
          title="Inyectar resultado"
        >
          ↳
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <button onClick={clear} className="col-span-2 bg-brand-error/10 text-brand-error text-sm font-bold py-2.5 rounded hover:bg-brand-error/20 transition-colors">C</button>
        <button onClick={(e) => handleOp(e, '/')} className="bg-brand-border/30 text-brand-text text-sm font-bold py-2.5 rounded hover:bg-brand-border/50 transition-colors">÷</button>
        <button onClick={(e) => handleOp(e, '*')} className="bg-brand-border/30 text-brand-text text-sm font-bold py-2.5 rounded hover:bg-brand-border/50 transition-colors">×</button>
        
        <button onClick={(e) => handleNum(e, '7')} className="bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">7</button>
        <button onClick={(e) => handleNum(e, '8')} className="bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">8</button>
        <button onClick={(e) => handleNum(e, '9')} className="bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">9</button>
        <button onClick={(e) => handleOp(e, '-')} className="bg-brand-border/30 text-brand-text text-sm font-bold py-2.5 rounded hover:bg-brand-border/50 transition-colors">-</button>
        
        <button onClick={(e) => handleNum(e, '4')} className="bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">4</button>
        <button onClick={(e) => handleNum(e, '5')} className="bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">5</button>
        <button onClick={(e) => handleNum(e, '6')} className="bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">6</button>
        <button onClick={(e) => handleOp(e, '+')} className="bg-brand-border/30 text-brand-text text-sm font-bold py-2.5 rounded hover:bg-brand-border/50 transition-colors">+</button>
        
        <button onClick={(e) => handleNum(e, '1')} className="bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">1</button>
        <button onClick={(e) => handleNum(e, '2')} className="bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">2</button>
        <button onClick={(e) => handleNum(e, '3')} className="bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">3</button>
        <button onClick={calculate} className="row-span-2 bg-brand-success/20 text-brand-success text-sm font-bold py-2.5 rounded hover:bg-brand-success/30 transition-colors">=</button>
        
        <button onClick={(e) => handleNum(e, '0')} className="col-span-2 bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">0</button>
        <button onClick={(e) => handleNum(e, '.')} className="bg-brand-bg text-brand-text text-sm font-mono py-2.5 rounded hover:bg-brand-border/30 transition-colors">.</button>
      </div>
    </div>
  );
};
