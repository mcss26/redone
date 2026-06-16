import React, { useRef,  useState, useEffect  } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, X, Save, Pencil, Trash2, Loader2, Package } from 'lucide-react';
import { sanitizePayload } from '../lib/sanitizer';

const UNITS = ['botella', 'caja', 'pack', 'kg', 'litro', 'unidad'];

export default function SkuModule({ onNavigate }) {
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const [skus, setSkus] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
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
    unit: 'unidad',
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
      setIsFetchingBackground(true);
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
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      (setIsFetchingBackground(false), setLoading(false));
    }
  };

  const openCreate = () => {
    setForm({
      id: null,
      supplier_id: suppliers.length > 0 ? suppliers[0].id : '',
      name: '',
      system_id: '',
      unit: 'unidad',
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
      unit: sku.unit || 'unidad',
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
        active: form.active
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('skus').insert([sanitizePayload(payload)]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('skus').update(sanitizePayload(payload)).eq('id', form.id);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(null);
      fetchData();
    } catch (err) {
      console.error('Error saving sku:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!(await window.UI.confirm(`¿Eliminar permanentemente el SKU "${form.name}"?`))) return;
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
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
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
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    }
  };

  const filteredSkus = skus.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.suppliers?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedSkus = [...filteredSkus].sort((a, b) => {
    let valA = a[sortConfig.key];
    let valB = b[sortConfig.key];

    if (sortConfig.key === 'supplier') {
      valA = a.suppliers?.name || '';
      valB = b.suppliers?.name || '';
    } else if (sortConfig.key === 'cost') {
      valA = Number(a.cost) || 0;
      valB = Number(b.cost) || 0;
    } else if (sortConfig.key === 'active') {
      valA = a.active ? 1 : 0;
      valB = b.active ? 1 : 0;
    } else if (sortConfig.key === 'name') {
      valA = (a.name || '').toLowerCase();
      valB = (b.name || '').toLowerCase();
    }

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

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
              CATÁLOGO SKU
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted/50" />
              <input autoComplete="off" 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre..." 
                className="pl-8 pr-0 py-1 bg-transparent border-b border-brand-border/50 text-[10px] font-semibold tracking-[0.1em] focus:outline-none focus:border-brand-muted placeholder:text-brand-muted/30 text-brand-text w-48 transition-all"
              />
            </div>
            <button
              onClick={openCreate}
              className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer flex items-center justify-end gap-2 text-[10px] font-bold tracking-[0.2em] uppercase"
            >
              + NUEVO
            </button>
          </div>
        </div>

        {/* Table Area */}
        {loading ? (
          <div className="flex items-center justify-center h-40 text-brand-muted text-xs tracking-widest uppercase font-bold animate-pulse">
            Cargando inventario...
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-brand-border">
                  <th onClick={() => handleSort('name')} className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-1/3 cursor-pointer hover:text-brand-text select-none group">
                    ITEM {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('supplier')} className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 cursor-pointer hover:text-brand-text select-none group">
                    PROVEEDOR {sortConfig.key === 'supplier' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('cost')} className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 cursor-pointer hover:text-brand-text select-none group">
                    COSTO / UNIDAD {sortConfig.key === 'cost' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('active')} className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 cursor-pointer hover:text-brand-text select-none group">
                    ESTADO {sortConfig.key === 'active' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                  {sortedSkus.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center text-xs text-brand-muted tracking-widest uppercase">
                        No se encontraron resultados.
                      </td>
                    </tr>
                  ) : sortedSkus.map((sku) => (
                    <tr key={sku.id} className={`border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors ${!sku.active ? 'opacity-40' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-semibold text-brand-text flex items-center gap-2">
                          <Package size={12} className="text-brand-muted" /> {sku.name} 
                          {sku.system_id && <span className="text-[9px] bg-brand-surface border border-brand-border/50 px-1.5 py-0.5 rounded font-mono text-brand-muted" title="ID en POS / Sistema">ID: {sku.system_id}</span>}
                        </div>
                        <div className="text-[10px] font-mono text-brand-muted mt-0.5">
                          Min: {sku.stock_min} | Vol: {sku.volume_ml ? `${sku.volume_ml}ml` : '-'}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-brand-muted">
                        {sku.suppliers?.name ? (
                          <span className="bg-brand-border/30 px-2 py-1 rounded text-brand-text">{sku.suppliers.name}</span>
                        ) : (
                          <span className="text-brand-muted/50">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-mono text-brand-text">
                          ${Number(sku.cost).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-5 py-2">
                        <div className="flex justify-center w-full">
                          <button onClick={() => toggleActive(sku)} className="cursor-pointer p-3 min-w-[44px] min-h-[44px] flex items-center justify-center" title={sku.active ? 'ACTIVO' : 'INACTIVO'}>
                            <div className={`w-2 h-2 rounded-full ${sku.active ? 'bg-brand-success shadow-[0_0_6px_rgba(74,222,128,0.5)]' : 'bg-brand-error shadow-[0_0_6px_rgba(248,113,113,0.5)]'}`} />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-2 text-right">
                        <div className="flex items-center justify-end">
                          <button onClick={() => openEdit(sku)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer p-3 min-w-[44px] min-h-[44px] flex items-center justify-center">
                            <Pencil size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <div className={`flex-1 overflow-y-auto p-6 space-y-8 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sku_name" className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted/50 mb-1">Nombre del Item *</label>
                  <input id="sku_name" autoComplete="off"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold placeholder:text-brand-muted/30 focus:outline-none focus:border-brand-muted transition-colors"
                    autoFocus
                    placeholder="Ej: Vodka Smirnoff"
                  />
                </div>
                <div>
                  <label htmlFor="sku_system_id" className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted/50 mb-1">ID Sistema (POS)</label>
                  <input id="sku_system_id" autoComplete="off"
                    type="text"
                    value={form.system_id}
                    onChange={(e) => setForm({ ...form, system_id: e.target.value })}
                    className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono placeholder:text-brand-muted/30 focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="Ej: 18"
                    title="El ID que arroja el CSV de Maxirest o GBOL"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sku_supplier" className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted/50 mb-1">Proveedor Principal *</label>
                <select
                  id="sku_supplier"
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold focus:outline-none focus:border-brand-muted transition-colors appearance-none"
                >
                  <option value="" disabled className="bg-brand-bg">Seleccione proveedor...</option>
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id} className="bg-brand-bg">{sup.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="sku_cost" className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted/50 mb-1">Costo Base ($) *</label>
                  <input id="sku_cost" autoComplete="off"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono placeholder:text-brand-muted/30 focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sku_volume" className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted/50 mb-1">Volumen (ml)</label>
                  <input id="sku_volume" autoComplete="off"
                    type="number"
                    min="0"
                    value={form.volume_ml}
                    onChange={(e) => setForm({ ...form, volume_ml: e.target.value })}
                    className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono placeholder:text-brand-muted/30 focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="sku_stock_min" className="block text-[9px] font-bold tracking-[0.3em] uppercase text-brand-muted/50">Stock Mínimo</label>
                    <span className="text-[8px] tracking-[0.2em] text-brand-muted/30 uppercase bg-brand-surface px-1.5 py-0.5 rounded">Auto</span>
                  </div>
                  <input id="sku_stock_min" autoComplete="off"
                    type="number"
                    min="0"
                    value={form.stock_min || ''}
                    readOnly
                    className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-muted font-mono focus:outline-none cursor-not-allowed opacity-70"
                    placeholder="Calculado Automáticamente"
                    title="Este valor se calcula automáticamente en base al promedio de las últimas 10 fechas"
                  />
                </div>
              </div>

            </div>

            {/* Panel Footer */}
            <div className="border-t border-brand-border shrink-0 flex">
              {slideOver === 'edit' && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex items-center justify-center bg-transparent border-r border-brand-border text-brand-error/70 px-6 py-4 hover:bg-brand-error hover:text-brand-bg transition-colors disabled:opacity-30 cursor-pointer"
                  title="Eliminar SKU"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.supplier_id}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-text text-brand-bg py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                {saving ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
