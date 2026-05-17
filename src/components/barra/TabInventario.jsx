import React, { useState, useEffect } from 'react';
import { Search, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const TabInventario = ({ workDayId }) => {
  const [skus, setSkus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [openingInputs, setOpeningInputs] = useState({});
  const [closingInputs, setClosingInputs] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [barSessionId, setLocalBarSessionId] = useState(null);

  useEffect(() => {
    if (workDayId) {
      fetchData();
    }
  }, [workDayId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch SKUs (Solo Bebidas e Insumo Barra)
      const { data: skuData, error: skuError } = await supabase
        .from('master_sku')
        .select('id, nombre, categoria_id')
        .eq('active', true)
        .in('categoria_id', ['92efbbc7-5dea-40d2-9d2f-86665703a759', '94d908b2-8f0e-404a-b0e5-71959a568857'])
        .order('nombre');

      if (skuError) throw skuError;
      setSkus(skuData || []);

      // 2. Fetch existing session & snapshots
      const { data: session } = await supabase
        .from('bar_sessions')
        .select('id')
        .eq('work_day_id', workDayId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (session) {
        setLocalBarSessionId(session.id);
        const { data: snapshots } = await supabase
          .from('bar_stock_snapshots')
          .select('sku_id, quantity, type')
          .eq('session_id', session.id);

        if (snapshots) {
          const loadedOpenings = {};
          const loadedClosings = {};
          snapshots.forEach(snap => {
            if (snap.type === 'opening') loadedOpenings[snap.sku_id] = snap.quantity;
            if (snap.type === 'closing') loadedClosings[snap.sku_id] = snap.quantity;
          });
          setOpeningInputs(loadedOpenings);
          setClosingInputs(loadedClosings);
        }
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpeningChange = (id, value) => {
    setOpeningInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleClosingChange = (id, value) => {
    setClosingInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!workDayId) {
      alert("No hay una jornada activa.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      let currentSessionId = barSessionId;

      // Ensure session exists
      if (!currentSessionId) {
        const { data: newSession, error: sessionError } = await supabase
          .from('bar_sessions')
          .insert({
            work_day_id: workDayId,
            opened_by: userId,
            status: 'active'
          })
          .select('id')
          .single();

        if (sessionError) throw sessionError;
        currentSessionId = newSession.id;
        setLocalBarSessionId(newSession.id);
      }

      // Prepare snapshots
      const snapshots = [];
      skus.forEach(sku => {
        if (openingInputs[sku.id] !== undefined && openingInputs[sku.id] !== '') {
          snapshots.push({
            session_id: currentSessionId,
            sku_id: sku.id,
            quantity: Number(openingInputs[sku.id]),
            type: 'opening',
            created_by: userId
          });
        }
        if (closingInputs[sku.id] !== undefined && closingInputs[sku.id] !== '') {
          snapshots.push({
            session_id: currentSessionId,
            sku_id: sku.id,
            quantity: Number(closingInputs[sku.id]),
            type: 'closing',
            created_by: userId
          });
        }
      });

      // Clear old snapshots for this session to avoid duplicates
      await supabase.from('bar_stock_snapshots').delete().eq('session_id', currentSessionId);

      // Insert new snapshots
      if (snapshots.length > 0) {
        const { error: snapError } = await supabase.from('bar_stock_snapshots').insert(snapshots);
        if (snapError) throw snapError;
      }

    } catch (error) {
      console.error('Error saving inventory:', error);
      alert('Error al guardar el inventario.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSkus = skus.filter(s => 
    s.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full relative">
      
      {/* ACTION BAR */}
      <div className="shrink-0 flex items-center justify-between p-6 pb-2">
        <div className="relative w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input 
            type="text" 
            placeholder="BUSCAR PRODUCTO..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-brand-surface/30 border border-brand-border/50 text-brand-text text-xs uppercase tracking-widest rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-brand-text/30 transition-colors placeholder:text-brand-muted/50 font-semibold"
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-brand-text text-brand-bg px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
        </button>
      </div>

      {/* DATA TABLE */}
      <div className="flex-1 overflow-auto p-6 pt-4">
        <div className="bg-brand-surface/10 border border-brand-border/30 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/30 bg-brand-surface/40">
                <th className="py-4 px-6 text-[10px] font-extrabold text-brand-muted uppercase tracking-[0.2em] w-1/2">Producto</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-brand-text uppercase tracking-[0.2em] w-1/4 text-center">Físico Inicio</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-brand-text uppercase tracking-[0.2em] w-1/4 text-center">Físico Cierre</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-xs font-bold tracking-widest uppercase text-brand-muted">
                    CARGANDO PRODUCTOS...
                  </td>
                </tr>
              ) : filteredSkus.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-xs font-bold tracking-widest uppercase text-brand-muted">
                    NO SE ENCONTRARON PRODUCTOS
                  </td>
                </tr>
              ) : (
                filteredSkus.map((sku) => (
                  <tr key={sku.id} className="border-b border-brand-border/10 hover:bg-brand-surface/20 transition-colors group">
                    <td className="py-3 px-6 text-sm font-bold text-brand-text truncate">{sku.nombre}</td>
                    <td className="py-2 px-6 text-center">
                      <input
                        type="number"
                        min="0"
                        placeholder="-"
                        value={openingInputs[sku.id] !== undefined ? openingInputs[sku.id] : ''}
                        onChange={(e) => handleOpeningChange(sku.id, e.target.value)}
                        className="w-24 bg-brand-surface/30 border border-brand-border/50 text-brand-text text-sm font-mono font-bold text-center rounded-lg px-3 py-2 focus:outline-none focus:border-brand-text/50 transition-colors placeholder:text-brand-muted/30"
                      />
                    </td>
                    <td className="py-2 px-6 text-center">
                      <input
                        type="number"
                        min="0"
                        placeholder="-"
                        value={closingInputs[sku.id] !== undefined ? closingInputs[sku.id] : ''}
                        onChange={(e) => handleClosingChange(sku.id, e.target.value)}
                        className="w-24 bg-brand-surface/30 border border-brand-border/50 text-brand-text text-sm font-mono font-bold text-center rounded-lg px-3 py-2 focus:outline-none focus:border-brand-text/50 transition-colors placeholder:text-brand-muted/30"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TabInventario;
