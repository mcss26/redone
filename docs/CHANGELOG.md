# Midnight Club OS - Changelog

All significant code, logic, and UI changes must be logged here chronologically.

## [Unreleased]

### Workdays - Correcciones de Cierre y P&L (2026-05-16)

- **WorkdaysNightChief.jsx**: Se solucionó un bug en la operación "Cierre Final" donde el guardado del cierre de caja (`cash_closings`) fallaba con un error de restricción única `cash_closings_event_date_key`. La instrucción `.insert()` fue reemplazada por un `.upsert(..., { onConflict: 'event_date' })` para garantizar que la acción sea idempotente y evitar bloqueos en el cierre de jornada.
- **WorkdaysBreakEven.jsx**: Agregada la tabla de "Eficiencia de Barra" al estado de resultados. Esta tabla cruza el consumo teórico (CSV cargado por el Night Chief) contra el consumo físico real (`Apertura - Cierre` cargado por el Encargado de Barra) para cada SKU. Calcula la "Diferencia" (Faltantes/Sobrantes) y su consecuente "Impacto Financiero" multiplicando la desviación por el costo del producto, presentándolo bajo las estrictas directrices de Brutalismo Funcional sin uso indebido del color rojo.
- **TabInventario.jsx**: Se agregó un filtro `.in('categoria_id', [...])` a la consulta de Supabase para que el módulo del encargado solo muestre productos de las categorías "Bebidas" e "Insumo Barra", excluyendo el resto del catálogo (insumos de oficina, limpieza, caja) para mantener la vista operativa limpia.
- **Database (`master_sku`)**: Se ejecutó un `UPDATE` masivo para reasignar todos los 58 productos del catálogo a la categoría "Bebidas" (`92efbbc7-5dea-40d2-9d2f-86665703a759`), unificando la vista en Master SKU a petición de operaciones.
- **EncargadoBarra.jsx**: Ocultada temporalmente la pestaña de "Recepciones" de la UI principal del encargado para reducir aún más la carga cognitiva, manteniéndola en código (standby) para futura reintegración.
- **TabInventario.jsx**: Solucionado un segundo error de Schema donde se filtraba por `is_active` en lugar de la columna real `active` en la tabla `master_sku`, permitiendo finalmente cargar el catálogo.
- **TabInventario.jsx**: Solucionado el error `TabInventario.jsx:62 Error fetching inventory data` corrigiendo la referencia a la columna de base de datos de `master_sku.name` a `master_sku.nombre`.

- **EncargadoBarra.jsx / TabInventario.jsx**: Simplificación radical del módulo de inventario. Se eliminó por completo la máquina de estados compleja (`PENDING_OPENING` -> `ACTIVE` -> `CLOSED`) y los indicadores visuales en el header.
- **TabInventario.jsx**: Rediseñado como una hoja de cálculo (spreadsheet) de alta densidad. Ahora el encargado solo visualiza el "Producto", "Físico Inicio" y "Físico Cierre" en la misma vista, permitiendo cargar ambos valores simultáneamente sin carga cognitiva ni bloqueos. La acción "Guardar Cambios" realiza un upsert transparente usando `bar_stock_snapshots`.
- **EncargadoBarra.jsx**: Eliminada la pestaña y lógica de gestión de "Staff" (`TabStaff.jsx`). Siguiendo la nueva arquitectura, el costo y control de nómina se asume directamente desde la planificación (Planner), haciendo redundante e inconsistente el control de asistencia a nivel de barra.
- **EncargadoBarra.jsx**: Solucionado un crash (ReferenceError: useEffect is not defined) que dejaba la pantalla en negro al montar el módulo, añadiendo la importación faltante de `useEffect`.
- **WorkdaysNightChief.jsx**: Solucionado el error `null value in column "event_date" of relation "cash_closings"`. Se agregó `event_date: activeWorkday.work_date` al payload de inserción durante el "Cierre Final" para respetar el constraint de la tabla.
- **WorkdaysBreakEven.jsx**: Cambiada la lógica de cálculo del P&L. Los ingresos por Cajas Operativas (POS) ahora reflejan el "Declarado (Físico/Digital)" en lugar de la diferencia de conciliación. Si hay 0 declarado, el ingreso operativo es 0, independientemente de lo que diga el sistema.
- **WorkdaysBreakEven.jsx**: Los Egresos de "Nómina Liquidada" ahora se calculan en base al staff planificado en el Planner multiplicándolo por el `base_rate` del rol (dado que aún no hay un módulo de liquidación en el Night Chief, se asume la planificación como el gasto real pagado).
- **App.jsx**: Modificada la función `handleNavigation` para aceptar un parámetro de `context` (ej. `{ date: '2026-05-15' }`) permitiendo inicializar vistas con estado pre-configurado.
- **WorkdaysPlanner.jsx**: Interceptado el error `23505` al intentar "Abrir Noche" cuando ya existe otra jornada abierta. Ahora consulta Supabase para recuperar la fecha de la jornada activa real y redirige automáticamente usando `onNavigate`.
- **WorkdaysNightChief.jsx**: Añadida la prop `initialDate` para inicializar el estado `selectedDate`, de forma que al ser redirigido desde el Planner, se posicione directamente en la jornada que está bloqueando el flujo.

