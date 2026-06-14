import React, { useRef,  useState, useEffect, useCallback  } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, Pencil, ClipboardList, Trash2 } from 'lucide-react';

export default function CostTemplatesModule({ onNavigate }) {
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const [templates, setTemplates] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | template object
  const [form, setForm] = useState({ title: '', supplier_id: '', default_amount: '', sort_order: '0' });
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const fetchData = useCallback(async () => {
    try {
      setIsFetchingBackground(true);
      
      // Fetch active suppliers for the dropdown
      const { data: sups, error: supsError } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('active', true)
        .order('name');
      if (supsError) throw supsError;
      setSuppliers(sups || []);

      // Fetch cost templates joined with suppliers
      const { data: temps, error: tempsError } = await supabase
        .from('cost_templates')
        .select(`
          *,
          suppliers ( name )
        `)
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true });
      if (tempsError) throw tempsError;
      setTemplates(temps || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      (setIsFetchingBackground(false), setLoading(false));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    const nextSort = templates.length > 0 ? Math.max(...templates.map(t => t.sort_order)) + 10 : 10;
    setForm({ title: '', supplier_id: '', default_amount: '', sort_order: nextSort.toString() });
    setSlideOver('create');
  };

  const openEdit = (t) => {
    setForm({ 
      title: t.title, 
      supplier_id: t.supplier_id || '', 
      default_amount: t.default_amount.toString(),
      sort_order: t.sort_order.toString()
    });
    setSlideOver(t);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    try {
      setSaving(true);

      const payload = {
        title: form.title.trim() || null,
        supplier_id: form.supplier_id || null,
        default_amount: parseFloat(form.default_amount) || 0,
        sort_order: parseInt(form.sort_order, 10) || 0,
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('cost_templates').insert(sanitizePayload(payload));
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cost_templates').update(sanitizePayload(payload)).eq('id', slideOver.id);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(null);
      fetchData();
    } catch (err) {
      console.error('Error saving template:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t) => {
    try {
      const { error } = await supabase.from('cost_templates').update({ active: !t.active }).eq('id', t.id);
      if (error) throw error;
      triggerFlash('success');
      fetchData();
    } catch (err) {
      console.error('Error toggling active:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!(await window.UI.confirm('¿Eliminar permanentemente esta plantilla?'))) return;
    try {
      const { error } = await supabase.from('cost_templates').delete().eq('id', id);
      if (error) throw error;
      triggerFlash('success');
      fetchData();
    } catch (err) {
      console.error('Error deleting template:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="h-full flex relative">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Actions & Title (Above Table) */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex flex-col">
            <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">
              COSTOS SEMANA
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={openCreate}
              className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer flex items-center justify-end gap-2 text-[10px] font-bold tracking-[0.2em] uppercase"
            >
              + NUEVA
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-16 text-center">ORDEN</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">CONCEPTO</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">PROVEEDOR PREDET.</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">COSTO BASE</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
              ) : templates.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-brand-muted/50 text-xs italic">No hay plantillas registradas.</td></tr>
              ) : templates.map((t) => (
                <tr key={t.id} className="border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3.5 text-xs text-brand-muted font-mono text-center">{t.sort_order}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-brand-text">{t.title}</td>
                  <td className="px-5 py-3.5 text-xs text-brand-muted">
                    {t.suppliers?.name ? (
                      <span className="bg-brand-border/30 px-2 py-1 rounded text-brand-text">{t.suppliers.name}</span>
                    ) : (
                      <span className="text-brand-muted/50">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-right text-brand-text">
                    {formatCurrency(t.default_amount)}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => toggleActive(t)} className="cursor-pointer" title={t.active ? 'Activa' : 'Inactiva'}>
                      <div className={`w-2 h-2 rounded-full mx-auto ${t.active ? 'bg-brand-success' : 'bg-brand-error'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right flex justify-end gap-2">
                    <button onClick={() => openEdit(t)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer p-1">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-brand-error/50 hover:text-brand-error transition-colors cursor-pointer p-1">
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
          <div className="absolute inset-0 bg-black/30 z-40" onClick={() => setSlideOver(null)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-brand-bg border-l border-brand-border z-50 flex flex-col animate-slide-in">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border shrink-0">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-muted">
                {slideOver === 'create' ? 'NUEVA PLANTILLA' : 'EDITAR PLANTILLA'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Panel Body */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
              
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Concepto *</label>
                <input autoComplete="off"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Ej: Servicio Limpieza, Hielo..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Costo Base Predeterminado</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-mono">$</span>
                  <input autoComplete="off"
                    type="number"
                    min="0"
                    step="100"
                    value={form.default_amount}
                    onChange={(e) => setForm({ ...form, default_amount: e.target.value })}
                    className="w-full bg-transparent border-b border-brand-border/50 pl-8 pr-4 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="0"
                  />
                </div>
                <p className="text-[10px] text-brand-muted mt-1.5 ml-1">Valor sugerido al abrir la jornada.</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Proveedor Vinculado</label>
                <select
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none cursor-pointer"
                >
                  <option value="">-- Sin proveedor fijo --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Orden de Visualización</label>
                <input autoComplete="off"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                  className="w-24 bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors text-center"
                />
              </div>

            </div>

            {/* Panel Footer */}
            <div className="border-t border-brand-border shrink-0 flex">
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-text text-brand-bg py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Save size={13} />
                {saving ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
