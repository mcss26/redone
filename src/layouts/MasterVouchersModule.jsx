import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, X, Save, ArrowLeft, Receipt, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

export default function MasterVouchersModule({ onNavigate }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [slideOver, setSlideOver] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', active: true });
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('voucher_types')
      .select('*')
      .order('name');
    
    setVouchers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const openCreate = () => {
    setSelectedVoucher(null);
    setForm({ name: '', code: '', active: true });
    setSlideOver(true);
  };

  const openEdit = (v) => {
    setSelectedVoucher(v);
    setForm({ name: v.name, code: v.code, active: v.active });
    setSlideOver(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) return;
    setSaving(true);

    try {
      // Auto-format code to snake_case if user typed normally
      const safeCode = form.code.trim().toLowerCase().replace(/\s+/g, '_');

      const payload = {
        name: form.name.trim() || null,
        code: safeCode || null,
        active: form.active,
      };

      if (selectedVoucher) {
        const { error } = await supabase.from('voucher_types').update(payload).eq('id', selectedVoucher.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('voucher_types').insert(payload);
        if (error) throw error;
      }

      triggerFlash('success');
      setSlideOver(false);
      fetchVouchers();
    } catch (err) {
      console.error("Error saving voucher:", err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (v, e) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('voucher_types').update({ active: !v.active }).eq('id', v.id);
      if (error) throw error;
      fetchVouchers();
    } catch (err) {
      console.error("Error toggling active status:", err);
      triggerFlash('error');
    }
  };

  return (
    <div className="h-full flex relative">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('index')} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-xs font-extrabold tracking-[0.3em] uppercase text-brand-muted">MASTER COMPROBANTES</h2>
              <p className="text-[10px] text-brand-muted/40 tracking-wide mt-0.5">Gestión de tipos de vouchers de pago</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-brand-text text-brand-bg px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
          >
            <Plus size={13} />
            NUEVO TIPO
          </button>
        </div>

        {/* Table */}
        <div className="">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3">NOMBRE</th>
                <th className="text-left text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-48">CÓDIGO (DB)</th>
                <th className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-32">ESTADO</th>
                <th className="text-right text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted px-5 py-3 w-24">ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-brand-muted text-xs">Cargando...</td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-brand-muted/50 text-xs italic">No hay comprobantes registrados.</td></tr>
              ) : vouchers.map((v) => (
                <tr key={v.id} onClick={() => openEdit(v)} className={`border-b border-brand-border/30 hover:bg-brand-card/50 transition-colors cursor-pointer ${!v.active ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-semibold text-brand-text flex items-center gap-2">
                      <Receipt size={12} className="text-brand-muted" /> {v.name}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-xs font-mono text-brand-muted/70 bg-brand-bg px-2 py-1 rounded inline-block">
                      {v.code}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={(e) => toggleActive(v, e)}
                      className={`px-3 py-1 rounded text-[9px] font-bold tracking-[0.2em] uppercase transition-colors ${
                        v.active ? 'bg-brand-success/20 text-brand-success hover:bg-brand-success/30' : 'bg-brand-error/20 text-brand-error hover:bg-brand-error/30'
                      }`}
                    >
                      {v.active ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="text-brand-muted text-xs uppercase tracking-widest hover:text-brand-text transition-colors">EDITAR</span>
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
          <div className="absolute inset-0 bg-black/30 z-40" onClick={() => setSlideOver(false)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-brand-bg border-l border-brand-border z-50 flex flex-col animate-slide-in">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border shrink-0">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-muted">
                {selectedVoucher ? 'EDITAR COMPROBANTE' : 'NUEVO COMPROBANTE'}
              </h3>
              <button onClick={() => setSlideOver(false)} className="text-brand-muted hover:text-brand-text transition-colors cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Nombre Público *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-muted transition-colors"
                  placeholder="Ej: Factura A"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-2">Código Interno (DB) *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  disabled={!!selectedVoucher} // Block editing code for existing ones to prevent FK break
                  className="w-full bg-transparent border-b border-brand-border/50 py-2 text-sm font-mono text-brand-text focus:outline-none focus:border-brand-muted transition-colors disabled:opacity-50"
                  placeholder="ej: factura_a"
                />
                {!selectedVoucher && (
                  <p className="text-[9px] text-brand-warning mt-2 uppercase tracking-wide">
                    Usado para referencias en base de datos.
                  </p>
                )}
                {selectedVoucher && (
                  <p className="text-[9px] text-brand-muted/50 mt-2 uppercase tracking-wide">
                    El código no se puede editar una vez creado para no romper el historial.
                  </p>
                )}
              </div>

              {selectedVoucher && (
                <div className="flex items-center justify-between border-b border-brand-border/50 py-3">
                  <div>
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-text">Estado Activo</div>
                    <div className="text-[9px] text-brand-muted mt-1 tracking-wide">Permitir su uso en nuevos pagos</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    <div className="w-9 h-5 bg-brand-border rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-brand-success after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              )}

            </div>

            <div className="border-t border-brand-border shrink-0 flex">
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.code}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-text text-brand-bg py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? 'GUARDANDO...' : (selectedVoucher ? 'ACTUALIZAR' : 'CREAR COMPROBANTE')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