### Night Chief - Flujo de Cierre Final (2026-05-10)

- **WorkdaysNightChief.jsx:** Implementación del botón y workflow de "Cierre Final".
  - **Pre-Validaciones (Bloqueo):** El botón de cierre se deshabilita por defecto y solo se habilita si las tres fuentes de datos están importadas (`recaudacionData`, `consumoData`, y datos de Passline). Si falta alguna, se muestra un texto de advertencia detallando el faltante.
  - **Slide-Over Modal:** Se reemplazó el concepto de modal tradicional por un panel lateral (Slide-Over) respetando la directriz de Brutalismo Funcional y fondo oscuro (#0A0A0A).
  - **Cierre de Caja (`cash_closings`):** Se consolida la sumatoria de las cajas físicas (declarado vs. sistema) y se inserta un registro único consolidado para la jornada.
  - **Cierre Operativo (`staff_accruals`):** Se integra la llamada al RPC `admin_generate_workday_accruals` para registrar la deuda salarial del personal que trabajó la jornada, implementando también un fallback por seguridad.
  - **Persistencia y Estado:** Al confirmar, se actualiza el `status` de la jornada en `work_days` a `CLOSED` y la UI se bloquea para prevenir futuras modificaciones operativas.
  - **Refactorización UI:** Se movieron los botones de "Subir CSV (Fallback)" y "Sincronizar API" de la barra de acciones superior al encabezado de la tabla "Cajas Operativas (POS)", homologando el patrón visual con las otras tablas de importación.
  - **Bugfix (Schema Mismatch):** Se corrigió la asignación de columnas en el payload de inserción de `cash_closings`, mapeando a los campos reales de la tabla (`total_system`, `total_declared`, `total_difference`) para resolver el error de schema cache reportado por Supabase.

### Night Chief — Passline Boletería Integration (2026-05-10)

- **WorkdaysNightChief.jsx:** Added two new Passline ticket summary tables below the POS terminals table.
  - **Passline Members:** Single-row summary showing Tickets Solicitados, Validados, and No Validados. Parsed from Passline CSV export by counting `Estado del eticket` values.
  - **Passline General:** Multi-row grouped table by `Tipo` column, showing Comprados, Validados, and No Validados per ticket type, with totals row in `tfoot`.
  - Both tables use independent CSV file inputs (no DB persistence, frontend-only parsing).
  - CSV parser handles quoted fields with commas using regex-based field splitting.
  - Layout uses `xl:grid-cols-2` responsive grid to sit side-by-side on wide monitors.
  - Empty states show ticket icon with import prompt.
  - New Lucide icons imported: `Upload`, `Ticket`, `Users`.

### Night Chief — Consumo & Recaudación Tables (2026-05-10)

- **WorkdaysNightChief.jsx:** Added two full-width GBOL import tables below Passline.
  - **Recaudación:** Columns: Artículo, Q. Paga (units), Q. Sin Cargo (units), Total $ (pesos). Footer sums all columns.
  - **Consumo:** Columns: Producto, Cantidad (supports decimals), Costo Total $. Footer sums all columns.
  - Both parsers dynamically locate the header row by scanning first 10 lines for key column names, handling GBOL's multi-line metadata headers.
  - Totals rows in source CSVs (empty product name) are automatically skipped.
  - New Lucide icons: `ShoppingCart`, `BarChart3`.
  - **DB Persistence (FormulaMid):** Connected to legacy tables `consumption_reports`/`consumption_details` and `revenue_reports`/`revenue_details`.
  - Added `sku_name text` and `total_cost numeric` columns to `consumption_details` (migration).
  - Idempotent write: DELETE existing report for date → INSERT report → INSERT details.
  - `fetchNightChiefData` loads persisted data on page load by `operational_date`.

### Master Screens UI/UX Audit — Cycle 1 (2026-05-10)

- **Auth:** Removed temporary auth bypass in `App.jsx` (line 49). Login component now renders properly when no Supabase session exists.
- **Proveedores:** Added `rounded-2xl` to slide-over submit button for design system consistency.
- **SKU:** Added `rounded-2xl` to slide-over submit button.
- **Nómina:** Added `rounded-2xl` to slide-over submit button. Standardized table container bg from `#0A0A0A` to `bg-brand-bg` and thead bg from `#111111` to `bg-[#0A0A0A]`. Humanized role display by stripping `STAFF_` prefix from role badges.
- **Tarifario:** Added `rounded-2xl` to slide-over submit button. Standardized table container bg to `bg-brand-bg` and thead to `bg-[#0A0A0A]`. Changed `CRÍTICO` note from `text-brand-error` (red) to `text-brand-muted` (grey) — red is reserved for actual errors per design rules.
- **Configuraciones:** Added `rounded-2xl` to both cat form and POS form submit buttons.

### Added

- Refactored `STOCK` navigation in `App.jsx` Top Bar from a direct link into a dropdown Sub-Nav to accommodate new modules.
- Created `SolicitudesStock.jsx` scaffold with Functional Brutalism standards and added routing to the new STOCK sub-nav.
- Implemented Pre-Approval UI in `SolicitudesStock.jsx` connecting to `replenishment_items` for pending items, using Slide-Over modals for rejections and direct Supabase auth injection for approvals.
- Polished Pre-Approval Table in `SolicitudesStock.jsx`: Reduced cognitive load by combining Insumo and Proveedor, adding direct mapping to `vw_stock_global` to show current stock vs required deficit, and fixing the zero-cost bug by directly fetching `costo_pack` from `master_sku`.
- Created `docs/` architecture for AI agent context retention.
- Updated `GEMINI.md` to enforce the reading of docs before execution.
- Added `MasterProveedores.jsx` mockup with Expandable Row pattern for review.
- Initialized Supabase client (`@supabase/supabase-js`).
- Wired `MasterProveedores.jsx` to fetch live data from `master_proveedores` table.
- Added strict Supabase Auth gating (`Login.jsx` + `App.jsx` state wrapping) to bypass RLS organically without compromising security keys.
- Added `MasterSKU.jsx` module displaying the 58 product catalog, mapping FKs to `master_categories` and `master_proveedores`.
- Added `MasterCategorias.jsx` to manage product families (active toggles, UUID tracking).
- Added `MasterPOS.jsx` implementing the terminal registry with GBOL alias and provider mapping.
- Refactored `App.jsx` UI Shell: Removed sidebar in favor of a clean `#0A0A0A` Top Bar with a secondary Dropdown Bar for Master navigation.
- Transformed `IndexLayout.jsx` into a centralized, card-based "Admin Hub" for welcoming and routing authenticated users.
- Implemented a "Side-Sheet" Slide-over Modal in `MasterProveedores.jsx` for creating new records, matching the exact DB schema.
- Sanitized empty UI strings to `null` on `insert` payloads to ensure Postgres data cleanliness.
- Merged `MasterCategorias.jsx` and `MasterPOS.jsx` into a single split-view `Configuraciones.jsx` module to increase information density.
- Created `OperacionesStock.jsx` as a pure operations dashboard with decoupled architecture (removing SKU and Recipe logic), featuring CSV dropzones and high-density KPIs.
- Wired `OperacionesStock.jsx` to fetch live data from `vw_stock_global` and cross-reference with `master_sku` for costing, strictly following the legacy Ticket #1 mandate.
- Simplified `OperacionesStock.jsx` by removing the left panel (Aforo, Dropzones, Historial) to focus strictly on real-time stock and KPIs, expanding the table to full width.
- Refactored `OperacionesStock.jsx` KPIs to calculate "Total Valorizado", "Stock Activo", and "Stock Inactivo" from the entire `vw_stock_global` view.
- Converted KPI cards in `OperacionesStock.jsx` into interactive state toggles (All / Active / Inactive) to dynamically filter the data table below.
- Updated `MasterProveedores.jsx` to display banking and legal information (CUIT, Banco, Alias, CBU) directly in the high-density table row, streamlining the visualization and removing category tags to prioritize the business name.
- Refactored `MasterSKU.jsx` table layout to functional brutalism, standardizing the LED status dots, replacing FK UUIDs with category names, and flattening the view structure.
- Implemented state-driven Slide-Over Modal in `MasterSKU.jsx` for creating and editing SKUs, complete with dynamically populated dropdowns mapping to `master_categories` and `master_proveedores`.
- Simplified the `MasterSKU.jsx` expanded details panel, eliminating cognitive load by removing redundant columns and raw database UUIDs, keeping only operational identifiers (Tipo, Volumen, Proveedor Default).
- Upgraded the filters in `OperacionesStock.jsx`: the categories dropdown now explicitly fetches all available categories from `master_categories` instead of deriving them from existing stock, and the search/filter inputs were completely restyled with custom Lucide icons and functional brutalist aesthetics.
- Updated the main navigation Top Bar in `App.jsx`: renamed "OPERACIONES" to "STOCK" and added a new parent tab "WORKDAYS" positioned before it.
- Added a new secondary sub-nav layer for "WORKDAYS" containing the "PLANNER", "NIGHT CHIEF", and "BREAK EVEN" modules, handling mutually exclusive dropdown states with the "MASTERS" tab.
- Created `WorkdaysPlanner.jsx` replacing the legacy planner. Includes dynamic fetching of `master_staff_roles` (using `base_rate` exclusively). Replaced the ambiguous Break-even logic with a clear "Costo Total Proyectado" KPI.
- Implemented a Date Picker in `WorkdaysPlanner.jsx` that queries Supabase in real-time to load existing drafts (`work_days`) based on the selected date, displaying dynamic status badges ("Draft Recuperado" vs "Nueva Jornada").
- Created `MasterTarifario.jsx` under the `MASTERS` tab to manage `master_staff_roles`. Strictly enforces the use of `base_rate` (preventing Error 42703) and uses the Functional Brutalism design language con un slide-over modal for CRUD operations.
- **Architectural Fix**: Resolved the Technical Debt in the Planner where opening costs and fixed costs were visually merged but querying a single table. `WorkdaysPlanner.jsx` now correctly performs a dual-fetch from both `cost_definitions` (Filtered by `category` IN 'RECURRENTE', 'FIJO') and `finance_opening_cost_defs`, combining them into the UI while retaining their origin for the `finance_payments` FKs.

- Created `EncargadoBarra.jsx` module for high-density physical inventory tracking (Apertura and Cierre).
- Added `ENCARGADOS` main tab to the Top Bar Shell in `App.jsx`, containing a sub-nav for `BARRA NOCHE`, simplifying the UX and maintaining the Functional Brutalism aesthetic.
- Updated Supabase RLS on `profiles` table to allow `anon` role to write, enabling `encargados` to update records without an active session context (`is_auth_user = false`).
- Created `MasterNomina.jsx` module (`MASTERS > NÓMINA PERSONAL`), implementing the Dual View pattern (CRUD + Grid) with a side-sheet Slide-Over absolute modal.
- Fixed Source Gap in `profiles` schema: `MasterNomina.jsx` intentionally removes `phone` and `email` properties to align perfectly with the actual Postgres Supabase columns.
- Modularized `EncargadoBarra.jsx` into `EncargadoBarraHub.jsx` orchestrating 3 sub-components (`TabStaff`, `TabReposiciones`, `TabInventario`).
- Implemented "Onboarding Express" in `TabStaff.jsx` allowing Bar Managers to create new `profiles` directly (ring-fenced by `area = BARRA`) using the newly granted RLS permissions.
- Removed "Cierre Anterior" column from `TabInventario.jsx` to clean up the UI for the Bar Manager.
- Renamed "Reposiciones" tab to "Recepciones" (`TabRecepciones.jsx`) aligning with the verified physical reception flow in `replenishment_receipts`.
- Connected `TabInventario.jsx` to real Supabase endpoints: fetching active `work_days`, creating `bar_sessions`, and inserting immutable rows into `bar_stock_snapshots` for Opening and Closing operations.
- Completed full backend persistence for `WorkdaysPlanner.jsx`: The "Confirmar & Generar QRs" action (`handleLockPlan`) now performs an atomic transaction upserting the `work_days` status to `PLANNED`, persisting the staff matrix directly into `work_day_staff_planning`, and wiping/re-inserting the fixed costs into `finance_payments` (`status: PENDING`).
- Implemented a Slide-Over Modal in `WorkdaysPlanner.jsx` for creating "Costos Ad-hoc" (exceptional costs). These are merged with recurring costs in the UI and seamlessly persisted to `finance_payments` with `source_type: 'AD_HOC'`.
- Scaffolded `WorkdaysNightChief.jsx` module as the central operational control panel (only available when a workday is `ACTIVE`). Implements a 4-KPI dashboard (Ingresos GBOL, Costos, Anomalías Stock, Health Score) and a 3-step action workflow for closing the night: GBOL Sync, RPC Accrual Generation (`admin_generate_workday_accruals`), and Final Closing (`rpc_close_work_day`).

### Changed

- Performed a UI Polish on `WorkdaysPlanner.jsx` to establish it as a "Golden Standard" for Functional Brutalism. Eliminated cognitive load (removed "Paso 1, 2, 3" step bubbles), simplified the Cost grid into dense horizontal rows, and refined the visual hierarchy of the Sticky Sidebar to prioritize "Presupuesto Proyectado".
- Shifted project paradigm from "Cinematic Landing Page" to "Functional Nightclub ERP".
- Implemented `GbolService` (`src/lib/gbolService.js`) as a dedicated transactional wrapper to handle the two-step GBOL sync process (`syncNight` and `populateSystemAmounts`) following the Night Chief architecture, and hooked it into `WorkdaysNightChief.jsx`'s sync button.
- Replaced the initial `GbolService` stub with the full, real GBOL API integration discovered in legacy `gbol-service.js`. The app now correctly hits `https://tickets.midnightclub.com.ar/gbol/api/tickets/facturacionElectronicaConsulta`, securely fetches credentials from `audit_config`, parses the items, and handles idempotent inserts into `import_gbol_facturacion`.
- **Night Chief Offline Fallback**: Added a "Subir CSV (Fallback)" feature in `WorkdaysNightChief.jsx` and `GbolService`. If the API server is unreachable, operators can upload a GBOL CSV. Both API and CSV operations now trigger a "Preflight Check" that warns the user if data already exists for the night, ensuring idempotent replacements and preventing accidental duplicates or data loss.
- **Night Chief Manual Entry**: Transformed the "Efectivo (Decl.)" and "Digital (Decl.)" columns into inline editable fields. Values update local state on change to instantly calculate the reconciliation difference, and securely push to `closing_terminals` in Supabase via an `upsert` when the input loses focus (`onBlur`).
- **Planner Bugfix (State Recovery)**: Fixed a bug in `WorkdaysPlanner.jsx` where selecting an already planned date failed to restore the saved `work_day_staff_planning` and `finance_payments` records due to an incorrect column query (`date` instead of `work_date`) and missing fetch logic. The UI now correctly restores the exact staff counts and AD_HOC costs that were confirmed.
- **Planner Bugfix (State Recovery)**: Fixed a bug in `WorkdaysPlanner.jsx` where selecting an already planned date failed to restore the saved `work_day_staff_planning` and `finance_payments` records due to an incorrect column query (`date` instead of `work_date`) and missing fetch logic. The UI now correctly restores the exact staff counts and AD_HOC costs that were confirmed.
- **Backend Fix (RLS DELETE)**: Added a missing `DELETE` Row Level Security policy to the `finance_payments` table. Previously, re-confirming a plan in `WorkdaysPlanner` would silently fail to delete the old costs and instead append them again, causing duplicated fixed costs. The table is now properly idempotent.
- **Planner UI**: Added a brutalist-styled warning message in `WorkdaysPlanner.jsx` that dynamically appears above the action button when a previously planned date is loaded, alerting the user that confirming will overwrite existing data. Also changed the button text contextually to "Actualizar Planificación".
- **UI Polish**: Updated global styling to use Plus Jakarta Sans, strict `#0A0A0A` background, and modern rounded corners for a premium Google-like feel.
- Enhanced `Configuraciones.jsx` (`Sistema & Operaciones`): Added full CRUD capabilities (Edit and Delete) for both `master_categories` (Familias de Productos) and `pos_terminals` (Terminales POS) via Slide-Over Modals, aligning with the Functional Brutalism design language.
- Fixed `WorkdaysNightChief.jsx` UI state to correctly reflect the simulated GBOL synchronization process. The "Sincronizar GBOL" action now updates the `terminals` state to inject mock `Facturación Sistema` values and changes the crossover status from "Esperando Datos" to "Esperando Cajero" on the data table.

- **GbolService**: Adjusted CSV header parsing to prioritize cajanom over caja to ensure successful mapping with friendly names from POS terminals.

- **WorkdaysNightChief**: Removida la inyección de datos mockeados (Math.random()) tras la sincronización del CSV. El componente ahora recarga los datos reales de facturación desde Supabase.
- **GbolService**: Actualizado el parseador de CSV para detectar dinámicamente las cabeceras (ignorando las 3 líneas descriptivas iniciales de GBOL) y así procesar exitosamente los tickets en staging.
- **Database**: Migración estructural a la tabla closing_terminals para incorporar work_day_id, system_digital y declared_digital para dar soporte al cierre de cajas unificado en Night Chief.

- **GbolService**: Refactorizado populateSystemAmounts para usar upsert en lugar de update. Esto asegura que los registros en closing_terminals se creen si la jornada aún no tenía cierres de caja inicializados, resolviendo el problema de totales vacíos (--) tras la importación del CSV.
- **GbolService**: Normalizado el matching de terminales con whitespace normalization para colapsar espacios multiples. Resuelve el fallo de Boleteria General donde el CSV tenia doble espacio y el alias en DB tenia uno solo. Se fuerza limpieza del cache de terminales al inicio de cada importacion CSV.
- **WorkdaysNightChief**: Added tfoot totals row summing system_total, system_cash, system_digital, declared_cash, declared_digital across all terminals with reconciliation diff.

## [2026-05-10] Night Chief - Passline General Fixes
- Added activeWorkday validation to CSV parser functions in WorkdaysNightChief.jsx to prevent ghost uploads without a valid date.
- Added automatic fetchNightChiefData() reload post-insert to guarantee the UI is deeply synced with the stg_passline_tickets database state immediately after chunk insertion.
- Verified stg_passline_tickets handles both MEMBER and non-MEMBER tickets successfully via RLS update.
- **WorkdaysNightChief**: Fixed the missing "Passline General" bug by implementing `while`-loop pagination in `fetchNightChiefData`. The Supabase client caps `.select()` queries at 1,000 rows by default, which caused all non-Member tickets to be ignored when the `Passline Members` CSV exceeded 1,000 records. All chunks are now stitched seamlessly into a single frontend array.

### [2026-05-10] Break Even - Real-Time P&L Dashboard
- **WorkdaysBreakEven.jsx**: Created the new financial dashboard under the Workdays sub-nav to provide a real-time Profit & Loss statement based on the active operational date.
- **Financial Logic**: 
  - Calculated Total Expenses by summing: 1) Recurring & Ad-hoc costs from `finance_payments` (`source_type` IN 'OPENING', 'AD_HOC'), 2) Payroll costs from `staff_accruals`, and 3) Consumed merchandise costs mapping `consumption_reports` to `consumption_details`.
  - Calculated Total Revenue by summing: 1) Validated `Passline General` tickets (excluding MEMBER, cleaning `total_raw`), and 2) `Cajas Operativas (POS)` representing the Net Reconciliation Difference (Faltante/Sobrante) from the night (`total_difference` in `cash_closings`). The previous redundant GBOL row was removed to simplify the interface.
