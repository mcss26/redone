import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, UserPlus, ArrowLeft, Pencil, Trash2 } from 'lucide-react';

const ROLES = ['admin', 'operativo', 'contador', 'encargado', 'viewer'];

export default function ProfilesModule({ onNavigate }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideOver, setSlideOver] = useState(null); // null | 'create' | profile object
  const [form, setForm] = useState({ full_name: '', role: 'operativo', phone: '', pin: '' });
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    setProfiles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const openCreate = () => {
    setForm({ full_name: '', role: 'operativo', phone: '', pin: '' });
    setSlideOver('create');
  };

  const openEdit = (profile) => {
    setForm({ 
      full_name: profile.full_name, 
      role: profile.role, 
      phone: profile.phone || '', 
      pin: profile.pin || '' 
    });
    setSlideOver(profile);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) return;
    setSaving(true);

    const payload = {
      full_name: form.full_name.trim(),
      role: form.role,
      phone: form.phone.trim() || null,
      pin: form.pin.trim() || null,
    };

    try {
      let result;
      if (slideOver === 'create') {
        result = await supabase.from('profiles').insert(sanitizePayload(payload));
      } else {
        result = await supabase.from('profiles').update(sanitizePayload(payload)).eq('id', slideOver.id);
      }
      if (result.error) throw result.error;
      flash('#22c55e');
      setSlideOver(null);
      fetchProfiles();
    } catch (err) {
      console.error(err);
      flash('#ef4444');
    } finally {
      setSaving(false);
    }
  };

  const flash = (color) => { setFlashColor(color); setTimeout(() => setFlashColor(null), 600); };

  const toggleActive = async (profile) => {
    try {
      const { error } = await supabase.from('profiles').update({ active: !profile.active }).eq('id', profile.id);
      if (error) throw error;
      flash('#22c55e');
      fetchProfiles();
    } catch (err) {
      console.error(err);
      flash('#ef4444');
    }
  };

  const handleDelete = async (profile) => {
    const confirmed = window.confirm(`¿Eliminar permanentemente a "${profile.full_name}"?`);
    if (!confirmed) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', profile.id);
      if (error) throw error;
      flash('#22c55e');
      fetchProfiles();
    } catch (err) {
      console.error(err);
      flash('#ef4444');
    }
  };

  const ROLE_BADGE = {
    admin:     'bg-brand-text text-brand-bg',
    operativo: 'bg-brand-accent/20 text-brand-accent',
    contador:  'bg-brand-warning/20 text-brand-warning',
    encargado: 'bg-purple-500/20 text-purple-500',
    viewer:    'bg-brand-muted/20 text-brand-muted',
  };

  return (
    <div className="h-full flex relative" style={flashColor ? { boxShadow: `inset 0 0 0 2px ${flashColor}`, transition: 'box-shadow 0.3s' } : { transition: 'box-shadow 0.3s' }}>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Actions & Title (Above Table) */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex flex-col">
            <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">
              PERFILES
            </h2>
          </div>

          <div className="flex items-center gap-6">
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">NOMBRE</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">ROL</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">TELÉFONO</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">PIN</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
              ) : profiles.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-brand-muted text-xs tracking-widest uppercase">No hay registros.</td></tr>
              ) : profiles.map((p) => (
                <tr key={p.id} className="border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-brand-text">{p.full_name}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${ROLE_BADGE[p.role]}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-brand-muted font-mono">{p.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-brand-muted font-mono">{p.pin ? '••••' : '—'}</td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => toggleActive(p)} className="cursor-pointer" title={p.active ? 'Activo' : 'Inactivo'}>
                      <div className={`w-2 h-2 rounded-full mx-auto ${p.active ? 'bg-brand-success' : 'bg-brand-error'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(p)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer" title="Editar">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(p)} className="text-brand-muted hover:text-red-500 transition-colors cursor-pointer" title="Eliminar">
                        <Trash2 size={13} />
                      </button>
                    </div>
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
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-muted">
                {slideOver === 'create' ? 'NUEVO PERFIL' : 'EDITAR PERFIL'}
              </h3>
              <button onClick={() => setSlideOver(null)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Nombre completo</label>
                <input autoComplete="off"
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  autoFocus
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setForm({ ...form, role: r })}
                      className={`px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b transition-all cursor-pointer ${
                        form.role === r
                          ? 'border-brand-text text-brand-text'
                          : 'border-brand-border/50 text-brand-muted hover:border-brand-muted'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Teléfono</label>
                <input autoComplete="off"
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text font-mono focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Opcional"
                />
              </div>

              {/* PIN */}
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">PIN de acceso</label>
                <input autoComplete="off"
                  type="text"
                  inputMode="numeric"
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text font-mono tracking-[0.5em] focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="4-6 dígitos"
                />
              </div>
            </div>

            {/* Panel Footer */}
            <div className="border-t border-brand-border shrink-0 flex">
              <button
                onClick={handleSave}
                disabled={saving || !form.full_name.trim()}
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
