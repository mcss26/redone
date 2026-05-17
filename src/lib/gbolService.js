import { supabase } from './supabase';

const GBOL_BASE_URL = 'https://tickets.midnightclub.com.ar/gbol/api';

const ENDPOINTS = {
    LOGIN:        '/account/login',
    FACTURACION:  '/tickets/facturacionElectronicaConsulta',
    COMANDAS:     '/generic/consultarMercaderias',
    STOCK:        '/inventarios/stockIdealCompras',
    CAJAS:        '/generic/consultarCajas',
    WITHDRAWALS:  '/withdrawals/history',
};

let _token = null;
let _tokenExpiry = 0;
let _terminalMap = null;

async function _loadCredentials() {
    const { data, error } = await supabase
        .from('audit_config')
        .select('key, value')
        .eq('domain', 'gbol')
        .eq('is_active', true);

    if (error || !data || data.length === 0) {
        throw new Error('[gbol-service] No GBOL credentials found in audit_config (domain=gbol)');
    }

    const config = {};
    data.forEach(row => {
        config[row.key] = (typeof row.value === 'object' && row.value !== null)
            ? (row.value.value || row.value)
            : row.value;
    });
    return config;
}

async function _request(endpoint, { method = 'GET', body = null } = {}) {
    if (!_token) {
        throw new Error('[gbol-service] Not authenticated. Call authenticate() first.');
    }

    const url = `${GBOL_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${_token}`,
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
        console.warn('[gbol-service] Token expired, re-authenticating...');
        _token = null;
        await GbolService.authenticate();
        return _request(endpoint, { method, body });
    }

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`[gbol-service] ${method} ${endpoint} → ${response.status}: ${errorText}`);
    }

    return response.json();
}

function _mapTipoComprobante(tcom) {
    if (tcom === 1) return 'A';
    if (tcom === 6 || tcom === 83) return 'B';
    return 'X';
}

async function _logSync(endpoint, noche, puntoDeVenta, recordsImported, status, errorDetail = null, durationMs = 0) {
    // Attempt to get user if auth exists
    let userId = null;
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user) {
        userId = sessionData.session.user.id;
    }

    await supabase.from('gbol_sync_log').insert({
        endpoint,
        noche,
        punto_venta: puntoDeVenta,
        records_imported: recordsImported,
        status,
        error_detail: errorDetail,
        duration_ms: durationMs,
        synced_by: userId,
    });
}