- **Passline Tickets Fix**: Reused the `while`-loop pagination pattern to bypass the 1,000 row Supabase cap and sum the `total_raw` from all tickets accurately.
- **Functional Brutalism UI**: Structured the P&L as a 2-column layout (Egresos Reales vs Ingresos Totales). Avoided the color red for negative values entirely, strictly utilizing `text-brand-muted` (grey) for losses and adjustments per design specifications.
- **Persistence (Consolidación)**: Added a "Consolidar Resultado" action that securely updates the `net_result` column on the `work_days` table with the newly calculated Net Result, finalizing the night's operations.

### [2026-05-10] Workdays Planner - Refactor Estético
- **WorkdaysPlanner.jsx**: Se cambió la clase `rounded-md` por `rounded-xl` en el input de `staffQty` (cantidades de Staff) para unificar el lenguaje de diseño visual "Brutalismo Funcional" alineando los bordes de la UI.

### [2026-05-10] Fine Polish - Brutalismo Funcional
### [2026-05-16] UI/UX Navigation Refactor (Global Date)
- **App.jsx**: Hoisted `selectedDate` up as a `globalDate` state. This state is now passed down to the `WorkdaysPlanner`, `WorkdaysNightChief`, and `WorkdaysBreakEven` components. This allows users to select a date once and switch between the three modules without losing context.
- **SPA Efficiency**: Refactored `WorkdaysPlanner.jsx`, `WorkdaysNightChief.jsx`, and `WorkdaysBreakEven.jsx` to replace the jarring full-component unmount (`isLoading = true` replacing the whole view) with a non-destructive `isFetchingBackground` state. The UI now gracefully dims (`opacity-50`) and shows an "Actualizando..." / "Sincronizando..." indicator during data refetches, massively improving perceived performance and fulfilling the requirement of preventing the full page reload sensation.
- **WorkdaysNightChief.jsx**: Se alinearon a la derecha los botones de importación (CSV/API) en todas las tablas usando iconos lucide-react de tamaño estándar (`w-4 h-4` / `size={16}`). Se mejoró el feedback visual (hover/focus) de los inputs de edición en línea para declaración de cajas, con bordes y bg sutiles.
- **WorkdaysBreakEven.jsx**: Mantenimiento del grid a 2 columnas. Se aseguró el uso exclusivo de `Intl.NumberFormat` para métricas financieras. Se eliminó la dependencia visual de rojo (`text-brand-error`) para el resultado negativo (faltante) de Cajas Operativas en la columna Ingresos, reemplazándolo por un gris neutro (`text-brand-muted`) de acuerdo con la política restrictiva de "Ningún rojo en finanzas".

