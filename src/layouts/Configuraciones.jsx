import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Tag, Server, MonitorSmartphone, X, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Configuraciones() {
  const [flashColor, setFlashColor] = useState('');
  
  // Categorias State
  const [categories, setCategories] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catForm, setCatForm] = useState({ nombre: '' });

  // POS State
  const [terminals, setTerminals] = useState([]);
  const [loadingPos, setLoadingPos] = useState(true);
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [editingPosId, setEditingPosId] = useState(null);
  const [posForm, setPosForm] = useState({ friendly_name: '', provider: 'MERCADO PAGO', external_id: '', gbol_alias: '' });

  const openCatModal = (cat = null) => {
    if (cat) {
      setEditingCatId(cat.id);
      setCatForm({ nombre: cat.nombre });
    } else {
      setEditingCatId(null);
      setCatForm({ nombre: '' });
    }
    setCatModalOpen(true);
  };

  const closeCatModal = () => {
    setCatModalOpen(false);
    setEditingCatId(null);
    setCatForm({ nombre: '' });
  };

  const openPosModal = (pos = null) => {
    if (pos) {
      setEditingPosId(pos.id);
      setPosForm({ 
        friendly_name: pos.friendly_name || '', 
        provider: pos.provider || '', 
        external_id: pos.external_id || '', 
        gbol_alias: pos.gbol_alias || '' 
      });
    } else {
      setEditingPosId(null);
      setPosForm({ friendly_name: '', provider: 'MERCADO PAGO', external_id: '', gbol_alias: '' });
    }
    setPosModalOpen(true);
  };

  const closePosModal = () => {
    setPosModalOpen(false);
    setEditingPosId(null);
    setPosForm({ friendly_name: '', provider: 'MERCADO PAGO', external_id: '', gbol_alias: '' });
  };

  const [isSaving, setIsSaving] = useState(false);

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  useEffect(() => {
    fetchCategories();
    fetchTerminals();
  }, []);

  const fetchCategories = async () => {
    setLoadingCat(true);
    const { data, error } = await supabase.from('master_categories').select('*').order('nombre', { ascending: true });
    if (!error) setCategories(data || []);
    setLoadingCat(false);
  };

  const fetchTerminals = async () => {
    setLoadingPos(true);
    const { data, error } = await supabase.from('pos_terminals').select('*').order('friendly_name', { ascending: true });
    if (!error) setTerminals(data || []);
    setLoadingPos(false);
  };

  const toggleCatStatus = async (id, current) => {
    const { error } = await supabase.from('master_categories').update({ active: !current }).eq('id', id);
    if (!error) {
      triggerFlash('success');
      setCategories(categories.map(c => c.id === id ? { ...c, active: !current } : c));
    } else triggerFlash('error');
  };

  const togglePosStatus = async (id, current) => {
    const { error } = await supabase.from('pos_terminals').update({ is_active: !current }).eq('id', id);
    if (!error) {
      triggerFlash('success');
      setTerminals(terminals.map(t => t.id === id ? { ...t, is_active: !current } : t));
    } else triggerFlash('error');
  };

  const handleDeleteCat = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta familia?")) return;
    const { error } = await supabase.from('master_categories').delete().eq('id', id);
    if (!error) {
      triggerFlash('success');
      fetchCategories();
    } else triggerFlash('error');
  };

  const handleDeletePos = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta terminal?")) return;
    const { error } = await supabase.from('pos_terminals').delete().eq('id', id);
    if (!error) {
      triggerFlash('success');
      fetchTerminals();
    } else triggerFlash('error');
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.nombre) return;
    setIsSaving(true);
    let error;
    if (editingCatId) {
      const res = await supabase.from('master_categories').update({ nombre: catForm.nombre }).eq('id', editingCatId);
      error = res.error;
    } else {
      const res = await supabase.from('master_categories').insert([{ nombre: catForm.nombre, active: true }]);
      error = res.error;
    }
    setIsSaving(false);
    if (!error) {
      triggerFlash('success');
      closeCatModal();
      fetchCategories();
    } else triggerFlash('error');
  };

  const handlePosSubmit = async (e) => {
    e.preventDefault();
    if (!posForm.friendly_name) return;
    setIsSaving(true);
    const payload = { ...posForm };
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
    
    let error;
    if (editingPosId) {
      const res = await supabase.from('pos_terminals').update(payload).eq('id', editingPosId);
      error = res.error;
    } else {
      payload.is_active = true;
      const res = await supabase.from('pos_terminals').insert([payload]);
      error = res.error;
    }
    
    setIsSaving(false);
    if (!error) {
      triggerFlash('success');
      closePosModal();
      fetchTerminals();
    } else triggerFlash('error');
  };

  return (
    <div className="h-full flex flex-col p-8 min-h-full">
      {flashColor && <div className={`fixed inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text">Sistema & Operaciones</h2>
          <p className="text-sm font-semibold text-brand-muted mt-1">Configuración Troncal del Entorno</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
        
        {/* COLUMNA IZQUIERDA: CATEGORÍAS */}
        <div className="flex flex-col border border-brand-border bg-brand-bg rounded-2xl overflow-hidden shadow-sm h-full">
          <div className="p-6 border-b border-brand-border bg-brand-surface flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <Tag size={20} className="text-brand-text" />
              <h3 className="font-extrabold uppercase tracking-widest text-brand-text">Familias de Productos</h3>
            </div>
            <button onClick={() => openCatModal()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent bg-brand-text text-brand-bg text-xs font-bold hover:bg-brand-text/90 transition-all shadow-md cursor-pointer">
              <Plus size={14} /> Nueva
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <tbody className="font-medium relative divide-y divide-brand-border/50">
                {loadingCat ? (
                  <tr><td className="p-12 text-center text-brand-muted"><Loader2 size={24} className="animate-spin mx-auto mb-2 text-brand-text" /><div className="uppercase tracking-widest text-[10px] font-bold">Cargando...</div></td></tr>
                ) : categories.length === 0 ? (
                  <tr><td className="p-12 text-center text-brand-muted"><div className="uppercase tracking-widest text-[10px] font-bold">Sin registros</div></td></tr>
                ) : categories.map(c => (
                  <tr key={c.id} className="hover:bg-brand-surface/30 transition-colors">
                    <td className="p-4 font-bold text-brand-text">{c.nombre}</td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button onClick={() => toggleCatStatus(c.id, c.active)} className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-widest uppercase cursor-pointer border border-transparent ${c.active ? 'bg-brand-success/10 text-brand-success hover:border-brand-error hover:text-brand-error' : 'bg-brand-error/10 text-brand-error hover:border-brand-success hover:text-brand-success'}`}>
                        {c.active ? 'Activa' : 'Inactiva'}
                      </button>
                      <button onClick={() => openCatModal(c)} className="p-1.5 rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors cursor-pointer" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteCat(c.id)} className="p-1.5 rounded-md text-brand-muted hover:text-brand-error hover:bg-brand-error/10 transition-colors cursor-pointer" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLUMNA DERECHA: TERMINALES POS */}
        <div className="flex flex-col border border-brand-border bg-brand-bg rounded-2xl overflow-hidden shadow-sm h-full">
          <div className="p-6 border-b border-brand-border bg-brand-surface flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <MonitorSmartphone size={20} className="text-brand-text" />
              <h3 className="font-extrabold uppercase tracking-widest text-brand-text">Terminales POS</h3>
            </div>
            <button onClick={() => openPosModal()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-transparent bg-brand-text text-brand-bg text-xs font-bold hover:bg-brand-text/90 transition-all shadow-md cursor-pointer">
              <Plus size={14} /> Nueva
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <tbody className="font-medium relative divide-y divide-brand-border/50">
                {loadingPos ? (
                  <tr><td className="p-12 text-center text-brand-muted"><Loader2 size={24} className="animate-spin mx-auto mb-2 text-brand-text" /><div className="uppercase tracking-widest text-[10px] font-bold">Cargando...</div></td></tr>
                ) : terminals.length === 0 ? (
                  <tr><td className="p-12 text-center text-brand-muted"><div className="uppercase tracking-widest text-[10px] font-bold">Sin registros</div></td></tr>
                ) : terminals.map(t => (
                  <tr key={t.id} className="hover:bg-brand-surface/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-brand-text">{t.friendly_name}</div>
                      <div className="text-[10px] text-brand-muted uppercase font-semibold mt-0.5">{t.provider}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-[10px] text-brand-muted uppercase font-semibold">GBOL Alias</div>
                      <div className="text-xs font-mono font-bold">{t.gbol_alias || '-'}</div>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button onClick={() => togglePosStatus(t.id, t.is_active)} className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-widest uppercase cursor-pointer border border-transparent ${t.is_active ? 'bg-brand-success/10 text-brand-success hover:border-brand-error hover:text-brand-error' : 'bg-brand-error/10 text-brand-error hover:border-brand-success hover:text-brand-success'}`}>
                        {t.is_active ? 'Online' : 'Offline'}
                      </button>
                      <button onClick={() => openPosModal(t)} className="p-1.5 rounded-md text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors cursor-pointer" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeletePos(t.id)} className="p-1.5 rounded-md text-brand-muted hover:text-brand-error hover:bg-brand-error/10 transition-colors cursor-pointer" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BACKDROP FOR BOTH MODALS */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${(catModalOpen || posModalOpen) ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => { closeCatModal(); closePosModal(); }}></div>

      {/* CATEGORY SLIDE-OVER */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-[400px] bg-[#0A0A0A] border-l border-brand-border z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${catModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-8 border-b border-brand-border/50 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold tracking-widest uppercase text-brand-text">{editingCatId ? 'Editar Familia' : 'Nueva Familia'}</h2>
            <p className="text-[10px] uppercase font-bold text-brand-muted tracking-widest mt-1">Configuración de Categoría</p>
          </div>
          <button onClick={closeCatModal} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-surface transition-colors text-brand-muted cursor-pointer"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <form id="catForm" onSubmit={handleCatSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Nombre Descriptivo *</label>
              <input required type="text" value={catForm.nombre} onChange={e => setCatForm({...catForm, nombre: e.target.value})} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-base text-brand-text font-bold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="Ej: LIMPIEZA" />
            </div>
          </form>
        </div>
        <div className="p-8 border-t border-brand-border/50 shrink-0">
          <button type="submit" form="catForm" disabled={isSaving} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-extrabold uppercase tracking-widest text-sm transition-all shadow-2xl ${isSaving ? 'bg-brand-text/50 cursor-not-allowed text-brand-bg' : 'bg-brand-text text-brand-bg hover:bg-brand-text/90 cursor-pointer'}`}>
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : (editingCatId ? <Pencil size={18} /> : <Plus size={18} />)} {isSaving ? 'GUARDANDO...' : (editingCatId ? 'GUARDAR CAMBIOS' : 'REGISTRAR')}
          </button>
        </div>
      </div>

      {/* POS SLIDE-OVER */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-[400px] bg-[#0A0A0A] border-l border-brand-border z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${posModalOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-8 border-b border-brand-border/50 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold tracking-widest uppercase text-brand-text">{editingPosId ? 'Editar Terminal' : 'Nueva Terminal'}</h2>
            <p className="text-[10px] uppercase font-bold text-brand-muted tracking-widest mt-1">Configuración POS</p>
          </div>
          <button onClick={closePosModal} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-surface transition-colors text-brand-muted cursor-pointer"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          <form id="posForm" onSubmit={handlePosSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Identificador Local (Friendly) *</label>
              <input required type="text" value={posForm.friendly_name} onChange={e => setPosForm({...posForm, friendly_name: e.target.value})} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-base text-brand-text font-bold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="Ej: CAJA PRINCIPAL" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Proveedor (Pasarela)</label>
              <input type="text" value={posForm.provider} onChange={e => setPosForm({...posForm, provider: e.target.value})} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="MERCADO PAGO" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Mapeo GBOL (Alias) *</label>
              <input required type="text" value={posForm.gbol_alias} onChange={e => setPosForm({...posForm, gbol_alias: e.target.value})} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="CAJA 1" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Device / External ID</label>
              <input type="text" value={posForm.external_id} onChange={e => setPosForm({...posForm, external_id: e.target.value})} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="SN-123456" />
            </div>
          </form>
        </div>
        <div className="p-8 border-t border-brand-border/50 shrink-0">
          <button type="submit" form="posForm" disabled={isSaving} className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-extrabold uppercase tracking-widest text-sm transition-all shadow-2xl ${isSaving ? 'bg-brand-text/50 cursor-not-allowed text-brand-bg' : 'bg-brand-text text-brand-bg hover:bg-brand-text/90 cursor-pointer'}`}>
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : (editingPosId ? <Pencil size={18} /> : <Plus size={18} />)} {isSaving ? 'GUARDANDO...' : (editingPosId ? 'GUARDAR CAMBIOS' : 'VINCULAR POS')}
          </button>
        </div>
      </div>

    </div>
  );
}
