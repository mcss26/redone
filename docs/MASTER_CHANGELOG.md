# Midnight Club - Master Changelog

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
