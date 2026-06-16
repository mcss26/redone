import React, { useRef,  useState, useEffect, useCallback  } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, Pencil, Truck, Search, Loader2, Building2, User, CreditCard, FileText, Trash2 } from 'lucide-react';
import { sanitizePayload } from '../lib/sanitizer';

const CATEGORIES = ['bar', 'limpieza', 'servicios', 'estructura', 'otros'];

export default function SuppliersModule({ onNavigate }) {
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | supplier object
  const [form, setForm] = useState({ 
    name: '', tax_id: '', contact_name: '', contact_phone: '', 
    email: '', bank_name: '', bank_alias: '', notes: '' 
  });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const fetchSuppliers = useCallback(async () => {
    try {
      setIsFetchingBackground(true);
      setError(null);
      const { data, error: fetchErr } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });
      
      if (fetchErr) throw fetchErr;
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError(err.message);
    } finally {
      (setIsFetchingBackground(false), setLoading(false));
    }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const openCreate = () => {
    setForm({ 
      name: '', tax_id: '', contact_name: '', contact_phone: '', 
      email: '', bank_name: '', bank_alias: '', notes: '' 
    });
    setSlideOver('create');
  };

  const openEdit = (supplier) => {
    setForm({ 
      name: supplier.name, 
      tax_id: supplier.tax_id || '', 
      contact_name: supplier.contact_name || '', 
      contact_phone: supplier.contact_phone || '', 
      email: supplier.email || '', 
      bank_name: supplier.bank_name || '', 
      bank_alias: supplier.bank_alias || '', 
      notes: supplier.notes || '' 
    });
    setSlideOver(supplier);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        tax_id: form.tax_id.trim() || null,
        contact_name: form.contact_name.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        email: form.email.trim() || null,
        bank_name: form.bank_name.trim() || null,
        bank_alias: form.bank_alias.trim() || null,
        notes: form.notes.trim() || null,
      };

      if (slideOver === 'create') {
        const { error } = await supabase.from('suppliers').insert([sanitizePayload(payload)]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('suppliers').update(sanitizePayload(payload)).eq('id', slideOver.id);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(null);
      fetchSuppliers();
    } catch (err) {
      console.error('Error saving supplier:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!(await window.UI.confirm(`¿Eliminar permanentemente al proveedor "${form.name}"?`))) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('suppliers').delete().eq('id', slideOver.id);
      if (error) throw error;
      triggerFlash('success');
      setSlideOver(null);
      fetchSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (supplier) => {
    try {
      const { error } = await supabase.from('suppliers').update({ active: !supplier.active }).eq('id', supplier.id);
      if (error) throw error;
      triggerFlash('success');
      fetchSuppliers();
    } catch (err) {
      console.error('Error toggling active state:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
    }
  };



  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.tax_id && s.tax_id.includes(searchQuery)) ||
    (s.contact_name && s.contact_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex relative">
      {flashColor && <div className={`fixed inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}
      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Actions & Title (Above Table) */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex flex-col">
            <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">
              PROVEEDORES
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted/50" />
              <input autoComplete="off" 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por CUIT o Nombre..." 
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

        {/* Table */}
        <div className="">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">NOMBRE</th>
                  <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">CUIT</th>
                  <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">BANCO</th>
                  <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">CONTACTO</th>
                  <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">ALIAS / CBU</th>
                  <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">ESTADO</th>
                  <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-brand-muted">
                      <Loader2 size={32} className="animate-spin mx-auto mb-4 text-brand-text" />
                      <div className="uppercase tracking-widest text-xs font-bold">Cargando proveedores...</div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr><td colSpan={7} className="text-center py-12 text-brand-error text-xs font-bold uppercase tracking-widest">Error de conexión: {error}</td></tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-brand-muted/50 text-xs italic">No se encontraron proveedores.</td></tr>
                ) : filteredSuppliers.map((s) => (
                  <tr key={s.id} className="border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-semibold text-brand-text">{s.name}</td>
                    <td className="px-5 py-3.5 text-xs text-brand-muted font-mono">{s.tax_id || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-brand-muted font-mono">{s.bank_name || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-brand-muted">
                      <div>{s.contact_name || '—'}</div>
                      <div className="font-mono text-[10px] mt-0.5">{s.contact_phone || ''}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-brand-muted font-mono">{s.bank_alias || '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <button onClick={() => toggleActive(s)} className="cursor-pointer" title={s.active ? 'Activo' : 'Inactivo'}>
                        <div className={`w-2 h-2 rounded-full mx-auto ${s.active ? 'bg-brand-success' : 'bg-brand-error'}`} />
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => openEdit(s)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                {slideOver === 'create' ? 'NUEVO PROVEEDOR' : 'EDITAR PROVEEDOR'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Panel Body */}
            <div className={`flex-1 overflow-y-auto p-6 space-y-5 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
              
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Razón Social *</label>
                <input id="sup_name" autoComplete="off"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">CUIT</label>
                <input autoComplete="off"
                  type="text"
                  value={form.tax_id}
                  onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Ej: 30-12345678-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Contacto</label>
                  <input autoComplete="off"
                    type="text"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Teléfono</label>
                  <input autoComplete="off"
                    type="text"
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="+54 9 11..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Correo Electrónico</label>
                <input autoComplete="off"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="contacto@empresa.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Banco</label>
                  <input autoComplete="off"
                    type="text"
                    value={form.bank_name}
                    onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                    className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="Galicia, etc."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Alias / CBU</label>
                  <input autoComplete="off"
                    type="text"
                    value={form.bank_alias}
                    onChange={(e) => setForm({ ...form, bank_alias: e.target.value })}
                    className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                    placeholder="EMPRESA.PAGOS"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Notas</label>
                <textarea autoComplete="off"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors resize-none h-20"
                  placeholder="Condiciones, días de visita..."
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
                  title="Eliminar Proveedor"
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