### [2026-05-16] Bugfix: Consumo de Sistema vs Físico
- **WorkdaysNightChief.jsx**: El parser del archivo CSV de "Consumo de Sistema" guardaba los registros en `consumption_details` con `sku_id = null`, insertando únicamente texto plano (`sku_name`). Se refactorizó la función `handleConsumoCsv` para que consulte dinámicamente la tabla `master_sku` durante la inserción y mapee de forma proactiva cada producto a su `sku_id` correcto, asegurando la integridad referencial en la base de datos.
- **WorkdaysBreakEven.jsx**: La "Eficiencia de Barra" fallaba silenciosamente cruzando los datos porque buscaba igualdades estrictas entre IDs que eran nulos. Se implementó un "Fallback de Compatibilidad" donde los `cDetailsArray` que no tengan un `sku_id` asignado buscarán resolverse en memoria cruzando `sku_name` contra la vista de todos los SKUs de la BD. Esto arregla inmediatamente la vista para las subidas previas sin forzar al usuario a volver a subir el CSV.
- **WorkdaysBreakEven.jsx**: Se agregó una nueva fila "Faltantes de Barra (Impacto Económico de Diferencias)" a la tabla de Egresos Reales. Esta fila calcula automáticamente la sumatoria de todos los impactos financieros positivos (faltantes donde el consumo físico superó al reportado por el sistema) y lo suma dinámicamente al total de Egresos, afectando el Resultado Neto final de la jornada.