export const GbolService = {
    authenticate: async function () {
        if (_token && Date.now() < _tokenExpiry) {
            return true;
        }

        const creds = await _loadCredentials();
        if (!creds.email || !creds.password) {
            throw new Error('[gbol-service] Missing email/password in audit_config (domain=gbol)');
        }

        const url = `${GBOL_BASE_URL}${ENDPOINTS.LOGIN}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: creds.email,
                password: creds.password
            }),
        });

        if (!response.ok) {
            throw new Error(`[gbol-service] Login failed: ${response.status}`);
        }

        const data = await response.json();
        _token = data.accessToken || data.token;
        _tokenExpiry = Date.now() + (4 * 60 * 60 * 1000);

        console.info('[gbol-service] Authenticated successfully');
        return true;
    },

    resolveTerminalId: async function (cajanom) {
        if (!cajanom) return null;

        if (!_terminalMap) {
            const { data } = await supabase
                .from('pos_terminals')
                .select('id, friendly_name, gbol_alias')
                .eq('is_active', true);

            _terminalMap = {};
            const norm = (s) => s.toUpperCase().trim().replace(/\s+/g, ' ');
            (data || []).forEach(t => {
                if (t.gbol_alias) {
                    _terminalMap[norm(t.gbol_alias)] = t.id;
                }
                if (t.friendly_name) {
                    _terminalMap[norm(t.friendly_name)] = t.id;
                }
            });
        }

        const key = cajanom.toUpperCase().trim().replace(/\s+/g, ' ');
        return _terminalMap[key] || null;
    },

    clearTerminalCache: function () {
        _terminalMap = null;
    },

    fetchFacturacion: async function (noche, puntoDeVenta = 'T-0') {
        await GbolService.authenticate();

        const raw = await _request(ENDPOINTS.FACTURACION, {
            method: 'POST',
            body: {
                estado: -1,
                metodoDePago: -1,
                puntoDeVenta,
                noche,
                tipoBusqueda: 1,
            },
        });

        const tickets = raw?.data?.facturacion || raw?.facturacion || raw || [];
        if (!Array.isArray(tickets)) {
            console.warn('[gbol-service] Unexpected facturacion response shape:', raw);
            return [];
        }

        const transformed = [];
        for (const t of tickets) {
            const terminalId = await GbolService.resolveTerminalId(t.cajanom);

            transformed.push({
                gbol_ticket_id: String(t.id),
                noche,
                tipo_fiscal: (t.estado === 'APROBADO') ? 'blanco' : 'negro',
                tipo_comprobante: _mapTipoComprobante(t.tcom),
                cae: t.cae || null,
                nro_factura: t.factura || null,
                punto_venta: t.ptovta ? Number(t.ptovta) : null,
                total: Number(t.importe) || 0,
                efectivo: Number(t.efectivo) || 0,
                digital: (Number(t.tarjetas) || 0) + (Number(t.merpag) || 0),
                tarjetas: Number(t.tarjetas) || 0,
                mercadopago: Number(t.merpag) || 0,
                base_imponible: Number(t.bimp) || 0,
                iva: Number(t.iva) || 0,
                gbol_caja_nombre: t.cajanom || null,
                terminal_id: terminalId,
                cliente_cuit: t.ndoc || null,
                cliente_razon: t.cliente || null,
                raw_data: t,
            });
        }

        return transformed;
    },

    syncNight: async function (noche, options = {}) {
        const {
            puntoDeVenta = 'T-0',
            syncFacturacion = true
        } = options;

        const results = { facturacion: 0, success: true };

        if (syncFacturacion) {
            const t0 = performance.now();
            try {
                const records = await GbolService.fetchFacturacion(noche, puntoDeVenta);

                // DELETE existing for idempotency
                await supabase
                    .from('import_gbol_facturacion')
                    .delete()
                    .eq('noche', noche);

                // INSERT fresh data
                if (records.length > 0) {
                    for (let i = 0; i < records.length; i += 500) {
                        const chunk = records.slice(i, i + 500);
                        const { error } = await supabase
                            .from('import_gbol_facturacion')
                            .insert(chunk);
                        if (error) throw error;
                    }
                }

                results.facturacion = records.length;
                results.records_imported = records.length;
                const duration = Math.round(performance.now() - t0);
                await _logSync('facturacion', noche, puntoDeVenta, records.length, 'success', null, duration);

            } catch (err) {
                const duration = Math.round(performance.now() - t0);
                await _logSync('facturacion', noche, puntoDeVenta, 0, 'error', err.message, duration);
                results.success = false;
                throw err;
            }
        }
        
        return results;
    },

    syncNightFromCsv: async function (file, noche) {
        _terminalMap = null; // Force fresh lookup with normalized matching
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split('\n').filter(line => line.trim());
                    if (lines.length < 2) throw new Error("CSV vacío o sin formato.");
                    
                    const headerIdx = lines.findIndex(l => l.toLowerCase().includes('ptovta') || l.toLowerCase().includes('caja'));
                    if (headerIdx === -1) throw new Error("No se encontraron los encabezados en el CSV.");
                    
                    const delimiter = lines[headerIdx].includes(';') ? ';' : ',';
                    const headers = lines[headerIdx].split(delimiter).map(h => h.trim().toLowerCase());
                    
                    const records = [];
                    for (let i = headerIdx + 1; i < lines.length; i++) {
                        const values = lines[i].split(delimiter).map(v => v.trim());
                        const row = {};
                        headers.forEach((h, idx) => { row[h] = values[idx]; });
                        
                        const cajanom = row['cajanom'] || row['caja nombre'] || row['caja'];
                        if (!cajanom) continue;

                        const terminalId = await GbolService.resolveTerminalId(cajanom);

                        const parseNum = (val) => Number(String(val).replace(',', '.')) || 0;
                        const estado = (row['estado'] || '').toUpperCase();
                        const tcomRaw = row['tcom'] || row['tipo comprobante'] || '';
                        let tcom = 'X';
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

                    // Idempotent replacement for this night
                    await supabase.from('import_gbol_facturacion').delete().eq('noche', noche);

                    if (records.length > 0) {
                        for (let i = 0; i < records.length; i += 500) {
                            const chunk = records.slice(i, i + 500);
                            const { error } = await supabase.from('import_gbol_facturacion').insert(chunk);
                            if (error) throw error;
                        }
                    }

                    await _logSync('facturacion_csv', noche, 'ALL', records.length, 'success', null, 0);
                    resolve({ success: true, records_imported: records.length });

                } catch (err) {
                    await _logSync('facturacion_csv', noche, 'ALL', 0, 'error', err.message, 0);
                    resolve({ success: false, error: err });
                }
            };
            reader.onerror = () => resolve({ success: false, error: new Error("Error leyendo el archivo CSV") });
            reader.readAsText(file);
        });
    },

    populateSystemAmounts: async function (closingId, noche) {
        const { data: tickets, error } = await supabase
            .from('import_gbol_facturacion')
            .select('gbol_caja_nombre, efectivo, digital, terminal_id')
            .eq('noche', noche);

        if (error) throw error;
        if (!tickets || tickets.length === 0) {
            console.warn('[gbol-service] No facturacion data for', noche);
            return { updated: 0, success: true };
        }

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
            // Note: Updated to match Supabase's column names
            const { error: updateError } = await supabase
                .from('closing_terminals')
                .upsert({
                    work_day_id: closingId,
                    terminal_id: terminalId,
                    system_cash: totals.cash,
                    system_digital: totals.digital,
                }, { onConflict: 'work_day_id,terminal_id' });

            if (!updateError) updated++;
        }

        return { updated, terminals: Object.keys(grouped).length, success: true };
    }
};
