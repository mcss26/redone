import React, { useState } from 'react';
import { Lock, Mail, Loader2, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // App.jsx auth state listener will automatically redirect.
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Credenciales Inválidas' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-bg via-brand-text/50 to-brand-bg opacity-20"></div>
        
        <div className="mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-center mb-6 shadow-sm">
            <KeyRound size={20} className="text-brand-text" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-text">Acceso Restringido</h1>
          <p className="text-sm font-medium text-brand-muted mt-1">Midnight Club OS • Portal Administrativo</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-brand-error/10 border border-brand-error/20 flex items-start gap-3">
            <Lock size={16} className="text-brand-error mt-0.5 shrink-0" />
            <div className="text-xs font-bold text-brand-error uppercase tracking-wide">{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-muted ml-1">Email Operativo</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-sm font-semibold focus:outline-none focus:border-brand-text focus:ring-1 focus:ring-brand-text/50 text-brand-text transition-all"
                placeholder="admin@midnight.club"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-muted ml-1">Token de Acceso</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-brand-bg border border-brand-border text-sm font-semibold focus:outline-none focus:border-brand-text focus:ring-1 focus:ring-brand-text/50 text-brand-text transition-all"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-xl border border-transparent bg-brand-text text-brand-bg text-sm font-bold hover:bg-brand-text/90 transition-all duration-200 cursor-pointer shadow-md flex justify-center items-center h-12"
          >
            {loading ? <Loader2 size={18} className="animate-spin text-brand-bg" /> : 'Establecer Conexión'}
          </button>
        </form>
      </div>
    </div>
  );
}