### [2026-05-16] UI/UX Navigation (Reportes)
- **App.jsx**: Se agregó un nuevo tab principal en el Top Bar llamado `REPORTE`, ubicado a la derecha de `MASTERS`. Se implementó su correspondiente sub-nav secundaria con la vista "Reportes Generales".
- **ReportesLayout.jsx**: Se creó la estructura inicial (shell) para el nuevo módulo de reportes, manteniendo la estética de "Brutalismo Funcional" y la navegación en cascada sin recargas.

### [2026-05-16] Data Engine & Conciliaci�n de Barra (Reportes)
- **useNightReport.js**: Creaci�n del Data Engine para el m�dulo de Reportes. Este hook act�a como motor en memoria para cruzar datos financieros de Night Chief (Cajas/Passline), Planner (RRHH/Adhoc) y la conciliaci�n de Barra.
- **ReportesLayout.jsx**: Refactor completo del Dashboard de Reportes. Se conect� a `globalDate` y se implement� un dise�o de alta densidad (Brutalismo Funcional) basado en tarjetas de KPIs (Ingresos, Egresos, P&L, Health Score).
- **Conciliaci�n de Barra (Sistema vs Real)**: Se integr� una tabla de auditor�a dedicada dentro del Dashboard de Reportes. Calcula en tiempo real las diferencias unitarias y el impacto econ�mico (P�rdidas/Sobros) derivado del stock f�sico vs consumo reportado por sistema (CSV).

