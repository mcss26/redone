import React, { useState, useEffect } from 'react';
import { Search, Plus, ChevronDown, Package, Link as LinkIcon, DollarSign, Droplet, Hash, CheckSquare, Loader2, Tag, Truck, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function MasterSKU() {
  const [skus, setSkus] = useState([]);
  const [categories, setCategories] = useState({});
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashColor, setFlashColor] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialForm = {
    nombre: '', external_id: '', tipo: '', categoria_id: '',
    proveedor_default_id: '', costo: '', costo_pack: '',
    pack_qty: '', ml_por_unidad: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch data concurrently to map Foreign Keys locally
      // This is safer than a joined query when we don't know the exact FK constraint names
      const [skuRes, catRes, provRes] = await Promise.all([
        supabase.from('master_sku').select('*').order('nombre', { ascending: true }),
        supabase.from('master_categories').select('*'),
        supabase.from('master_proveedores').select('id, nombre_fantasia')
      ]);

      if (skuRes.error) throw skuRes.error;

      // Create lookup maps for relationships
      const catMap = {};
      if (catRes.data) {
        catRes.data.forEach(c => { catMap[c.id] = c.nombre || c.name || c.category || 'Categoría Desconocida'; });
      }

      const provMap = {};
      if (provRes.data) {
        provRes.data.forEach(p => { provMap[p.id] = p.nombre_fantasia; });
      }

      setCategories(catMap);
      setProviders(provMap);
      setSkus(skuRes.data || []);
    } catch (err) {
      console.error('Error fetching SKUs:', err);
      setError(err.message);
      triggerFlash('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nombre) return;

    try {
      setIsSaving(true);
      
      const payload = { ...formData, active: true };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      if (editingId) {
        const { error } = await supabase
          .from('master_sku')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('master_sku')
          .insert([payload]);
        if (error) throw error;
      }

      triggerFlash('success');
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchData();
    } catch (err) {
      console.error('Error saving SKU:', err);
      triggerFlash('error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('master_sku')
        .update({ active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      triggerFlash('success');
      setSkus(skus.map(s => s.id === id ? { ...s, active: !currentStatus } : s));
    } catch (err) {
      console.error('Error toggling status:', err);
      triggerFlash('error');
    }
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '-';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val);
  };

  const SkuRow = ({ sku }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <>
        <tr 
          onClick={() => setIsExpanded(!isExpanded)} 
          className={`hover:bg-brand-surface transition-all duration-200 text-brand-text cursor-pointer border-b ${isExpanded ? 'bg-brand-surface/50 border-brand-border' : 'border-brand-border/50'}`}
        >
          <td className="p-4">
            <div className="font-bold text-sm truncate max-w-[250px] text-brand-text">{sku.nombre || 'SIN NOMBRE'}</div>
            {sku.external_id && <div className="text-[10px] text-brand-muted uppercase font-mono mt-0.5">{sku.external_id}</div>}
          </td>
          <td className="p-4 font-semibold text-xs text-brand-muted">
            {sku.categoria_id ? (categories[sku.categoria_id] || 'Cargando...') : '-'}
          </td>
          <td className="p-4 font-mono font-medium text-xs text-brand-text">
            {sku.pack_qty ? `x${sku.pack_qty}` : '-'}
          </td>
          <td className="p-4 font-mono font-medium text-xs text-brand-text">
            {formatCurrency(sku.costo)}
          </td>
          <td className="p-4 font-mono font-medium text-xs text-brand-muted">
            {formatCurrency(sku.costo_pack)}
          </td>
          <td className="p-4">
            <div className="flex justify-center">
              <span 
                className={`w-2 h-2 rounded-full ${sku.active ? 'bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-brand-error shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}
                title={sku.active ? 'Activo' : 'Inactivo'}
              ></span>
            </div>
          </td>
          <td className="p-4 text-right">
            <button className={`p-1 rounded-md hover:bg-brand-bg transition-colors ${isExpanded ? 'text-brand-text bg-brand-bg' : 'text-brand-muted'}`}>
              <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </td>
        </tr>
        
        {/* EXPANDED DETAILS */}
        {isExpanded && (
          <tr className="bg-brand-surface/30 border-b border-brand-border">
            <td colSpan="7" className="p-6">
              <div className="flex items-center justify-between gap-8">
                
                {/* Detalles Operativos */}
                <div className="flex items-center gap-16">
                  <div>
                    <div className="text-[10px] text-brand-muted uppercase font-semibold tracking-widest">Volumen (ML)</div>
                    <div className="text-sm font-semibold text-brand-text mt-0.5">{sku.ml_por_unidad ? `${sku.ml_por_unidad} ml` : '-'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-muted uppercase font-semibold tracking-widest">Proveedor Default</div>
                    <div className="text-sm font-semibold text-brand-text mt-0.5">
                      {sku.proveedor_default_id ? (providers[sku.proveedor_default_id] || 'Cargando...') : '-'}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleStatus(sku.id, sku.active); }} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      sku.active 
                        ? 'text-brand-error border-transparent hover:bg-brand-error/10 hover:border-brand-error/20' 
                        : 'text-brand-success border-transparent hover:bg-brand-success/10 hover:border-brand-success/20'
                    }`}
                  >
                    {sku.active ? 'Desactivar SKU' : 'Reactivar SKU'}
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setFormData({
                        nombre: sku.nombre || '',
                        external_id: sku.external_id || '',
                        categoria_id: sku.categoria_id || '',
                        proveedor_default_id: sku.proveedor_default_id || '',
                        costo: sku.costo || '',
                        costo_pack: sku.costo_pack || '',
                        pack_qty: sku.pack_qty || '',
                        ml_por_unidad: sku.ml_por_unidad || ''
                      });
                      setEditingId(sku.id);
                      setIsModalOpen(true);
                    }} 
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-surface border border-brand-border hover:border-brand-text transition-colors cursor-pointer text-brand-text"
                  >
                    Editar SKU
                  </button>
                </div>

              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <div className="h-full flex flex-col p-8 min-h-full">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`fixed inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text">Catálogo SKU</h2>
          <p className="text-sm font-semibold text-brand-muted mt-1">Master de Productos e Insumos</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              id="searchSkuQuery"
              name="searchSkuQuery"
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ID, External o Nombre..." 
              className="pl-10 pr-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm font-semibold focus:outline-none focus:border-brand-text focus:ring-1 focus:ring-brand-text/50 placeholder:text-brand-muted text-brand-text w-72 transition-all"
            />
          </div>
          <button 
            onClick={() => {
              setFormData(initialForm);
              setEditingId(null);
              setIsModalOpen(true);
            }} 
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-transparent bg-brand-text text-brand-bg text-sm font-bold hover:bg-brand-text/90 transition-all duration-200 cursor-pointer shadow-md"
          >
            <Plus size={18} />
            Registrar SKU
          </button>
        </div>
      </div>

      <div className="flex-1 border border-brand-border bg-brand-bg rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead className="bg-[#0A0A0A] text-brand-muted sticky top-0 z-10">
              <tr>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border">Nombre</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border">Categoría</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border">Pack</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border">Costo Base</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border">Costo Pack</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border text-center">Estado</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="font-medium relative">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-brand-muted">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4 text-brand-text" />
                    <div className="uppercase tracking-widest text-xs font-bold">Sincronizando Catálogo...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-brand-error">
                    <div className="uppercase tracking-widest text-xs font-bold">Error de conexión: {error}</div>
                  </td>
                </tr>
              ) : skus.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-brand-muted">
                    <div className="uppercase tracking-widest text-xs font-bold">No hay SKUs registrados.</div>
                  </td>
                </tr>
              ) : (
                skus
                  .filter(sku => 
                    (sku.nombre?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                    (sku.external_id || '').includes(searchQuery)
                  )
                  .map((sku) => (
                    <SkuRow key={sku.id} sku={sku} />
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL BACKDROP */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isModalOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsModalOpen(false)}
      ></div>

      {/* SLIDE-OVER SIDE SHEET */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-[500px] bg-[#0A0A0A] border-l border-brand-border z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isModalOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-8 border-b border-brand-border/50 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold tracking-widest uppercase text-brand-text">
              {editingId ? 'Editar SKU' : 'Nuevo SKU'}
            </h2>
            <p className="text-[10px] uppercase font-bold text-brand-muted tracking-widest mt-1">
              {editingId ? 'Actualización de Producto' : 'Alta de Producto en Catálogo'}
            </p>
          </div>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-surface transition-colors text-brand-muted hover:text-brand-text cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <form id="skuForm" onSubmit={handleSave} className="space-y-10">
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2">
                <Hash size={16} className="text-brand-muted" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">A. Identificación</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Nombre del Producto *</label>
                  <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-base text-brand-text font-bold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="Ej: Vodka Absolut 700ml" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">External ID</label>
                  <input type="text" name="external_id" value={formData.external_id} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="SKU-ABS-01" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2">
                <LinkIcon size={16} className="text-brand-muted" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">B. Relaciones</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Categoría</label>
                  <select name="categoria_id" value={formData.categoria_id} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold focus:outline-none focus:border-brand-text transition-colors appearance-none">
                    <option value="" className="bg-brand-bg text-brand-muted">Sin Categoría</option>
                    {Object.entries(categories).map(([id, name]) => (
                      <option key={id} value={id} className="bg-brand-bg">{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Proveedor Default</label>
                  <select name="proveedor_default_id" value={formData.proveedor_default_id} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold focus:outline-none focus:border-brand-text transition-colors appearance-none">
                    <option value="" className="bg-brand-bg text-brand-muted">Sin Proveedor Asignado</option>
                    {Object.entries(providers).map(([id, name]) => (
                      <option key={id} value={id} className="bg-brand-bg">{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2">
                <DollarSign size={16} className="text-brand-muted" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">C. Costos y Volumetría</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Costo Base</label>
                  <input type="number" step="0.01" name="costo" value={formData.costo} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Costo Pack</label>
                  <input type="number" step="0.01" name="costo_pack" value={formData.costo_pack} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Unidades por Pack</label>
                  <input type="number" name="pack_qty" value={formData.pack_qty} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="1" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">ML por Unidad</label>
                  <input type="number" name="ml_por_unidad" value={formData.ml_por_unidad} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="1000" />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-8 border-t border-brand-border/50 shrink-0">
          <button 
            type="submit" 
            form="skuForm"
            disabled={isSaving}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-extrabold uppercase tracking-widest text-sm transition-all duration-200 shadow-2xl ${
              isSaving 
                ? 'bg-brand-text/50 text-brand-bg cursor-not-allowed' 
                : 'bg-brand-text text-brand-bg hover:bg-brand-text/90 cursor-pointer'
            }`}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {isSaving ? (editingId ? 'GUARDANDO...' : 'REGISTRANDO...') : (editingId ? 'GUARDAR CAMBIOS' : 'REGISTRAR SKU')}
          </button>
        </div>
      </div>
    </div>
  );
}
