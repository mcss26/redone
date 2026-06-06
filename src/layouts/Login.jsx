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
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-brand-bg">

      <div className="w-full max-w-sm z-10 px-8 flex flex-col items-center">
        
        {/* Brand */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in delay-100 flex flex-col items-center">
          <span className="text-[8px] md:text-[10px] font-bold tracking-[0.4em] uppercase text-brand-muted mb-4 md:mb-6">
            SYSTEM ACCESS // CONTROL PANEL
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[7rem] leading-none font-extrabold tracking-[0.1em] uppercase text-brand-text whitespace-nowrap">
            MIDNIGHT CLUB
          </h1>
        </div>

        {/* Form Container (Raw Brutalist) */}
        <div className="w-full max-w-xs animate-slide-up delay-300 mt-12">
          <form 
            onSubmit={handleSubmit} 
            className="w-full flex flex-col space-y-6"
          >
            {/* Input Box */}
            <div className="relative group w-full flex items-center border-b border-brand-border/50 focus-within:border-brand-text transition-colors duration-300 pb-3">
              <Lock size={14} className="text-brand-muted/50 group-focus-within:text-brand-text transition-colors duration-300 mr-4" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pin}
                onChange={handlePinChange}
                placeholder="INGRESAR PIN"
                autoFocus
                className="flex-1 bg-transparent border-none text-xl font-mono tracking-[0.5em] text-brand-text placeholder:text-brand-muted/30 placeholder:tracking-[0.2em] focus:outline-none"
              />
            </div>

            {/* Error & Spacer */}
            <div className="h-6 flex items-start">
              {error && (
                <div className="flex items-center gap-2 text-brand-error text-[10px] font-bold animate-fade-in uppercase tracking-widest">
                  <AlertCircle size={12} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="w-full bg-brand-text text-brand-bg py-4 text-[11px] font-extrabold uppercase tracking-[0.3em] hover:bg-white active:scale-95 transition-all duration-300 disabled:bg-brand-surface disabled:text-brand-muted/50 disabled:active:scale-100 cursor-pointer flex items-center justify-center"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'AUTENTICAR'}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in delay-500 w-full text-center">
          <p className="text-[9px] font-mono text-brand-muted/30 uppercase tracking-[0.4em]">
            {new Date().getFullYear()} © SYSTEM V2.0
          </p>
        </div>
      </div>
    </div>
  );
}
