import { supabase } from './supabase';
import { fetchAll } from './queryHelper';
import { createClient } from '@supabase/supabase-js';

const publicSupabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

let _terminalMap = null;

const parseCsvLine = (line, separator) => {
  const result = [];
  let inQuotes = false, current = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === separator && !inQuotes) { result.push(current.trim().replace(/^"|"$/g, '')); current = ''; }
    else { current += char; }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

export const GbolService = {
    resolveTerminalId: async function (cajanom) {
        if (!cajanom) return null;

        if (!_terminalMap) {
            const { data, error } = await supabase
                .from('pos_terminals')
                .select('id, name')
                .eq('active', true);
            
            if (error) {
                throw error;
            }

            _terminalMap = {};
            const norm = (s) => s.toUpperCase().trim().replace(/\s+/g, ' ');
            (data || []).forEach(t => {
                if (t.name) _terminalMap[norm(t.name)] = t.id;
            });
        }

        const key = cajanom.toUpperCase().trim().replace(/\s+/g, ' ');
        return _terminalMap[key] || null;
    },

    syncNightFromCsv: async function (file, noche) {
        _terminalMap = null; // Force fresh lookup
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split('\n').filter(line => line.trim());
                    if (lines.length < 2) throw new Error("CSV vacío o sin formato.");
                    
                    const headerIdx = lines.findIndex(l => l.toLowerCase().includes('ptovta') || l.toLowerCase().includes('caja'));
                    if (headerIdx === -1) throw new Error("No se encontraron los encabezados en el CSV.");
                    
                    const delimiter = lines[headerIdx].includes(';') ? ';' : ',';
                    const headers = parseCsvLine(lines[headerIdx], delimiter).map(h => h.toLowerCase());
                    
                    const records = [];
                    for (let i = headerIdx + 1; i < lines.length; i++) {
                        const values = parseCsvLine(lines[i], delimiter);
                        if (values.length < Math.max(2, headers.length / 2)) continue;

                        const row = {};
                        headers.forEach((h, idx) => { row[h] = values[idx]; });
                        
                        const cajanom = row['cajanom'] || row['caja nombre'] || row['caja'];
                        if (!cajanom) continue;

                        const terminalId = await GbolService.resolveTerminalId(cajanom);

                        const parseNum = (val) => Number(String(val).replace(',', '.')) || 0;
                        const estado = (row['estado'] || '').toUpperCase();
                        
                        let tcom = 'X';
                        const tcomRaw = row['tcom'] || row['tipo comprobante'] || '';
                        if (tcomRaw.includes('1')) tcom = 'A';
                        if (tcomRaw.includes('6') || tcomRaw.includes('83')) tcom = 'B';

                        const efectivo = parseNum(row['efectivo']);
                        const tarjetas = parseNum(row['tarjetas']);
                        const merpag = parseNum(row['merpag']);
                        const importe = parseNum(row['importe'] || row['total'] || row['monto']);

                        records.push({
                            gbol_ticket_id: row['id'] || `csv-${noche}-${i}`,
                            noche,
                            tipo_fiscal: (estado === 'APROBADO') ? 'blanco' : 'negro',
                            tipo_comprobante: tcom,
                            total: importe,
                            efectivo: efectivo,
                            digital: tarjetas + merpag,
                            tarjetas: tarjetas,
                            mercadopago: merpag,
                            gbol_caja_nombre: cajanom,
                            terminal_id: terminalId,
                            raw_data: row
                        });
                    }

                    // Delete existing for idempotency
                    const { error: delError } = await publicSupabase.from('import_gbol_facturacion').delete().eq('noche', noche);
                    if (delError) throw delError;

                    if (records.length > 0) {
                        for (let i = 0; i < records.length; i += 500) {
                            const chunk = records.slice(i, i + 500);
                            const { error } = await supabase.from('import_gbol_facturacion').insert(chunk);
                            if (error) throw error;
                        }
                    }

                    resolve({ success: true, records_imported: records.length });
                } catch (err) {
                    resolve({ success: false, error: err });
                }
            };
            reader.onerror = () => resolve({ success: false, error: new Error("Error leyendo el archivo CSV") });
            reader.readAsText(file);
        });
    },

    populateSystemAmounts: async function (workDayId, noche) {
        const { data: tickets, error } = await fetchAll(supabase
            .from('import_gbol_facturacion')
            .select('gbol_caja_nombre, efectivo, digital, terminal_id')
            .eq('noche', noche));

        if (error) throw error;
        if (!tickets || tickets.length === 0) return { updated: 0, success: true };

        const grouped = {};
        tickets.forEach(t => {
            const key = t.terminal_id;
            if (!key) return; 
            if (!grouped[key]) grouped[key] = { cash: 0, digital: 0 };
            grouped[key].cash += Number(t.efectivo) || 0;
            grouped[key].digital += Number(t.digital) || 0;
        });

        let updated = 0;
        for (const [terminalId, totals] of Object.entries(grouped)) {
            // Upsert into V2 table night_cash_closing
            const { error: updateError } = await supabase
                .from('night_cash_closing')
                .upsert({
                    work_day_id: workDayId,
                    terminal_id: terminalId,
                    system_cash: totals.cash,
                    system_digital: totals.digital,
                    closed_at: new Date().toISOString()
                }, { onConflict: 'work_day_id,terminal_id' });

            if (updateError) throw updateError;
            updated++;
        }

        return { updated, terminals: Object.keys(grouped).length, success: true };
    }
};
