import React, { useRef,  useState, useEffect, useCallback  } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, PackageCheck, Save, Lock } from 'lucide-react';

export default function BarInventoryModule({ onNavigate }) {
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const [loading, setLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [workDays, setWorkDays] = useState([]);
  const [selectedWorkDayId, setSelectedWorkDayId] = useState('');
  
  const [skus, setSkus] = useState([]);
  const [inventory, setInventory] = useState({}); // { [skuId]: { stock_open, stock_close, status } }
  
  const [mode, setMode] = useState('open'); // 'open' | 'close'
  const [saving, setSaving] = useState(false);
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  // Fetch WorkDays
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        // Fetch draft, planned or active work days for inventory
        const { data: wdData, error: wdError } = await supabase
          .from('work_days')
          .select('id, work_date, status, event_name')
          .in('status', ['open', 'closed'])
          .order('work_date', { ascending: true });
          
        if (wdError) throw wdError;

        setWorkDays(wdData || []);
        if (wdData && wdData.length > 0) {
          setSelectedWorkDayId(wdData[0].id);
        }

        // Fetch active SKUs
        const { data: skuData, error: skuError } = await supabase
          .from('skus')
          .select('*')
          .eq('active', true)
          .order('name');
          
        if (skuError) throw skuError;
        setSkus(skuData || []);
      } catch (err) {
        console.error('Error in fetchBaseData:', err);
        triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
      }
    };
    
    fetchBaseData();
  }, []);

  // Fetch Inventory for selected Work Day
  const fetchInventory = useCallback(async () => {
    if (!selectedWorkDayId || skus.length === 0) {
      (setIsFetchingBackground(false), setLoading(false));
      return;
    }
    
    try {
      setIsFetchingBackground(true);
      const { data: invData, error } = await supabase
        .from('bar_inventory')
        .select('*')
        .eq('work_day_id', selectedWorkDayId);

      if (error) throw error;

      // Build inventory map. Default to 0 if no record exists yet.
      const invMap = {};
      skus.forEach(sku => {
        const existing = invData?.find(i => i.sku_id === sku.id);
        invMap[sku.id] = existing || {
          stock_open: 0,
          stock_close: 0,
          status: 'draft',
          isNew: true
        };
      });

      setInventory(invMap);
      
      // Auto-switch mode based on overall status
      // If all are locked_open, default to 'close' mode.
      if (invData && invData.length > 0) {
        const wd = workDays.find(w => w.id === selectedWorkDayId);
        if (wd && wd.status === 'closed') setMode('close');
      }
      
      (setIsFetchingBackground(false), setLoading(false));
    } catch (err) {
      console.error('Error fetching inventory:', err);
      triggerFlash('error');
      window.UI?.toast?.(err.message || "Error al procesar", 'danger');
      (setIsFetchingBackground(false), setLoading(false));
    }
  }, [selectedWorkDayId, skus, workDays]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handle Increments
  const updateStock = (skuId, delta, exactValue = null) => {
    setInventory(prev => {
      const current = prev[skuId];

      let newValue = 0;
      if (exactValue !== null) {
        // Keep the string if it ends with a dot or comma so the user can type "1." -> "1.5"
        const strVal = String(exactValue).replace(',', '.');
        if (strVal.endsWith('.')) {
          newValue = strVal; // Store the string temporarily
        } else {
          let parsed = parseFloat(strVal);
          if (isNaN(parsed)) parsed = 0;
          // Don't apply Math.max to empty string or if it's just a number string to avoid stripping trailing zeros if we want to support them, but parseFloat strips trailing zeros anyway.
          newValue = parsed < 0 ? 0 : strVal === '' ? '' : parsed;
        }
      } else {
        const val = mode === 'open' ? Number(current.stock_open) : Number(current.stock_close);
        newValue = Math.max(0, val + delta);
      }

      return {
        ...prev,
        [skuId]: {
          ...current,
          [mode === 'open' ? 'stock_open' : 'stock_close']: newValue
        }
      };
    });
  };

  const handleSaveAndLock = async () => {
    setSaving(true);
    try {
      const upsertPayload = skus.map(sku => {
        const item = inventory[sku.id];
        return {
          work_day_id: selectedWorkDayId,
          sku_id: sku.id,
          stock_open: item.stock_open,
          stock_close: item.stock_close,
          status: 'draft' // Keeps backward compatibility if column has constraint
        };
      });

      const { error } = await supabase
        .from('bar_inventory')
        .upsert(upsertPayload, { onConflict: 'work_day_id,sku_id' });

      if (error) throw error;
      
      triggerFlash('success');
      await fetchInventory();
    } catch (error) {
      console.error('Error locking inventory:', error);
      triggerFlash('error');
      window.UI?.toast?.(error.message || "Error al procesar", 'danger');
    } finally {
      setSaving(false);
    }
  };

  // Group SKUs by unit for better mobile navigation
  const categories = [...new Set(skus.map(s => s.unit))];

  // Determine global status for the selected mode
  const selectedDay = workDays.find(wd => wd.id === selectedWorkDayId);
  const isModeLocked = selectedDay ? selectedDay.status === 'closed' : true;

  return (
    <div className="h-full flex flex-col relative bg-brand-bg">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      {/* Header - Mobile First Design */}
      <div className="shrink-0 p-4 md:p-6 border-b border-brand-border bg-brand-surface z-10 shadow-md">
        <div className="flex items-center gap-4 mb-4">
          <div>
            <h2 className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-brand-muted/50">APERTURA/CIERRE BARRA</h2>
          </div>
        </div>

        {/* WorkDay Selector */}
        <div className="mb-4">
          <select
            value={selectedWorkDayId}
            onChange={(e) => setSelectedWorkDayId(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3.5 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-muted transition-colors appearance-none"
          >
            {workDays.length === 0 && <option value="">Sin jornadas activas</option>}
            {workDays.map((wd) => (
              <option key={wd.id} value={wd.id}>
                {wd.work_date} — {wd.event_name || 'Sin Evento'} ({wd.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-brand-bg rounded-lg p-1 border border-brand-border/50">
          <button 
            onClick={() => setMode('open')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'open' ? 'bg-brand-surface border border-brand-border text-brand-text shadow-sm' : 'text-brand-muted/50 hover:text-brand-muted'}`}
          >
            Apertura
          </button>
          <button 
            onClick={() => setMode('close')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'close' ? 'bg-brand-surface border border-brand-border text-brand-text shadow-sm' : 'text-brand-muted/50 hover:text-brand-muted'}`}
          >
            Cierre
          </button>
        </div>
      </div>

      {/* Content area - Large Touch Targets */}
      <div className={`flex-1 overflow-y-auto p-4 md:p-6 pb-32 ${isFetchingBackground ? 'opacity-50 pointer-events-none' : ''}`}>
        {loading ? (
          <div className="flex justify-center items-center h-full text-brand-muted">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : workDays.length === 0 ? (
          <div className="text-center py-12 text-brand-muted/50 text-xs italic">
            No hay jornadas activas para inventariar.
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Lock Warning Banner */}
            {isModeLocked && (
              <div className="bg-brand-warning/10 border border-brand-warning/20 rounded-lg p-4 flex items-start gap-3">
                <Lock size={16} className="text-brand-warning shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-brand-warning uppercase tracking-widest">Stock Bloqueado</div>
                  <div className="text-[10px] text-brand-muted mt-1 leading-relaxed">
                    La jornada está cerrada. El inventario es de solo lectura.
                  </div>
                </div>
              </div>
            )}

            {categories.map(category => (
              <div key={category} className="mb-8">
                <h3 className="text-[11px] font-extrabold tracking-[0.2em] text-brand-muted mb-4 uppercase border-b border-brand-border/50 pb-2">
                  {category || 'Sin Categoría'}
                </h3>
                
                <div className="space-y-3">
                  {skus.filter(s => s.unit === category).map(sku => {
                    const item = inventory[sku.id];
                    if (!item) return null;
                    const value = mode === 'open' ? item.stock_open : item.stock_close;
                    
                    return (
                      <div key={sku.id} className={`bg-brand-surface border border-brand-border rounded-lg p-4 flex items-center justify-between transition-opacity ${isModeLocked ? 'opacity-60' : ''}`}>
                        <div className="flex-1 pr-4">
                          <div className="text-sm font-bold text-brand-text truncate">{sku.name}</div>
                          <div className="text-[10px] text-brand-muted mt-1 tracking-widest uppercase">
                            Vol: {sku.volume_ml ? `${sku.volume_ml}ml` : 'N/A'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => updateStock(sku.id, -1)}
                            disabled={isModeLocked}
                            className="w-12 h-12 flex items-center justify-center bg-brand-bg border border-brand-border rounded-lg text-brand-text active:bg-brand-border disabled:opacity-30 cursor-pointer"
                          >
                            <span className="text-xl font-mono">-</span>
                          </button>
                          
                          <input autoComplete="off" 
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => {
                              // Allow temporary trailing commas/dots for UX by checking if it ends with one,
                              // but we still trigger updateStock. Actually, updateStock expects a number,
                              // so let's pass the raw string so it doesn't strip the decimal if the user is typing "1."
                              updateStock(sku.id, 0, e.target.value);
                            }}
                            disabled={isModeLocked}
                            className="w-16 h-12 bg-transparent text-center font-mono font-bold text-xl text-brand-text focus:outline-none focus:bg-brand-bg rounded-lg transition-colors disabled:opacity-100"
                          />
                          
                          <button 
                            onClick={() => updateStock(sku.id, 1)}
                            disabled={isModeLocked}
                            className="w-12 h-12 flex items-center justify-center bg-brand-bg border border-brand-border rounded-lg text-brand-text active:bg-brand-border disabled:opacity-30 cursor-pointer"
                          >
                            <span className="text-xl font-mono">+</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      {!loading && workDays.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-brand-bg/90 backdrop-blur-md border-t border-brand-border z-20 flex justify-center">
          <div className="w-full max-w-3xl">
            {isModeLocked ? (
              <div className="w-full flex items-center justify-center gap-2 bg-brand-surface border border-brand-border text-brand-muted rounded-lg py-4 text-xs font-bold uppercase tracking-widest opacity-50 cursor-not-allowed">
                <Lock size={14} />
                {mode === 'open' ? 'INVENTARIO DE APERTURA' : 'INVENTARIO DE CIERRE'} (CERRADO)
              </div>
            ) : (
              <button
                onClick={handleSaveAndLock}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-brand-text text-brand-bg rounded-lg py-4 text-xs font-bold uppercase tracking-widest hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'GUARDANDO...' : `GUARDAR INVENTARIO`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
