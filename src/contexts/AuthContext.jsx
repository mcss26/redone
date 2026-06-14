import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext(null);

// Role → module access map
// 'all' = access to every module, otherwise whitelist of module IDs
// writable: modules where the role can Create/Edit/Delete (subset of access)
const ROLE_ACCESS = {
  admin: {
    access: 'all',
    writable: 'all',
  },
  operativo: {
    access: [
      // Masters (read-only)
      'profiles', 'suppliers', 'sku', 'staff_roles', 'cost_templates', 'pos_terminals', 'master_vouchers',
      // Planificación (full)
      'work_days', 'opening_costs', 'staff_plan', 'stock_requests',
      // La Noche
      'bar_inventory', 'workday',
    ],
    writable: ['work_days', 'opening_costs', 'staff_plan', 'stock_requests', 'bar_inventory', 'workday', 'sku'],
  },
  contador: {
    access: [
      // Masters (read-only)
      'profiles', 'suppliers', 'sku', 'staff_roles', 'cost_templates', 'pos_terminals', 'master_vouchers',
      // Ejecución
      'payments', 'fixed_costs',
      // Reportes
      'night_report', 'monthly_report', 'annual_report',
    ],
    writable: ['payments', 'fixed_costs'],
  },
  encargado: {
    access: ['bar_inventory', 'workday'],
    writable: ['bar_inventory', 'workday'],
  },
  viewer: {
    access: ['night_report', 'monthly_report', 'annual_report'],
    writable: [],
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-verify session in background
  React.useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    const verifySession = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, active')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error || !data || !data.active) {
          if (isMounted) {
            setUser(null);
            localStorage.removeItem('mc_user');
            localStorage.removeItem('mc_active_view');
          }
        }
      } catch (err) {
        // Silently fail on network error, keep current session
      }
    };
    
    verifySession();
    return () => { isMounted = false; };
  }, [user?.id]);

  const login = useCallback(async (pin) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('pin', pin)
        .eq('active', true)
        .maybeSingle();

      if (dbError) throw dbError;
      if (!data) {
        setError('PIN inválido');
        return false;
      }
      setUser(data);
      localStorage.setItem('mc_user', JSON.stringify(data));
      return true;
    } catch (e) {
      setError(e.message || 'Error de conexión');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem('mc_user');
    localStorage.removeItem('mc_active_view');
  }, []);

  // Role-gating helpers
  const roleHelpers = useMemo(() => {
    const role = user?.role || 'viewer';
    const config = ROLE_ACCESS[role] || ROLE_ACCESS.viewer;

    return {
      /** Can this role see the module in navigation? */
      canAccess: (moduleId) => config.access === 'all' || config.access.includes(moduleId),
      /** Can this role create/edit/delete in this module? */
      canMutate: (moduleId) => config.writable === 'all' || config.writable.includes(moduleId),
      /** Is this role read-only for everything? */
      isReadOnly: role === 'viewer',
    };
  }, [user?.role]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, ...roleHelpers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

