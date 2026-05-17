import React, { useState, useEffect } from 'react';
import { Package, Search, CheckCircle } from 'lucide-react';

const TabRecepciones = () => {
  const [recepciones, setRecepciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // MOCK DATA FETCH
    setTimeout(() => {
      setRecepciones([
        { id: '1', product: 'Smirnoff 700ml', requested: 12, received: 0, status: 'PENDING', time: '02:30 AM' },
        { id: '2', product: 'Speed Lápiz', requested: 48, received: 0, status: 'PENDING', time: '03:15 AM' }
      ]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleReceive = (id) => {
    setRecepciones(prev => prev.map(r => r.id === id ? { ...r, status: 'RECEIVED', received: r.requested } : r));
  };

  return (
    <div className="flex flex-col h-full relative">
      
      <div className="shrink-0 flex items-center justify-between p-6 pb-2">
        <div className="relative w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input 
            type="text" 
            placeholder="BUSCAR INSUMO..." 
            className="w-full bg-brand-surface/30 border border-brand-border/50 text-brand-text text-xs uppercase tracking-widest rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-brand-text/30 transition-colors placeholder:text-brand-muted/50 font-semibold"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 pt-4">
        <div className="bg-brand-surface/10 border border-brand-border/30 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/30 bg-brand-surface/40">
                <th className="py-4 px-6 text-[10px] font-extrabold text-brand-muted uppercase tracking-[0.2em] w-1/6">Hora Envío</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-brand-muted uppercase tracking-[0.2em] w-1/3">Producto</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-brand-muted uppercase tracking-[0.2em] w-1/6 text-right">Cantidad</th>
                <th className="py-4 px-6 text-[10px] font-extrabold text-brand-muted uppercase tracking-[0.2em] w-1/6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-xs font-bold tracking-widest uppercase text-brand-muted">
                    Buscando recepciones...
                  </td>
                </tr>
              ) : recepciones.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-xs font-bold tracking-widest uppercase text-brand-muted">
                    SIN RECEPCIONES PENDIENTES
                  </td>
                </tr>
              ) : (
                recepciones.map((rep) => (
                  <tr key={rep.id} className={`border-b border-brand-border/10 transition-colors ${rep.status === 'RECEIVED' ? 'bg-brand-success/5 opacity-50' : 'hover:bg-brand-surface/20'}`}>
                    <td className="py-3 px-6 text-xs font-bold text-brand-muted font-mono">{rep.time}</td>
                    <td className="py-3 px-6 text-sm font-bold text-brand-text flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-border/50 flex items-center justify-center text-brand-muted">
                        <Package size={14} />
                      </div>
                      {rep.product}
                    </td>
                    <td className="py-3 px-6 text-sm font-bold text-brand-text font-mono text-right">
                      +{rep.requested}
                    </td>
                    <td className="py-3 px-6 text-right">
                      {rep.status === 'PENDING' ? (
                        <button 
                          onClick={() => handleReceive(rep.id)}
                          className="px-4 py-2 bg-brand-surface border border-brand-border/50 text-brand-text rounded-lg text-[10px] font-bold uppercase tracking-widest hover:text-brand-success hover:border-brand-success/50 transition-all"
                        >
                          Recibir
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-2 text-brand-success">
                          <CheckCircle size={14} />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest">OK</span>
                        </div>
                      )}
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

export default TabRecepciones;
