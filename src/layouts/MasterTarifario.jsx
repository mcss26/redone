import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, X, Briefcase, DollarSign, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function MasterTarifario() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashColor, setFlashColor] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const initialForm = {
    name: '',
    area: '',
    base_rate: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const predefinedAreas = ['Barra', 'Caja', 'Limpieza', 'Seguridad', 'Administración', 'Técnica', 'Logística'];

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('master_staff_roles')
        .select('*')
        .order('area', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
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
    if (!formData.name || !formData.area || formData.base_rate === '') return;

    try {
      setIsSaving(true);
      
      const payload = { 
        name: formData.name,
        area: formData.area,
        base_rate: parseFloat(formData.base_rate) || 0,
        active: true 
      };

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('master_staff_roles')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('master_staff_roles')
          .insert([payload]);
        if (error) throw error;
      }

      triggerFlash('success');
      setIsModalOpen(false);
      setFormData(initialForm);
      fetchRoles(); // Refresh list
    } catch (err) {
      console.error('Error saving role:', err);
      triggerFlash('error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('master_staff_roles')
        .update({ active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      triggerFlash('success');
      setRoles(roles.map(r => r.id === id ? { ...r, active: !currentStatus } : r));
    } catch (err) {
      console.error('Error toggling status:', err);
      triggerFlash('error');
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="h-full flex flex-col p-8 min-h-full">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`fixed inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text">Catálogo Tarifario</h2>
          <p className="text-sm font-semibold text-brand-muted mt-1">Master de Roles Operativos y Tarifas Base</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por rol o área..." 
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
            Nuevo Rol
          </button>
        </div>
      </div>

      <div className="flex-1 border border-brand-border bg-brand-bg rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead className="bg-[#0A0A0A] text-brand-muted sticky top-0 z-10 border-b border-brand-border">
              <tr>
                <th className="p-4 pl-6 text-[10px] font-extrabold uppercase tracking-widest">Rol Operativo</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest">Área Funcional</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest text-right">Tarifa Base (Base Rate)</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest text-center">Estado</th>
                <th className="p-4 text-[10px] font-extrabold uppercase tracking-widest text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="font-medium relative divide-y divide-brand-border/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-brand-muted">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4 text-brand-text" />
                    <div className="uppercase tracking-widest text-xs font-bold">Sincronizando con Supabase...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-brand-error">
                    <div className="uppercase tracking-widest text-xs font-bold">Error de conexión: {error}</div>
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-brand-muted">
                    <div className="uppercase tracking-widest text-xs font-bold">No hay roles registrados.</div>
                  </td>
                </tr>
              ) : (
                roles
                  .filter(r => 
                    (r.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                    (r.area?.toLowerCase() || '').includes(searchQuery.toLowerCase())
                  )
                  .map((role) => (
                    <tr key={role.id} className="hover:bg-brand-surface/30 transition-all duration-200 group">
                      <td className="p-4 pl-6 font-bold text-sm text-brand-text">
                        {role.name}
                      </td>
                      <td className="p-4 text-xs font-bold text-brand-muted uppercase tracking-widest">
                        <span className="px-2.5 py-1 bg-brand-surface rounded-md border border-brand-border/50">
                          {role.area}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-black text-brand-text">
                        {formatCurrency(role.base_rate)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => toggleStatus(role.id, role.active)}
                            className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${role.active ? 'bg-brand-success/20' : 'bg-brand-error/20'}`}
                            title={role.active ? 'Desactivar' : 'Reactivar'}
                          >
                            <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${role.active ? 'right-1 bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'left-1 bg-brand-error shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
                          </button>
                        </div>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={() => {
                            setFormData({
                              name: role.name,
                              area: role.area,
                              base_rate: role.base_rate
                            });
                            setEditingId(role.id);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text hover:bg-brand-surface transition-all"
                        >
                          EDITAR
                        </button>
                      </td>
                    </tr>
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
        className={`fixed inset-y-0 right-0 w-full max-w-[450px] bg-[#0A0A0A] border-l border-brand-border z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${isModalOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-8 border-b border-brand-border/50 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold tracking-widest uppercase text-brand-text">
              {editingId ? 'Editar Rol' : 'Nuevo Rol Operativo'}
            </h2>
            <p className="text-[10px] uppercase font-bold text-brand-muted tracking-widest mt-1">
              Catálogo de Personal
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
          <form id="roleForm" onSubmit={handleSave} className="space-y-8">
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2">
                <Briefcase size={16} className="text-brand-muted" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Definición de Rol</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Nombre del Cargo *</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-base text-brand-text font-bold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" placeholder="Ej: Bartender Sr." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Área Funcional *</label>
                  <input 
                    required 
                    type="text" 
                    name="area" 
                    list="area-suggestions"
                    value={formData.area} 
                    onChange={handleInputChange} 
                    className="w-full bg-transparent border-b border-brand-border/50 px-0 py-2 text-sm text-brand-text font-semibold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" 
                    placeholder="Ej: Barra, Caja, etc." 
                  />
                  <datalist id="area-suggestions">
                    {predefinedAreas.map(a => <option key={a} value={a} />)}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2">
                <DollarSign size={16} className="text-brand-muted" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Tarifario</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Tarifa Base (Base Rate) *</label>
                  <div className="relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-brand-muted font-mono">$</span>
                    <input 
                      required 
                      type="number" 
                      min="0"
                      name="base_rate" 
                      value={formData.base_rate} 
                      onChange={handleInputChange} 
                      className="w-full bg-transparent border-b border-brand-border/50 pl-6 py-2 text-lg text-brand-text font-mono font-bold focus:outline-none focus:border-brand-text transition-colors placeholder-brand-muted/30" 
                      placeholder="35000" 
                    />
                  </div>
                  <p className="text-[10px] font-medium text-brand-muted mt-2">
                    Nota: Este sistema opera exclusivamente con base_rate por compatibilidad de DB.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-brand-surface/20 border border-brand-border p-4 rounded-xl flex gap-3 mt-4">
              <Users size={16} className="text-brand-text shrink-0 mt-0.5" />
              <p className="text-[10px] font-semibold text-brand-muted leading-relaxed">
                Este rol estará disponible inmediatamente en el <strong>Planner</strong> para el dimensionamiento del staff y la proyección de Break-even de la jornada.
              </p>
            </div>

          </form>
        </div>

        <div className="p-8 border-t border-brand-border/50 shrink-0">
          <button 
            type="submit" 
            form="roleForm"
            disabled={isSaving}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-extrabold uppercase tracking-widest text-sm transition-all duration-200 shadow-2xl ${
              isSaving 
                ? 'bg-brand-text/50 text-brand-bg cursor-not-allowed' 
                : 'bg-brand-text text-brand-bg hover:bg-brand-text/90 cursor-pointer'
            }`}
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {isSaving ? (editingId ? 'GUARDANDO...' : 'REGISTRANDO...') : (editingId ? 'GUARDAR CAMBIOS' : 'REGISTRAR ROL')}
          </button>
        </div>
      </div>
    </div>
  );
}
