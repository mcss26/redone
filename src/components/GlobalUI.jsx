import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function GlobalUI({ children }) {
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  useEffect(() => {
    window.UI = {
      toast: (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
      },
      confirm: (msg) => {
        return new Promise((resolve) => {
          setConfirmState({
            msg,
            onConfirm: () => {
              resolve(true);
              setConfirmState(null);
            },
            onCancel: () => {
              resolve(false);
              setConfirmState(null);
            }
          });
        });
      }
    };
  }, []);

  return (
    <>
      {children}
      
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-lg border flex items-center gap-3 animate-slide-in shadow-2xl ${toast.type === 'danger' ? 'bg-brand-bg border-brand-danger/50 text-brand-danger' : 'bg-brand-bg border-brand-success/50 text-brand-success'}`}>
          {toast.type === 'danger' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span className="text-xs font-bold uppercase tracking-widest">{toast.msg}</span>
        </div>
      )}

      {/* Confirm Modal (Brutalist) */}
      {confirmState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={confirmState.onCancel} />
          
          {/* Modal */}
          <div className="relative bg-brand-bg border border-brand-border/50 w-full max-w-sm overflow-hidden animate-fade-in shadow-2xl">
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-brand-danger shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-danger/10 border border-brand-danger/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-brand-danger" size={20} />
                </div>
                <h3 className="text-brand-text font-bold uppercase tracking-[0.2em] text-sm leading-tight">
                  Autorización <br/> Requerida
                </h3>
              </div>
              
              <p className="text-brand-muted text-xs font-mono mb-8 leading-relaxed">
                {confirmState.msg}
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={confirmState.onCancel}
                  className="flex-1 bg-transparent border border-brand-border/50 hover:border-brand-text text-brand-text px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmState.onConfirm}
                  className="flex-1 bg-brand-danger text-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-red-600 cursor-pointer"
                >
                  Proceder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
