import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [pin, setPin] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length < 4) return;
    await login(pin);
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(val);
  };

  if (!mounted) return null; // Avoid flicker before CSS animations start

  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-brand-bg">

      <div className="w-full max-w-sm z-10 px-6">
        
        {/* Brand */}
        <div className="text-center mb-14 animate-fade-in delay-100">
          <h1 className="text-sm font-extrabold tracking-[0.3em] uppercase text-brand-text drop-shadow-md">
            MIDNIGHT CLUB
          </h1>
          <div className="mt-3 text-[9px] font-bold tracking-[0.6em] uppercase text-brand-muted/70">
            CONTROL PANEL
          </div>
        </div>

        {/* Form Container (Ghost Glass) */}
        <div className="animate-slide-up delay-300">
          <form 
            onSubmit={handleSubmit} 
            className="space-y-6 bg-brand-surface/40 backdrop-blur-xl border border-brand-border/50 rounded-2xl p-8 shadow-2xl"
          >
            <div className="relative group">
              <Lock size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-text transition-colors duration-300" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={handlePinChange}
                placeholder="INGRESAR PIN"
                autoFocus
                className="w-full bg-brand-bg/50 border border-brand-border/40 rounded-xl pl-12 pr-5 py-4 text-sm font-mono tracking-[0.5em] text-brand-text placeholder:text-brand-muted/30 placeholder:tracking-[0.2em] focus:outline-none focus:border-brand-text/30 focus:bg-brand-bg/80 focus:ring-1 focus:ring-brand-text/30 transition-all duration-300 shadow-inner"
              />
            </div>

            {error && (
               <div className="flex items-center justify-center gap-2 text-brand-error text-[11px] font-bold px-1 bg-brand-error/10 py-2.5 rounded-lg border border-brand-error/20 animate-fade-in">
                <AlertCircle size={14} />
                <span className="tracking-widest uppercase">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="w-full relative overflow-hidden bg-brand-text text-brand-bg rounded-xl py-4 text-[11px] font-extrabold uppercase tracking-[0.2em] hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3 group"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
              
              {loading ? (
                <Loader2 size={16} className="animate-spin text-brand-bg" />
              ) : (
                'AUTENTICAR'
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center animate-fade-in delay-500">
          <p className="text-[10px] font-mono text-brand-muted/40 uppercase tracking-widest">
            {new Date().getFullYear()} © SYSTEM V2.0
          </p>
        </div>
      </div>
    </div>
  );
}