### [2026-05-16] UX/UI Refactor Reportes (Hist�rico y Desglose Fiscal)
- **UX Maestro-Detalle (ReportesLayout)**: Se modific� la UI del m�dulo de Reportes para que, al ingresar, el usuario vea primero un listado de todas las jornadas con estado 'cerrada' (Hist�rico). Al seleccionar una fila, se navega al Dashboard Anal�tico de esa fecha espec�fica, evitando la dependencia obligatoria del selector de fecha global.
- **Desglose Fiscal de Ingresos (useNightReport)**: Se integr� la tabla `import_gbol_facturacion` al motor de datos. Ahora los ingresos se separan estructuralmente en: Efectivo Facturado (blanco), Efectivo No Facturado (negro), Ingresos Digitales (digital+tarjeta+MP), y Tickets Passline.
- **C�lculo Impositivo (Egresos)**: Se agreg� un nuevo rengl�n autom�tico en la estructura de egresos ('Impuestos'), el cual calcula por defecto un 21% sobre la suma de Ingresos Digitales + Efectivo Facturado, impactando din�micamente en el P&L Neto de la auditor�a.

### [2026-05-16] Motor de Comisiones Digitales (Data Engine)
- **C�lculo de Pasarelas**: Se incorpor� la extracci�n de las retenciones param�tricas alojadas en `payment_commission_config` directamente dentro del hook `useNightReport.js`.
- **L�gica Matem�tica**: El motor ahora computa din�micamente las comisiones por pasarela (MercadoPago y Tarjetas) calculando la comisi�n pura y agreg�ndole la al�cuota de IVA correspondiente. Este desglose impacta ahora sobre un nuevo rengl�n de Egresos ('Comisiones Zoco/MP/Tarjetas') en el frontend, garantizando una liquidaci�n del P&L que resta los peajes de cobranza de manera precisa sin necesidad de vistas SQL (sustituyendo a la antigua `vw_workday_commissions`).

