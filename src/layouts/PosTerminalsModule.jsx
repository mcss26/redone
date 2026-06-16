import React, { useRef,  useState, useEffect, useCallback  } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, Pencil, CreditCard, Search, Trash2, Loader2 } from 'lucide-react';
import { sanitizePayload } from '../lib/sanitizer';

export default function PosTerminalsModule({ onNavigate }) {
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [search, setSearch] = useState('');
  const [flashColor, setFlashColor] = useState('');
  
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | terminal object
  const [form, setForm] = useState({ name: '', terminal_id: '' });
  const [saving, setSaving] = useState(false);

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const fetchTerminals = useCallback(async () => {
    try {
      setIsFetchingBackground(true);
      const { data, error } = await supabase
        .from('pos_terminals')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setTerminals(data || []);
    } catch (err) {
      console.error('Error fetching terminals:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      (setIsFetchingBackground(false), setLoading(false));
    }
  }, []);

  useEffect(() => { fetchTerminals(); }, [fetchTerminals]);

  const openCreate = () => {
    setForm({ name: '', terminal_id: '' });
    setSlideOver('create');
  };

  const openEdit = (t) => {
    setForm({ 
      name: t.name, 
      terminal_id: t.terminal_id || '',
    });
    setSlideOver(t);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim().toUpperCase() || null,
        terminal_id: form.terminal_id.trim().toUpperCase() || null,
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('pos_terminals').insert(sanitizePayload(payload));
        if (error) throw error;
      } else {
        const { error } = await supabase.from('pos_terminals').update(sanitizePayload(payload)).eq('id', slideOver.id);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(null);
      fetchTerminals();
    } catch (err) {
      console.error('Error saving terminal:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!(await window.UI.confirm(`¿Eliminar permanentemente la terminal "${form.name}"?`))) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('pos_terminals').delete().eq('id', slideOver.id);
      if (error) throw error;
      triggerFlash('success');
      setSlideOver(null);
      fetchTerminals();
    } catch (err) {
      console.error('Error deleting terminal:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t) => {
    try {
      const { error } = await supabase.from('pos_terminals').update({ active: !t.active }).eq('id', t.id);
      if (error) throw error;
      triggerFlash('success');
      setTerminals(prev => prev.map(terminal => terminal.id === t.id ? { ...terminal, active: !t.active } : terminal));
    } catch (err) {
      console.error('Error toggling active:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    }
  };

  const filteredTerminals = terminals.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.terminal_id && t.terminal_id.toLowerCase().includes(search.toLowerCase()))
  );

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
              PUNTOS DE VENTA
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted/50" />
              <input autoComplete="off" 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar terminal..." 
                className="pl-8 pr-0 py-1 bg-transparent border-b border-brand-border/50 text-[10px] font-semibold tracking-[0.1em] focus:outline-none focus:border-brand-muted placeholder:text-brand-muted/30 text-brand-text w-48 transition-all"
              />
            </div>
            <button
              onClick={openCreate}
              className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer flex items-center justify-end gap-2 text-[10px] font-bold tracking-[0.2em] uppercase"
            >
              + NUEVA
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-4xl">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">NOMBRE DE CAJA</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">ID DE TERMINAL</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-24">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
              ) : filteredTerminals.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-brand-muted/50 text-xs italic">No se encontraron resultados.</td></tr>
              ) : filteredTerminals.map((t) => (
                <tr key={t.id} className={`border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors ${!t.active ? 'opacity-40' : ''}`}>
                  <td className="px-5 py-4 text-sm font-semibold text-brand-text">{t.name}</td>
                  <td className="px-5 py-4 text-xs font-mono text-brand-muted">
                    {t.terminal_id || '-'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => toggleActive(t)} className="cursor-pointer" title={t.active ? 'Activa' : 'Inactiva'}>
                      <div className={`w-2 h-2 rounded-full mx-auto ${t.active ? 'bg-brand-success' : 'bg-brand-error'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEdit(t)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                      <Pencil size={13} />
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
                {slideOver === 'create' ? 'NUEVA TERMINAL' : 'EDITAR TERMINAL'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Panel Body */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
              
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Nombre de Caja *</label>
                <input autoComplete="off"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Ej: CAJA 1, BARRA VIP"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">ID de Terminal</label>
                <input autoComplete="off"
                  type="text"
                  value={form.terminal_id}
                  onChange={(e) => setForm({ ...form, terminal_id: e.target.value.toUpperCase() })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Ej: MP-T12345"
                />
              </div>

            </div>

            {/* Panel Footer */}
            <div className="border-t border-brand-border shrink-0 flex">
              {slideOver !== 'create' && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex items-center justify-center bg-brand-error text-white px-6 hover:bg-red-600 transition-colors disabled:opacity-30 cursor-pointer"
                  title="Eliminar Terminal"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-text text-brand-bg py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
