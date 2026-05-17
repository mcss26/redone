import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, ChevronDown, Building2, User, CreditCard, Mail, Phone, FileText, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function MasterProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashColor, setFlashColor] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialForm = {
    nombre_fantasia: '', category: '', razon_social: '', cuit: '',
    contacto_nombre: '', email: '', contacto_telefono: '',
    banco: '', cbu: '', alias: '', notas: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('master_proveedores')
        .select('*')
        .order('nombre_fantasia', { ascending: true });

      if (error) throw error;
      setProveedores(data || []);
    } catch (err) {
      console.error('Error fetching proveedores:', err);
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
    if (!formData.nombre_fantasia) return; // Basic validation

    try {
      setIsSaving(true);
      
      // Sanitizamos los campos vacíos a null para respetar la integridad de Postgres
      const payload = { ...formData, active: true };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('master_proveedores')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('master_proveedores')
          .insert([payload]);
        if (error) throw error;
      }

      triggerFlash('success');
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchProveedores(); // Refresh list
    } catch (err) {
      console.error('Error creating proveedor:', err);
      triggerFlash('error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('master_proveedores')
        .update({ active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      triggerFlash('success');
      setProveedores(proveedores.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
    } catch (err) {
      console.error('Error toggling status:', err);
      triggerFlash('error');
    }
  };

  const ProveedorRow = ({ prov }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <>
        <tr 
          onClick={() => setIsExpanded(!isExpanded)} 
          className={`hover:bg-brand-surface transition-all duration-200 text-brand-text cursor-pointer border-b ${isExpanded ? 'bg-brand-surface/50 border-brand-border' : 'border-brand-border/50'}`}
        >
          <td className="p-4 font-bold text-sm text-brand-text">
            {prov.nombre_fantasia || 'SIN NOMBRE'}
          </td>
          <td className="p-4 font-mono font-medium text-xs tracking-tight text-brand-text">{prov.cuit || '-'}</td>
          <td className="p-4 font-semibold text-xs text-brand-muted">{prov.banco || '-'}</td>
          <td className="p-4 font-mono font-medium text-xs text-brand-text">{prov.alias || prov.cbu_alias || '-'}</td>
          <td className="p-4 font-mono font-medium text-xs text-brand-muted">{prov.cbu || '-'}</td>
          <td className="p-4">
            <div className="flex justify-center">
              <span 
                className={`w-2 h-2 rounded-full ${prov.active ? 'bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-brand-error shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}
                title={prov.active ? 'Activo' : 'Inactivo'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Identity & Legal */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-text border-b border-brand-border/50 pb-2">
                    <Building2 size={16} className="text-brand-muted" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Identidad Legal</h4>
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-muted uppercase font-semibold">Razón Social</div>
                    <div className="text-sm font-semibold">{prov.razon_social || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-muted uppercase font-semibold">Rubro / Categoría</div>
                    <div className="text-sm font-semibold">{prov.category || '-'}</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-text border-b border-brand-border/50 pb-2">
                    <User size={16} className="text-brand-muted" />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Contacto Directo</h4>
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-muted uppercase font-semibold">Persona</div>
                    <div className="text-sm font-semibold">{prov.contacto_nombre || '-'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-brand-muted" />
                    <div className="text-sm font-medium">{prov.email || '-'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-brand-muted" />
                    <div className="text-sm font-medium">{prov.contacto_telefono || '-'}</div>
                  </div>
                </div>

                {/* Bank data moved to main row */}

                {/* Notes (Full Width) */}
                {prov.notas && (
                  <div className="col-span-1 md:col-span-2 mt-2 bg-brand-bg rounded-xl p-4 border border-brand-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} className="text-brand-muted" />
                      <div className="text-[10px] text-brand-muted uppercase font-semibold">Notas</div>
                    </div>
                    <p className="text-sm font-medium text-brand-muted">{prov.notas}</p>
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleStatus(prov.id, prov.active); }} 
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      prov.active 
                        ? 'text-brand-error border-transparent hover:bg-brand-error/10 hover:border-brand-error/20' 
                        : 'text-brand-success border-transparent hover:bg-brand-success/10 hover:border-brand-success/20'
                    }`}
                  >
                    {prov.active ? 'Desactivar Proveedor' : 'Reactivar Proveedor'}
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setFormData({
                        nombre_fantasia: prov.nombre_fantasia || '',
                        category: prov.category || '',
                        razon_social: prov.razon_social || '',
                        cuit: prov.cuit || '',
                        contacto_nombre: prov.contacto_nombre || '',
                        email: prov.email || '',
                        contacto_telefono: prov.contacto_telefono || '',
                        banco: prov.banco || '',
                        cbu: prov.cbu || '',
                        alias: prov.alias || prov.cbu_alias || '',
                        notas: prov.notas || ''
                      });
                      setEditingId(prov.id);
                      setIsModalOpen(true);
                    }} 
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-surface border border-brand-border hover:border-brand-text transition-colors cursor-pointer"
                  >
                    Editar Datos
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
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text">Proveedores</h2>
          <p className="text-sm font-semibold text-brand-muted mt-1">Master de Entidades Comerciales</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              id="searchQuery"
              name="searchQuery"
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por CUIT o Nombre..." 
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
            Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="flex-1 border border-brand-border bg-brand-bg rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead className="bg-[#0A0A0A] text-brand-muted sticky top-0 z-10">
              <tr>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border">Nombre de Fantasía</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border">CUIT</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border">Banco</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border">Alias</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border">CBU</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border text-center">Estado</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest border-b border-brand-border text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="font-medium relative">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-brand-muted">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4 text-brand-text" />
                    <div className="uppercase tracking-widest text-xs font-bold">Sincronizando con Supabase...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-brand-error">
                    <div className="uppercase tracking-widest text-xs font-bold">Error de conexión: {error}</div>
                  </td>
                </tr>
              ) : proveedores.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-brand-muted">
                    <div className="uppercase tracking-widest text-xs font-bold">No hay proveedores registrados.</div>
                  </td>
                </tr>
              ) : (
                proveedores
                  .filter(prov => 
                    (prov.nombre_fantasia?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                    (prov.cuit || '').includes(searchQuery) ||
                    (prov.razon_social?.toLowerCase() || '').includes(searchQuery.toLowerCase())
                  )
                  .map((prov) => (
                    <ProveedorRow key={prov.id} prov={prov} />
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
              {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <p className="text-[10px] uppercase font-bold text-brand-muted tracking-widest mt-1">
              {editingId ? 'Actualización de Entidad Comercial' : 'Alta de Entidad Comercial'}
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
          <form id="provForm" onSubmit={handleSave} className="space-y-10">
            
            {/* BLOQUE A */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2">
                <Building2 size={16} className="text-brand-muted" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">A. Identidad Legal</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Nombre de Fantasía *</label>
                  <input required type="text" name="nombre_fantasia" value={formData.nombre_fantasia} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-base text-brand-text font-bold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="Ej: Coca-Cola Distribuidora" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Razón Social</label>
                  <input type="text" name="razon_social" value={formData.razon_social} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="Ej: Femsa S.A." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">CUIT</label>
                    <input type="text" name="cuit" value={formData.cuit} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="30-00000000-0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Rubro / Categoría</label>
                    <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="Bebidas" />
                  </div>
                </div>
              </div>
            </div>

            {/* BLOQUE B */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2">
                <User size={16} className="text-brand-muted" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">B. Contacto Operativo</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Persona de Contacto</label>
                  <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="Nombre del representante" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Teléfono</label>
                    <input type="text" name="contacto_telefono" value={formData.contacto_telefono} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="+54 9 11..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Correo Electrónico</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="contacto@empresa.com" />
                  </div>
                </div>
              </div>
            </div>

            {/* BLOQUE C */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2">
                <CreditCard size={16} className="text-brand-muted" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">C. Tesorería y Pagos</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Entidad Bancaria</label>
                  <input type="text" name="banco" value={formData.banco} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="Galicia, Santander..." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">CBU / CVU</label>
                    <input type="text" name="cbu" value={formData.cbu} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="000000000000000000" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Alias</label>
                    <input type="text" name="alias" value={formData.alias} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="EMPRESA.PAGO" />
                  </div>
                </div>
              </div>
            </div>

            {/* BLOQUE D */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2">
                <FileText size={16} className="text-brand-muted" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">D. Operaciones</h3>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Anotaciones (Días de Visita, Plazos, etc)</label>
                <textarea name="notas" value={formData.notas} onChange={handleInputChange} rows="3" className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-medium focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30 resize-none" placeholder="El corredor pasa los martes a las 15hs..."></textarea>
              </div>
            </div>

          </form>
        </div>

        <div className="p-8 border-t border-brand-border/50 shrink-0">
          <button 
            type="submit" 
            form="provForm"
            disabled={isSaving}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-extrabold uppercase tracking-widest text-sm transition-all duration-200 shadow-2xl ${
              isSaving 
                ? 'bg-brand-text/50 text-brand-bg cursor-not-allowed' 
                : 'bg-brand-text text-brand-bg hover:bg-brand-text/90 cursor-pointer'
            }`}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {isSaving ? (editingId ? 'GUARDANDO...' : 'REGISTRANDO...') : (editingId ? 'GUARDAR CAMBIOS' : 'REGISTRAR PROVEEDOR')}
          </button>
        </div>
      </div>
    </div>
  );
}
