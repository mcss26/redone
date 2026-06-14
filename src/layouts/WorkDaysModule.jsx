import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, Pencil, ChevronRight, CalendarDays, Trash2, Loader2, Search } from 'lucide-react';
import dayjs from 'dayjs';

export default function WorkDaysModule({ onNavigate }) {
  const [workDays, setWorkDays] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [slideOver, setSlideOver] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [form, setForm] = useState({ work_date: dayjs().format('YYYY-MM-DD'), event_name: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const openCreate = () => {
    setSelectedDay(null);
    setForm({ work_date: dayjs().format('YYYY-MM-DD'), event_name: '', notes: '' });
    setSlideOver(true);
  };

  const openEdit = (wd) => {
    setSelectedDay(wd);
    setForm({
      work_date: wd.work_date,
      event_name: wd.event_name || '',
      notes: wd.notes || '',
    });
    setSlideOver(true);
  };

  const fetchWorkDays = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('work_days')
      .select('*')
      .order('work_date', { ascending: false });
    setWorkDays(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchWorkDays(); }, [fetchWorkDays]);

  const handleSave = async () => {
    if (!form.work_date) return;
    setSaving(true);

    try {
      if (selectedDay) {
        // Update existing
        const { error: wdError } = await supabase
          .from('work_days')
          .update({
            work_date: form.work_date,
            event_name: form.event_name.trim() || null,
            notes: form.notes.trim() || null,
          })
          .eq('id', selectedDay.id);

        if (wdError) throw wdError;
      } else {
        // Create new
        const { data: newWorkDay, error: wdError } = await supabase
          .from('work_days')
          .insert({
            work_date: form.work_date,
            event_name: form.event_name.trim() || null,
            notes: form.notes.trim() || null,
            status: 'open'
          })
          .select('id')
          .single();

        if (wdError) throw wdError;

        // Fetch active cost templates
        const { data: templates } = await supabase
          .from('cost_templates')
          .select('*')
          .eq('active', true);

        // Auto-populate opening_costs
        if (templates && templates.length > 0) {
          const openingCostsPayload = templates.map(t => ({
            work_day_id: newWorkDay.id,
            template_id: t.id,
            title: t.title,
            supplier_id: t.supplier_id,
            amount: t.default_amount,
            status: 'draft'
          }));

          const { error: ocError } = await supabase.from('opening_costs').insert(sanitizePayload(openingCostsPayload));
          if (ocError) {
            console.error('Error auto-populating costs:', ocError);
            throw new Error(`Error carga automática de costos: ${ocError.message}`);
          }
        }

        // Fetch active staff roles with default_quantity > 0
        const { data: staffRoles } = await supabase
          .from('staff_roles')
          .select('*')
          .eq('active', true)
          .gt('default_quantity', 0);

        // Auto-populate staff_plan
        if (staffRoles && staffRoles.length > 0) {
          const staffPlanPayload = staffRoles.map(r => ({
            work_day_id: newWorkDay.id,
            role_id: r.id,
            quantity_requested: r.default_quantity,
            quantity_approved: 0,
            status: 'draft'
          }));

          const { error: spError } = await supabase.from('staff_plan').insert(sanitizePayload(staffPlanPayload));
          if (spError) {
            console.error('Error auto-populating staff plan:', spError);
            throw new Error(`Error carga automática de staff: ${spError.message}`);
          }
        }
      }

      triggerFlash('success');
      setSlideOver(false);
      fetchWorkDays();
    } catch (err) {
      console.error('Error saving work day:', err);
      triggerFlash('error');
      alert('Error al guardar la jornada. Revise la consola para más detalles.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const dayId = id || selectedDay?.id;
    if (!dayId) return;
    if (!window.confirm('¿Estás seguro de eliminar esta jornada permanentemente? Se eliminarán los costos asociados.')) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('work_days')
        .delete()
        .eq('id', dayId);
      
      if (error) throw error;
      triggerFlash('success');
      setSlideOver(false);
      fetchWorkDays();
    } catch (err) {
      console.error('Error deleting work day:', err);
      triggerFlash('error');
      alert('Error al eliminar. Revisa la consola.');
    } finally {
      setSaving(false);
    }
  };

  const STATUS_DOTS = {
    open: 'bg-brand-success shadow-[0_0_6px_rgba(74,222,128,0.5)]',
    closed: 'bg-brand-muted shadow-none',
    cancelled: 'bg-brand-error shadow-[0_0_6px_rgba(248,113,113,0.5)]',
  };

  const STATUS_LABELS = {
    open: 'ABIERTA',
    closed: 'CERRADA',
    cancelled: 'CANCELADA',
  };

  return (
    <div className="h-full flex relative">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Actions & Title (Above Table) */}
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">
            WORKDAYS
          </h2>

          <button
            onClick={openCreate}
            className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer flex items-center justify-end gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-right"
          >
            + ABRIR JORNADA
          </button>
        </div>

        {/* Table (Raw Data Format) */}
        <div className="w-full overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">FECHA</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">EVENTO</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
              ) : workDays.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-brand-muted/50 text-xs italic">No hay jornadas registradas.</td></tr>
              ) : workDays.map((wd) => (
                <tr key={wd.id} className="border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono text-brand-text">{dayjs(wd.work_date).format('DD/MM/YYYY')}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-brand-text">{wd.event_name || <span className="text-brand-muted/30">Noche Regular</span>}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center w-full">
                      <div 
                        className={`w-2 h-2 rounded-full ${STATUS_DOTS[wd.status] || 'bg-brand-muted'}`} 
                        title={STATUS_LABELS[wd.status] || wd.status}
                      />
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right flex justify-end gap-2 items-center">
                    <button onClick={() => openEdit(wd)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer p-1" title="Ver Detalles">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(wd.id)} className="text-brand-error/50 hover:text-brand-error transition-colors cursor-pointer p-1" title="Eliminar">
                      <Trash2 size={13} />
                    </button>
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
          <div className="absolute inset-0 bg-black/30 z-40" onClick={() => setSlideOver(false)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-brand-bg border-l border-brand-border z-50 flex flex-col animate-slide-in">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border shrink-0">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-muted">
                {selectedDay ? 'DETALLES DE JORNADA' : 'NUEVA JORNADA'}
              </h3>
              <button onClick={() => setSlideOver(false)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              


              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Fecha Operativa *</label>
                <input autoComplete="off"
                  type="date"
                  value={form.work_date}
                  onChange={(e) => setForm({ ...form, work_date: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Nombre del Evento (Opcional)</label>
                <input autoComplete="off"
                  type="text"
                  value={form.event_name}
                  onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Ej: Fiesta de Disfraces"
                />
              </div>



            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 border-t border-brand-border shrink-0 flex gap-3">
              {selectedDay && selectedDay.status === 'open' && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex items-center justify-center bg-brand-surface border border-brand-error/30 text-brand-error rounded-xl px-4 py-3 hover:bg-brand-error hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                  title="Eliminar Jornada"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !form.work_date}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-text text-brand-bg rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? 'GUARDANDO...' : (selectedDay ? 'ACTUALIZAR' : 'CREAR JORNADA')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