### [2026-05-16] Hotfix Query Reportes Hist�ricos
- **Correcci�n Case Sensitivity**: Se corrigi� el query de Supabase en `ReportesLayout.jsx` que buscaba jornadas cerradas. En Postgres los strings son case-sensitive y el sistema guarda el status como `CLOSED` (may�sculas), no `closed`. Esto soluciona el bug donde el dashboard de hist�rico aparec�a vac�o incluso habiendo cerrado jornadas recientemente.

### [2026-05-16] Ajuste Fino en L�gica de Faltantes (Auditor�a)
- **Faltante de Caja P&L**: Se ajust� la ecuaci�n de useNightReport.js. Si diferenciaCaja es negativo (robo/p�rdida/descuadre en caja), ahora se extrae y se suma como una penalidad real dentro de los Egresos (ugaCaja), impactando negativamente en el P&L Neto para tener un resultado real del negocio.
- **Sobrante de Caja P&L**: A la inversa, si hay m�s dinero f�sico que el facturado, se suma ahora a los Ingresos Totales de la noche.
- **UI Desglose Fugas**: En ReportesLayout.jsx, la fuga de caja ahora se muestra directamente en color rojo dentro de la Estructura de Costos. Adem�s, la tabla de Conciliaci�n de Barra ya no muestra el confuso signo menos para los faltantes; indica claramente [N] (Faltante) o [N] (Sobrante).

