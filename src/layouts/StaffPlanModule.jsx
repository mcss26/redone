import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, Pencil, Users, CheckCircle2, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';

export default function StaffPlanModule({ onNavigate }) {
  const [workDays, setWorkDays] = useState([]);
  const [selectedWorkDayId, setSelectedWorkDayId] = useState('');
  const [staffPlans, setStaffPlans] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
          supabase.from('work_days').select('*').in('status', ['open', 'closed']).order('work_date', { ascending: true }),
          supabase.from('staff_roles').select('id, name, base_rate').eq('active', true).order('name')
        ]);
        
        if (wdRes.error) throw wdRes.error;
        if (rolesRes.error) throw rolesRes.error;

        setWorkDays(wdRes.data || []);
        setStaffRoles(rolesRes.data || []);
        
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

  const fetchPlans = useCallback(async () => {
    if (!selectedWorkDayId) return;
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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
        const { error } = await supabase.from('staff_plan').insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('staff_plan').update(payload).eq('id', slideOver.id);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(null);
      fetchPlans();
    } catch (err) {
      console.error('Error saving plan:', err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta solicitud de staff?')) return;
    try {
      const { error } = await supabase.from('staff_plan').delete().eq('id', id);
      if (error) throw error;
      triggerFlash('success');
      fetchPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      triggerFlash('error');
    }
  };

  const handleApproveAll = async () => {
    if (!window.confirm('¿Aprobar TODAS las solicitudes pendientes de staff usando la cantidad solicitada?')) return;
    
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
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-brand-muted">PLAN DE STAFF</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">Asignación de roles por jornada</p>
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
              onClick={handleApproveAll}
              disabled={!selectedWorkDayId || isClosed || staffPlans.filter(p => p.status === 'draft').length === 0}
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
              SOLICITAR ROL
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">ROL</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">SOLICITADOS</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">APROBADOS</th>
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
              ) : staffPlans.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-brand-muted/50 text-xs italic">No hay roles solicitados.</td></tr>
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
                    {p.quantity_requested}
                  </td>
                  <td className="px-5 py-3.5 text-center font-mono text-brand-success text-sm">
                    {p.status === 'approved' ? p.quantity_approved : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-brand-text text-sm">
                    {formatCurrency(
                      (p.status === 'rejected' ? 0 : (p.status === 'approved' ? p.quantity_approved : p.quantity_requested)) * (p.staff_roles?.base_rate || 0)
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2 py-1 rounded text-[9px] font-bold tracking-[0.2em] uppercase ${
                      p.status === 'draft' ? 'bg-brand-warning/20 text-brand-warning' : 
                      p.status === 'approved' ? 'bg-brand-success/20 text-brand-success' : 
                      'bg-brand-error/20 text-brand-error'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right flex justify-end gap-2 items-center">
                    {!isClosed && (
                      <>
                        <button onClick={() => openEdit(p)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer p-1">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-brand-error/50 hover:text-brand-error transition-colors cursor-pointer p-1">
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
                {slideOver === 'create' ? 'NUEVA SOLICITUD' : 'EDITAR SOLICITUD'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Rol Requerido *</label>
                <select
                  value={form.role_id}
                  onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                  disabled={slideOver !== 'create'}
                >
                  <option value="">-- Seleccionar Rol --</option>
                  {staffRoles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Cantidad Solicitada *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity_requested}
                  onChange={(e) => setForm({ ...form, quantity_requested: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
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
                disabled={saving || !form.role_id}
                className="w-full flex items-center justify-center gap-2 bg-brand-text text-brand-bg rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Save size={13} />
                {saving ? 'GUARDANDO...' : 'GUARDAR PLAN'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
