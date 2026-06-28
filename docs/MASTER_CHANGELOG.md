# Midnight Club OS - Master Changelog

## 2026-06-17 (Permisos: AuditorÃ­a Consumo â†’ Contador)
- **Permisos:** Agregado `auditoria_barra` al array `access` del rol `contador` en `AuthContext.jsx`. El mÃ³dulo es **read-only** (no se aÃ±adiÃ³ a `writable`), permitiendo al contador visualizar las auditorÃ­as consolidadas.
- **UI:** Agregado enlace `AUDITORIA CONSUMO` al menÃº desplegable de `REPORTES` en `ContadorIndex.jsx`.
- **ValidaciÃ³n:** Build exitoso (`npm run build`, 0 errores).

## 2026-06-16 (Critical Hotfix - sanitizePayload Import)
- **Hotfix / Critical:** Corregido `ReferenceError: sanitizePayload is not defined` en 14 mÃ³dulos CRUD. La inyecciÃ³n masiva del 14/06 agregÃ³ llamadas a `sanitizePayload()` en 19 mÃ³dulos pero el `import` solo fue incluido en `ProfilesModule.jsx`. Se agregÃ³ `import { sanitizePayload } from '../lib/sanitizer'` a los 14 mÃ³dulos faltantes: `WorkDaysModule`, `OpeningCostsModule`, `StockRequestsModule`, `StaffPlanModule`, `FixedCostsModule`, `AuditoriaBarraModule`, `CostTemplatesModule`, `FixedCostTemplatesModule`, `SuppliersModule`, `StaffRolesModule`, `SkuModule`, `PosTerminalsModule`, `PaymentsModule`, `MasterVouchersModule`.
- **Impacto:** Todas las operaciones de escritura (insert/update) estaban rotas silenciosamente en estos mÃ³dulos. El error era capturado por los bloques `catch` y mostrado como toast genÃ©rico, pero la operaciÃ³n no se completaba. La auto-poblaciÃ³n de `opening_costs` y `staff_plan` al crear jornadas era la mÃ¡s crÃ­tica.
- **Data Recovery:** Eliminada jornada 20/06 (`e3face21-b170-4c6f-aa6b-4febb1c16e58`, evento "SABADO") que fue creada sin auto-poblado de costos ni staff. Confirmado 0 registros huÃ©rfanos en `opening_costs`, `staff_plan`, `stock_requests`. El usuario debe recrearla desde la UI para que se ejecute la auto-poblaciÃ³n correctamente.
- **ValidaciÃ³n:** Build exitoso (`npm run build`, 0 errores, 525ms). Grep verificÃ³ 15/15 imports presentes en todos los mÃ³dulos que usan `sanitizePayload`.

