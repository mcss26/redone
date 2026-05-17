import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, DollarSign, Calculator, Lock, QrCode, Calendar, ArrowRight, Plus, X } from 'lucide-react';

export default function WorkdaysPlanner({ globalDate, setGlobalDate, onNavigate }) {
  const selectedDate = globalDate;
  const setSelectedDate = setGlobalDate;
  const [workday, setWorkday] = useState(null);
  const [roles, setRoles] = useState([]);
  const [fixedCosts, setFixedCosts] = useState([
    { id: 'sadaic', name: 'SADAIC', amount: 340000 },
    { id: 'aadicapif', name: 'AADICAPIF', amount: 370000 },
    { id: 'limpieza', name: 'Canon Limpieza', amount: 150000 }
  ]);
  
  const [staffQty, setStaffQty] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingBackground, setIsFetchingBackground] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [flashColor, setFlashColor] = useState('');
  
  // Ad-hoc cost modal state
  const [isAdHocModalOpen, setIsAdHocModalOpen] = useState(false);
  const [adHocTitle, setAdHocTitle] = useState('');
  const [adHocAmount, setAdHocAmount] = useState('');

  const [defaultFixedCosts, setDefaultFixedCosts] = useState([]);

  useEffect(() => {
    fetchPlannerData();
  }, []);

  useEffect(() => {
    if (selectedDate && defaultFixedCosts.length > 0) {
      checkExistingWorkday(selectedDate);
    }
  }, [selectedDate, defaultFixedCosts]);

  const fetchPlannerData = async () => {
    try {
      setIsLoading(true);
      const { data: rolesData, error: rolesError } = await supabase
        .from('master_staff_roles')
        .select('id, name, area, base_rate')
        .eq('active', true)
        .order('area', { ascending: true })
        .order('name', { ascending: true });
        
      if (!rolesError && rolesData) {
        setRoles(rolesData);
      }

      const { data: openingData, error: openingError } = await supabase
        .from('finance_opening_cost_defs')
        .select('id, title, default_amount');

      const combinedCosts = [];
      if (!openingError && openingData) {
        openingData.forEach(o => {
          combinedCosts.push({
            id: o.id,
            name: o.title || 'SIN TITULO',
            amount: o.default_amount || 0,
            origin: 'finance_opening_cost_defs'
          });
        });
      }

      setDefaultFixedCosts(combinedCosts);
      // Don't set fixedCosts here, checkExistingWorkday will handle it based on date
    } catch (err) {
      console.error('Error loading planner data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingWorkday = async (dateStr) => {
    try {
      setIsFetchingBackground(true);
      const { data, error } = await supabase
        .from('work_days')
        .select('id, status, work_date')
        .eq('work_date', dateStr)
        .maybeSingle();

      if (data) {
        setWorkday(data);
        
        // Load Staff Planning
        const { data: staffData } = await supabase
          .from('work_day_staff_planning')
          .select('role_id, quantity')
          .eq('work_day_id', data.id);
          
        const newStaffQty = {};
        if (staffData) {
          staffData.forEach(s => {
            newStaffQty[s.role_id] = s.quantity;
          });
        }
        setStaffQty(newStaffQty);

        // Load Fixed Costs
        const { data: paymentsData } = await supabase
          .from('finance_payments')
          .select('title, amount_total, source_type, opening_def_id')
          .eq('work_day_id', data.id)
          .in('source_type', ['OPENING', 'AD_HOC']);

        if (paymentsData && paymentsData.length > 0) {
          const loadedCosts = paymentsData.map(p => ({
            id: p.opening_def_id || `adhoc_${Math.random()}`,
            name: p.title,
            amount: p.amount_total,
            origin: p.source_type === 'OPENING' ? 'finance_opening_cost_defs' : 'ad_hoc'
          }));
          setFixedCosts(loadedCosts);
        } else {
          setFixedCosts(defaultFixedCosts); // Fallback if no payments saved but workday exists
        }

      } else {
        setWorkday(null);
        setStaffQty({});
        setFixedCosts(defaultFixedCosts);
      }
    } catch (err) {
      console.error('Error checking workday:', err);
    } finally {
      setIsFetchingBackground(false);
    }
  };

  const handleQtyChange = (roleId, value) => {
    const qty = parseInt(value, 10) || 0;
    setStaffQty(prev => ({ ...prev, [roleId]: qty < 0 ? 0 : qty }));
  };

  const handleFixedCostChange = (index, value) => {
    const amt = parseFloat(value) || 0;
    const newCosts = [...fixedCosts];
    newCosts[index].amount = amt < 0 ? 0 : amt;
    setFixedCosts(newCosts);
  };

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const handleSaveAdHocCost = () => {
    if (!adHocTitle.trim()) return;
    const newCosts = [...fixedCosts];
    newCosts.push({
      id: `adhoc_${Date.now()}`,
      name: adHocTitle,
      amount: parseFloat(adHocAmount) || 0,
      origin: 'ad_hoc'
    });
    setFixedCosts(newCosts);
    setIsAdHocModalOpen(false);
    setAdHocTitle('');
    setAdHocAmount('');
  };

  const handleLockPlan = async () => {
    setIsLocking(true);
    try {
      // 1. Upsert workday
      let currentWorkdayId = workday?.id;
      if (!currentWorkdayId) {
        const { data, error } = await supabase
          .from('work_days')
          .insert({
            work_date: selectedDate,
            status: 'PLANNED'
          })
          .select('id')
          .single();
        if (error) throw error;
        currentWorkdayId = data.id;
        setWorkday({ id: currentWorkdayId, work_date: selectedDate, status: 'PLANNED' });
      } else {
        await supabase.from('work_days').update({ status: 'PLANNED' }).eq('id', currentWorkdayId);
        setWorkday(prev => ({ ...prev, status: 'PLANNED' }));
      }

      // 2. Upsert staff planning
      await supabase.from('work_day_staff_planning').delete().eq('work_day_id', currentWorkdayId);
      
      const staffInserts = Object.keys(staffQty)
        .filter(roleId => staffQty[roleId] > 0)
        .map(roleId => ({
          work_day_id: currentWorkdayId,
          role_id: roleId,
          quantity: staffQty[roleId]
        }));
        
      if (staffInserts.length > 0) {
        const { error: staffError } = await supabase.from('work_day_staff_planning').insert(staffInserts);
        if (staffError) throw staffError;
      }

      // 3. Upsert opening costs to finance_payments
      // Wipe only OPENING / AD_HOC costs that are still PENDING for this workday
      await supabase.from('finance_payments')
        .delete()
        .eq('work_day_id', currentWorkdayId)
        .in('source_type', ['OPENING', 'AD_HOC'])
        .eq('status', 'PENDING');

      const paymentInserts = fixedCosts.map(cost => ({
        work_day_id: currentWorkdayId,
        title: cost.name || 'Sin Título',
        amount_total: cost.amount || 0,
        status: 'PENDING',
        source_type: cost.origin === 'finance_opening_cost_defs' ? 'OPENING' : 'AD_HOC',
        opening_def_id: cost.origin === 'finance_opening_cost_defs' ? cost.id : null,
        due_date: selectedDate
      }));

      if (paymentInserts.length > 0) {
        const { error: paymentError } = await supabase.from('finance_payments').insert(paymentInserts);
        if (paymentError) throw paymentError;
      }

      triggerFlash('success');
    } catch (error) {
      console.error('Error locking plan:', error);
      triggerFlash('error');
    } finally {
      setIsLocking(false);
    }
  };

  const handleActivateWorkday = async () => {
    if (!workday?.id) return;
    setIsLocking(true);
    try {
      const { error } = await supabase
        .from('work_days')
        .update({ status: 'ACTIVE' })
        .eq('id', workday.id);

      if (error) {
        if (error.message?.includes('work_days_one_active_idx') || error.code === '23505') {
          // Fetch the currently active workday to redirect
          const { data: activeData } = await supabase
            .from('work_days')
            .select('work_date')
            .eq('status', 'ACTIVE')
            .maybeSingle();
            
          if (activeData && activeData.work_date && onNavigate) {
            onNavigate('night_chief', { date: activeData.work_date });
          } else {
            alert('No se puede activar: Ya hay otra jornada ACTIVA. Debes cerrarla en Night Chief primero.');
          }
        } else {
          throw error;
        }
      } else {
        setWorkday(prev => ({ ...prev, status: 'ACTIVE' }));
        triggerFlash('success');
      }
    } catch (err) {
      console.error('Error activating workday:', err);
      triggerFlash('error');
    } finally {
      setIsLocking(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  
  const totalStaffCost = roles.reduce((sum, role) => sum + (role.base_rate * (staffQty[role.id] || 0)), 0);
  const totalFixedCosts = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalProjected = totalStaffCost + totalFixedCosts;

  const groupedRoles = roles.reduce((acc, role) => {
    if (!acc[role.area]) acc[role.area] = [];
    acc[role.area].push(role);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-brand-bg">
      {flashColor && <div className={`absolute inset-0 z-[100] ${flashColor} opacity-20 pointer-events-none transition-opacity duration-100`}></div>}
      
      {/* TOP HEADER */}
      <div className="shrink-0 bg-[#0A0A0A] border-b border-brand-border/50 px-8 py-6 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-text mb-1">Workdays Planner</h2>
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">
              Planificación Operativa y Financiera
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-brand-surface/30 border border-brand-border/50 p-2 rounded-xl">
            <div className="flex items-center gap-3 px-3">
              <Calendar size={18} className="text-brand-text" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xl font-mono font-bold text-brand-text focus:outline-none cursor-pointer appearance-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="h-8 w-[1px] bg-brand-border/50"></div>
            <div className="pr-3 pl-1 flex items-center gap-2">
              {isFetchingBackground && (
                <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest animate-pulse mr-2">
                  Sincronizando...
                </span>
              )}
              {workday ? (
                <span className="px-3 py-1.5 bg-brand-surface text-brand-text text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-success shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  DRAFT RECUPERADO
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-brand-surface/30 text-brand-muted text-[10px] font-black uppercase tracking-widest rounded-lg border border-brand-border/30 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-muted"></div>
                  NUEVA JORNADA
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-brand-muted font-bold tracking-widest uppercase text-sm">
          Cargando entorno...
        </div>
      ) : (
        <div className={`flex-1 overflow-y-auto px-8 py-8 flex flex-col xl:flex-row gap-12 items-start transition-opacity duration-300 ${isFetchingBackground ? 'opacity-50' : 'opacity-100'}`}>
          
          {/* LEFT COLUMN: Data Entry */}
          <div className="w-full xl:w-2/3 flex flex-col gap-12">
            
            {/* Staff Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Users size={20} className="text-brand-muted" />
                <h3 className="text-lg font-extrabold text-brand-text tracking-tight">Staff Operativo</h3>
              </div>
              
              <div className="bg-[#0A0A0A] border border-brand-border rounded-2xl p-6">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 pb-3 border-b border-brand-border/50 text-[10px] font-black uppercase tracking-widest text-brand-muted">
                  <div>Rol / Función</div>
                  <div className="text-right">Tarifa Base</div>
                  <div className="text-center">Cantidad</div>
                  <div className="text-right">Subtotal</div>
                </div>
                
                <div className="flex flex-col gap-6 mt-4">
                  {Object.keys(groupedRoles).map(area => (
                    <div key={area}>
                      <div className="text-xs font-black uppercase tracking-widest text-brand-text mb-3 px-2 border-l-2 border-brand-text">
                        {area}
                      </div>
                      <div className="flex flex-col gap-1">
                        {groupedRoles[area].map(role => {
                          const qty = staffQty[role.id] || 0;
                          const subtotal = qty * role.base_rate;
                          return (
                            <div key={role.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 items-center py-2 px-2 hover:bg-brand-surface/30 rounded-lg transition-colors group">
                              <div className="font-semibold text-sm text-brand-text/90 group-hover:text-brand-text transition-colors">{role.name}</div>
                              <div className="text-right font-mono text-xs text-brand-muted">{formatCurrency(role.base_rate)}</div>
                              <div className="flex justify-center">
                                <input 
                                  type="number" 
                                  min="0"
                                  value={qty || ''}
                                  onChange={(e) => handleQtyChange(role.id, e.target.value)}
                                  placeholder="0"
                                  className="w-16 bg-brand-surface border border-transparent hover:border-brand-border focus:border-brand-text rounded-xl px-2 py-1 text-center text-brand-text font-mono text-sm focus:outline-none transition-colors"
                                />
                              </div>
                              <div className="text-right font-mono font-bold text-sm text-brand-text">{formatCurrency(subtotal)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Fixed Costs Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <DollarSign size={20} className="text-brand-muted" />
                  <h3 className="text-lg font-extrabold text-brand-text tracking-tight">Costos de Apertura</h3>
                </div>
                <button 
                  onClick={() => setIsAdHocModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border rounded-lg text-xs font-bold text-brand-text hover:bg-brand-text hover:text-brand-bg transition-colors"
                >
                  <Plus size={14} /> Excepcional
                </button>
              </div>
              
              <div className="bg-[#0A0A0A] border border-brand-border rounded-2xl px-6 py-2">
                <div className="flex flex-col">
                  {fixedCosts.map((cost, idx) => (
                    <div key={cost.id} className="grid grid-cols-[1fr_auto] gap-4 items-center py-4 border-b border-brand-border/50 last:border-0 group">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-surface group-hover:bg-brand-text transition-colors"></div>
                        <label className="text-sm font-semibold text-brand-text truncate" title={cost.name}>
                          {cost.name}
                        </label>
                      </div>
                      <div className="relative w-48">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted font-mono text-xs">$</span>
                        <input 
                          type="number" 
                          min="0"
                          value={cost.amount || ''}
                          onChange={(e) => handleFixedCostChange(idx, e.target.value)}
                          className="w-full bg-brand-surface border border-transparent hover:border-brand-border focus:border-brand-text rounded-xl pl-8 pr-4 py-2 text-sm font-mono font-bold text-brand-text focus:outline-none transition-colors text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Resumen & Confirmación */}
          <div className="w-full xl:w-1/3 sticky top-0 space-y-6 mt-12 xl:mt-0">
            
            <div className="bg-[#0A0A0A] border border-brand-border rounded-3xl overflow-hidden shadow-2xl">
              {/* KPI Header */}
              <div className="bg-brand-surface p-10 border-b border-brand-border/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-text/5 rounded-full blur-3xl"></div>
                <h4 className="text-[11px] font-black text-brand-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Calculator size={16} /> Costo Total Proyectado
                </h4>
                <div className="text-5xl md:text-6xl font-mono font-black text-brand-text tracking-tighter drop-shadow-lg">
                  {formatCurrency(totalProjected)}
                </div>
              </div>
              
              {/* Desglose */}
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-brand-muted">Total Nómina</span>
                  <span className="font-mono font-bold text-brand-text">{formatCurrency(totalStaffCost)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-brand-muted">Total Fijos & Excepcionales</span>
                  <span className="font-mono font-bold text-brand-text">{formatCurrency(totalFixedCosts)}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-8 pt-0 mt-2">
                <div className="flex gap-3">
                  <button 
                    onClick={handleLockPlan}
                    disabled={isLocking}
                    className={`flex-1 py-4 rounded-xl flex items-center justify-center px-6 font-black uppercase tracking-widest text-[11px] transition-all duration-300 group ${
                      isLocking 
                        ? 'bg-brand-surface text-brand-muted cursor-not-allowed border border-brand-border' 
                        : 'bg-brand-text text-[#0A0A0A] hover:shadow-[0_0_30px_rgba(229,229,229,0.15)] cursor-pointer'
                    }`}
                  >
                    {isLocking ? (
                      <span>Iniciando Transacción...</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock size={14} /> {workday ? 'Actualizar Planificación' : 'Confirmar Planificación'}
                      </span>
                    )}
                  </button>

                  {workday && workday.status !== 'ACTIVE' && workday.status !== 'CLOSED' && (
                    <button 
                      onClick={handleActivateWorkday}
                      disabled={isLocking}
                      className="flex-shrink-0 px-6 py-4 rounded-xl flex items-center justify-center font-black uppercase tracking-widest text-[11px] transition-all duration-300 bg-transparent border border-brand-success text-brand-success hover:bg-brand-success hover:text-[#0A0A0A] shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] cursor-pointer"
                      title="Forzar apertura de jornada"
                    >
                      Abrir Noche (ACTIVE)
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SIDE-SHEET MODAL FOR AD-HOC COSTS */}
      {isAdHocModalOpen && (
        <div className="absolute inset-0 z-[150] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm"
            onClick={() => setIsAdHocModalOpen(false)}
          ></div>
          
          {/* Slide-over panel */}
          <div className="relative w-full max-w-md bg-[#0A0A0A] border-l border-brand-border/50 h-full flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-brand-border/50 flex items-center justify-between bg-brand-surface/30">
              <h3 className="text-sm font-black text-brand-text uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={16} className="text-brand-muted" />
                Costo Excepcional
              </h3>
              <button 
                onClick={() => setIsAdHocModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-surface text-brand-muted hover:text-brand-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Concepto (Título)</label>
                <input 
                  type="text" 
                  value={adHocTitle}
                  onChange={(e) => setAdHocTitle(e.target.value)}
                  placeholder="Ej. Seguridad Extra, Hielo Adicional..."
                  className="w-full bg-brand-surface border border-transparent hover:border-brand-border focus:border-brand-text rounded-xl px-4 py-3 text-sm font-semibold text-brand-text focus:outline-none transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Monto Proyectado</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted font-mono">$</span>
                  <input 
                    type="number" 
                    min="0"
                    value={adHocAmount}
                    onChange={(e) => setAdHocAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-brand-surface border border-transparent hover:border-brand-border focus:border-brand-text rounded-xl pl-8 pr-4 py-3 text-sm font-mono font-bold text-brand-text focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-brand-border/50 bg-[#0A0A0A]">
              <button 
                onClick={handleSaveAdHocCost}
                disabled={!adHocTitle.trim()}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all ${
                  !adHocTitle.trim() 
                    ? 'bg-brand-surface text-brand-muted cursor-not-allowed border border-brand-border' 
                    : 'bg-brand-text text-[#0A0A0A] hover:shadow-[0_0_20px_rgba(229,229,229,0.15)] cursor-pointer'
                }`}
              >
                <Plus size={16} /> Confirmar Costo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