### [2026-05-16] Hard Reset de Base de Datos
- **Purga de Operaciones**: Se ejecut� un `TRUNCATE TABLE work_days CASCADE;` y `TRUNCATE TABLE consumption_reports CASCADE;` para eliminar todo el historial de jornadas operativas (incluyendo sus dependencias en cascada: cierres de caja, n�minas, stock en barra, pagos, etc.) de manera que se pueda probar la ingesta y el c�lculo del reporte en un entorno limpio y en cero.

### [2026-05-17] UX/UI Refactor - Inventario Barra Responsivo
- **TabInventario.jsx**: Se migraron los inputs numéricos a type='text' con inputMode='decimal' interceptando el cambio para convertir las comas a puntos, permitiendo así al usuario usar su teclado de preferencia y validando siempre el ingreso.
- **Mobile Responsiveness**: Se modificó el layout (Action Bar y Tabla de SKUs) utilizando propiedades fluidas y breakpoints sm: para que la aplicación sea 100% usable desde un dispositivo móvil sin desbordes horizontales.

### [2026-05-17] Hotfix - Importador CSV Passline (Separadores)
- **WorkdaysNightChief.jsx**: Se actualizó el parser de archivos CSV (handleMembersCsv y handleGeneralCsv) para soportar de manera dinámica tanto coma (,) como punto y coma (;) como separadores. Además, ahora se limpian las comillas residuales en la fila de cabeceras (headers) para prevenir el error 'No se encontró la columna Estado del eticket' cuando Passline exporta con comillas y punto y coma.

### [2026-05-17] Fix - Passline Ingresos (Break Even)
- **WorkdaysBreakEven.jsx / useNightReport.js**: Se modificó la consulta a stg_passline_tickets para eliminar el filtro .ilike('estado_ticket', '%validada%'). A partir de ahora, el cálculo de ingresos por Passline General suma **todos los tickets vendidos** independientemente de si fueron validados (escaneados en puerta) o no, reflejando el ingreso económico real de la plataforma.
