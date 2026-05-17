import React from 'react';
import { Search, Filter, Download } from 'lucide-react';

export default function TableLayout() {
  const mockData = Array.from({ length: 25 }).map((_, i) => ({
    id: `TRX-${1000 + i}`,
    time: `01:${(i * 13 % 60).toString().padStart(2, '0')}:${(i * 7 % 60).toString().padStart(2, '0')} AM`,
    terminal: `BAR-0${(i % 4) + 1}`,
    amount: `$${(Math.random() * 200 + 10).toFixed(2)}`,
    status: i % 7 === 0 ? 'VOID' : 'SETTLED'
  }));

  return (
    <div className="h-full flex flex-col p-8 min-h-full">
      <div className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-text">Transaction Log</h2>
          <p className="text-sm font-semibold text-brand-muted mt-1">Raw Data Feed</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="pl-10 pr-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-sm font-semibold focus:outline-none focus:border-brand-text focus:ring-1 focus:ring-brand-text/50 placeholder:text-brand-muted text-brand-text w-64 transition-all"
            />
          </div>
          <button className="p-2.5 rounded-xl border border-brand-border bg-brand-bg hover:bg-brand-surface hover:border-brand-text/30 transition-all cursor-pointer text-brand-text shadow-sm">
            <Filter size={18} />
          </button>
          <button className="p-2.5 rounded-xl border border-brand-border bg-brand-bg hover:bg-brand-surface hover:border-brand-text/30 transition-all cursor-pointer text-brand-text shadow-sm">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 border border-brand-border bg-brand-bg rounded-2xl overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead className="bg-brand-surface text-brand-muted sticky top-0 z-10">
              <tr>
                <th className="p-4 font-bold border-b border-brand-border">ID</th>
                <th className="p-4 font-bold border-b border-brand-border">Timestamp</th>
                <th className="p-4 font-bold border-b border-brand-border">Source</th>
                <th className="p-4 font-bold border-b border-brand-border text-right">Amount</th>
                <th className="p-4 font-bold border-b border-brand-border">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border font-medium">
              {mockData.map((row, i) => (
                <tr key={i} className="hover:bg-brand-surface/50 transition-colors text-brand-text">
                  <td className="p-4 font-mono font-semibold text-xs tracking-tight">{row.id}</td>
                  <td className="p-4 text-brand-muted font-mono font-medium text-xs">{row.time}</td>
                  <td className="p-4 font-semibold">{row.terminal}</td>
                  <td className="p-4 text-right font-mono font-bold text-xs tracking-tight">{row.amount}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-widest uppercase ${
                      row.status === 'VOID' ? 'bg-brand-error/10 text-brand-error' : 'bg-brand-success/10 text-brand-success'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
