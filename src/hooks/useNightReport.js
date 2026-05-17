import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useNightReport(selectedDate) {
  const [data, setData] = useState({
    isLoading: true,
    workday: null,
    kpis: {
      expectedRevenue: 0,
      expectedAttendance: 0,
    },
    ingresos: {
      total: 0,
      efectivoFacturado: 0,
      efectivoNoFacturado: 0,
      digitales: 0,
      passlineGeneral: 0,
      cajasOperativas: 0, // Declarado físico para comparar
      diferenciaCaja: 0
    },
    egresos: {
      total: 0,
      costosFijosAdhoc: 0,
      nomina: 0,
      consumoReal: 0, // Costo de toda la mercadería consumida físicamente
      impactoDiferencias: 0, // Solo Faltantes (fuga)
      impuestos: 0
    },
    auditoria: {
      consumoBarra: []
    },
    netResult: 0,
    healthScore: 0
  });

  useEffect(() => {
    if (selectedDate) {
      fetchNightData(selectedDate);
    }
  }, [selectedDate]);

  const fetchNightData = async (dateStr) => {
    try {
      setData(prev => ({ ...prev, isLoading: true }));

      // 1. Fetch Jornada Base
      const { data: workday } = await supabase
        .from('work_days')
        .select('*')
        .eq('work_date', dateStr)
        .maybeSingle();

      if (!workday) {
        setData(prev => ({ ...prev, isLoading: false, workday: null }));
        return;
      }

      // 2. Pilar Ingresos (GBOL & Passline)
      let efectivoFacturado = 0;
      let efectivoNoFacturado = 0;
      let digitales = 0;
      
      const { data: gbolRows } = await supabase
        .from('import_gbol_facturacion')
        .select('tipo_fiscal, efectivo, digital, tarjetas, mercadopago')
        .eq('noche', dateStr);
        
      if (gbolRows && gbolRows.length > 0) {
        gbolRows.forEach(row => {
          if (row.tipo_fiscal === 'blanco') {
             efectivoFacturado += Number(row.efectivo || 0);
          } else if (row.tipo_fiscal === 'negro') {
             efectivoNoFacturado += Number(row.efectivo || 0);
          }
          digitales += Number(row.digital || 0) + Number(row.tarjetas || 0) + Number(row.mercadopago || 0);
        });
      }

      let cajasOperativas = 0;
      let diferenciaCaja = 0;
      const { data: cashClosing } = await supabase
        .from('cash_closings')
        .select('*')
        .eq('work_day_id', workday.id)
        .maybeSingle();

      if (cashClosing) {
        cajasOperativas = Number(cashClosing.total_declared || 0);
        diferenciaCaja = Number(cashClosing.total_difference || 0);
      }

      let passlineGeneral = 0;
      let allPasslineTickets = [];
      let fetchMore = true;
      let from = 0;
      const limit = 1000;
      while (fetchMore) {
        const { data: chunk } = await supabase
          .from('stg_passline_tickets')
          .select('estado_ticket, total_raw')
          .eq('operational_date', dateStr)
          .neq('tipo_ticket', 'MEMBER')
          .range(from, from + limit - 1);
          
        if (chunk && chunk.length > 0) {
          allPasslineTickets = [...allPasslineTickets, ...chunk];
          from += limit;
          if (chunk.length < limit) fetchMore = false;
        } else {
          fetchMore = false;
        }
      }
      passlineGeneral = allPasslineTickets.reduce((acc, curr) => {
        const val = parseFloat((curr.total_raw || '').replace(/[^0-9.-]/g, '')) || 0;
        return acc + val;
      }, 0);

      const sobranteCaja = diferenciaCaja > 0 ? diferenciaCaja : 0;
      const totalIngresos = efectivoFacturado + efectivoNoFacturado + digitales + passlineGeneral + sobranteCaja;

      // 3. Pilar Egresos
      let costosFijosAdhoc = 0;
      let nomina = 0;

      const { data: payments } = await supabase
        .from('finance_payments')
        .select('amount_total, source_type')
        .eq('work_day_id', workday.id)
        .in('source_type', ['OPENING', 'AD_HOC']);
        
      if (payments) costosFijosAdhoc = payments.reduce((acc, curr) => acc + Number(curr.amount_total || 0), 0);

      const { data: staffPlanning } = await supabase
        .from('work_day_staff_planning')
        .select('role_id, quantity')
        .eq('work_day_id', workday.id);
        
      if (staffPlanning && staffPlanning.length > 0) {
        const roleIds = staffPlanning.map(s => s.role_id);
        const { data: roles } = await supabase.from('master_staff_roles').select('id, base_rate').in('id', roleIds);
        if (roles) {
          nomina = staffPlanning.reduce((acc, curr) => {
            const role = roles.find(r => r.id === curr.role_id);
            return acc + (Number(curr.quantity || 0) * Number(role?.base_rate || 0));
          }, 0);
        }
      }

      // 4. Pilar Auditoría de Barra (System vs Real) & Consumo Real
      let cDetailsArray = [];
      const { data: cReport } = await supabase
        .from('consumption_reports')
        .select('id')
        .eq('operational_date', dateStr)
        .maybeSingle();
        
      if (cReport) {
        const { data: cDetails } = await supabase
          .from('consumption_details')
          .select('sku_id, sku_name, quantity')
          .eq('report_id', cReport.id);
        if (cDetails) {
          cDetailsArray = cDetails;
        }
      }

      let auditoriaBarra = [];
      let impactoDiferencias = 0;
      let consumoReal = 0;
      
      const { data: barSession } = await supabase
        .from('bar_sessions')
        .select('id')
        .eq('work_day_id', workday.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (barSession) {
        const { data: snapshots } = await supabase.from('bar_stock_snapshots').select('*').eq('session_id', barSession.id);
        const { data: allSkus } = await supabase.from('master_sku').select('id, nombre, costo');

        if (snapshots && allSkus) {
          const physicalBySku = {};
          snapshots.forEach(s => {
            if (!physicalBySku[s.sku_id]) physicalBySku[s.sku_id] = { opening: 0, closing: 0 };
            if (s.type === 'opening') physicalBySku[s.sku_id].opening = Number(s.quantity);
            if (s.type === 'closing') physicalBySku[s.sku_id].closing = Number(s.quantity);
          });

          cDetailsArray.forEach(c => {
            if (!c.sku_id && c.sku_name) {
              const matched = allSkus.find(s => s.nombre.toLowerCase().trim() === c.sku_name.toLowerCase().trim());
              if (matched) c.sku_id = matched.id;
            }
          });

          const skuIdsToProcess = new Set([...Object.keys(physicalBySku), ...cDetailsArray.map(c => c.sku_id).filter(Boolean)]);

          auditoriaBarra = Array.from(skuIdsToProcess).map(skuId => {
            const sku = allSkus.find(s => s.id === skuId);
            const skuName = sku ? sku.nombre : cDetailsArray.find(c => c.sku_id === skuId)?.sku_name || 'Desconocido';
            const costo = sku ? Number(sku.costo || 0) : 0;
            
            const physical = physicalBySku[skuId] || { opening: 0, closing: 0 };
            const physicalConsumption = physical.opening - physical.closing;
            const sysDetails = cDetailsArray.find(c => c.sku_id === skuId);
            const systemConsumption = sysDetails ? Number(sysDetails.quantity || 0) : 0;
            
            const diferenciaUnits = physicalConsumption - systemConsumption;
            const impacto = diferenciaUnits * costo;

            // Acumular el costo real de la mercadería consumida
            consumoReal += (physicalConsumption > 0 ? physicalConsumption * costo : 0);

            return { skuId, skuName, systemConsumption, physicalConsumption, diferenciaUnits, impacto };
          }).filter(item => item.systemConsumption !== 0 || item.physicalConsumption !== 0).sort((a, b) => b.impacto - a.impacto);
          
          impactoDiferencias = auditoriaBarra.filter(d => d.impacto > 0).reduce((acc, curr) => acc + curr.impacto, 0);
        }
      }

      // 5. Cálculo de Comisiones (Pasarelas Digitales)
      let comisionesPasarela = 0;
      const { data: comConfig } = await supabase.from('payment_commission_config').select('*');
      
      if (comConfig && gbolRows) {
        const mpConfig = comConfig.find(c => c.payment_method === 'mercadopago_qr') || { commission_rate: 0, iva_on_commission: 0 };
        const tarjetaConfig = comConfig.find(c => c.payment_method === 'tarjeta_credito') || { commission_rate: 0, iva_on_commission: 0 };
        
        let sumMp = 0;
        let sumTarjetas = 0;
        
        gbolRows.forEach(row => {
          sumMp += Number(row.mercadopago || 0);
          sumTarjetas += Number(row.tarjetas || 0);
        });

        const dedMp = sumMp * Number(mpConfig.commission_rate) * (1 + Number(mpConfig.iva_on_commission));
        const dedTarjetas = sumTarjetas * Number(tarjetaConfig.commission_rate) * (1 + Number(tarjetaConfig.iva_on_commission));
        
        comisionesPasarela = dedMp + dedTarjetas;
      }

      // Impuestos Fiscales (Asumimos 21% IVA por ahora sobre lo facturado en blanco)
      const TASA_IMPUESTO = 0.21;
      const impuestos = (efectivoFacturado + digitales) * TASA_IMPUESTO;

      // Penalización por Faltante de Caja (si hubo robo/pérdida de efectivo, impacta como egreso)
      const fugaCaja = diferenciaCaja < 0 ? Math.abs(diferenciaCaja) : 0;

      const totalEgresos = costosFijosAdhoc + nomina + consumoReal + comisionesPasarela + impuestos + fugaCaja;
      const netResult = totalIngresos - totalEgresos;

      // 6. Algoritmo de Health Score (0-100)
      let healthScore = 100;
      if (Math.abs(diferenciaCaja) > (totalIngresos * 0.01)) healthScore -= 15;
      if (impactoDiferencias > (totalIngresos * 0.02)) healthScore -= 20;
      healthScore = Math.max(0, healthScore);

      setData({
        isLoading: false,
        workday,
        kpis: { expectedRevenue: 0, expectedAttendance: 0 },
        ingresos: {
          total: totalIngresos,
          efectivoFacturado,
          efectivoNoFacturado,
          digitales,
          passlineGeneral,
          cajasOperativas,
          diferenciaCaja
        },
        egresos: {
          total: totalEgresos,
          costosFijosAdhoc,
          nomina,
          consumoReal,
          comisionesPasarela,
          impuestos,
          fugaCaja,
          impactoDiferencias
        },
        auditoria: { consumoBarra: auditoriaBarra },
        netResult,
        healthScore
      });

    } catch (err) {
      console.error("Data Engine Error (useNightReport):", err);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  };

  return data;
}
