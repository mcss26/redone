import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, ArrowLeft, X, Save, Package, Pencil, Trash2, Loader2 } from 'lucide-react';

const UNITS = ['botella', 'caja', 'pack', 'kg', 'litro', 'unidad'];

export default function SkuModule({ onNavigate }) {
  const [skus, setSkus] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashColor, setFlashColor] = useState('');
  
  // slideOver can be null, 'create', or 'edit'
  const [slideOver, setSlideOver] = useState(null);

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };
  
  const [form, setForm] = useState({
    id: null,
    supplier_id: '',
    name: '',
    system_id: '',
    unit: 'botella',
    cost: '',
    volume_ml: '',
    stock_min: '',
    active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch suppliers for the dropdown
      const { data: sups, error: errSup } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('active', true)
        .order('name');
        
      if (errSup) throw errSup;
      setSuppliers(sups || []);

      // Fetch skus
      const { data: items, error } = await supabase
        .from('skus')
        .select(`
          *,
          suppliers ( name )
        `)
        .order('name');
        
      if (error) throw error;
      setSkus(items || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      triggerFlash('error');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({
      id: null,
      supplier_id: suppliers.length > 0 ? suppliers[0].id : '',
      name: '',
      system_id: '',
      unit: 'botella',
      cost: '',
      volume_ml: '',
      stock_min: '',
      active: true
    });
    setSlideOver('create');
  };

  const openEdit = (sku) => {
    setForm({
      id: sku.id,
      supplier_id: sku.supplier_id || '',
      name: sku.name || '',
      system_id: sku.system_id || '',
      unit: sku.unit || 'botella',
      cost: sku.cost || '',
      volume_ml: sku.volume_ml || '',
      stock_min: sku.stock_min || '',
      active: sku.active
    });
    setSlideOver('edit');
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.supplier_id) return;
    
    try {
      setSaving(true);
      const payload = {
        supplier_id: form.supplier_id,
        name: form.name.trim(),
        system_id: form.system_id.trim() || null,
        unit: form.unit,
        cost: parseFloat(form.cost) || 0,
        volume_ml: parseFloat(form.volume_ml) || null,
        stock_min: parseInt(form.stock_min, 10) || 0,
        active: form.active
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('skus').insert([payload]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('skus').update(payload).eq('id', form.id);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(null);
      fetchData();
    } catch (err) {
      console.error('Error saving sku:', err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar permanentemente el SKU "${form.name}"?`)) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('skus').delete().eq('id', form.id);
      if (error) throw error;
      triggerFlash('success');
      setSlideOver(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting sku:', err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (sku) => {
    try {
      const { error } = await supabase
        .from('skus')
        .update({ active: !sku.active })
        .eq('id', sku.id);
        
      if (error) throw error;
      
      triggerFlash('success');
      setSkus(prev => prev.map(s => s.id === sku.id ? { ...s, active: !sku.active } : s));
    } catch (err) {
      console.error('Error toggling active:', err);
      triggerFlash('error');
    }
  };

  const filteredSkus = skus.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.suppliers?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex relative">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('index')} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-brand-muted">CATÁLOGO SKU</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">{skus.length} registrados</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o proveedor..." 
                className="pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-xs font-semibold focus:outline-none focus:border-brand-text focus:ring-1 focus:ring-brand-text/50 placeholder:text-brand-muted text-brand-text w-64 transition-all"
              />
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-brand-text text-brand-bg px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
            >
              <Package size={13} />
              NUEVO
            </button>
          </div>
        </div>

        {/* Table Area */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-brand-muted text-xs tracking-widest uppercase font-bold animate-pulse">
            Cargando inventario...
          </div>
        ) : (
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-bg/50 border-b border-brand-border/50">
                    <th className="px-5 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted w-1/3">Item</th>
                    <th className="px-5 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted">Proveedor</th>
                    <th className="px-5 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted">Costo / Unidad</th>
                    <th className="px-5 py-4 text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted text-center">Estado</th>
                    <th className="px-5 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/30">
                  {filteredSkus.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center text-xs text-brand-muted tracking-widest uppercase">
                        No se encontraron resultados.
                      </td>
                    </tr>
                  ) : filteredSkus.map((sku) => (
                    <tr key={sku.id} className={`hover:bg-brand-bg/40 transition-colors ${!sku.active ? 'opacity-40' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-semibold text-brand-text flex items-center gap-2">
                          {sku.name} 
                          {sku.system_id && <span className="text-[9px] bg-brand-surface border border-brand-border/50 px-1.5 py-0.5 rounded font-mono text-brand-muted" title="ID en POS / Sistema">ID: {sku.system_id}</span>}
                        </div>
                        <div className="text-[10px] font-mono text-brand-muted mt-0.5">
                          Min: {sku.stock_min} | Vol: {sku.volume_ml ? `${sku.volume_ml}ml` : '-'}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                        {sku.suppliers?.name || '?"'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-mono text-brand-text">
                          ${Number(sku.cost).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-brand-muted mt-0.5">
                          {sku.unit}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button onClick={() => toggleActive(sku)} className="cursor-pointer" title={sku.active ? 'Activo' : 'Inactivo'}>
                          <div className={`w-2 h-2 rounded-full mx-auto ${sku.active ? 'bg-brand-success' : 'bg-brand-error'}`} />
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => openEdit(sku)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                          <Pencil size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Slide-Over Panel */}
      {slideOver && (
        <>
          <div className="absolute inset-0 bg-black/30 z-40" onClick={() => setSlideOver(null)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-brand-bg border-l border-brand-border z-50 flex flex-col animate-slide-in">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border shrink-0">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-muted">
                {slideOver === 'create' ? 'NUEVO SKU' : 'EDITAR SKU'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Nombre del Item *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                    autoFocus
                    placeholder="Ej: Vodka Smirnoff 700ml"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">ID Sistema (POS)</label>
                  <input
                    type="text"
                    value={form.system_id}
                    onChange={(e) => setForm({ ...form, system_id: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="Ej: 18"
                    title="El ID que arroja el CSV de Maxirest o GBOL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Proveedor Principal *</label>
                <select
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                >
                  <option value="" disabled>Seleccione proveedor...</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>



              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Unidad *</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Costo Base ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Volumen (ml)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.volume_ml}
                    onChange={(e) => setForm({ ...form, volume_ml: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Stock Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock_min}
                    onChange={(e) => setForm({ ...form, stock_min: e.target.value })}
                    className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

            </div>

            {/* Panel Footer */}
            <div className="px-6 py-4 border-t border-brand-border shrink-0 flex gap-3">
              {slideOver === 'edit' && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex items-center justify-center bg-brand-surface border border-brand-error/30 text-brand-error rounded-xl px-4 py-3 hover:bg-brand-error hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
                  title="Eliminar SKU"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.supplier_id}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-text text-brand-bg rounded-xl py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
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
