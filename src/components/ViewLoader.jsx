import React from 'react';
import { Loader2 } from 'lucide-react';

export default function ViewLoader() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-brand-bg/80 backdrop-blur-sm animate-fade-in space-y-4">
      <div className="relative">
        <div className="absolute inset-0 blur-md bg-brand-accent/20 rounded-full animate-pulse" />
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin relative z-10" />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-muted">
          Midnight Club
        </span>
        <span className="text-xs font-semibold tracking-widest text-brand-text/80 animate-pulse mt-1">
          Cargando Módulo...
        </span>
      </div>
    </div>
  );
}
