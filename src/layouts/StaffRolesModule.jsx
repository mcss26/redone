import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, Pencil, DollarSign, Search, Trash2, Loader2 } from 'lucide-react';


export default function StaffRolesModule({ onNavigate }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [flashColor, setFlashColor] = useState('');
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | role object
  const [form, setForm] = useState({ name: '', base_rate: '', default_quantity: '' });
  const [saving, setSaving] = useState(false);

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staff_roles')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      triggerFlash('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const openCreate = () => {
    setForm({ name: '', base_rate: '', default_quantity: '0' });
    setSlideOver('create');
  };

  const openEdit = (role) => {
    setForm({ 
      name: role.name, 
      base_rate: role.base_rate.toString(),
      default_quantity: role.default_quantity.toString()
    });
    setSlideOver(role);
  };

  const handleSave = async () => {
    if (!form.name.trim() || form.base_rate === '') return;
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim() || null,
        base_rate: parseFloat(form.base_rate) || 0,
        default_quantity: parseInt(form.default_quantity) || 0,
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('staff_roles').insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('staff_roles').update(payload).eq('id', slideOver.id);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(null);
      fetchRoles();
    } catch (err) {
      console.error('Error saving role:', err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar permanentemente el rol "${form.name}"?`)) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('staff_roles').delete().eq('id', slideOver.id);
      if (error) throw error;
      triggerFlash('success');
      setSlideOver(null);
      fetchRoles();
    } catch (err) {
      console.error('Error deleting role:', err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (role) => {
    try {
      const { error } = await supabase.from('staff_roles').update({ active: !role.active }).eq('id', role.id);
      if (error) throw error;
      triggerFlash('success');
      setRoles(prev => prev.map(r => r.id === role.id ? { ...r, active: !role.active } : r));
    } catch (err) {
      console.error('Error toggling active:', err);
      triggerFlash('error');
    }
  };

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );



  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

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
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-brand-muted">TARIFARIO STAFF</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">{roles.length} roles registrados</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar rol..." 
                className="pl-10 pr-4 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-xs font-semibold focus:outline-none focus:border-brand-text focus:ring-1 focus:ring-brand-text/50 placeholder:text-brand-muted text-brand-text w-64 transition-all"
              />
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-brand-text text-brand-bg px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
            >
              <DollarSign size={13} />
              NUEVO
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">ROL</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">TARIFA BASE</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">DEFAULT</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
              ) : filteredRoles.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-brand-muted/50 text-xs italic">No se encontraron resultados.</td></tr>
              ) : filteredRoles.map((r) => (
                <tr key={r.id} className={`border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors ${!r.active ? 'opacity-40' : ''}`}>
                  <td className="px-5 py-3.5 text-sm font-semibold text-brand-text">{r.name}</td>

                  <td className="px-5 py-3.5 text-sm font-mono text-right text-brand-text">
                    {formatCurrency(r.base_rate)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-center text-brand-muted">
                    {r.default_quantity}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => toggleActive(r)} className="cursor-pointer" title={r.active ? 'Activo' : 'Inactivo'}>
                      <div className={`w-2 h-2 rounded-full mx-auto ${r.active ? 'bg-brand-success' : 'bg-brand-error'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => openEdit(r)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
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
                {slideOver === 'create' ? 'NUEVO ROL' : 'EDITAR ROL'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Nombre del Rol *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Ej: Bartender VIP"
                  autoFocus
                />
              </div>



              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Tarifa Base (Por Noche) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-mono">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.base_rate}
                    onChange={(e) => setForm({ ...form, base_rate: e.target.value })}
                    className="w-full bg-transparent border-b border-brand-border/50 pl-8 pr-4 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Plantilla (Auto-Populate)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.default_quantity}
                  onChange={(e) => setForm({ ...form, default_quantity: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="0 para no autocompletar"
                />
                <p className="text-[10px] text-brand-muted mt-2">
                  Si es mayor a 0, este rol se auto-cargará en el plan de staff al abrir una nueva jornada.
                </p>
              </div>

            </div>

            {/* Panel Footer */}
            <div className="border-t border-brand-border shrink-0 flex">
              {slideOver !== 'create' && (
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex items-center justify-center bg-brand-error text-white px-6 hover:bg-red-600 transition-colors disabled:opacity-30 cursor-pointer"
                  title="Eliminar Rol"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || form.base_rate === ''}
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
