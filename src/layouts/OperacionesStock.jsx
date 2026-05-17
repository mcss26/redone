import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TrendingUp, AlertTriangle, CheckCircle2, Package, Search, ChevronDown, Filter } from 'lucide-react';

export default function OperacionesStock() {
  const [stockData, setStockData] = useState([]);
  const [allCategories, setAllCategories] = useState(['Todas']);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('active'); // 'all' | 'active' | 'inactive'

  useEffect(() => {
    fetchLiveStock();
  }, []);

  const fetchLiveStock = async () => {
    try {
      setIsLoading(true);
      // 1. Fetch data concurrently
      const [viewRes, skuRes, catRes] = await Promise.all([
        supabase.from('vw_stock_global').select('*'),
        supabase.from('master_sku').select('id, costo'),
        supabase.from('master_categories').select('nombre')
      ]);

      if (viewRes.error) throw viewRes.error;
      if (skuRes.error) throw skuRes.error;
      if (catRes.error) throw catRes.error;

      const costMap = skuRes.data.reduce((acc, curr) => {
        acc[curr.id] = parseFloat(curr.costo || 0);
        return acc;
      }, {});

      // Extract all categories explicitly from master_categories
      const fetchedCats = catRes.data.map(c => c.nombre).filter(Boolean).sort();
      setAllCategories(['Todas', ...fetchedCats]);

      // 3. Merge data
      const mergedData = viewRes.data.map(item => {
        const costo = costMap[item.sku_id] || 0;
        const stockActual = parseFloat(item.stock_actual || 0);
        const requerido = parseFloat(item.requerido || 0);
        return {
          id: item.sku_id,
          name: item.sku_nombre,
          stock: stockActual,
          rtg: requerido,
          costo: costo,
          valorizado: stockActual * costo,
          activo: item.activo,
          categoria_nombre: item.categoria_nombre,
          status: item.estado === 'Normal' ? 'ok' : item.estado === 'Bajo' ? 'warning' : 'critical'
        };
      });

      // Sort alphabetically
      mergedData.sort((a, b) => a.name.localeCompare(b.name));
      setStockData(mergedData);
    } catch (err) {
      console.error('Error fetching stock:', err);
    } finally {
      setIsLoading(false);
    }
  };



  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  const totalValorizado = stockData.reduce((acc, item) => acc + item.valorizado, 0);
  const stockActivoValor = stockData.filter(item => item.activo).reduce((acc, item) => acc + item.valorizado, 0);
  const stockInactivoValor = stockData.filter(item => !item.activo).reduce((acc, item) => acc + item.valorizado, 0);

  const filteredStock = stockData.filter(item => {
    if (activeFilter === 'active' && !item.activo) return false;
    if (activeFilter === 'inactive' && item.activo) return false;
    if (selectedCategory !== 'Todas' && item.categoria_nombre !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col p-8 min-h-full">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text">Stock Central</h2>
          <p className="text-sm font-semibold text-brand-muted mt-1">Operaciones, Importaciones y Rendimiento</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 border border-brand-border bg-brand-surface rounded-xl text-xs font-bold uppercase tracking-widest text-brand-text hover:bg-brand-text hover:text-brand-bg transition-colors cursor-pointer">
            Exportar Reporte
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-8 min-h-0">
          
          {/* KPIs Row */}
          <div className="grid grid-cols-3 gap-6 shrink-0">
            <div 
              onClick={() => setActiveFilter('all')}
              className={`bg-brand-bg border rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-all ${activeFilter === 'all' ? 'border-brand-text ring-1 ring-brand-text/50' : 'border-brand-border hover:border-brand-text/50'}`}
            >
               <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-muted mb-2">Total Valorizado</div>
               <div className="text-3xl font-mono font-bold text-brand-text">{formatCurrency(totalValorizado)}</div>
               <TrendingUp size={64} className="absolute -right-4 -bottom-4 text-brand-surface/50 pointer-events-none" />
            </div>
            <div 
              onClick={() => setActiveFilter('active')}
              className={`bg-brand-bg border rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-all ${activeFilter === 'active' ? 'border-brand-success ring-1 ring-brand-success/50' : 'border-brand-border hover:border-brand-success/50'}`}
            >
               <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-muted mb-2">Stock Activo</div>
               <div className="text-3xl font-mono font-bold text-brand-success">{formatCurrency(stockActivoValor)}</div>
               <div className="mt-2 text-[10px] font-bold text-brand-success bg-brand-success/10 inline-block px-2 py-0.5 rounded uppercase">Inventario en Operación</div>
            </div>
            <div 
              onClick={() => setActiveFilter('inactive')}
              className={`bg-brand-bg border rounded-2xl p-6 relative overflow-hidden cursor-pointer transition-all ${activeFilter === 'inactive' ? 'border-brand-error ring-1 ring-brand-error/50' : 'border-brand-error/30 hover:border-brand-error/50'}`}
            >
               <div className="text-[10px] font-extrabold uppercase tracking-widest text-brand-error mb-2">Stock Inactivo</div>
               <div className="text-3xl font-mono font-bold text-brand-error">{formatCurrency(stockInactivoValor)}</div>
               <div className="mt-2 text-[10px] font-bold text-brand-error bg-brand-error/10 inline-block px-2 py-0.5 rounded uppercase">Capital Inmovilizado</div>
            </div>
          </div>

          {/* Tabla de Stock de Alta Densidad */}
          <div className="flex-1 flex flex-col border border-brand-border bg-brand-bg rounded-2xl overflow-hidden shadow-sm min-h-0">
            <div className="p-4 border-b border-brand-border bg-brand-surface flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Package size={18} className="text-brand-text" />
                <h3 className="font-extrabold uppercase tracking-widest text-brand-text text-sm">Estado del Inventario</h3>
              </div>
              <div className="flex gap-3">
                <div className="relative group">
                  <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted group-hover:text-brand-text transition-colors pointer-events-none" />
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#0A0A0A] border border-brand-border pl-9 pr-8 py-2 rounded-xl text-xs font-bold text-brand-text focus:outline-none focus:border-brand-text uppercase cursor-pointer appearance-none shadow-sm hover:border-brand-text/50 transition-colors"
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                </div>
                
                <div className="relative group">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted group-hover:text-brand-text transition-colors pointer-events-none" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="BUSCAR SKU..." 
                    className="bg-[#0A0A0A] border border-brand-border pl-9 pr-4 py-2 rounded-xl text-xs font-bold text-brand-text focus:outline-none focus:border-brand-text focus:ring-1 focus:ring-brand-text/50 w-56 uppercase placeholder:text-brand-muted/50 transition-all shadow-sm hover:border-brand-text/50" 
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                <thead className="bg-[#0A0A0A] sticky top-0 z-10">
                  <tr>
                    <th className="p-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-widest border-b border-brand-border">SKU / ÍTEM</th>
                    <th className="p-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-widest border-b border-brand-border text-right">Stock Act.</th>
                    <th className="p-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-widest border-b border-brand-border text-right">Stock RTG</th>
                    <th className="p-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-widest border-b border-brand-border text-right">Costo Unit.</th>
                    <th className="p-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-widest border-b border-brand-border text-right">Valorizado</th>
                    <th className="p-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-widest border-b border-brand-border text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="font-medium divide-y divide-brand-border/50">
                  {isLoading ? (
                    <tr><td colSpan="6" className="p-8 text-center text-brand-muted text-xs font-bold uppercase tracking-widest">Sincronizando vw_stock_global...</td></tr>
                  ) : filteredStock.map(item => (
                    <tr key={item.id} className="hover:bg-brand-surface/30 transition-colors">
                      <td className="p-4 font-bold text-brand-text text-xs">{item.name}</td>
                      <td className="p-4 text-right font-mono text-brand-text">{item.stock}</td>
                      <td className="p-4 text-right font-mono text-brand-muted">{item.rtg}</td>
                      <td className="p-4 text-right font-mono text-brand-text">{formatCurrency(item.costo)}</td>
                      <td className="p-4 text-right font-mono font-bold text-brand-text">{formatCurrency(item.valorizado)}</td>
                      <td className="p-4 text-center">
                        {item.status === 'ok' && <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-success bg-brand-success/10 px-2 py-1 rounded"><CheckCircle2 size={12}/> Normal</span>}
                        {item.status === 'warning' && <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded"><AlertTriangle size={12}/> Bajo</span>}
                        {item.status === 'critical' && <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-error bg-brand-error/10 px-2 py-1 rounded"><AlertTriangle size={12}/> Crítico</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
}
