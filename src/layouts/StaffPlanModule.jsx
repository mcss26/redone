import React, { useRef,  useState, useEffect, useCallback  } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, Pencil, Users, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { sanitizePayload } from '../lib/sanitizer';

export default function StaffPlanModule({ onNavigate }) {
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);
  const { user } = useAuth();
  const [workDays, setWorkDays] = useState([]);
  const [selectedWorkDayId, setSelectedWorkDayId] = useState('');
  const [staffPlans, setStaffPlans] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | plan object
  const [form, setForm] = useState({ role_id: '', quantity_requested: '1', quantity_approved: '0', status: 'draft' });
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [wdRes, rolesRes] = await Promise.all([
          supabase.from('work_days').select('*').in('status', ['open', 'closed']).order('work_date', { ascending: false }).limit(30),
          supabase.from('staff_roles').select('id, name, base_rate, default_quantity').eq('active', true).order('name')
        ]);
        
        if (wdRes.error) throw wdRes.error;
        if (rolesRes.error) throw rolesRes.error;

        setWorkDays(wdRes.data || []);
        setStaffRoles(rolesRes.data || []);
        
        if (wdRes.data && wdRes.data.length > 0) {
          setSelectedWorkDayId(wdRes.data[0].id);
        } else {
          (setIsFetchingBackground(false), setLoading(false));
        }
      } catch (err) {
        console.error('Error in fetchInit:', err);
        (setIsFetchingBackground(false), setLoading(false));
      }
    };
    fetchInit();
  }, []);

  const fetchPlans = useCallback(async () => {
    if (!selectedWorkDayId) return;
    try {
      setIsFetchingBackground(true);
      const { data, error } = await supabase
        .from('staff_plan')
        .select(`*, staff_roles ( name, base_rate )`)
        .eq('work_day_id', selectedWorkDayId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setStaffPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      (setIsFetchingBackground(false), setLoading(false));
    }
  }, [selectedWorkDayId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const openCreate = () => {
    if (!selectedWorkDayId) return;
    setForm({ role_id: '', quantity_requested: '1', quantity_approved: '0', status: 'draft' });
    setSlideOver('create');
  };

  const openEdit = (p) => {
    setForm({ 
      role_id: p.role_id, 
      quantity_requested: p.quantity_requested.toString(), 
      quantity_approved: p.quantity_approved.toString(),
      status: p.status
    });
    setSlideOver(p);
  };

  const handleSave = async () => {
    if (!form.role_id) return;
    try {
      setSaving(true);
      const isApproveAction = form.status === 'approved';

      const payload = {
        work_day_id: selectedWorkDayId,
        role_id: form.role_id,
        quantity_requested: parseInt(form.quantity_requested, 10) || 1,
        quantity_approved: isApproveAction ? (parseInt(form.quantity_approved, 10) || parseInt(form.quantity_requested, 10)) : 0,
        status: form.status
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('staff_plan').insert(sanitizePayload(payload));
        if (error) throw error;
      } else {
        const { error } = await supabase.from('staff_plan').update(sanitizePayload(payload)).eq('id', slideOver.id);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(null);
      fetchPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await window.UI.confirm('¿Eliminar esta solicitud de staff?'))) return;
    try {
      const { error } = await supabase.from('staff_plan').delete().eq('id', id);
      if (error) throw error;
      triggerFlash('success');
      setSlideOver(null);
      fetchPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    }
  };

  const handleApproveAll = async () => {
    if (!(await window.UI.confirm('¿Aprobar TODAS las solicitudes pendientes de staff usando la cantidad solicitada?'))) return;
    
    try {
      setSaving(true);
      const draftPlans = staffPlans.filter(p => p.status === 'draft');
      
      await Promise.all(draftPlans.map(p => 
        supabase.from('staff_plan').update({ 
          status: 'approved', 
          quantity_approved: p.quantity_requested 
        }).eq('id', p.id)
      ));
      
      triggerFlash('success');
      fetchPlans();
    } catch (err) {
      console.error('Error approving all plans:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      setSaving(false);
    }
  };



  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  const totalCost = staffPlans.reduce((sum, p) => {
    const qty = p.status === 'rejected' ? 0 : (p.status === 'approved' ? p.quantity_approved : p.quantity_requested);
    const rate = p.staff_roles?.base_rate || 0;
    return sum + (qty * rate);
  }, 0);

  const activeWd = workDays.find(wd => wd.id === selectedWorkDayId);
  const isClosed = activeWd ? activeWd.status === 'closed' : true;
  const isLocked = isClosed && user?.role !== 'admin';

  return (
    <div className="h-full flex relative">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}
      <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Actions & Title (Above Table) */}
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">
            PLAN DE STAFF
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
                onClick={handleApproveAll}
                disabled={!selectedWorkDayId || isLocked || staffPlans.filter(p => p.status === 'draft').length === 0}
                className="text-brand-success/70 hover:text-brand-success transition-colors cursor-pointer flex items-center justify-end gap-2 text-[10px] font-bold tracking-[0.2em] uppercase disabled:opacity-30"
                title="Aprobar todo"
              >
                <CheckCircle2 size={13} /> APROBAR
              </button>
            )}

            <button
              onClick={openCreate}
              disabled={!selectedWorkDayId || isLocked}
              className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer flex items-center justify-end gap-2 text-[10px] font-bold tracking-[0.2em] uppercase disabled:opacity-30"
            >
              + SOLICITAR
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">ROL</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">CANT.</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">COSTO</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-28">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
              ) : !selectedWorkDayId ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted/50 text-xs italic">Seleccione una jornada.</td></tr>
              ) : staffPlans.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-brand-muted/50 text-xs italic">No hay roles solicitados.</td></tr>
              ) : staffPlans.map((p) => (
                <tr key={p.id} className="border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col justify-center">
                      <span className="text-sm font-semibold text-brand-text flex items-center gap-2">
                        <Users size={12} className="text-brand-muted" /> {p.staff_roles?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono text-brand-text text-sm">
                    {p.status === 'approved' ? p.quantity_approved : p.quantity_requested}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-brand-text text-sm">
                    {formatCurrency(
                      (p.status === 'rejected' ? 0 : (p.status === 'approved' ? p.quantity_approved : p.quantity_requested)) * (p.staff_roles?.base_rate || 0)
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center w-full">
                      <div 
                        className={`w-2 h-2 rounded-full ${
                          p.status === 'draft' ? 'bg-brand-warning shadow-[0_0_6px_rgba(250,204,21,0.5)]' : 
                          p.status === 'approved' ? 'bg-brand-success shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 
                          'bg-brand-error shadow-[0_0_6px_rgba(248,113,113,0.5)]'
                        }`} 
                        title={p.status === 'draft' ? 'BORRADOR' : p.status === 'approved' ? 'APROBADO' : 'RECHAZADO'}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right flex justify-end gap-2 items-center">
                    {!isLocked && (
                      <>
                        <button onClick={() => openEdit(p)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer w-11 h-11 flex items-center justify-center shrink-0">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-brand-error/50 hover:text-brand-error transition-colors cursor-pointer w-11 h-11 flex items-center justify-center shrink-0">
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
        {selectedWorkDayId && staffPlans.length > 0 && (
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
                {slideOver === 'create' ? 'NUEVA SOLICITUD' : 'EDITAR SOLICITUD'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
              
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Rol *</label>
                <select id="sp_role"
                  value={form.role_id}
                  onChange={(e) => {
                    const rId = e.target.value;
                    const selectedRole = staffRoles.find(r => r.id === rId);
                    setForm({ 
                      ...form, 
                      role_id: rId,
                      quantity_requested: selectedRole && selectedRole.default_quantity > 0 
                        ? selectedRole.default_quantity.toString() 
                        : '1'
                    });
                  }}
                  className="w-full bg-transparent border-b border-brand-border/50 px-0 rounded-none focus:border-brand-text py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                  disabled={slideOver !== 'create'}
                >
                  <option value="" disabled className="bg-brand-bg">-- Seleccionar Rol --</option>
                  {staffRoles.map(r => (
                    <option key={r.id} value={r.id} className="bg-brand-bg">{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sp_qty" className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Solicitado *</label>
                <input autoComplete="off"
                  type="number"
                  min="1"
                  value={form.quantity_requested}
                  onChange={(e) => setForm({ ...form, quantity_requested: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 px-0 rounded-none focus:border-brand-text py-3 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                />
              </div>

              {slideOver !== 'create' && (
                <>
                  <div className="pt-6 border-t border-brand-border/30 mt-6">
                    <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-accent/70 mb-6">Aprobación</h4>
                    
                    <div className="space-y-6">
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
                          className="w-full bg-transparent border-b border-brand-border/50 px-0 rounded-none focus:border-brand-text py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                        >
                          <option value="draft" className="bg-brand-bg">BORRADOR</option>
                          <option value="approved" className="bg-brand-bg">APROBADO</option>
                          <option value="rejected" className="bg-brand-bg">RECHAZADO</option>
                        </select>
                      </div>

                      {form.status === 'approved' && (
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-success mb-2">Aprobado</label>
                          <input autoComplete="off"
                            type="number"
                            min="0"
                            value={form.quantity_approved}
                            onChange={(e) => setForm({ ...form, quantity_approved: e.target.value })}
                            className="w-full bg-brand-surface border border-brand-success/30 rounded-lg px-4 py-3 text-sm text-brand-success font-mono focus:outline-none focus:border-brand-success transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 border-t border-brand-border shrink-0 flex gap-3">
              {slideOver !== 'create' && (
                <button
                  onClick={() => handleDelete(slideOver.id)}
                  disabled={saving}
                  className="flex items-center justify-center bg-brand-surface border border-brand-error/30 text-brand-error rounded-lg px-4 py-3 hover:bg-brand-error hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                  title="Eliminar Solicitud"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !form.role_id}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-text text-brand-bg rounded-lg py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? 'GUARDANDO...' : 'GUARDAR PLAN'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