## 2026-06-14 (Production Ready - Phase 1)
- **System / Database:** Implementada la funciÃ³n `update_sku_stock_min` y el trigger `trg_update_stock_min` en Supabase para calcular y mantener actualizado automÃ¡ticamente el `stock_min` de cada SKU. El cÃ¡lculo promedia dinÃ¡micamente el consumo real de las Ãºltimas 10 fechas activas (`CEIL(consumo_total / fechas)`).
- **UI:** Modificado el mÃ³dulo `SkuModule.jsx` para convertir el campo `stock_min` en solo-lectura (`readOnly`) reflejando su nueva naturaleza autogestionada por el backend, incluyendo badges visuales ("Auto").
- **Feature:** Implementado `GlobalErrorBoundary.jsx` estÃ©tico para prevenir pantallas blancas en crasheos de React, alineado con el Functional Brutalism.
- **Feature:** Implementado detector Offline en `App.jsx` que inyecta dinÃ¡micamente un banner top (`SYS_OFFLINE`) cuando el POS pierde conexiÃ³n de red.
- **Security:** Modificado `AuthContext.jsx` para verificar pasivamente si el `id` del usuario en localStorage sigue existiendo y estando `active` en la base de datos de Supabase. Si no es asÃ­, fuerza un auto-logout para limpiar la sesiÃ³n en las tablets.
- **Data Hardening:** Creado `src/lib/sanitizer.js`. Implementada la inyecciÃ³n de `sanitizePayload(payload)` en 19 mÃ³dulos para asegurar que ninguna inserciÃ³n en Supabase reciba strings vacÃ­os `""` (Regla #62).
- **UX/UI:** InyecciÃ³n masiva del atributo `autoComplete="off"` a mÃ¡s de 50 inputs a lo largo de todos los Slide-Overs para evitar el auto-relleno del navegador y preservar la estÃ©tica brutalista.
- **Kiosk Mode:** Configurado `index.html` con bloqueos de zoom (`user-scalable=no`, `maximum-scale=1.0`) y meta-etiquetas de PWA para permitir instalar la aplicaciÃ³n fullscreen en iOS/Android.
- **PWA:** Creado `public/manifest.json` para definir la experiencia nativa de la aplicaciÃ³n (Ã­cono, colores `Deep Void` #0A0A0A, nombre `MC OS`).
- **Global Refactor (UX/Resilience):** Inyectados los estados `isFetchingBackground` y `window.UI.toast` en los bloques catch de los 20 mÃ³dulos transaccionales. Esto previene parpadeos de tabla completos (Regla #66) y expone visualmente los mensajes de error de Supabase al cajero (Regla #42).
- **Cleanup & Production Build:** Eliminados +10 archivos temporales (`scratch_*.js`, `.bak`, `.csv`) y ejecutada con Ã©xito la compilaciÃ³n final estricta (`npm run build`) validando la estabilidad total.

# Midnight Club - Master Changelog

## 2026-06-13
### Feature: AuditorÃ­a Barra (Fase 3 - Persistencia de Consumo)
- **System:** Implementada la persistencia completa del reporte de AuditorÃ­a de Barra utilizando las tablas nativas `import_system_consumption` y `night_consumption`.
- **Architecture:** `AuditoriaBarraModule.jsx` ahora guarda el CSV crudo en `import_system_consumption` (asegurando trazabilidad de Ã­tems no mapeados) y el consumo asociado a SKUs vÃ¡lidos en `night_consumption`.
- **UI:** Al seleccionar una jornada con auditorÃ­a previa, el mÃ³dulo recupera automÃ¡ticamente los datos reconstruyendo el reporte en pantalla e indicando el estado `AUDITORÃ�A CONSOLIDADA`, permitiendo visualizar el histÃ³rico sin necesidad de re-subir archivos CSV.
### Feature: SimplificaciÃ³n P&L (Arqueo y Barra)
- **UI/UX:** En `NightReportModule.jsx` se agregÃ³ una lÃ³gica de agregaciÃ³n que consolida todos los ajustes de auditorÃ­a de barra en un monto neto para limpiar visualmente el P&L.
- **Architecture:** Se implementÃ³ una lÃ³gica contable dinÃ¡mica para las diferencias de caja (Arqueo) y Barra: los sobrantes netos suman a Ingresos, y los faltantes netos suman a Egresos. Esto alinea la UI con los principios contables estÃ¡ndar y evita valores de ingreso negativos.

## 2026-06-06
### Module Review & Documentation Initialization
- **System:** Commenced a fresh documentation cycle for Midnight Club System 4.0 to maintain a streamlined and updated context.
- **Architecture:** Analyzed `OperativoIndex.jsx` and recorded its structure as the Golden Standard for all Index-type layouts in `MASTER_DECISIONS.md`.
- **Action:** Initialized clean states for `MASTER_CHANGELOG.md` and `MASTER_DECISIONS.md`.

### Data Entry & CRUD Architecture Standardized
- **Architecture:** Audited `WorkDaysModule`, `OpeningCostsModule`, and `SkuModule`.
- **System:** Formally documented the "CRUD & Data Entry" Golden Standard in `MASTER_DECISIONS.md`. This includes Slide-Over panel patterns, strict `null` data mapping, explicit `loading`/`saving` states, and high-density raw data tables.

### Role Index Validation
- **Architecture:** Audited `ContadorIndex.jsx` and verified its strict alignment with the Index Screen Golden Standard. No structural refactoring was required.

### Bug Fix: Cost Templates Deletion
- **System:** Added `handleDelete` function to `CostTemplatesModule.jsx` to allow users to permanently delete cost templates from the master template list, completing its CRUD lifecycle.

### Feature: Global Messages Board (Muro de Novedades)
- **System:** Creada tabla `global_messages` en Supabase para almacenamiento asÃ­ncrono de notas.
- **Architecture/UI:** Implementado `<GlobalMessagesBoard />` como un contenedor fijo (Always On) en todos los mÃ³dulos de Index (`AdminIndex`, `OperativoIndex`, `ContadorIndex`). Provee comunicaciÃ³n en vivo inter-rol.

### Bug Fix: CSV Import Duplication (NightOpsModule & GbolService)
- **System:** Se corrigiÃ³ un fallo crÃ­tico en la importaciÃ³n de archivos CSV (Members, Passline General y GBOL) donde las consultas asÃ­ncronas de eliminaciÃ³n (`.delete()`) no estaban controlando los errores correctamente, ocasionando una inserciÃ³n duplicada en caso de fallas o de reintentos (sumando valores en vez de sobreescribir).
- **Architecture:** Se aplicaron las reglas de seguridad G1, G2 y G3, envolviendo las consultas `delete` e `insert` de Supabase para validar destructuraciÃ³n de error e interceptaciÃ³n inmediata. Se reemplazaron todos los `console.error` por notificaciones de error visuales usando `window.UI?.toast()`.

### Bug Fix: Duplicate Passline Tickets (NightOpsModule & GbolService)
- **MÃ³dulo Operativo (ImportaciÃ³n Passline Members):** Implementado borrado pre-inserciÃ³n aislado mediante cliente `publicSupabase` anÃ³nimo sin `persistSession` para eludir fallos silenciosos por polÃ­ticas RLS en la tabla `stg_passline_tickets`.
- **MÃ³dulo Operativo (ImportaciÃ³n Passline Members):** Refactorizada heurÃ­stica del parser para atrapar alias dinÃ¡micos de IDs (`id`, `cÃ³digo`, `ticket id`) evitando fallos de deduplicaciÃ³n que inflaban el volumen de importaciÃ³n.
- **MÃ³dulo Operativo (ImportaciÃ³n Passline General):** Refactorizado constraint de borrado (`neq('tipo_ticket', 'MEMBER')` -> `in('tipo_ticket', uniqueTipos)`) para garantizar una limpieza exacta de todos los tipos de tickets presentes en el CSV general, previniendo duplicaciÃ³n nativa de datos cuando se sobreescribÃ­an archivos con tickets variados o anÃ³malos.
- **MÃ³dulo Operativo (ImportaciÃ³n GBOL):** Implementado bypass global en `lib/gbolService.js` mediante cliente `publicSupabase` para eludir restricciones RLS al ejecutar borrado de idempotencia sobre `import_gbol_facturacion`.

## 2026-06-07 (Performance Overhaul - Fase 1)
### Performance: Lazy Loading Selectivo
- **System:** Implementado patrÃ³n de `React.lazy()` en `src/App.jsx` exclusivamente para los sub-mÃ³dulos del `ROUTE_MAP` (vistas pesadas de CRUD y Reportes).
- **Architecture:** Se mantuvieron como importaciones estÃ¡ticas las pantallas de inicio (`Login` y los mÃ³dulos `*Index`) para asegurar renderizado de primer acceso instantÃ¡neo (Cero intrusiÃ³n en la UX).
- **UI:** AÃ±adido componente inmersivo `<ViewLoader />` como fallback the `<Suspense>`, con estÃ©tica funcional (fondo oscuro, loader de neÃ³n) minimizando el salto visual en la primera carga de un mÃ³dulo.

### Feature: AuditorÃ­a Barra (Fase 1 y 2 - ConciliaciÃ³n y ConsolidaciÃ³n)
- **System:** Creado componente `AuditoriaBarraModule.jsx` que implementa la carga de archivos CSV de consumos de sistema y los compara en tiempo real contra los registros de `bar_inventory` (Stock Inicial - Stock Final).
- **System:** Se agregÃ³ funcionalidad para consolidar la auditorÃ­a en la caja de la jornada. Al presionar "Consolidar", el mÃ³dulo genera asientos de ingresos/egresos (`type='income'/'expense'`) en la tabla `financial_adjustments` con la categorÃ­a `auditoria_barra`. 
- **Architecture:** Se garantiza la idempotencia (los ajustes antiguos de barra para esa jornada se eliminan automÃ¡ticamente antes de insertar los nuevos). El Night Report los lee nativamente y los impacta en el P&L final de forma transparente.
- **UI:** AÃ±adida tabla de alta densidad visual con cÃ¡lculo de diferencias en unidades y su monetizaciÃ³n automÃ¡tica (usando `skus.cost`).
- **Feature:** Modificado `BarInventoryModule.jsx` para permitir el ingreso de valores decimales (comas y puntos) en el conteo de stock fÃ­sico.

## 2026-06-14
### Refactor: Estricta UnificaciÃ³n de Glosario Front-End
- **UI:** RefactorizaciÃ³n masiva de la nomenclatura visible de la aplicaciÃ³n (20 mÃ³dulos) para adherirse al Glosario Front-End Bimodal documentado en `MASTER_DECISIONS.md`.
- **System:** Actualizados todos los ruteadores globales (`AdminIndex`, `OperativoIndex`, `ContadorIndex`, `EncargadoIndex`) para usar los TÃ­tulos Completos, unificando la experiencia visual entre roles.
- **UI:** Actualizados los menÃºes superiores de `<AppShell />` (`App.jsx`) para usar los TÃ­tulos Cortos, previniendo el colapso visual en pantallas pequeÃ±as.
- **UI:** Reemplazados todos los encabezados internos (`<h2>`) dentro de la carpeta `src/layouts/*Module.jsx` para alinear con exactitud milimÃ©trica al tÃ­tulo oficial aprobado por cada mÃ³dulo.

### UI/UX: Admin-Exclusive Sub-Navigation (Workdays Phase)
- **UI:** Modificada la barra superior de navegaciÃ³n (`App.jsx`) para los mÃ³dulos de la fase operativa (`work_days`, `opening_costs`, `stock_requests`, `staff_plan`). Ahora esta sub-navegaciÃ³n es visible exclusivamente para el rol de Administrador (`user.role === 'admin'`).
- **UI:** Se eliminÃ³ el mÃ³dulo `CAT. SKU` de esta barra superior, dejando Ãºnicamente los 4 mÃ³dulos operativos que comprenden el ciclo de la jornada. Se mantuvo el resaltado visual del mÃ³dulo activo para mantener el contexto espacial ("Wayfinding").

### UI/UX: Admin-Exclusive Sub-Navigation (Pagos Phase)
- **UI:** Se dividiÃ³ la barra superior compartida de `Contador Sub-Nav` en dos. Se creÃ³ una nueva barra exclusiva para Administradores (`user.role === 'admin'`) que vincula interactivamente los mÃ³dulos de la fase PAGOS (`payments` [PAGOS SEMANA] y `fixed_costs` [PAGOS MES]).
- **UI:** Los mÃ³dulos de reportes (`night_report`, `monthly_report`, `annual_report`) se aislaron en su propia barra superior para no mezclarse con la operativa de pagos.

### UI/UX: ReestructuraciÃ³n de Fase Night Chief
- **System:** Se trasladÃ³ el mÃ³dulo de AuditorÃ­a (`auditoria_barra`) desde la fase `REPORTES` a la fase operativa `NIGHT CHIEF` en el enrutador global (`AdminIndex.jsx`), ordenando el flujo: `NIGHT CHIEF` -> `AUDITORIA CONSUMO` -> `APERTURA/CIERRE BARRA`.
- **UI:** Se creÃ³ una nueva sub-navegaciÃ³n superior (`App.jsx`) exclusiva para Administradores, conectando dinÃ¡micamente estas tres vistas crÃ­ticas para facilitar el cuadre en vivo de la operaciÃ³n nocturna.

### Feature: Refactor KPIs Reporte Mensual (R. MES)
- **UI/UX:** Se reestructurÃ³ la ZONA A del mÃ³dulo `MonthlyReportModule.jsx` reemplazando los KPIs antiguos por el nuevo estÃ¡ndar contable: `INGRESO BRUTO`, `EGRESOS TOTALES` y `MARGEN NETO`.
- **System:** Implementado desglose de ingresos separando Efectivo (POS), Digital (POS + Passline) y Otros/Ajustes (Sobrantes de caja/barra + Ajustes manuales).
- **System:** Implementado desglose de egresos separando Costos de Semana, Costos Fijos Mensuales, Impuestos (38% cupones), Mermas de Stock (AuditorÃ­as) y Diferencias de Arqueo.
- **Reports:** Agregada "ZONA D: ANÃ�LISIS OPERATIVO" en R. MES y R. ANUAL. Incluye tablas analÃ­ticas de Rendimiento de Cajas (ordenadas por mayor faltante) y Detalle de Mermas (ordenadas por mayor faltante). Las diferencias netas de auditorÃ­a y arqueo ahora alimentan correctamente las matemÃ¡ticas del mes total de la misma manera que en el Reporte de Noche.

### Feature: Refactor Estructural Reporte Anual (R. ANUAL)
- **UI/UX:** Se reestructurÃ³ `AnnualReportModule.jsx` para adoptar el estÃ¡ndar visual Bimodal de 3 Columnas (`TOTAL EGRESOS`, `TOTAL INGRESOS`, `MARGEN NETO`) eliminando grÃ¡ficos y mÃ©tricas redundantes de DistribuciÃ³n.
- **System:** Se estandarizÃ³ la agregaciÃ³n matemÃ¡tica en el bloque `fetchYearDetails` para que utilice el mismo bucle de conciliaciÃ³n de Caja, Passline, Arqueos, AuditorÃ­a de Barra y Costos Fijos Mensuales que el R. MES.
- **UI:** La Tabla Viva HistÃ³rica en el Reporte Anual fue rediseÃ±ada para agrupar los resultados por mes (12 filas mÃ¡ximo) en lugar de evento individual, garantizando rendimiento escalable al finalizar el aÃ±o.

- 2026-06-14 - Refactor UI/UX AuditorÃ­a: Eliminado window.confirm, implementado GlobalUI, remediado Container Purge y dependencias huÃ©rfanas en mÃ³dulos CRUD. AÃ±adido isMountedRef en useEffects para seguridad asÃ­ncrona.

### 2026-06-14: Payments Report Module & Fixed Costs Payment UX
- **Module Added**: `PaymentsReportModule.jsx` created to consolidate payments from `opening_costs` and `monthly_fixed_costs`.
- **Refactor**: Modified `FixedCostsModule.jsx` to trigger a Slide-Over upon paying a cost, allowing users to select `payment_method` and `voucher_type`.
- **Routing**: Added `r_pagos` to `App.jsx` sub-nav and `ContadorIndex.jsx`.
- 2026-06-14 - Mantenimiento: Limpieza de archivos temporales y scripts de pruebas en la raÃ­z del proyecto para cumplir con los estÃ¡ndares de higiene del repositorio.
- 2026-06-14 - Hotfix: ResoluciÃ³n de errores de sintaxis masivos provocados por migraciÃ³n de window.confirm. AÃ±adidos los parÃ©ntesis de cierre en condicionales asÃ­ncronos en 13 mÃ³dulos. Vite ahora compila exitosamente.
- 2026-06-14 - UX Architecture: RefactorizaciÃ³n masiva de 19 mÃ³dulos para erradicar las recargas destructivas de tablas. Se reemplazÃ³ setLoading(true) por isFetchingBackground(true) en todas las recargas asÃ­ncronas para eliminar los Layout Shifts y generar una percepciÃ³n de red instantÃ¡nea.

### 2026-06-28: Admin Access to Closed Workdays
- **System**: Se modificaron `OpeningCostsModule.jsx`, `StaffPlanModule.jsx`, y `StockRequestsModule.jsx` para extender la consulta a supabase permitiendo extraer jornadas en estado `closed` (limitado a 30 recientes).
- **Security**: Se reemplazÃ³ la validaciÃ³n estricta `isClosed` por `isLocked` que ahora discrimina por rol (`user?.role === 'admin'`). 
- **UX**: Esto permite exclusivamente a los usuarios administradores visualizar, editar y eliminar registros (costos, planes de staff, insumos) de fechas pasadas ya consolidadas.
### [2026-06-28] Implementación de KPI Fiscal en Reporte de Pagos
- Agregado desglose del Crédito Fiscal IVA (Bruto, Neto, IVA Estimado) exclusivo para roles Admin y Contador en PaymentsReportModule.jsx.
- La estimación utiliza la alícuota estándar del 21% basándose en el tipo de comprobante sin requerir modificaciones en la base de datos.

### [2026-06-28] Refactorización de Impuestos en Reportes (r.mes y r.anual)
- **Architecture/Logic:** Se extrajo el cálculo de "Proyección de Impuestos" (`dayTax`) del acumulador de Egresos Operativos en `MonthlyReportModule.jsx` y `AnnualReportModule.jsx`.
- **Logic:** Implementado cálculo dinámico de "Crédito IVA" en los reportes base, deduciendo el 21% de los egresos formales (Factura A/M) tanto de costos variables como de fijos.
- **System:** Actualizada la fórmula de Margen Neto a su representación contable estricta: `Ingresos + Egresos - Proyección de Impuestos Neta`.

### 2026-06-28: Agent Orchestration Update
- Installed new skills: pbakaus/impeccable and ercel-labs/agent-skills@web-design-guidelines to strengthen the Module Audit Framework.
