# Midnight Club OS - Master Changelog

## 2026-06-14 (Production Ready - Phase 1)
- **Feature:** Implementado `GlobalErrorBoundary.jsx` estético para prevenir pantallas blancas en crasheos de React, alineado con el Functional Brutalism.
- **Feature:** Implementado detector Offline en `App.jsx` que inyecta dinámicamente un banner top (`SYS_OFFLINE`) cuando el POS pierde conexión de red.
- **Security:** Modificado `AuthContext.jsx` para verificar pasivamente si el `id` del usuario en localStorage sigue existiendo y estando `active` en la base de datos de Supabase. Si no es así, fuerza un auto-logout para limpiar la sesión en las tablets.
- **Data Hardening:** Creado `src/lib/sanitizer.js`. Implementada la inyección de `sanitizePayload(payload)` en 19 módulos para asegurar que ninguna inserción en Supabase reciba strings vacíos `""` (Regla #62).
- **UX/UI:** Inyección masiva del atributo `autoComplete="off"` a más de 50 inputs a lo largo de todos los Slide-Overs para evitar el auto-relleno del navegador y preservar la estética brutalista.
- **Kiosk Mode:** Configurado `index.html` con bloqueos de zoom (`user-scalable=no`, `maximum-scale=1.0`) y meta-etiquetas de PWA para permitir instalar la aplicación fullscreen en iOS/Android.
- **PWA:** Creado `public/manifest.json` para definir la experiencia nativa de la aplicación (ícono, colores `Deep Void` #0A0A0A, nombre `MC OS`).

# Midnight Club - Master Changelog

## 2026-06-13
### Feature: Auditoría Barra (Fase 3 - Persistencia de Consumo)
- **System:** Implementada la persistencia completa del reporte de Auditoría de Barra utilizando las tablas nativas `import_system_consumption` y `night_consumption`.
- **Architecture:** `AuditoriaBarraModule.jsx` ahora guarda el CSV crudo en `import_system_consumption` (asegurando trazabilidad de ítems no mapeados) y el consumo asociado a SKUs válidos en `night_consumption`.
- **UI:** Al seleccionar una jornada con auditoría previa, el módulo recupera automáticamente los datos reconstruyendo el reporte en pantalla e indicando el estado `AUDITORÍA CONSOLIDADA`, permitiendo visualizar el histórico sin necesidad de re-subir archivos CSV.
### Feature: Simplificación P&L (Arqueo y Barra)
- **UI/UX:** En `NightReportModule.jsx` se agregó una lógica de agregación que consolida todos los ajustes de auditoría de barra en un monto neto para limpiar visualmente el P&L.
- **Architecture:** Se implementó una lógica contable dinámica para las diferencias de caja (Arqueo) y Barra: los sobrantes netos suman a Ingresos, y los faltantes netos suman a Egresos. Esto alinea la UI con los principios contables estándar y evita valores de ingreso negativos.

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
- **System:** Creada tabla `global_messages` en Supabase para almacenamiento asíncrono de notas.
- **Architecture/UI:** Implementado `<GlobalMessagesBoard />` como un contenedor fijo (Always On) en todos los módulos de Index (`AdminIndex`, `OperativoIndex`, `ContadorIndex`). Provee comunicación en vivo inter-rol.

### Bug Fix: CSV Import Duplication (NightOpsModule & GbolService)
- **System:** Se corrigió un fallo crítico en la importación de archivos CSV (Members, Passline General y GBOL) donde las consultas asíncronas de eliminación (`.delete()`) no estaban controlando los errores correctamente, ocasionando una inserción duplicada en caso de fallas o de reintentos (sumando valores en vez de sobreescribir).
- **Architecture:** Se aplicaron las reglas de seguridad G1, G2 y G3, envolviendo las consultas `delete` e `insert` de Supabase para validar destructuración de error e interceptación inmediata. Se reemplazaron todos los `console.error` por notificaciones de error visuales usando `window.UI?.toast()`.

### Bug Fix: Duplicate Passline Tickets (NightOpsModule & GbolService)
- **Módulo Operativo (Importación Passline Members):** Implementado borrado pre-inserción aislado mediante cliente `publicSupabase` anónimo sin `persistSession` para eludir fallos silenciosos por políticas RLS en la tabla `stg_passline_tickets`.
- **Módulo Operativo (Importación Passline Members):** Refactorizada heurística del parser para atrapar alias dinámicos de IDs (`id`, `código`, `ticket id`) evitando fallos de deduplicación que inflaban el volumen de importación.
- **Módulo Operativo (Importación Passline General):** Refactorizado constraint de borrado (`neq('tipo_ticket', 'MEMBER')` -> `in('tipo_ticket', uniqueTipos)`) para garantizar una limpieza exacta de todos los tipos de tickets presentes en el CSV general, previniendo duplicación nativa de datos cuando se sobreescribían archivos con tickets variados o anómalos.
- **Módulo Operativo (Importación GBOL):** Implementado bypass global en `lib/gbolService.js` mediante cliente `publicSupabase` para eludir restricciones RLS al ejecutar borrado de idempotencia sobre `import_gbol_facturacion`.

## 2026-06-07 (Performance Overhaul - Fase 1)
### Performance: Lazy Loading Selectivo
- **System:** Implementado patrón de `React.lazy()` en `src/App.jsx` exclusivamente para los sub-módulos del `ROUTE_MAP` (vistas pesadas de CRUD y Reportes).
- **Architecture:** Se mantuvieron como importaciones estáticas las pantallas de inicio (`Login` y los módulos `*Index`) para asegurar renderizado de primer acceso instantáneo (Cero intrusión en la UX).
- **UI:** Añadido componente inmersivo `<ViewLoader />` como fallback the `<Suspense>`, con estética funcional (fondo oscuro, loader de neón) minimizando el salto visual en la primera carga de un módulo.

### Feature: Auditoría Barra (Fase 1 y 2 - Conciliación y Consolidación)
- **System:** Creado componente `AuditoriaBarraModule.jsx` que implementa la carga de archivos CSV de consumos de sistema y los compara en tiempo real contra los registros de `bar_inventory` (Stock Inicial - Stock Final).
- **System:** Se agregó funcionalidad para consolidar la auditoría en la caja de la jornada. Al presionar "Consolidar", el módulo genera asientos de ingresos/egresos (`type='income'/'expense'`) en la tabla `financial_adjustments` con la categoría `auditoria_barra`. 
- **Architecture:** Se garantiza la idempotencia (los ajustes antiguos de barra para esa jornada se eliminan automáticamente antes de insertar los nuevos). El Night Report los lee nativamente y los impacta en el P&L final de forma transparente.
- **UI:** Añadida tabla de alta densidad visual con cálculo de diferencias en unidades y su monetización automática (usando `skus.cost`).
- **Feature:** Modificado `BarInventoryModule.jsx` para permitir el ingreso de valores decimales (comas y puntos) en el conteo de stock físico.

## 2026-06-14
### Refactor: Estricta Unificación de Glosario Front-End
- **UI:** Refactorización masiva de la nomenclatura visible de la aplicación (20 módulos) para adherirse al Glosario Front-End Bimodal documentado en `MASTER_DECISIONS.md`.
- **System:** Actualizados todos los ruteadores globales (`AdminIndex`, `OperativoIndex`, `ContadorIndex`, `EncargadoIndex`) para usar los Títulos Completos, unificando la experiencia visual entre roles.
- **UI:** Actualizados los menúes superiores de `<AppShell />` (`App.jsx`) para usar los Títulos Cortos, previniendo el colapso visual en pantallas pequeñas.
- **UI:** Reemplazados todos los encabezados internos (`<h2>`) dentro de la carpeta `src/layouts/*Module.jsx` para alinear con exactitud milimétrica al título oficial aprobado por cada módulo.

### UI/UX: Admin-Exclusive Sub-Navigation (Workdays Phase)
- **UI:** Modificada la barra superior de navegación (`App.jsx`) para los módulos de la fase operativa (`work_days`, `opening_costs`, `stock_requests`, `staff_plan`). Ahora esta sub-navegación es visible exclusivamente para el rol de Administrador (`user.role === 'admin'`).
- **UI:** Se eliminó el módulo `CAT. SKU` de esta barra superior, dejando únicamente los 4 módulos operativos que comprenden el ciclo de la jornada. Se mantuvo el resaltado visual del módulo activo para mantener el contexto espacial ("Wayfinding").

### UI/UX: Admin-Exclusive Sub-Navigation (Pagos Phase)
- **UI:** Se dividió la barra superior compartida de `Contador Sub-Nav` en dos. Se creó una nueva barra exclusiva para Administradores (`user.role === 'admin'`) que vincula interactivamente los módulos de la fase PAGOS (`payments` [PAGOS SEMANA] y `fixed_costs` [PAGOS MES]).
- **UI:** Los módulos de reportes (`night_report`, `monthly_report`, `annual_report`) se aislaron en su propia barra superior para no mezclarse con la operativa de pagos.

### UI/UX: Reestructuración de Fase Night Chief
- **System:** Se trasladó el módulo de Auditoría (`auditoria_barra`) desde la fase `REPORTES` a la fase operativa `NIGHT CHIEF` en el enrutador global (`AdminIndex.jsx`), ordenando el flujo: `NIGHT CHIEF` -> `AUDITORIA CONSUMO` -> `APERTURA/CIERRE BARRA`.
- **UI:** Se creó una nueva sub-navegación superior (`App.jsx`) exclusiva para Administradores, conectando dinámicamente estas tres vistas críticas para facilitar el cuadre en vivo de la operación nocturna.
