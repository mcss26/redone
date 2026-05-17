import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [flashColor, setFlashColor] = useState('');

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const KpiCard = ({ title, value, sub, alert }) => (
    <div className={`p-5 rounded-2xl border bg-brand-bg relative transition-all duration-300 hover:shadow-lg ${alert ? 'border-brand-error/30 bg-brand-error/5' : 'border-brand-border'}`}>
      {alert && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-brand-error animate-pulse m-5 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>}
      <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">{title}</h3>
      <div className="text-3xl font-extrabold text-brand-text mb-1 tracking-tight">{value}</div>
      <div className={`text-xs font-semibold ${alert ? 'text-brand-error' : 'text-brand-muted'}`}>
        {sub}
      </div>
    </div>
  );

  return (
    <div className="p-8 relative min-h-full">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`fixed inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text">Op-Center</h2>
          <p className="text-sm font-semibold text-brand-muted mt-1">Live System Telemetry</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => triggerFlash('error')} className="px-5 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-sm font-bold hover:border-brand-error hover:text-brand-error transition-all duration-200 cursor-pointer text-brand-text shadow-sm">
            Force Sync (Err)
          </button>
          <button onClick={() => triggerFlash('success')} className="px-5 py-2.5 rounded-xl border border-transparent bg-brand-text text-brand-bg text-sm font-bold hover:bg-brand-text/90 transition-all duration-200 cursor-pointer shadow-md">
            Execute End of Day
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <KpiCard title="Gross Sales" value="$42,850" sub="+12.5% vs Last Night" />
        <KpiCard title="Headcount" value="1,248" sub="Capacity 85%" />
        <KpiCard title="Stock Variance" value="-$420" sub="Critical: Vodka A" alert={true} />
        <KpiCard title="Active Terminals" value="12/12" sub="All systems nominal" />
      </div>

      {/* Data Visuals Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-brand-border bg-brand-bg p-6">
          <h3 className="text-sm font-bold text-brand-text mb-6">Sales Velocity</h3>
          <div className="h-64 flex items-end gap-3">
            {[30, 45, 20, 60, 80, 50, 90, 100, 75, 40].map((h, i) => (
              <div key={i} className="flex-1 bg-brand-surface border border-brand-border rounded-t-lg hover:bg-brand-text/10 hover:border-brand-text/30 transition-all duration-300 relative group cursor-crosshair" style={{ height: `${h}%` }}>
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-text text-brand-bg text-xs font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{h}K</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-2xl border border-brand-border bg-brand-bg p-6">
          <h3 className="text-sm font-bold text-brand-text mb-6">Critical Alerts</h3>
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-brand-border/50 bg-brand-surface/50 hover:bg-brand-surface transition-colors">
                <AlertTriangle size={18} className="text-brand-error mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-brand-text text-sm">Stock Depletion</div>
                  <div className="text-brand-muted mt-1 text-xs font-semibold">Bar {i} running low on cups.</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
