import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, XCircle, Search, Clock, FileText, BarChart3, AlertTriangle, Truck } from 'lucide-react';

const SolicitudesStock = () => {
  const [activeTab, setActiveTab] = useState('pre_approval'); // pre_approval, orders, audit
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for rejection slide-over
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [itemToReject, setItemToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPreApprovalItems();
  }, []);

  const fetchPreApprovalItems = async () => {
    setLoading(true);
    
    // Fetch items that are pending pre-approval
    const { data: itemsData, error: itemsError } = await supabase
      .from('replenishment_items')
      .select(`
        id,
        sku_id,
        requested_packs,
        pack_cost_est,
        line_total_est,
        pre_approval_status,
        master_sku ( id, nombre, external_id, costo_pack, master_proveedores (id, nombre_fantasia) ),
        replenishment_requests ( operational_date, profiles ( full_name ) )
      `)
      .eq('pre_approval_status', 'pending')
      .eq('is_deleted', false);
      
    // Fetch global stock to get current levels and ideal/required amounts
    const { data: stockData } = await supabase
      .from('vw_stock_global')
      .select('sku_id, stock_actual, requerido');

    if (itemsError) {
      console.error('Error fetching items:', itemsError);
    } else {
      const stockMap = {};
      if (stockData) {
        stockData.forEach(s => stockMap[s.sku_id] = s);
      }
      
      const enriched = itemsData?.map(item => {
        const current_stock = stockMap[item.sku_id]?.stock_actual || 0;
        const required_stock = stockMap[item.sku_id]?.requerido || 0;
        const costo_unitario = item.master_sku?.costo_pack || item.pack_cost_est || 0;
        
        return {
          ...item,
          current_stock,
          required_stock,
          costo_unitario
        };
      });
      
      setItems(enriched || []);
    }
    setLoading(false);
  };

  const handlePreApprove = async (id) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { error } = await supabase
      .from('replenishment_items')
      .update({
        pre_approval_status: 'pre_approved',
        pre_approved_by: userId,
        pre_approved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (!error) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const openRejectModal = (item) => {
    setItemToReject(item);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const { error } = await supabase
      .from('replenishment_items')
      .update({
        pre_approval_status: 'pre_rejected',
        pre_rejection_reason: rejectReason,
        pre_approved_by: userId,
        pre_approved_at: new Date().toISOString()
      })
      .eq('id', itemToReject.id);

    if (!error) {
      setItems(items.filter(item => item.id !== itemToReject.id));
      setIsRejectModalOpen(false);
    }
  };

  return (
    <div className="h-full w-full bg-[#0A0A0A] flex flex-col p-6 overflow-hidden relative">
      {/* HEADER */}
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-text uppercase tracking-widest">
            SOLICITUDES DE STOCK
          </h1>
          <p className="text-brand-muted text-sm mt-1 uppercase tracking-widest font-semibold">
            CONTROL DE COMPRAS Y AUDITORÍA DE INSUMOS
          </p>
        </div>
        
        {/* TABS */}
        <div className="flex bg-brand-surface/50 rounded-xl p-1 border border-brand-border">
          <button 
            onClick={() => setActiveTab('pre_approval')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'pre_approval' ? 'bg-brand-text text-brand-bg shadow-sm' : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock size={14} /> Pre-Aprobación
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'orders' ? 'bg-brand-text text-brand-bg shadow-sm' : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <div className="flex items-center gap-2">
              <Truck size={14} /> Órdenes
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'audit' ? 'bg-brand-text text-brand-bg shadow-sm' : 'text-brand-muted hover:text-brand-text'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={14} /> Auditoría
            </div>
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col bg-brand-surface/10 border border-brand-border/30 rounded-2xl overflow-hidden relative">
        
        {activeTab === 'pre_approval' && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-brand-border bg-brand-surface/20 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Search size={16} className="text-brand-muted" />
                <input 
                  type="text" 
                  placeholder="BUSCAR INSUMO O PROVEEDOR..." 
                  className="bg-transparent border-none text-brand-text text-xs tracking-widest uppercase focus:outline-none w-64 placeholder:text-brand-muted/50 font-bold"
                />
              </div>
              <div className="text-xs font-bold text-brand-muted uppercase tracking-widest">
                {items.length} Pendientes
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-4 h-4 rounded-full bg-brand-text/30 animate-ping"></div>
                </div>
              ) : items.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-brand-muted">
                  <CheckCircle size={32} className="mb-4 opacity-50" />
                  <p className="text-sm font-bold uppercase tracking-widest">NO HAY SOLICITUDES PENDIENTES</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#0A0A0A] border-b border-brand-border z-10">
                    <tr>
                      <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted">Insumo / Prov.</th>
                      <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted">Stock Base</th>
                      <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted text-right">Solicitado</th>
                      <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted text-right">Costo Proy.</th>
                      <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-brand-muted text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border/30">
                    {items.map(item => {
                      const deficit = Math.max(0, item.required_stock - item.current_stock);
                      return (
                      <tr key={item.id} className="hover:bg-brand-surface/20 transition-colors group">
                        <td className="p-4">
                          <div className="font-bold text-sm text-brand-text">{item.master_sku?.nombre || 'Desconocido'}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-brand-muted tracking-widest">ID: {item.master_sku?.external_id || '-'}</span>
                            <span className="text-brand-muted/50">•</span>
                            <span className="text-[10px] font-bold text-brand-text uppercase">{item.master_sku?.master_proveedores?.nombre_fantasia || 'SIN PROVEEDOR'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-bold text-brand-text">{Number(item.current_stock).toFixed(0)}</span>
                              <span className="text-xs text-brand-muted">/ {Number(item.required_stock).toFixed(0)}</span>
                            </div>
                            <div className="text-[10px] font-bold tracking-widest uppercase text-brand-muted">
                              Déficit: <span className="text-brand-error">-{deficit.toFixed(0)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-sm font-mono font-bold text-brand-text">
                            +{Number(item.requested_packs).toFixed(0)}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="text-sm font-mono font-bold text-brand-text">${Number(item.requested_packs * item.costo_unitario).toLocaleString()}</div>
                          <div className="text-[10px] text-brand-muted font-mono mt-1">${Number(item.costo_unitario).toLocaleString()} p/pack</div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openRejectModal(item)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-muted hover:text-brand-error hover:bg-brand-error/10 transition-colors"
                              title="Rechazar"
                            >
                              <XCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handlePreApprove(item.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-bg bg-brand-success hover:bg-brand-success/80 transition-colors shadow-lg"
                              title="Aprobar"
                            >
                              <CheckCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="flex-1 flex flex-col items-center justify-center text-brand-muted p-12 text-center">
            <Truck size={48} className="mb-6 opacity-20" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-brand-text mb-2">Órdenes a Proveedor</h2>
            <p className="text-sm max-w-md">Módulo en construcción. Aquí se visualizarán las órdenes generadas tras la aprobación de los requerimientos.</p>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="flex-1 flex flex-col items-center justify-center text-brand-muted p-12 text-center">
            <BarChart3 size={48} className="mb-6 opacity-20" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-brand-text mb-2">Auditoría y Analíticas</h2>
            <p className="text-sm max-w-md">Módulo en construcción. Gráficos de Déficit Recurrente, Tendencia de Gasto y Pedido vs Consumo.</p>
          </div>
        )}

      </div>

      {/* SLIDE-OVER REJECT MODAL */}
      <div 
        className={`fixed inset-y-0 right-0 w-[400px] bg-brand-surface border-l border-brand-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isRejectModalOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-brand-error uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={18} /> Rechazar Solicitud
            </h2>
            <button 
              onClick={() => setIsRejectModalOpen(false)}
              className="text-brand-muted hover:text-brand-text transition-colors"
            >
              <XCircle size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="bg-brand-bg rounded-xl p-4 mb-6 border border-brand-border/50">
              <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Insumo</div>
              <div className="text-sm font-bold text-brand-text mb-4">{itemToReject?.master_sku?.nombre}</div>
              
              <div className="flex justify-between">
                <div>
                  <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Packs</div>
                  <div className="text-sm font-mono font-bold text-brand-text">{itemToReject?.requested_packs}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Costo Total</div>
                  <div className="text-sm font-mono font-bold text-brand-text">${Number((itemToReject?.requested_packs || 0) * (itemToReject?.costo_unitario || 0)).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-8">
              <label className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                Motivo del Rechazo (Requerido)
              </label>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full h-32 bg-brand-bg border border-brand-border rounded-xl p-4 text-sm font-bold text-brand-text focus:outline-none focus:border-brand-text/50 resize-none"
                placeholder="Indique la justificación para auditoría..."
              ></textarea>
            </div>

            <div className="mt-auto flex gap-4">
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-brand-text bg-brand-surface border border-brand-border hover:bg-brand-surface/80 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleReject}
                disabled={!rejectReason}
                className="flex-1 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-brand-bg bg-brand-error hover:bg-brand-error/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* OVERLAY FOR MODAL */}
      {isRejectModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsRejectModalOpen(false)}
        ></div>
      )}

    </div>
  );
};

export default SolicitudesStock;
