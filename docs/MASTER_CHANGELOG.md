# Master Changelog (V1 & V2)

## Índice de Contenidos

## Archivo: CHANGELOG-v2.md
- [Midnight Club OS - Redone V2 Changelog](#midnight-club-os-redone-v2-changelog)
  - [[2.18.0] - 2026-06-05](#2-18-0-2026-06-05)
    - [Added: Módulo de Costos Fijos Mensuales (Overheads) y motor financiero](#added-m-dulo-de-costos-fijos-mensuales-overheads-y-motor-financiero)
  - [[2.16.0] - 2026-05-18](#2-16-0-2026-05-18)
    - [Fase 4: Polish & Deploy Readiness (Step 4.1 - 4.3)](#fase-4-polish-deploy-readiness-step-4-1-4-3)
    - [Fase 3: Code Quality (Step 3.1 - Reportes Financieros)](#fase-3-code-quality-step-3-1-reportes-financieros)
    - [Fase 2: Code Quality (Step 2.4 - Bloque Operativo)](#fase-2-code-quality-step-2-4-bloque-operativo)
    - [Fase 2: Code Quality (Step 2.3 - Planificación Operativa)](#fase-2-code-quality-step-2-3-planificaci-n-operativa)
    - [Fase 2: Code Quality (Step 2.2 - Master Data)](#fase-2-code-quality-step-2-2-master-data)
    - [Fase 1: Flatten Structure (Step 1.1)](#fase-1-flatten-structure-step-1-1)
    - [Step 1.2: Environment & Git Hygiene](#step-1-2-environment-git-hygiene)
    - [Step 1.3: Package Identity](#step-1-3-package-identity)
    - [Step 1.4: Vite Base Path](#step-1-4-vite-base-path)
    - [Step 1.5: Deploy Workflow](#step-1-5-deploy-workflow)
    - [Step 1.6: Role-Gating Navigation & Mutation](#step-1-6-role-gating-navigation-mutation)
  - [[2.15.0] - 2026-05-18](#2-15-0-2026-05-18)
    - [Production Readiness Planning](#production-readiness-planning)
    - [Fase 0: Housekeeping (Ejecutado)](#fase-0-housekeeping-ejecutado)
  - [[2.14.0] - 2026-05-18](#2-14-0-2026-05-18)
    - [Added](#added)
  - [[2026-05-17] InicializaciÃ³n de Roadmap de Cierre](#2026-05-17-inicializaci-n-de-roadmap-de-cierre)
## Archivo: CHANGELOG_v1_compressed.md
- [Midnight Club OS - Changelog (Compressed)](#midnight-club-os-changelog-compressed)
  - [V2 Redone Entries](#v2-redone-entries)
    - [2026-05-17: V2 Redone - Auditora de Consumo y P&L (Night Report)](#2026-05-17-v2-redone-auditora-de-consumo-y-p-l-night-report)
    - [2026-05-17: V2 Redone - Night Ops Staging & Parsers](#2026-05-17-v2-redone-night-ops-staging-parsers)
    - [2026-05-17: Fixing Passline CSV Imports](#2026-05-17-fixing-passline-csv-imports)
    - [2026-05-17: V2 Redone - NightOpsModule Porting & GBOL CSV](#2026-05-17-v2-redone-nightopsmodule-porting-gbol-csv)
    - [2026-05-17: V2 Redone - Phase 3 (Bar Inventory)](#2026-05-17-v2-redone-phase-3-bar-inventory)
    - [2026-05-17: V2 Redone - Master Vouchers Module](#2026-05-17-v2-redone-master-vouchers-module)
    - [2026-05-17: V2 Redone - Phase 2 Execution (Payments Module)](#2026-05-17-v2-redone-phase-2-execution-payments-module)
    - [2026-05-17: V2 Redone - Architecture Simplification (Receiving Removed)](#2026-05-17-v2-redone-architecture-simplification-receiving-removed)
    - [2026-05-17: V2 Redone - StockRequestsModule Refactor & Financial Tracking](#2026-05-17-v2-redone-stockrequestsmodule-refactor-financial-tracking)
    - [2026-05-17: V2 Redone - OpeningCostsModule Refactor](#2026-05-17-v2-redone-openingcostsmodule-refactor)
    - [2026-05-17: V2 Redone - StaffPlanModule Financials](#2026-05-17-v2-redone-staffplanmodule-financials)
    - [2026-05-17: V2 Redone - StaffPlanModule Refactor](#2026-05-17-v2-redone-staffplanmodule-refactor)
    - [2026-05-17: V2 Redone - WorkDaysModule Details Panel](#2026-05-17-v2-redone-workdaysmodule-details-panel)
    - [2026-05-17: V2 Redone - UI/UX Navigation Fix (AdminIndex)](#2026-05-17-v2-redone-ui-ux-navigation-fix-adminindex)
    - [2026-05-17: V2 Redone - Master Modules UI/UX Alignment (Staff Roles & POS)](#2026-05-17-v2-redone-master-modules-ui-ux-alignment-staff-roles-pos)
    - [2026-05-17: V2 Redone - SKU Module UI Alignment](#2026-05-17-v2-redone-sku-module-ui-alignment)
    - [2026-05-17: V2 Redone - Module 14: Night Operations (Auditora / Sbado)](#2026-05-17-v2-redone-module-14-night-operations-auditora-sbado)
    - [2026-05-17: V2 Redone - Module 13: Receiving (Recepcin de Stock)](#2026-05-17-v2-redone-module-13-receiving-recepcin-de-stock)
    - [2026-05-17: V2 Redone - Module 12: Payments (Contabilidad)](#2026-05-17-v2-redone-module-12-payments-contabilidad)
    - [2026-05-17: V2 Redone - Module 10 & 11: Staff Plan & Stock Requests](#2026-05-17-v2-redone-module-10-11-staff-plan-stock-requests)
    - [2026-05-17: V2 Redone - Module 08 & 09: Work Days & Opening Costs](#2026-05-17-v2-redone-module-08-09-work-days-opening-costs)
    - [2026-05-17: V2 Redone - Module 07: POS Terminals](#2026-05-17-v2-redone-module-07-pos-terminals)
    - [2026-05-17: V2 Redone - Module 05: Cost Templates](#2026-05-17-v2-redone-module-05-cost-templates)
    - [2026-05-17: V2 Redone - Module 04: Staff Roles](#2026-05-17-v2-redone-module-04-staff-roles)
    - [2026-05-17: V2 Redone - Supabase Migration Execution](#2026-05-17-v2-redone-supabase-migration-execution)
    - [2026-05-17: V2 Redone - Improvements to SuppliersModule](#2026-05-17-v2-redone-improvements-to-suppliersmodule)
    - [2026-05-17: V2 Redone - Improvements to SkuModule](#2026-05-17-v2-redone-improvements-to-skumodule)
    - [2026-05-17: V2 Redone  Module 01: Profiles + PIN Auth](#2026-05-17-v2-redone-module-01-profiles-pin-auth)
    - [2026-05-17: V2 Redone  Admin Shell + PIN Login + Module Index](#2026-05-17-v2-redone-admin-shell-pin-login-module-index)
    - [2026-05-17: V2 Redone  Module 02: Suppliers](#2026-05-17-v2-redone-module-02-suppliers)
    - [2026-05-17: V2 Redone - Module 03: SKU Catalog](#2026-05-17-v2-redone-module-03-sku-catalog)
    - [2026-05-17: V2 Redone - Supabase Migration Execution](#2026-05-17-v2-redone-supabase-migration-execution)
    - [2026-05-17: V2 Redone - Phase 2.5: Binary Operations Migration](#2026-05-17-v2-redone-phase-2-5-binary-operations-migration)
    - [2026-05-17 - SKU Mapping and CSV Import Resilience Update](#2026-05-17-sku-mapping-and-csv-import-resilience-update)
    - [2026-05-17 - Bulk SKU Import](#2026-05-17-bulk-sku-import)
    - [2026-05-17 - Auditory Calculation Fix](#2026-05-17-auditory-calculation-fix)
## Archivo: CHANGELOG_legacy_backup.md
- [Midnight Club OS - Changelog](#midnight-club-os-changelog)
  - [[Unreleased]](#unreleased)
    - [2026-05-17: V2 Redone - Auditoría de Consumo y P&L (Night Report)](#2026-05-17-v2-redone-auditor-a-de-consumo-y-p-l-night-report)
    - [2026-05-17: V2 Redone - Night Ops Staging & Parsers](#2026-05-17-v2-redone-night-ops-staging-parsers)
    - [2026-05-17: Fixing Passline CSV Imports](#2026-05-17-fixing-passline-csv-imports)
    - [2026-05-17: V2 Redone - NightOpsModule Porting & GBOL CSV](#2026-05-17-v2-redone-nightopsmodule-porting-gbol-csv)
    - [2026-05-17: V2 Redone - Phase 3 (Bar Inventory)](#2026-05-17-v2-redone-phase-3-bar-inventory)
    - [2026-05-17: V2 Redone - Master Vouchers Module](#2026-05-17-v2-redone-master-vouchers-module)
    - [2026-05-17: V2 Redone - Phase 2 Execution (Payments Module)](#2026-05-17-v2-redone-phase-2-execution-payments-module)
    - [2026-05-17: V2 Redone - Architecture Simplification (Receiving Removed)](#2026-05-17-v2-redone-architecture-simplification-receiving-removed)
    - [2026-05-17: V2 Redone - StockRequestsModule Refactor & Financial Tracking](#2026-05-17-v2-redone-stockrequestsmodule-refactor-financial-tracking)
    - [2026-05-17: V2 Redone - OpeningCostsModule Refactor](#2026-05-17-v2-redone-openingcostsmodule-refactor)
    - [2026-05-17: V2 Redone - StaffPlanModule Financials](#2026-05-17-v2-redone-staffplanmodule-financials)
    - [2026-05-17: V2 Redone - StaffPlanModule Refactor](#2026-05-17-v2-redone-staffplanmodule-refactor)
    - [2026-05-17: V2 Redone - WorkDaysModule Details Panel](#2026-05-17-v2-redone-workdaysmodule-details-panel)
    - [2026-05-17: V2 Redone - UI/UX Navigation Fix (AdminIndex)](#2026-05-17-v2-redone-ui-ux-navigation-fix-adminindex)
    - [2026-05-17: V2 Redone - Master Modules UI/UX Alignment (Staff Roles & POS)](#2026-05-17-v2-redone-master-modules-ui-ux-alignment-staff-roles-pos)
    - [2026-05-17: V2 Redone - SKU Module UI Alignment](#2026-05-17-v2-redone-sku-module-ui-alignment)
    - [2026-05-17: V2 Redone - Module 14: Night Operations (Auditoría / Sábado)](#2026-05-17-v2-redone-module-14-night-operations-auditor-a-s-bado)
    - [2026-05-17: V2 Redone - Module 13: Receiving (Recepción de Stock)](#2026-05-17-v2-redone-module-13-receiving-recepci-n-de-stock)
    - [2026-05-17: V2 Redone - Module 12: Payments (Contabilidad)](#2026-05-17-v2-redone-module-12-payments-contabilidad)
    - [2026-05-17: V2 Redone - Module 10 & 11: Staff Plan & Stock Requests](#2026-05-17-v2-redone-module-10-11-staff-plan-stock-requests)
    - [2026-05-17: V2 Redone - Module 08 & 09: Work Days & Opening Costs](#2026-05-17-v2-redone-module-08-09-work-days-opening-costs)
    - [2026-05-17: V2 Redone - Module 07: POS Terminals](#2026-05-17-v2-redone-module-07-pos-terminals)
    - [2026-05-17: V2 Redone - Module 05: Cost Templates](#2026-05-17-v2-redone-module-05-cost-templates)
    - [2026-05-17: V2 Redone - Module 04: Staff Roles](#2026-05-17-v2-redone-module-04-staff-roles)
    - [2026-05-17: V2 Redone - Supabase Migration Execution](#2026-05-17-v2-redone-supabase-migration-execution)
    - [2026-05-17: V2 Redone - Improvements to SuppliersModule](#2026-05-17-v2-redone-improvements-to-suppliersmodule)
    - [2026-05-17: V2 Redone - Improvements to SkuModule](#2026-05-17-v2-redone-improvements-to-skumodule)
    - [Nuevo MÃ³dulo: Master Pagos (2026-05-17)](#nuevo-m-dulo-master-pagos-2026-05-17)
    - [Workdays - Correcciones de Cierre y P&L (2026-05-16)](#workdays-correcciones-de-cierre-y-p-l-2026-05-16)
    - [Night Chief - Flujo de Cierre Final (2026-05-10)](#night-chief-flujo-de-cierre-final-2026-05-10)
    - [Night Chief Ã¢â‚¬â€� Passline BoleterÃƒÂ­a Integration (2026-05-10)](#night-chief-passline-boleter-a-integration-2026-05-10)
    - [Night Chief Ã¢â‚¬â€� Consumo & RecaudaciÃƒÂ³n Tables (2026-05-10)](#night-chief-consumo-recaudaci-n-tables-2026-05-10)
    - [Master Screens UI/UX Audit Ã¢â‚¬â€� Cycle 1 (2026-05-10)](#master-screens-ui-ux-audit-cycle-1-2026-05-10)
    - [Added](#added)
    - [Changed](#changed)
  - [[2026-05-10] Night Chief - Passline General Fixes](#2026-05-10-night-chief-passline-general-fixes)
    - [[2026-05-10] Break Even - Real-Time P&L Dashboard](#2026-05-10-break-even-real-time-p-l-dashboard)
    - [[2026-05-10] Workdays Planner - Refactor EstÃƒÂ©tico](#2026-05-10-workdays-planner-refactor-est-tico)
    - [[2026-05-10] Fine Polish - Brutalismo Funcional](#2026-05-10-fine-polish-brutalismo-funcional)
    - [[2026-05-16] UI/UX Navigation Refactor (Global Date)](#2026-05-16-ui-ux-navigation-refactor-global-date)
    - [[2026-05-16] Bugfix: Consumo de Sistema vs FÃƒÂ­sico](#2026-05-16-bugfix-consumo-de-sistema-vs-f-sico)
    - [[2026-05-16] UI/UX Navigation (Reportes)](#2026-05-16-ui-ux-navigation-reportes)
    - [[2026-05-16] Data Engine & ConciliaciÃ³n de Barra (Reportes)](#2026-05-16-data-engine-conciliaci-n-de-barra-reportes)
    - [[2026-05-16] UX/UI Refactor Reportes (HistÃ³rico y Desglose Fiscal)](#2026-05-16-ux-ui-refactor-reportes-hist-rico-y-desglose-fiscal)
    - [[2026-05-16] Motor de Comisiones Digitales (Data Engine)](#2026-05-16-motor-de-comisiones-digitales-data-engine)
    - [[2026-05-16] Hotfix Query Reportes HistÃ³ricos](#2026-05-16-hotfix-query-reportes-hist-ricos)
    - [[2026-05-16] Ajuste Fino en LÃ³gica de Faltantes (AuditorÃ­a)](#2026-05-16-ajuste-fino-en-l-gica-de-faltantes-auditor-a)
    - [[2026-05-16] Hard Reset de Base de Datos](#2026-05-16-hard-reset-de-base-de-datos)
    - [[2026-05-17] UX/UI Refactor - Inventario Barra Responsivo](#2026-05-17-ux-ui-refactor-inventario-barra-responsivo)
    - [[2026-05-17] Hotfix - Importador CSV Passline (Separadores)](#2026-05-17-hotfix-importador-csv-passline-separadores)
    - [[2026-05-17] Fix - Passline Ingresos (Break Even)](#2026-05-17-fix-passline-ingresos-break-even)
    - [[2026-05-17] Hotfix - Importador CSV GBOL (Comillas)](#2026-05-17-hotfix-importador-csv-gbol-comillas)
    - [[2026-05-17] Hard Reset de Base de Datos (Pruebas)](#2026-05-17-hard-reset-de-base-de-datos-pruebas)
  - [[2026-05-17]](#2026-05-17)
    - [Fixed](#fixed)
    - [Added](#added)
    - [2024-05-17: Implementación del Módulo Admin Pagos](#2024-05-17-implementaci-n-del-m-dulo-admin-pagos)
    - [Fixed](#fixed)
    - [2024-05-17: Rollback del Modulo Admin Pagos](#2024-05-17-rollback-del-modulo-admin-pagos)
    - [2024-05-17: Edicion Inline en Stock Central](#2024-05-17-edicion-inline-en-stock-central)
    - [2026-05-17: V2 Redone — Module 01: Profiles + PIN Auth](#2026-05-17-v2-redone-module-01-profiles-pin-auth)
    - [2026-05-17: V2 Redone — Admin Shell + PIN Login + Module Index](#2026-05-17-v2-redone-admin-shell-pin-login-module-index)
    - [2026-05-17: V2 Redone — Module 02: Suppliers](#2026-05-17-v2-redone-module-02-suppliers)
    - [2026-05-17: V2 Redone - Module 03: SKU Catalog](#2026-05-17-v2-redone-module-03-sku-catalog)
    - [2026-05-17: V2 Redone - Supabase Migration Execution](#2026-05-17-v2-redone-supabase-migration-execution)
    - [2026-05-17 - SKU Mapping and CSV Import Resilience Update](#2026-05-17-sku-mapping-and-csv-import-resilience-update)
    - [2026-05-17 - Bulk SKU Import](#2026-05-17-bulk-sku-import)
    - [2026-05-17 - Auditory Calculation Fix](#2026-05-17-auditory-calculation-fix)



### --- SOURCE: CHANGELOG-v2.md --- ###

# Midnight Club OS - Redone V2 Changelog

## [2.18.0] - 2026-06-05

### Operations UI/UX Polish (Functional Brutalism)
- **Frontend - StaffPlanModule**: Se solucionó un bug lógico donde las solicitudes manuales de staff desde la vista operativa ignoraban la "Cantidad Default" configurada en el Tarifario. Ahora, el selector consulta `staff_roles` y auto-completa dinámicamente el campo de cantidad. Además, se alineó estéticamente la tabla a formato "Raw Data", eliminando los contenedores y reemplazando labels por Status Dots.
- **Frontend - SkuModule**: Se alineó el catálogo al Brutalismo Funcional de la V2. El formulario (Sidebar) de ingreso y edición fue depurado de "cajas" sólidas. Se implementó funcionalidad de ordenamiento (sort) iterativo sin íconos redundantes en los encabezados de tabla.
- **Arquitectura de Datos - SkuModule**: Se depreció por completo el campo `unit` (Unidad) de los formularios front-end por decisión de negocio ("siempre se carga por unidad"), forzando que internamente se pase siempre el valor `"unidad"` para no romper esquemas existentes de base de datos.
- **Frontend - App.jsx & Contexts**: Se implementó persistencia de sesión a través del `localStorage` (`mc_user` y `mc_active_view`), lo que impide que los recargos de navegador eliminen la sesión iniciada mediante PIN de los usuarios operativos, mejorando sustancialmente la experiencia inmersiva del POS.

### Added: Módulo de Costos Fijos Mensuales (Overheads) y motor financiero
- **Supabase API Exec**: Se restauró la skill `supabase-cli-executor.js` usando la Management API (POST `/database/query`) para evitar bloqueos por falta de Docker Desktop local.
- **Database**: Creación de tabla `monthly_fixed_costs` con RLS habilitado.
- **Frontend - UI**: Se creó `FixedCostsModule.jsx` utilizando Functional Brutalism. Permite la carga, edición, borrado y pago de costos fijos por mes.
- **Reporte Mensual**: Se integró el modelo financiero en `MonthlyReportModule.jsx` para restar la totalidad de la estructura/overheads mensual directamente del *Net Profit* bruto antes del ROI.
- **Navegación**: Se dio acceso en rol Contador y Admin en la fase de Ejecución en `AdminIndex.jsx`.

### Stock Requests & Operations Polish
- **Database (stock_requests)**: Se ejecutó un `ALTER TABLE` vía `supabase-cli-executor.js` agregando la columna `supplier_id` (uuid REFERENCES suppliers). Esto quiebra la dependencia estricta al catálogo `skus`, permitiendo al equipo operativo sobreescribir el proveedor designado a nivel de pedido individual (Granular Supplier Override).

## [2.17.0] - 2026-05-20

### Fase 4: Polish & Deploy Readiness (GitHub Pages Fix)
- **vite.config.js**: Corregido el `base: '/'` a `base: '/redone/'` para solucionar los errores de `404 Not Found` en la importación de assets estáticos (JS/CSS) y la pantalla en blanco durante el despliegue en GitHub Pages.

### Fase 3: Code Quality (Step 3.2 - Supabase Limits Mitigation)
- **Supabase Limits Mitigation**: Detectada vulnerabilidad crítica arquitectónica donde los reportes agregados (Night, Monthly, Annual) sufrían truncamiento de datos en tablas con más de 1000 filas (ej. `stg_passline_tickets`, `night_cash_closing`, `opening_costs`) debido al límite nativo `.range()` de Supabase (PostgREST API).
- **lib/queryHelper.js**: Implementado patrón de diseño de capa de acceso a datos para mitigar truncamientos de red. Creada utilidad centralizada `fetchAll(queryBuilder)` que abstrae bucles iterativos seguros mediante `.range()` secuenciales, consolidando todas las páginas en memoria para un cálculo de P&L perfecto desde el frontend.
- **Reportes Financieros**: Refactorizados `NightReportModule`, `MonthlyReportModule` y `AnnualReportModule` inyectando el helper `fetchAll()` en sus respectivos `Promise.all` agregadores. Esto garantiza precisión matemática a largo plazo para cálculos contables sin necesidad de recurrir a vistas SQL (alineado con la decisión arquitectónica V2 de *Zero Aggregation Tables*).
- **lib/gbolService.js**: Incorporado uso de `fetchAll()` en la función `populateSystemAmounts` para `import_gbol_facturacion`, blindando la persistencia de caja física incluso si la exportación del POS GBOL en una sola jornada superase los 1000 comprobantes.

## [2.16.0] - 2026-05-18

### UX/UI Polish: Cinematic Login
- **Login.jsx**: Rediseñado el módulo de Login (`src/layouts/Login.jsx`) para adoptar un estilo cinemático y refinado de "Functional Brutalism" (Ghost Glass). Implementados fondos con radial gradients profundos (`animate-slow-pulse`), bordes de cristal ahumado (`backdrop-blur-xl`), animaciones CSS nativas escalonadas (`animate-fade-in delay-100`, `animate-slide-up delay-300`) e interacciones avanzadas en el botón "AUTENTICAR" (shimmer effect y scale feedback).
- **index.css**: Agregados `@keyframes` nativos (`fade-in`, `slide-up`, `slow-pulse`, `shimmer`) y utilitarios para delays de animación a la hoja de estilos global para habilitar estas transiciones cinemáticas fluidas.

### Hotfix: ProfilesModule Role-Gating
- **ProfilesModule**: Agregado el rol `encargado` a la constante `ROLES` y `ROLE_BADGE` (asignado con color morado `purple-500`) permitiendo la creación de perfiles para los Encargados de Barra directamente desde el Panel Administrativo (EQUIPO). Previamente el rol estaba ausente en el formulario de creación, bloqueando el onboarding operativo.
- **Database (profiles)**: Ejecutada migración para reemplazar el constraint `profiles_role_check` en la tabla `profiles`, agregando `'encargado'` al `CHECK` para permitir inserciones exitosas (el constraint previo bloqueaba la creación desde la UI).

### Fase 4: Polish & Deploy Readiness (Step 4.1 - 4.3)

- **Production Build**: Verificado `npm run build` sin errores, generando un bundle de producción estable y eficiente de un solo chunk.
- **Dependency Cleanup**: Purgado `clsx` y `tailwind-merge` del entorno local, reduciendo el footprint de dependencias y alineando la base de código con el estándar de clases dinámicas mediante template strings.
- **Documentation**: Creado manual maestro de onboarding `docs/README.md` abarcando el Setup, Tech Stack, Estructura "Flattened", Mapa de Módulos (19 totales) y Matriz RBAC para los 5 roles.

### Fase 3: Code Quality (Step 3.1 - Reportes Financieros)

- **MonthlyReportModule**: Implementado bloque `try/catch` envolviendo operaciones fetch (`fetchAvailableMonths` y `fetchMonthDetails`) e incorporada función `triggerFlash` para proveer consistencia visual ante fallas de consulta.
- **AnnualReportModule**: Implementada idéntica convención de arquitectura de manejo de errores `try/catch` con `triggerFlash` para homologar al estándar V2.

### Fase 2: Code Quality (Step 2.4 - Bloque Operativo)

- **BarInventoryModule**: Integrado `try/catch` exhaustivo en `fetchBaseData` y `fetchInventory`.
- **NightOpsModule**: Implementado control de errores y mapeo riguroso de `"" -> null` en la persistencia de caja (`declared_cash`/`declared_digital`).
- **NightReportModule**: Incorporado `try/catch` con `flashColor` overlay en toda interacción y saneamiento de nulos en inserción de `financial_adjustments`.

### Fase 2: Code Quality (Step 2.3 - Planificación Operativa)

- **OpeningCostsModule**: Implementado `try/catch` exhaustivo (load, save, delete, approve) y mapeo estricto `"" -> null` para atributos clave.
- **StaffPlanModule**: Incorporada interacción `flashColor` global, resiliencia `try/catch` y limpieza estricta en payload de persistencia.
- **StockRequestsModule**: Aplicada política estricta de `try/catch` para interacciones DB y saneamiento de nulos en `notes` e IDs.

### Fase 2: Code Quality (Step 2.2 - Master Data)

- **CostTemplatesModule**: Implementado `try/catch` en load/save/toggle y `flashColor` overlay visual. Mapeo riguroso de `"" -> null` en `title` y `supplier_id`.
- **MasterVouchersModule**: Mapeo estricto de `"" -> null` en los campos `name` y `code` para evitar inserción de strings vacíos en base de datos.
- **PosTerminalsModule**: Mapeo estricto de `"" -> null` en los campos `name` y `terminal_id`.
- **ProfilesModule**: Implementado Empty State ("No hay registros.") visible cuando la tabla está vacía tras cargar.
- **StaffRolesModule**: Mapeo estricto de `"" -> null` en el campo `name` para robustez de DB.

### Fase 1: Flatten Structure (Step 1.1)

- **Flatten**: Promovidos `ready-to-go/src/`, `ready-to-go/lib/`, `ready-to-go/db/` a root. Eliminado directorio wrapper `ready-to-go/`. Actualizado `index.html` entry point de `/ready-to-go/src/main.jsx` → `/src/main.jsx`. 0 imports modificados (todas las rutas relativas `../../lib/supabase` se preservaron intactas). App verificada funcionando post-flatten via browser screenshot (login screen rendering OK).

### Step 1.2: Environment & Git Hygiene

- **`.env.example`**: Creado con placeholders (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) para onboarding seguro.
- **`.gitignore`**: Creado desde cero (no existia). Protege `.env.local` (credenciales reales), `node_modules/`, `dist/`, `supabase/.temp/`.
- **DECISIONS.md D15**: Actualizada referencia operativa de `ready-to-go/` a `src/`, `lib/`, `db/` (estructura flattened).

### Step 1.3: Package Identity

- **`package.json`**: Renombrado `redone` → `midnight-club-os`, version `1.0.0` → `2.0.0`, agregado `"private": true`, eliminados campos stale de npm-init (`main`, `directories`, `keywords`, `author`, `license`). Scripts preservados.

### Step 1.4: Vite Base Path

- **`vite.config.js`**: Evaluado `base: '/redone/'`. Correcto para GitHub Pages (repo = `redone`). Sin cambios. Si se migra a dominio propio, cambiar a `'/'`.

### Step 1.5: Deploy Workflow

- **`.github/workflows/deploy.yml`**: Agregadas env vars `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` desde GitHub Secrets al step Build. Sin esto, el build de produccion tenia credenciales Supabase como `undefined`. Node 20 ✅, `npm ci` ✅, artifact path `./dist` ✅, branch `master` ✅.
- **Build local validado**: `npm run build` exitoso post-flatten (1.68s, 1794 modulos, 617KB bundle).

### Step 1.6: Role-Gating Navigation & Mutation

- **`AuthContext.jsx`**: Implementado `ROLE_ACCESS` map para 5 roles (admin, operativo, contador, encargado, viewer). Exportadas helpers `canAccess` (para ver el módulo), `canMutate` (para Create/Edit/Delete) y `isReadOnly` (para labels).
- **`App.jsx`**: Filtrado activo de RUTAS directas (`if (!canAccess(activeView))`). Agregado color de rol `encargado`.
- **`AdminIndex.jsx`**: Reescritura total. El `MODULE_MAP` ahora se filtra dinámicamente según `canAccess()`. Módulos permitidos pero restringidos (read-only) muestran un icono de Ojo. Rol Viewer despliega un badge naranja global "SOLO LECTURA" en el header.

## [2.15.0] - 2026-05-18

### Production Readiness Planning

- **Roadmap E2E**: Creado plan de producción completo con 5 fases (P0 Housekeeping, P1 Infraestructura, P2 Code Quality, P3 Validación E2E por Roles, P4 Polish & Deploy). Identificados 10 items de deuda técnica (3 críticos: estructura anidada ready-to-go/, legacy src/ zombi con credenciales expuestas, encoding UTF-16 corrupto en docs). Mapeados 7 bloques de test E2E cubriendo los 4 roles operativos (Admin, Operativo, Contador, Encargado Barra) en un ciclo semanal Mar→Lun completo. Estimación: 4-5h de ejecución secuencial.

### Fase 0: Housekeeping (Ejecutado)

- **Step 0.1**: Eliminado `src/` legacy completo (8 archivos, 57KB). Resuelve exposición de credenciales Supabase V1 hardcodeadas en `src/lib/supabase.js` (proyecto `iyknbgmcnbpvalvsjxjz`).
- **Step 0.2**: Eliminados 3 scripts scratch del root (`compile_for_nblm.py`, `db_dump_scratch.sql`, `fix_constraint.cjs`).
- **Step 0.3**: Eliminado `.env.local` duplicado en `ready-to-go/` (idéntico al root).
- **Step 0.4**: Limpiado `supabase/.temp/` (8 archivos de caché CLI).
- **Step 0.5**: Archivado `docs/CHANGELOG.md` V1 → `docs/.archive/CHANGELOG_v1_compressed.md`.
- **Step 0.6**: Corregido encoding UTF-16 corrupto: CHANGELOG-v2.md (1,037 null bytes → 0), DECISIONS.md (232 null bytes → 0). Ambos archivos ahora UTF-8 puro.
- **Step 0.7**: Creado `ready-to-go/db/14c_night_sales.md` documentando tabla huérfana `night_sales` (0 rows, 9 cols) como RESERVED future spec para análisis de ventas por producto.
- **DB Audit (vabekvkijcvbyqvrxrss)**: 20 tablas, 0 triggers custom, 0 views, 0 funciones, RLS off (D15). Frontend V2 consume 17 tablas. `night_sales` reservada. `payments` no existe como tabla (se usa `opening_costs.status` para tracking de pagos).
- **Root final**: 6 archivos esenciales + 5 directorios. Zero código muerto.

## [2.14.0] - 2026-05-18

### Added

- **Auditoria Anual (AnnualReportModule.jsx)**: Clon funcional de MonthlyReportModule pero con agregacion y filtro por ano completo. Mantiene la filosofia de Zero Aggregation Tables, calculando ingresos, egresos e impuestos iterando sobre todas las jornadas de un ano para preservar la precision del dato transaccional.

## [2026-05-17] InicializaciÃ³n de Roadmap de Cierre

- **Docs**: Se declara `CHANGELOG.md` anterior como legacy. Todo el progreso de la V2 "Redone" se trackearÃ¡ exclusivamente aquÃ­.
- **AdminIndex**: Se eliminÃ³ el mÃ³dulo pendiente `recipes` y se habilitÃ³ `master_vouchers` ("Tipos de Comprobante") en la UI, sujeto a validaciÃ³n y creaciÃ³n en base de datos.
- **Cleanup**: Iniciado proceso de revisiÃ³n uno-a-uno de pantallas de `src/layouts` legacy contra `ready-to-go/src/layouts` para su eliminaciÃ³n segura.
- **Cleanup**: Eliminados mÃ³dulos legacy de Fase 1 (MasterProveedores, MasterSKU, MasterTarifario, MasterNomina, Configuraciones).
- **Cleanup**: Eliminados mÃ³dulos operativos legacy (WorkdaysPlanner, WorkdaysNightChief, WorkdaysBreakEven, OperacionesStock, SolicitudesStock, EncargadoBarra).
- **Cleanup**: Eliminados mÃ³dulos financieros y de reporte legacy (ReportesLayout, MasterPagos).
- **Cleanup**: Eliminados layouts generales legacy (Login, Dashboard, TableLayout, IndexLayout) y archivo `migration.sql` viejo.
- **Database Sync**: Se verificÃ³ la existencia de todos los esquemas en la base de datos (staff_roles, cost_templates, pos_terminals, work_days, etc.) los cuales ya estaban instanciados. Se ejecutÃ³ la migraciÃ³n pendiente de `voucher_types` (Tipos de Comprobante) y se enlazÃ³ como Foreign Key a `opening_costs` reemplazando el CHECK duro.
- **UI Locking**: Se estandarizÃ³ el cerrojo global (`isClosed`) en `StockRequestsModule` y se modificÃ³ la selecciÃ³n de jornadas en `PaymentsModule` para ajustarse al flujo binario ('open', 'closed'). Ambos mÃ³dulos bloquean exitosamente las mutaciones si la jornada no estÃ¡ abierta.
- **Planning**: Se generÃ³ el Roadmap E2E V2 (Fases 0â€“4) tras revisar el CHANGELOG legacy completo. Se identificaron 3 gaps crÃ­ticos: (1) `stock_requests` no impacta el P&L del NightReport, (2) 4 tablas de staging sin documentaciÃ³n `.md`, (3) sin indicador visual de carga POS/GBOL en NightReport. El plan ordena ejecuciÃ³n por dependencia de datos con prueba E2E de cierre de jornada como hito final.
- **Docs**: Creado `ready-to-go/db/14b_night_ops_staging.md` documentando las 4 tablas de staging (`stg_passline_tickets`, `import_gbol_facturacion`, `import_system_consumption`, `night_consumption`) verificadas en la DB vÃ­a Supabase CLI. Schemas confirmados 1:1.
- **Cleanup**: `docs/CHANGELOG.md` limpiado de encoding corrupto (mixed UTF-8/CP1252/UTF-16 â†’ ASCII puro) y comprimido de 69KB (477 lÃ­neas) a 28KB (220 lÃ­neas) eliminando las 35 secciones legacy V1. Backup preservado en `CHANGELOG_legacy_backup.md`.
- **Fase 1 Validation**: Verificado vÃ­a SQL que `staff_roles.base_rate` es la ÃšNICA fuente de nÃ³mina (sin `base_salary`). Confirmado uso consistente en `StaffPlanModule`, `NightReportModule` y `MonthlyReportModule`. Verificados seeds de `voucher_types` (Factura A/B/C, Recibo X, todos `active: true`). FK `opening_costs.voucher_type â†’ voucher_types.code` confirmada intacta.
- **ProfilesModule**: Agregado `handleDelete` con hard delete y `window.confirm`. Agregado botÃ³n `Trash2` en columna de acciones de la tabla. Refactoreado `handleSave` y `toggleActive` con `try/catch` + `flashColor` feedback (verde Ã©xito, rojo error). Estado anterior carecÃ­a de manejo de errores.
- **E2E Fase 2 (Browser Agent)**: Test E2E completo de los 4 mÃ³dulos de PLANIFICACIÃ“N validado exitosamente:
  - **WorkDays**: Jornada "Test E2E Browser" (24/05/2026) creada en estado `open`. 2 jornadas visibles en tabla.
  - **OpeningCosts**: Sin auto-population de templates (0 templates activos). Ad-hoc "Flete Especial Test" creado con $15,000 en DRAFT. KPI TOTAL APERTURA $15,000. Botones AD-HOC/edit/delete activos.
  - **StaffPlan**: Rol "Barback" solicitado (qty=2), aprobado. TOTAL PROYECTADO calculado dinÃ¡micamente con base_rate.
  - **StockRequests**: MÃ³dulo carga correctamente. Selector de jornada funcional. Datos existentes visibles (ABSOLUT COMUN $19,125 APPROVED). Botones activos para jornada open.
  - **isClosed Lock**: Confirmado visualmente â€” botones habilitados en jornadas `open`, sin jornadas `closed` para test inverso.
- **Suppliers Seed**: Migrados 30 proveedores desde `master_proveedores` legacy al schema V2 `suppliers`. 47 filas originales â†’ 30 tras 7 merges de duplicados (AADICAPIF, SADAIC, Distribuidora Energy, Petit Plast, Estudio Contable Torrez, Japos/Thenon, Medicem) y eliminaciÃ³n de 7 entradas espurias (personas internas, categorÃ­as de gasto, servicios no-proveedor). Campos `cbu`+`alias` â†’ `bank_alias`. Campo `category` omitido (no existe en V2). Total en DB: 30 registros.
- **SKU Seed**: Migrados 55 SKUs desde `master_sku` legacy. 3 test entries eliminados. 17 SKUs existentes actualizados (cost, volume_ml, supplier_id corregido). 38 nuevos insertados. Supplier fantasma `"1"` eliminado. Campos legacy descartados: `pack_qty`, `costo_pack`, `external_id`, `categoria_id`. Campo `unit` inferido (botella/unidad). Total: 55 SKUs (26 activos, 29 inactivos).
- **Staff Templates & Bulk Approval**: Agregada funcionalidad de plantillas por defecto en `staff_roles`. AÃ±adida columna `default_quantity` int a la DB. Actualizada creaciÃ³n en `WorkDaysModule` para pre-poblar el `staff_plan` con estos roles en status 'draft'. En `StaffPlanModule` se agregÃ³ botÃ³n "APROBAR TODO" que marca masivamente los 'draft' como 'approved', fijando automÃ¡ticamente `quantity_approved` igual a `quantity_requested`.
- **Staff Roles Seed**: Migrados 18 roles desde `master_staff_roles` legacy al schema V2 `staff_roles`. Nombres normalizados ("Enc." â†’ "Encargado de", correcciones ortogrÃ¡ficas). Campo `area` legacy descartado. 1 rol legacy omitido (Bartender) por ya existir en V2. Total en DB: 23 roles.
- **Payments Supplier Info**: Actualizado `PaymentsModule.jsx` para mostrar los datos del proveedor (CUIT, CBU, Alias, Banco y Contacto) en el slide-over al momento de registrar un pago, facilitando las transferencias bancarias directas para el Contador sin salir de la pantalla.
- **Binary Lifecycle Sync**: Refactorizados `OpeningCostsModule.jsx` y `PaymentsModule.jsx` para alinear los estados internos. Los costos nacen como `draft`, son aprobados a `approved`, y finalmente pagados como `paid`. Se agregÃ³ botÃ³n de aprobaciÃ³n en UI para completar el workflow administrativo. La restricciÃ³n CHECK fue restaurada a V1.
- **Root Cleanup**: Eliminados 23 archivos scratch/debug del root del proyecto y carpeta `dist/`. Archivos eliminados: 6x `.sql` (check.sql, check_cash_closing.sql, check_sales.sql, list_tables.sql, execute.sql), 6x `.py` (csv_analyzer, csv_head, fix, fix_cols, fix_fetch, fix_headers, fix_mock), 6x `.js/.cjs` (check_schema.cjs, check_schema.js, scratch_query.js, scratch_schema.js, read_logs.cjs, test_csv.cjs, test_import.js, test_populate.js), 2x `.txt` (help.txt, help_query.txt), 1x `.json` (db_schema.json). Root queda limpio: 6 archivos esenciales (.env.local, GEMINI.md, index.html, package.json, package-lock.json, vite.config.js) + 7 directorios.
- **E2E Fase 3 (Browser Agent)**: Test E2E completo de los 3 mÃ³dulos de EJECUCIÃ“N + LA NOCHE validado exitosamente:
  - **Prep**: Costo "Flete Especial Test" transicionado de `draft` â†’ `approved` vÃ­a SQL para habilitar flujo Payments.
  - **PaymentsModule**: NavegaciÃ³n exitosa. "Flete Especial Test" visible como PENDIENTE $15,000. Pago registrado con mÃ©todo=Digital, comprobante=Factura A, notas="Test E2E". TransiciÃ³n a PAGADO confirmada.
  - **BarInventoryModule**: Jornada Test E2E seleccionada. Modo APERTURA funcional: stock incrementado vÃ­a +/- buttons. GUARDAR INVENTARIO exitoso (upsert). Toggle a modo CIERRE exitoso. ABSOLUT COMUN stock_close=1. Segunda persistencia OK.
  - **NightOpsModule**: ESTADO: ABIERTA (banner verde). ARQUEO DE CAJAS visible con 5 terminales (BOLETERIA GENERAL 1, CAJA 1, CAJA 1.2, CAJA 2, CAJA 3). Declarado Cash=50000, Digital=120000 en BOLETERIA GENERAL 1. DIFERENCIA calculada. IMPORTAR CSV GBOL presente.
  - **Cross-Verification**: OpeningCosts confirma "Flete Especial Test" con status PAID. Integridad Paymentsâ†’OpeningCosts verificada.

- **Docs**: [2026-05-17] Corrección Plan de Pruebas: Movida acción de Cargar CSV Consumos de NightOps (Fase 3) a NightReport (Fase 4) y agregada carga Passline en Fase 3 en docs/test-drive-developing.md

- **NightOpsModule (UX)**: Agregado botón 'IGUALAR SISTEMA' en Arqueo de Cajas para pre-poblar masivamente el monto declarado en base a los datos importados del POS, reduciendo la fricción operativa cuando el efectivo/digital cuadra perfectamente (D18).
- **NightReportModule (P&L 3 Columnas)**: Refactorizado el módulo de auditoría final a un dashboard de 3 columnas (Egresos, Ingresos, Break Even) con cálculos de márgenes dinámicos. Agregado cálculo automático de impuestos sobre ventas digitales, inyección de snapshot en cierre, y panel Slide-Over para agregar ingresos/egresos manuales a través de la nueva tabla *financial_adjustments*.
- **NightReportModule (Eficiencia de Barra)**: Agregado botón temporal (DEV) 'IGUALAR A SISTEMA' para forzar que el consumo físico coincida con el del sistema, agilizando pruebas en el flujo final.
- **NightReportModule (Stock Aprobado)**: Eliminada tabla de Eficiencia de Barra y dependencias de CSV. Agregada tabla 'InversiÃ³n en Insumos (Stock Aprobado)' consumiendo directamente `stock_requests`, cerrando el flujo contable.
- **NightReportModule (Refinamiento Contable)**: Eliminada tabla redundante de 'InversiÃ³n en Insumos'. Desglosado el detalle de 'Costos Pagados' (Egresos) en tres subcategorÃ­as de P&L: Costos Recurrentes (vinculados a templates), Costos Ad-Hoc, e Insumos Pagados (derivados del lote de solicitudes de stock). Eliminadas por completo las consultas fantasma a `stock_requests`.
- **MonthlyReportModule**: Reescritura completa del mÃ³dulo. TransiciÃ³n a tabla viva (contemplando status 'open' para proyecciÃ³n y 'closed' para auditorÃ­a). EliminaciÃ³n de dependencias legacy (night_sales). IncorporaciÃ³n de grÃ¡ficos nativos (TermÃ³metro de rentabilidad, Tendencia HistÃ³rica Y/X, DistribuciÃ³n de Gasto) y aislamiento de Pasivo Impositivo.

- **MonthlyReportModule (Correcciones Contables)**: Corregida query de Passline para usar operational_date en vez de work_day_id. Agrupados los terminales de caja por jornada (filter+reduce) en lugar de tomar solo el primero. Modificada tabla para incluir impuestos en 'Egresos Totales' y cuadrar el Resultado Neto. Removido color rojo de tarjeta Pasivo Impositivo.

- **MonthlyReportModule (UI / UX)**: Refinamiento de visualizaciones. El TermÃ³metro de Rentabilidad se minimizÃ³ a una barra horizontal superior. La Tendencia HistÃ³rica ahora ocupa el ancho completo para mayor legibilidad (full-width) con fondo semi-transparente. La DistribuciÃ³n de Gastos fue rediseÃ±ada para ser minimalista, asignando colores dinÃ¡micamente segÃºn peso porcentual (Rojo = 1ro, Naranja = 2do, Amarillo = 3ro, Blanco = 4to) ordenando los rubros de mayor a menor impacto.

- **Context Compressor**: Solucionado el error de encoding (`enconded output error`) al usar la skill `context-compressor` en la consola de Windows (Powershell/CMD). Se introdujo el parámetro `--out` en `minify.js` para guardar el resultado directamente al sistema de archivos mediante `fs.writeFileSync`, evitando que el pipe de la terminal corrompa los acentos (UTF-8). También se omitió la minificación agresiva para archivos `.md`, previniendo que se rompa la estructura de los listados y cabeceras Markdown durante la compresión.
- **Context Compressor**: Ampliada la utilidad con un nuevo módulo `merge_docs.js` que unifica múltiples archivos `.md` en uno solo de forma segura. Extrae los encabezados para generar automáticamente un Índice de Contenidos (TOC) y comprime el markdown conservando la trazabilidad de los datos, ideal para generar versiones maestras consolidadas del Changelog y el Decision Log de todos los agentes.

### --- SOURCE: CHANGELOG_v1_compressed.md --- ###

# Midnight Club OS - Changelog (Compressed)

> Legacy entries (V1) archived to CHANGELOG_legacy_backup.md
> Only V2 Redone entries preserved below.

## V2 Redone Entries

### 2026-05-17: V2 Redone - Auditora de Consumo y P&L (Night Report)
- **Database (16_night_consumption.md virtual)**: Created tables `import_system_consumption` for raw CSV ingestion and `night_consumption` to store aggregated system consumption per SKU per Work Day.
- **ready-to-go/src/layouts/NightOpsModule.jsx**: Completely removed the "PRE-CIERRE" button and `closingNight` logic. In the new Binary Lifecycle (`open`/`closed`), `NightOpsModule` is strictly for data entry during the night, and never transitions the status to `closed`. 
- **ready-to-go/src/layouts/NightReportModule.jsx**: Refactored the entire module to serve as the definitive Financial Auditor. It now fetches workdays with both `open` and `closed` statuses. Added a robust CSV import pipeline `handleConsumptionCsv` to ingest physical bar system reports. Created the "Eficiencia de Barra" data engine that reconciles `bar_inventory` (Fsico: `stock_open` - `stock_close`) against `night_consumption` (Sistema), calculating precise unit discrepancies and their economic impact using `skus.cost_price`. The dashboard KPIs now accurately reflect "Ingresos Esperados" (system + discrepancies), "Mermas & Nmina", and dynamically factor "Faltantes de Barra" into the Net Profit calculation. Added a "CONSOLIDAR Y CERRAR" button to finalize and seal the workday (`status: closed`) when the Admin finishes the audit.
- **UI/UX Alignment (Functional Brutalism)**: Separated the "Mermas & Nmina" KPI into two distinct pillars ("Nmina Operativa" and "Mermas Stock") within the NightReport dashboard. Reduced cognitive load by replacing verbose sub-rows with clean, single-line tracking metrics. Eliminated the usage of the "error" (red) color for expected business expenses (Nmina, Costos), reserving red strictly for operational anomalies like missing stock ("Faltantes") or negative discrepancies, adhering strictly to the 'No Red in UI' design system rule.

### 2026-05-17: V2 Redone - Night Ops Staging & Parsers
- **db/15_night_ops_staging.md (Virtual)**: Created and injected the `stg_passline_tickets` and `import_gbol_facturacion` staging tables into the V2 database via Supabase CLI to fix hallucinated references. These tables are strictly required for CSV import idempotency and proper Passline ticket deduplication.
- **ready-to-go/src/layouts/NightOpsModule.jsx**: Replaced the flawed regex CSV parser with the robust `parseCsvLine` algorithm from V1 to properly handle escaped quotes in Passline exports. Modified the "Cerrar Jornada Final" button to "Pre-Cierre", removing the deprecated V1 RPC call (`admin_generate_workday_accruals`) and simply transitioning the workday to `closed` to send it to the Night Report (Auditora) module. Aligned UI to V2 Brutalism standards by removing unnecessary subheadings to reduce cognitive load and renamed the "Boletera" table to "Passline". Reverted a previous bug where `selectedWorkDay.id` was passed to `syncNightFromCsv` instead of `selectedWorkDay.work_date`, which caused the database to store the CSV records with a UUID instead of a date, resulting in 0 matches when the frontend attempted to sum the records for the UI table. Updated the Arqueo table to render `t.terminal_id` instead of the legacy `t.provider`.
- **ready-to-go/lib/gbolService.js**: Replaced the regex CSV parsing with `parseCsvLine` to ensure GBOL exports are processed safely. Confirmed the service now correctly targets the newly created `import_gbol_facturacion` table. Removed the legacy `provider` column from the `pos_terminals` select query, which was causing the `resolveTerminalId` function to throw an unhandled error and crash the import process.

### 2026-05-17: Fixing Passline CSV Imports
- **src/layouts/WorkdaysNightChief.jsx**: Refactored the CSV parsing logic for Passline imports. Replaced the flawed regex matching with a robust character-by-character CSV parser to properly handle quoted strings and delimiter variations. Implemented strict data deduplication: 'ID ticket' is used to filter out duplicate rows (re-validations), and 'ID Compra' is tracked to prevent revenue inflation by only assigning the transaction `Total` to the first ticket of the purchase, ensuring `useNightReport.js` calculates accurate net income.

### 2026-05-17: V2 Redone - NightOpsModule Porting & GBOL CSV
- **ready-to-go/src/layouts/NightOpsModule.jsx**: Refactored the module to replace mocked terminal closings with exact V1 Arqueo inline-editable tables. Ported the Passline CSV parsers (Members and General) to populate `stg_passline_tickets`. Excluded Consumo/Recaudacion parsing. Added strict "Functional Brutalism" UI/UX visual standards, implementing `flashColor` interaction feedback for all actions and `Loader2` spinners for asynchronous loads. Standardized button radii to `rounded-xl`. Fixed layout des-alignment in the main header and implemented case-insensitive checks for `work_days` status (legacy records are stored in uppercase), resolving silent failures that showed "no active workday".
- **ready-to-go/lib/gbolService.js**: Created a standalone V2 GbolService to handle ONLY offline GBOL CSV imports (Facturacion). It parses the raw CSV, normalizes terminal names, idempotently inserts into `import_gbol_facturacion`, and aggregates total `system_cash` and `system_digital` into `night_cash_closing` to power the Arqueo tables.### 2026-05-17: V2 Redone - Phase 2 (Simplificacin Operativa)
- **db/08_work_days.md**: Simplified the lifecycle constraint by logically dropping the `draft` state. New standard lifecycle is `planned` (Planning by Operativo) -> `active` (Execution unlocked by Admin) -> `closed` (Finalized by Night Ops).
- **ready-to-go/src/layouts/WorkDaysModule.jsx**: Replaced all instances of `draft` with `planned` for newly created workdays. Updated visual labels (`PLANIFICACIN`).
- **ready-to-go/src/layouts/NightOpsModule.jsx**: Removed the manual `handleOpenNight` action and the associated banner. The module now automatically unlocks CSV import and Arqueo tables whenever a workday is in `active` state, recognizing that "opening the night" is implicitly authorized by Admin approval. Added a locked banner for `planned` states waiting for Admin approval.

### 2026-05-17: V2 Redone - Phase 3 (Bar Inventory)
- **db/14_bar_inventory.md**: Created DB schema for `bar_inventory` to handle operational physical stock tracking. Added a unique constraint on `(work_day_id, sku_id)` to prevent duplication and a status field (`draft`, `locked_open`, `locked_close`) for mathematical locking logic.
- **src/layouts/BarInventoryModule.jsx**: Built a mobile-first, high-density touch module for the "Encargado de Barra". Optimized layout for nighttime operation (large +/- touch targets, 100% full width, sticky action footers). Implemented dynamic mode switching (Apertura vs Cierre) and mathematical lock prevention. Added a fix for column naming in the `work_days` query (replacing `date` and `location` with `work_date` and `event_name`) to resolve silent failures when loading jornadas.
- **src/layouts/AdminIndex.jsx & App.jsx**: Connected `BarInventoryModule` into the "LA NOCHE" Phase and flipped its status to `live`.

### 2026-05-17: V2 Redone - Master Vouchers Module
- **db/13_voucher_types.md**: Created a new database schema for `voucher_types` with the user-requested seed data (Factura A, Factura B, Factura C, Recibo X). Dropped the hardcoded `CHECK` constraint on `opening_costs.voucher_type` and replaced it with a dynamic foreign key to `voucher_types.code`.
- **src/layouts/MasterVouchersModule.jsx**: Built a new functional brutalist master module for configuring voucher types, featuring active toggles, code auto-formatting (snake_case), and slide-over editing.
- **src/layouts/PaymentsModule.jsx**: Removed hardcoded options and integrated dynamic fetching of active `voucher_types`. Connected the select dropdown directly to the database output, ensuring future voucher additions require zero code changes.
- **src/App.jsx & AdminIndex.jsx**: Registered the new master module in the routing and navigation shell.

### 2026-05-17: V2 Redone - Phase 2 Execution (Payments Module)
- **src/layouts/PaymentsModule.jsx**: Standardized the module to match the V2 Functional Brutalism design language. Implemented `try/catch` error boundaries for Supabase transactions. Added `Loader2` for loading state visualization on the submit button. Added `flashColor` visual feedback overlay (green for success, red for error) to immediately inform the user of action results without breaking the brutalist aesthetic. Fixed a data-visibility gap by modifying the query to include `draft` workdays, ensuring that costs approved during early planning phases are instantly available for the Contador to pay. Fixed a silent database constraint bug where the default `voucher_type` was set to an invalid value (`factura_c`), replacing it with `factura_b`. Expanded the main table to full-width and increased data density (`py-3.5`). Removed the top Dashboard KPIs to maximize vertical space and adhere strictly to the high-density table paradigm.
- **src/layouts/AdminIndex.jsx**: Flipped the `payments` module status from `pending` to `live`, officially activating the Phase 2 Execution block (Contador).
- **db/12_payments.md**: Updated documentation to reflect the finalized execution logic for the Payments module, highlighting its role as the 'Contador Inbox' for approved `opening_costs`.

### 2026-05-17: V2 Redone - Architecture Simplification (Receiving Removed)
- **ReceivingModule.jsx**: Completely removed the Stock Receiving module (`ReceivingModule.jsx`).
- **AdminIndex.jsx & App.jsx**: Removed all routes and references to the Receiving module.
- **migration.sql**: Appended schema updates to drop `received_qty`, `receipt_status`, `received_at`, and `received_by` columns from `stock_requests`. From now on, "Approved Stock" is immediately treated as "Received Stock" to optimize operational speed (One-Step Approval ADR).

### 2026-05-17: V2 Redone - StockRequestsModule Refactor & Financial Tracking
- **src/layouts/StockRequestsModule.jsx**: Aligned with the V2 visual standard by removing top KPIs, adding dynamic `TOTAL PROYECTADO` KPI below the table, and adjusting table layout (`max-w-5xl` removal, `py-3.5` density). Added a new column to calculate and display the real-time cost per SKU requested. Added interaction `flashColor` and `Loader2` for state feedback. Optimized the `approveAll` function to use `Promise.all` for parallel batch updates instead of a sequential loop, drastically reducing the operation time for approving large lists of SKUs.

### 2026-05-17: V2 Redone - OpeningCostsModule Refactor
- **src/layouts/OpeningCostsModule.jsx**: Aligned the interface to the V2 Functional Brutalism standard established in the Staff modules. Removed top KPI dashboard in favor of a dynamic `TOTAL APERTURA` KPI at the bottom right of the table. Removed the `max-w-5xl` table constraint, adjusted cell paddings to `py-3.5`, integrated the global `Loader2` for saving states, and implemented the `flashColor` overlay for visual feedback on successful interactions.

### 2026-05-17: V2 Redone - StaffPlanModule Financials
- **src/layouts/StaffPlanModule.jsx**: Added a real-time `COSTO` column to the table that multiplies the relevant quantity by the role's base rate. Added a `TOTAL PROYECTADO` KPI underneath the table to dynamically summarize the total staffing cost for the selected jornada.

### 2026-05-17: V2 Redone - StaffPlanModule Refactor
- **src/layouts/StaffPlanModule.jsx**: Fixed an issue where the roles dropdown failed to populate due to querying a non-existent `area` column in the `staff_roles` table. Removed the "solicitados" and "aprobados" KPIs as requested by the Operativo to simplify the view. Removed the `max-w-5xl` constraint on the table to visually align its full-width layout and cell paddings (`py-3.5`) with the Master modules standard.

### 2026-05-17: V2 Redone - WorkDaysModule Details Panel
- **src/layouts/WorkDaysModule.jsx**: Implemented the "Ver Detalles" slide-over panel. Clicking on a jornada row now correctly opens the side sheet, allowing the Operativo to view/edit the `event_name` and `notes`, or permanently delete the jornada (if in draft) and its associated costs.

### 2026-05-17: V2 Redone - UI/UX Navigation Fix (AdminIndex)
- **src/layouts/AdminIndex.jsx**: Fixed routing mapping bug. Correctly mapped the "Planificacin" section to use the `work_days` ID with label 'Jornadas' and the `CalendarDays` icon. Also correctly mapped the "La Noche" section to use the `workday` ID with label 'Operacin Nocturna' to point to the Execution phase.

### 2026-05-17: V2 Redone - Master Modules UI/UX Alignment (Staff Roles & POS)
- **src/layouts/PosTerminalsModule.jsx**: Aligned layout logic to Master Module standard. Replaced legacy `provider` field with `terminal_id` across UI and payload. Integrated full error handling (`try/catch`), real-time visual feedback (`flashColor`), optimistic UI toggling, hard delete function with `window.confirm`, and dynamic search bar.
- **db/07_pos_terminals.md**: Updated schema documentation to drop `provider` in favor of `terminal_id` mapping.
- **src/layouts/StaffRolesModule.jsx**: Aligned logic to match the Master Module standard. Integrated full error handling (`try/catch`), real-time visual feedback (`flashColor`), optimistic UI toggling, a hard delete function with `window.confirm`, and added the dynamic search bar functionality to the header block.
- **db/04_staff_roles.md & src/layouts/StaffRolesModule.jsx**: Removed hardcoded `area` categories from the frontend and the database schema to simplify the data model and align with V2 Redone standards.### 2026-05-17: V2 Redone - Module 16: Monthly Report (Auditora Mensual)
- **db/16_monthly_report.md**: Documented the approach for the monthly aggregator. Continues the "Clean State" pattern with no new tables required.
- **src/layouts/MonthlyReportModule.jsx**: Built the final Monthly Dashboard.
  - Dynamically fetches all `closed` workdays grouped by `YYYY-MM`.
  - Computes monthly sums for **Revenue**, **Costs** (Staff + Opening), and **Discrepancies**.
  - Displays a high-density breakdown table showing individual workday performance (Revenue, Costs, Discrepancies, Net Profit).
- **App.jsx & AdminIndex.jsx**: Wired up the final module in the `MENSUAL` reporting block. The complete end-to-end V2 system is now functional.

### 2026-05-17: V2 Redone - SKU Module UI Alignment
- **src/layouts/SkuModule.jsx**: Aligned the header and container structure to match the standard layout of Master modules (like `ProfilesModule` and `SuppliersModule`). Converted to the `h-full flex relative` shell, replacing the legacy two-panel split, and unified the search and create button layout into a single top-right action bar.### 2026-05-17: V2 Redone - Module 15: Night Report (Auditora Financiera Lunes)
- **db/15_night_report.md**: Documented the read-only dashboard approach for the Night Report. No new tables are required.
- **src/layouts/NightReportModule.jsx**: Built the Auditora Financiera dashboard for closed workdays.
  - Dynamically calculates **Ingresos POS** from `night_sales`.
  - Calculates **Diferencias de Caja** from `night_cash_closing`.
  - Aggregates **Costos de Apertura** (Paid & Pending).
  - Calculates **Nmina (Staff)** dynamically by joining `staff_plan` with `staff_roles.base_rate`.
  - Real-time computation of **Net Profit (Break Even)**.
- **App.jsx & AdminIndex.jsx**: Wired up the first module in the `LUNES` reporting block.

### 2026-05-17: V2 Redone - Module 14: Night Operations (Auditora / Sbado)
- **db/14_night_ops.md**: Documented the simplified architecture for the Night Operations block. Flattened V1's complex accrual triggers.
- **migration.sql**: Created `night_sales` to log POS entries, and `night_cash_closing` with generated delta columns (`diff_cash`, `diff_digital`) for per-terminal reconciliation.
- **src/layouts/NightOpsModule.jsx**: Built the Operacin Nocturna dashboard. Features:
  - "Abrir Jornada" to transition from `planned` to `active`.
  - Import simulation for `night_sales` to populate system totals.
  - Per-terminal cash closing Slide-Over to capture declared values vs system values.
  - Hard lock: "Cerrar Jornada Final", which updates the Work Day status to `closed`, sealing the night for financial reporting.
- **App.jsx & AdminIndex.jsx**: Wired up the first module in the `SBADO` execution block.

### 2026-05-17: V2 Redone - Module 13: Receiving (Recepcin de Stock)
- **db/13_receiving.md**: Decided against a 1-to-1 `stock_receipts` table. Flattened the schema by extending `stock_requests`.
- **migration.sql**: Added `received_qty`, `receipt_status`, and tracking fields to `stock_requests`.
- **src/layouts/ReceivingModule.jsx**: Built UI for physical stock validation. Operativos can confirm expected quantities or register ad-hoc (unplanned) entries, immediately flagging discrepancies.
- **App.jsx & AdminIndex.jsx**: Wired up the second module in the `EJECUCIN` block.

### 2026-05-17: V2 Redone - Module 12: Payments (Contabilidad)
- **db/12_payments.md**: Documented the payment execution flow. Note: Uses the existing `opening_costs` table.
- **src/layouts/PaymentsModule.jsx**: Built UI for the execution phase, filtering `approved` opening costs and allowing the Contador to mark them as `paid` while capturing `payment_method` and `voucher_type`.
- **App.jsx & AdminIndex.jsx**: Wired up the first module in the `EJECUCIN` block.

### 2026-05-17: V2 Redone - Module 10 & 11: Staff Plan & Stock Requests
- **db/10_staff_plan.md & 11_stock_requests.md**: Created DB documentation and schemas for planning staff headcount and inventory items.
- **migration.sql**: Executed migration to add `staff_plan` and `stock_requests` tables, linked via cascade to `work_days`.
- **src/layouts/StaffPlanModule.jsx**: Built UI for requesting roles and capturing Admin headcount approvals.
- **src/layouts/StockRequestsModule.jsx**: Built UI for requesting SKUs and capturing Admin inventory approvals.
- **App.jsx & AdminIndex.jsx**: Wired up both modules to finalize the `PLANIFICACIN` block.

### 2026-05-17: V2 Redone - Module 08 & 09: Work Days & Opening Costs
- **db/08_work_days.md & 09_opening_costs.md**: Created DB documentation and SQL schemas for `work_days` and `opening_costs`.
- **migration.sql**: Executed migration successfully to build the core planning tables.
- **src/layouts/WorkDaysModule.jsx**: Built UI for listing Work Days and initiating the planning flow. 
  - *Logic Check*: Opening a Work Day automatically clones active `cost_templates` into `opening_costs`.
- **src/layouts/OpeningCostsModule.jsx**: Built UI for the Operativo to manage, edit, and approve opening costs tied to a specific Work Day.
- **App.jsx & AdminIndex.jsx**: Wired up both modules, registering them under the `PLANIFICACIN` block.

### 2026-05-17: V2 Redone - Module 07: POS Terminals
- **ready-to-go/db/07_pos_terminals.md**: Created DB documentation and SQL schema for `pos_terminals`.
- **ready-to-go/src/layouts/PosTerminalsModule.jsx**: Built UI for CRUD of POS terminals using Brutalist patterns.
- **migration.sql**: Executed migration successfully via Supabase CLI (`--linked`).
- **ready-to-go/src/App.jsx & AdminIndex.jsx**: Wired up and activated the `pos_terminals` module.

### 2026-05-17: V2 Redone - Module 05: Cost Templates
- **ready-to-go/db/05_cost_templates.md**: Created DB documentation and SQL schema for `cost_templates`.
- **ready-to-go/src/layouts/CostTemplatesModule.jsx**: Built UI for CRUD of default recurring costs, with foreign key mapping to suppliers.
- **migration.sql**: Executed migration successfully via Supabase CLI (`--linked`).
- **ready-to-go/src/App.jsx & AdminIndex.jsx**: Wired up and activated the `cost_templates` module.

### 2026-05-17: V2 Redone - Module 04: Staff Roles
- **ready-to-go/db/04_staff_roles.md**: Created DB documentation and SQL schema for `staff_roles`.
- **ready-to-go/src/layouts/StaffRolesModule.jsx**: Built UI for role CRUD using "Functional Brutalism" constraints, slide-over panels, and category-colored badges.
- **ready-to-go/src/App.jsx**: Wired up `staff_roles` route.
- **ready-to-go/src/layouts/AdminIndex.jsx**: Activated `staff_roles` module status to live.

### 2026-05-17: V2 Redone - Supabase Migration Execution
- **ready-to-go/db/02_suppliers.md & 03_sku.md**: Executed SQL migrations via Supabase CLI (`--linked`) directly to the `vabekvkijcvbyqvrxrss` remote project using an updated access token, bypassing local MCP connection issues. Tables are now live. Documentation updated to reflect successful execution.

### 2026-05-17: V2 Redone - Improvements to SuppliersModule
- **ready-to-go/src/layouts/SuppliersModule.jsx**: Refactored module based on legacy `MasterProveedores.jsx`:
  - Added a local search/filter input (`searchQuery`) for quick data retrieval.
  - Implemented semantic grouping in the Slide-Over Modal (Identidad Legal, Contacto, Finanzas y Operaciones) to reduce cognitive load and organize the form fields.
  - Integrated `Loader2` and a Flash Feedback Overlay (`triggerFlash`) to handle loading states and display success/error notifications visually without breaking the brutalist aesthetic.
  - Hardened error handling in Supabase API calls (`fetchSuppliers`, `handleSave`, `toggleActive`).
  - **DB Schema & UI Update**: Added `bank_name` (Entidad Bancaria) column to the `suppliers` table via remote SQL execution and updated the Slide-Over Modal to include this field alongside `bank_alias`.
  - **DB Schema Update (Category Drop)**: Dropped the `category` column from `suppliers` table completely as requested.
  - **UI Update (Category Drop & Banco Addition)**: Removed the category field from the slide-over modal, payload, and the main data table grid. Replaced the `CATEGORA` column in the data table with a new `BANCO` column displaying the `bank_name` value.
  - **UX Improvement (Cognitive Load Reduction)**: Flattened the Slide-Over Modal structure. Removed redundant section headers, borders, and icons, opting for a clean, cohesive, density-focused layout by leveraging implicit field grouping (e.g., Contacto and Telfono side by side).
  - **Hard Delete Functionality**: Added a "Trash" button in the Slide-Over Modal footer (visible only when editing) to allow permanent deletion of a supplier, complete with confirmation prompt and loading states.

### 2026-05-17: V2 Redone - Improvements to SkuModule
- **ready-to-go/src/layouts/SkuModule.jsx**: Upgraded module based on UX and security standards defined in SuppliersModule:
  - **UX/Visual Feedback**: Integrated `flashColor` state and overlay (`triggerFlash`) to instantly inform users of success or failure.
  - **Optimistic UI**: Modifying the active status of an SKU now updates local state immediately instead of waiting for a full `fetchData()` cycle.
  - **Error Handling Safety**: Replaced unsafe `if (error)` flows with robust `try/catch` blocks in all Supabase API calls.
  - **Hard Delete Functionality**: Added `Trash2` button to the editing slide-over to permanently remove mistakenly created SKUs.
  - **Visual Polish**: Added `Loader2` spinner to the save button to indicate background activity.

### 2026-05-17: V2 Redone  Module 01: Profiles + PIN Auth
- **Supabase**: Created new project 'Redone' (ID: vabekvkijcvbyqvrxrss) in MidnighuClub_Org, region sa-east-1.
- **Migration**: create_profiles  single profiles table with PIN-based auth (no RLS, no Supabase Auth).
- **Seed data**: Admin user (PIN: 1234) inserted.
- **Files created**:
  - eady-to-go/db/01_profiles.md  Module documentation.
  - eady-to-go/lib/supabase.js  New Supabase client.
  - eady-to-go/.env.local  New project credentials.

### 2026-05-17: V2 Redone  Admin Shell + PIN Login + Module Index
- **ready-to-go/src/App.jsx**: V2 App shell with PIN auth context, top bar (brand + role badge + avatar dropdown), and router switch with commented placeholders for all 14 future modules.
- **ready-to-go/src/contexts/AuthContext.jsx**: PIN-based auth via profiles.pin lookup. No Supabase Auth, no JWT, no RLS.
- **ready-to-go/src/layouts/Login.jsx**: Minimal PIN login screen. Numeric input, password masked, auto-focus.
- **ready-to-go/src/layouts/AdminIndex.jsx**: Module map organized by 5 operational phases (Masters, Planificacion, Ejecucion, La Noche, Reportes). Status dots (live/wip/pending). Only live modules are clickable.
- **ready-to-go/src/layouts/ProfilesModule.jsx**: Full CRUD for team profiles with slide-over panel. Role selector, PIN field, active toggle.
- **ready-to-go/src/index.css**: V2 design tokens (added brand-card, brand-accent, brand-warning, JetBrains Mono).
- **index.html**: Entry point switched to ready-to-go/src/main.jsx.
- **.env.local**: Root env updated to Redone project credentials.

### 2026-05-17: V2 Redone  Module 02: Suppliers
- **ready-to-go/db/02_suppliers.md**: Created DB documentation and SQL schema for suppliers. Includes CHECK constraints for categories ('bar', 'limpieza', etc.).
- **ready-to-go/src/layouts/SuppliersModule.jsx**: Built UI for supplier CRUD. Slide-over panel for create/edit.
- **ready-to-go/src/App.jsx**: Wired up suppliers route.
- **ready-to-go/src/layouts/AdminIndex.jsx**: Flipped suppliers module status to live.

### 2026-05-17: V2 Redone - Module 03: SKU Catalog
- **ready-to-go/db/03_sku.md**: Created DB documentation and SQL schema for SKUs. Includes CHECK constraints for categories and FK to suppliers.
- **ready-to-go/src/layouts/SkuModule.jsx**: Built UI for SKU CRUD following functional brutalist design. Added slide-over panel for create/edit.
- **ready-to-go/src/App.jsx**: Wired up SKU route.
- **ready-to-go/src/layouts/AdminIndex.jsx**: Flipped SKU module status to live.

### 2026-05-17: V2 Redone - Supabase Migration Execution
- **ready-to-go/db/02_suppliers.md & 03_sku.md**: Executed SQL migrations via Supabase CLI (`--linked`) directly to the `vabekvkijcvbyqvrxrss` remote project using an updated access token, bypassing local MCP connection issues. Tables are now live. Documentation updated to reflect successful execution.
- **BarInventoryModule.jsx**: Se corrigieron los nombres de las columnas en la consulta de 'work_days' (cambiando 'date' y 'location' por 'work_date' y 'event_name') lo que causaba que la carga de jornadas fallara de forma silenciosa y mostrara siempre 'Sin jornadas activas'.

### 2026-05-17: V2 Redone - Phase 2.5: Binary Operations Migration
- **db/08_work_days.md**: Updated schema and executed SQL to change status enum to just 'open', 'closed', 'cancelled', migrating existing rows from 'draft', 'planned', 'active' to 'open'.
- **WorkDaysModule.jsx**: Insert default status to 'open'.
- **StaffPlanModule.jsx**: Removed admin 'approveAll' requirement. Fetch open/closed statuses. Made fully read/write while 'open'.
- **OpeningCostsModule.jsx**: Removed internal 'approved' status and 'approveAll'. Lock entirely if work day is 'closed'.
- **BarInventoryModule.jsx**: Refactored to remove internal lock statuses. Entire module is editable while day is 'open'.
- **NightOpsModule.jsx**: Adapted to use 'open'/'closed' binary lifecycle, removing intermediate states.

### 2026-05-17 - SKU Mapping and CSV Import Resilience Update
- **Feature**: Added system_id to skus table and SkuModule.jsx to map custom POS IDs.
- **Feature**: Upgraded CSV import in NightReportModule.jsx to support matching by both system_id (e.g. from 'articulo') and string 
ame, prioritizing ID matches for perfect mapping accuracy without relying strictly on text.

### 2026-05-17 - Bulk SKU Import
- **Database**: Imported 16 operational SKUs directly from \CONSUMO BARRAS 24_01 2026.csv\ into the \skus\ table, assigning their respective \system_id\ values (e.g., Speed Lata -> 18, Absolut -> 30) to establish a perfect reconciliation baseline.

### 2026-05-17 - Auditory Calculation Fix
- **NightReportModule**: Inverted the difference calculation logic in the Eficiencia de Barra table. \Diferencia = Sistema - Fsico\ as requested, labeling positive values as FALTANTE (Red). However, P&L penalization remains strictly bound to physical loss (\Fsico > Sistema\) to prevent false operational losses.

### --- SOURCE: CHANGELOG_legacy_backup.md --- ###

# Midnight Club OS - Changelog

All significant code, logic, and UI changes must be logged here chronologically.

## [Unreleased]

### 2026-05-17: V2 Redone - Auditoría de Consumo y P&L (Night Report)
- **Database (16_night_consumption.md virtual)**: Created tables `import_system_consumption` for raw CSV ingestion and `night_consumption` to store aggregated system consumption per SKU per Work Day.
- **ready-to-go/src/layouts/NightOpsModule.jsx**: Completely removed the "PRE-CIERRE" button and `closingNight` logic. In the new Binary Lifecycle (`open`/`closed`), `NightOpsModule` is strictly for data entry during the night, and never transitions the status to `closed`. 
- **ready-to-go/src/layouts/NightReportModule.jsx**: Refactored the entire module to serve as the definitive Financial Auditor. It now fetches workdays with both `open` and `closed` statuses. Added a robust CSV import pipeline `handleConsumptionCsv` to ingest physical bar system reports. Created the "Eficiencia de Barra" data engine that reconciles `bar_inventory` (Físico: `stock_open` - `stock_close`) against `night_consumption` (Sistema), calculating precise unit discrepancies and their economic impact using `skus.cost_price`. The dashboard KPIs now accurately reflect "Ingresos Esperados" (system + discrepancies), "Mermas & Nómina", and dynamically factor "Faltantes de Barra" into the Net Profit calculation. Added a "CONSOLIDAR Y CERRAR" button to finalize and seal the workday (`status: closed`) when the Admin finishes the audit.
- **UI/UX Alignment (Functional Brutalism)**: Separated the "Mermas & Nómina" KPI into two distinct pillars ("Nómina Operativa" and "Mermas Stock") within the NightReport dashboard. Reduced cognitive load by replacing verbose sub-rows with clean, single-line tracking metrics. Eliminated the usage of the "error" (red) color for expected business expenses (Nómina, Costos), reserving red strictly for operational anomalies like missing stock ("Faltantes") or negative discrepancies, adhering strictly to the 'No Red in UI' design system rule.

### 2026-05-17: V2 Redone - Night Ops Staging & Parsers
- **db/15_night_ops_staging.md (Virtual)**: Created and injected the `stg_passline_tickets` and `import_gbol_facturacion` staging tables into the V2 database via Supabase CLI to fix hallucinated references. These tables are strictly required for CSV import idempotency and proper Passline ticket deduplication.
- **ready-to-go/src/layouts/NightOpsModule.jsx**: Replaced the flawed regex CSV parser with the robust `parseCsvLine` algorithm from V1 to properly handle escaped quotes in Passline exports. Modified the "Cerrar Jornada Final" button to "Pre-Cierre", removing the deprecated V1 RPC call (`admin_generate_workday_accruals`) and simply transitioning the workday to `closed` to send it to the Night Report (Auditoría) module. Aligned UI to V2 Brutalism standards by removing unnecessary subheadings to reduce cognitive load and renamed the "Boletería" table to "Passline". Reverted a previous bug where `selectedWorkDay.id` was passed to `syncNightFromCsv` instead of `selectedWorkDay.work_date`, which caused the database to store the CSV records with a UUID instead of a date, resulting in 0 matches when the frontend attempted to sum the records for the UI table. Updated the Arqueo table to render `t.terminal_id` instead of the legacy `t.provider`.
- **ready-to-go/lib/gbolService.js**: Replaced the regex CSV parsing with `parseCsvLine` to ensure GBOL exports are processed safely. Confirmed the service now correctly targets the newly created `import_gbol_facturacion` table. Removed the legacy `provider` column from the `pos_terminals` select query, which was causing the `resolveTerminalId` function to throw an unhandled error and crash the import process.
### 2026-05-17: Fixing Passline CSV Imports
- **src/layouts/WorkdaysNightChief.jsx**: Refactored the CSV parsing logic for Passline imports. Replaced the flawed regex matching with a robust character-by-character CSV parser to properly handle quoted strings and delimiter variations. Implemented strict data deduplication: 'ID ticket' is used to filter out duplicate rows (re-validations), and 'ID Compra' is tracked to prevent revenue inflation by only assigning the transaction `Total` to the first ticket of the purchase, ensuring `useNightReport.js` calculates accurate net income.

### 2026-05-17: V2 Redone - NightOpsModule Porting & GBOL CSV
- **ready-to-go/src/layouts/NightOpsModule.jsx**: Refactored the module to replace mocked terminal closings with exact V1 Arqueo inline-editable tables. Ported the Passline CSV parsers (Members and General) to populate `stg_passline_tickets`. Excluded Consumo/Recaudacion parsing. Added strict "Functional Brutalism" UI/UX visual standards, implementing `flashColor` interaction feedback for all actions and `Loader2` spinners for asynchronous loads. Standardized button radii to `rounded-xl`. Fixed layout des-alignment in the main header and implemented case-insensitive checks for `work_days` status (legacy records are stored in uppercase), resolving silent failures that showed "no active workday".
- **ready-to-go/lib/gbolService.js**: Created a standalone V2 GbolService to handle ONLY offline GBOL CSV imports (Facturacion). It parses the raw CSV, normalizes terminal names, idempotently inserts into `import_gbol_facturacion`, and aggregates total `system_cash` and `system_digital` into `night_cash_closing` to power the Arqueo tables.### 2026-05-17: V2 Redone - Phase 2 (Simplificación Operativa)
- **db/08_work_days.md**: Simplified the lifecycle constraint by logically dropping the `draft` state. New standard lifecycle is `planned` (Planning by Operativo) -> `active` (Execution unlocked by Admin) -> `closed` (Finalized by Night Ops).
- **ready-to-go/src/layouts/WorkDaysModule.jsx**: Replaced all instances of `draft` with `planned` for newly created workdays. Updated visual labels (`PLANIFICACIÓN`).
- **ready-to-go/src/layouts/NightOpsModule.jsx**: Removed the manual `handleOpenNight` action and the associated banner. The module now automatically unlocks CSV import and Arqueo tables whenever a workday is in `active` state, recognizing that "opening the night" is implicitly authorized by Admin approval. Added a locked banner for `planned` states waiting for Admin approval.

### 2026-05-17: V2 Redone - Phase 3 (Bar Inventory)
- **db/14_bar_inventory.md**: Created DB schema for `bar_inventory` to handle operational physical stock tracking. Added a unique constraint on `(work_day_id, sku_id)` to prevent duplication and a status field (`draft`, `locked_open`, `locked_close`) for mathematical locking logic.
- **src/layouts/BarInventoryModule.jsx**: Built a mobile-first, high-density touch module for the "Encargado de Barra". Optimized layout for nighttime operation (large +/- touch targets, 100% full width, sticky action footers). Implemented dynamic mode switching (Apertura vs Cierre) and mathematical lock prevention. Added a fix for column naming in the `work_days` query (replacing `date` and `location` with `work_date` and `event_name`) to resolve silent failures when loading jornadas.
- **src/layouts/AdminIndex.jsx & App.jsx**: Connected `BarInventoryModule` into the "LA NOCHE" Phase and flipped its status to `live`.

### 2026-05-17: V2 Redone - Master Vouchers Module
- **db/13_voucher_types.md**: Created a new database schema for `voucher_types` with the user-requested seed data (Factura A, Factura B, Factura C, Recibo X). Dropped the hardcoded `CHECK` constraint on `opening_costs.voucher_type` and replaced it with a dynamic foreign key to `voucher_types.code`.
- **src/layouts/MasterVouchersModule.jsx**: Built a new functional brutalist master module for configuring voucher types, featuring active toggles, code auto-formatting (snake_case), and slide-over editing.
- **src/layouts/PaymentsModule.jsx**: Removed hardcoded options and integrated dynamic fetching of active `voucher_types`. Connected the select dropdown directly to the database output, ensuring future voucher additions require zero code changes.
- **src/App.jsx & AdminIndex.jsx**: Registered the new master module in the routing and navigation shell.

### 2026-05-17: V2 Redone - Phase 2 Execution (Payments Module)
- **src/layouts/PaymentsModule.jsx**: Standardized the module to match the V2 Functional Brutalism design language. Implemented `try/catch` error boundaries for Supabase transactions. Added `Loader2` for loading state visualization on the submit button. Added `flashColor` visual feedback overlay (green for success, red for error) to immediately inform the user of action results without breaking the brutalist aesthetic. Fixed a data-visibility gap by modifying the query to include `draft` workdays, ensuring that costs approved during early planning phases are instantly available for the Contador to pay. Fixed a silent database constraint bug where the default `voucher_type` was set to an invalid value (`factura_c`), replacing it with `factura_b`. Expanded the main table to full-width and increased data density (`py-3.5`). Removed the top Dashboard KPIs to maximize vertical space and adhere strictly to the high-density table paradigm.
- **src/layouts/AdminIndex.jsx**: Flipped the `payments` module status from `pending` to `live`, officially activating the Phase 2 Execution block (Contador).
- **db/12_payments.md**: Updated documentation to reflect the finalized execution logic for the Payments module, highlighting its role as the 'Contador Inbox' for approved `opening_costs`.

### 2026-05-17: V2 Redone - Architecture Simplification (Receiving Removed)
- **ReceivingModule.jsx**: Completely removed the Stock Receiving module (`ReceivingModule.jsx`).
- **AdminIndex.jsx & App.jsx**: Removed all routes and references to the Receiving module.
- **migration.sql**: Appended schema updates to drop `received_qty`, `receipt_status`, `received_at`, and `received_by` columns from `stock_requests`. From now on, "Approved Stock" is immediately treated as "Received Stock" to optimize operational speed (One-Step Approval ADR).

### 2026-05-17: V2 Redone - StockRequestsModule Refactor & Financial Tracking
- **src/layouts/StockRequestsModule.jsx**: Aligned with the V2 visual standard by removing top KPIs, adding dynamic `TOTAL PROYECTADO` KPI below the table, and adjusting table layout (`max-w-5xl` removal, `py-3.5` density). Added a new column to calculate and display the real-time cost per SKU requested. Added interaction `flashColor` and `Loader2` for state feedback. Optimized the `approveAll` function to use `Promise.all` for parallel batch updates instead of a sequential loop, drastically reducing the operation time for approving large lists of SKUs.

### 2026-05-17: V2 Redone - OpeningCostsModule Refactor
- **src/layouts/OpeningCostsModule.jsx**: Aligned the interface to the V2 Functional Brutalism standard established in the Staff modules. Removed top KPI dashboard in favor of a dynamic `TOTAL APERTURA` KPI at the bottom right of the table. Removed the `max-w-5xl` table constraint, adjusted cell paddings to `py-3.5`, integrated the global `Loader2` for saving states, and implemented the `flashColor` overlay for visual feedback on successful interactions.

### 2026-05-17: V2 Redone - StaffPlanModule Financials
- **src/layouts/StaffPlanModule.jsx**: Added a real-time `COSTO` column to the table that multiplies the relevant quantity by the role's base rate. Added a `TOTAL PROYECTADO` KPI underneath the table to dynamically summarize the total staffing cost for the selected jornada.

### 2026-05-17: V2 Redone - StaffPlanModule Refactor
- **src/layouts/StaffPlanModule.jsx**: Fixed an issue where the roles dropdown failed to populate due to querying a non-existent `area` column in the `staff_roles` table. Removed the "solicitados" and "aprobados" KPIs as requested by the Operativo to simplify the view. Removed the `max-w-5xl` constraint on the table to visually align its full-width layout and cell paddings (`py-3.5`) with the Master modules standard.

### 2026-05-17: V2 Redone - WorkDaysModule Details Panel
- **src/layouts/WorkDaysModule.jsx**: Implemented the "Ver Detalles" slide-over panel. Clicking on a jornada row now correctly opens the side sheet, allowing the Operativo to view/edit the `event_name` and `notes`, or permanently delete the jornada (if in draft) and its associated costs.

### 2026-05-17: V2 Redone - UI/UX Navigation Fix (AdminIndex)
- **src/layouts/AdminIndex.jsx**: Fixed routing mapping bug. Correctly mapped the "Planificación" section to use the `work_days` ID with label 'Jornadas' and the `CalendarDays` icon. Also correctly mapped the "La Noche" section to use the `workday` ID with label 'Operación Nocturna' to point to the Execution phase.

### 2026-05-17: V2 Redone - Master Modules UI/UX Alignment (Staff Roles & POS)
- **src/layouts/PosTerminalsModule.jsx**: Aligned layout logic to Master Module standard. Replaced legacy `provider` field with `terminal_id` across UI and payload. Integrated full error handling (`try/catch`), real-time visual feedback (`flashColor`), optimistic UI toggling, hard delete function with `window.confirm`, and dynamic search bar.
- **db/07_pos_terminals.md**: Updated schema documentation to drop `provider` in favor of `terminal_id` mapping.
- **src/layouts/StaffRolesModule.jsx**: Aligned logic to match the Master Module standard. Integrated full error handling (`try/catch`), real-time visual feedback (`flashColor`), optimistic UI toggling, a hard delete function with `window.confirm`, and added the dynamic search bar functionality to the header block.
- **db/04_staff_roles.md & src/layouts/StaffRolesModule.jsx**: Removed hardcoded `area` categories from the frontend and the database schema to simplify the data model and align with V2 Redone standards.### 2026-05-17: V2 Redone - Module 16: Monthly Report (Auditoría Mensual)
- **db/16_monthly_report.md**: Documented the approach for the monthly aggregator. Continues the "Clean State" pattern with no new tables required.
- **src/layouts/MonthlyReportModule.jsx**: Built the final Monthly Dashboard.
  - Dynamically fetches all `closed` workdays grouped by `YYYY-MM`.
  - Computes monthly sums for **Revenue**, **Costs** (Staff + Opening), and **Discrepancies**.
  - Displays a high-density breakdown table showing individual workday performance (Revenue, Costs, Discrepancies, Net Profit).
- **App.jsx & AdminIndex.jsx**: Wired up the final module in the `MENSUAL` reporting block. The complete end-to-end V2 system is now functional.

### 2026-05-17: V2 Redone - SKU Module UI Alignment
- **src/layouts/SkuModule.jsx**: Aligned the header and container structure to match the standard layout of Master modules (like `ProfilesModule` and `SuppliersModule`). Converted to the `h-full flex relative` shell, replacing the legacy two-panel split, and unified the search and create button layout into a single top-right action bar.### 2026-05-17: V2 Redone - Module 15: Night Report (Auditoría Financiera Lunes)
- **db/15_night_report.md**: Documented the read-only dashboard approach for the Night Report. No new tables are required.
- **src/layouts/NightReportModule.jsx**: Built the Auditoría Financiera dashboard for closed workdays.
  - Dynamically calculates **Ingresos POS** from `night_sales`.
  - Calculates **Diferencias de Caja** from `night_cash_closing`.
  - Aggregates **Costos de Apertura** (Paid & Pending).
  - Calculates **Nómina (Staff)** dynamically by joining `staff_plan` with `staff_roles.base_rate`.
  - Real-time computation of **Net Profit (Break Even)**.
- **App.jsx & AdminIndex.jsx**: Wired up the first module in the `LUNES` reporting block.

### 2026-05-17: V2 Redone - Module 14: Night Operations (Auditoría / Sábado)
- **db/14_night_ops.md**: Documented the simplified architecture for the Night Operations block. Flattened V1's complex accrual triggers.
- **migration.sql**: Created `night_sales` to log POS entries, and `night_cash_closing` with generated delta columns (`diff_cash`, `diff_digital`) for per-terminal reconciliation.
- **src/layouts/NightOpsModule.jsx**: Built the Operación Nocturna dashboard. Features:
  - "Abrir Jornada" to transition from `planned` to `active`.
  - Import simulation for `night_sales` to populate system totals.
  - Per-terminal cash closing Slide-Over to capture declared values vs system values.
  - Hard lock: "Cerrar Jornada Final", which updates the Work Day status to `closed`, sealing the night for financial reporting.
- **App.jsx & AdminIndex.jsx**: Wired up the first module in the `SÁBADO` execution block.

### 2026-05-17: V2 Redone - Module 13: Receiving (Recepción de Stock)
- **db/13_receiving.md**: Decided against a 1-to-1 `stock_receipts` table. Flattened the schema by extending `stock_requests`.
- **migration.sql**: Added `received_qty`, `receipt_status`, and tracking fields to `stock_requests`.
- **src/layouts/ReceivingModule.jsx**: Built UI for physical stock validation. Operativos can confirm expected quantities or register ad-hoc (unplanned) entries, immediately flagging discrepancies.
- **App.jsx & AdminIndex.jsx**: Wired up the second module in the `EJECUCIÓN` block.

### 2026-05-17: V2 Redone - Module 12: Payments (Contabilidad)
- **db/12_payments.md**: Documented the payment execution flow. Note: Uses the existing `opening_costs` table.
- **src/layouts/PaymentsModule.jsx**: Built UI for the execution phase, filtering `approved` opening costs and allowing the Contador to mark them as `paid` while capturing `payment_method` and `voucher_type`.
- **App.jsx & AdminIndex.jsx**: Wired up the first module in the `EJECUCIÓN` block.

### 2026-05-17: V2 Redone - Module 10 & 11: Staff Plan & Stock Requests
- **db/10_staff_plan.md & 11_stock_requests.md**: Created DB documentation and schemas for planning staff headcount and inventory items.
- **migration.sql**: Executed migration to add `staff_plan` and `stock_requests` tables, linked via cascade to `work_days`.
- **src/layouts/StaffPlanModule.jsx**: Built UI for requesting roles and capturing Admin headcount approvals.
- **src/layouts/StockRequestsModule.jsx**: Built UI for requesting SKUs and capturing Admin inventory approvals.
- **App.jsx & AdminIndex.jsx**: Wired up both modules to finalize the `PLANIFICACIÓN` block.

### 2026-05-17: V2 Redone - Module 08 & 09: Work Days & Opening Costs
- **db/08_work_days.md & 09_opening_costs.md**: Created DB documentation and SQL schemas for `work_days` and `opening_costs`.
- **migration.sql**: Executed migration successfully to build the core planning tables.
- **src/layouts/WorkDaysModule.jsx**: Built UI for listing Work Days and initiating the planning flow. 
  - *Logic Check*: Opening a Work Day automatically clones active `cost_templates` into `opening_costs`.
- **src/layouts/OpeningCostsModule.jsx**: Built UI for the Operativo to manage, edit, and approve opening costs tied to a specific Work Day.
- **App.jsx & AdminIndex.jsx**: Wired up both modules, registering them under the `PLANIFICACIÓN` block.

### 2026-05-17: V2 Redone - Module 07: POS Terminals
- **ready-to-go/db/07_pos_terminals.md**: Created DB documentation and SQL schema for `pos_terminals`.
- **ready-to-go/src/layouts/PosTerminalsModule.jsx**: Built UI for CRUD of POS terminals using Brutalist patterns.
- **migration.sql**: Executed migration successfully via Supabase CLI (`--linked`).
- **ready-to-go/src/App.jsx & AdminIndex.jsx**: Wired up and activated the `pos_terminals` module.

### 2026-05-17: V2 Redone - Module 05: Cost Templates
- **ready-to-go/db/05_cost_templates.md**: Created DB documentation and SQL schema for `cost_templates`.
- **ready-to-go/src/layouts/CostTemplatesModule.jsx**: Built UI for CRUD of default recurring costs, with foreign key mapping to suppliers.
- **migration.sql**: Executed migration successfully via Supabase CLI (`--linked`).
- **ready-to-go/src/App.jsx & AdminIndex.jsx**: Wired up and activated the `cost_templates` module.

### 2026-05-17: V2 Redone - Module 04: Staff Roles
- **ready-to-go/db/04_staff_roles.md**: Created DB documentation and SQL schema for `staff_roles`.
- **ready-to-go/src/layouts/StaffRolesModule.jsx**: Built UI for role CRUD using "Functional Brutalism" constraints, slide-over panels, and category-colored badges.
- **ready-to-go/src/App.jsx**: Wired up `staff_roles` route.
- **ready-to-go/src/layouts/AdminIndex.jsx**: Activated `staff_roles` module status to live.

### 2026-05-17: V2 Redone - Supabase Migration Execution
- **ready-to-go/db/02_suppliers.md & 03_sku.md**: Executed SQL migrations via Supabase CLI (`--linked`) directly to the `vabekvkijcvbyqvrxrss` remote project using an updated access token, bypassing local MCP connection issues. Tables are now live. Documentation updated to reflect successful execution.

### 2026-05-17: V2 Redone - Improvements to SuppliersModule
- **ready-to-go/src/layouts/SuppliersModule.jsx**: Refactored module based on legacy `MasterProveedores.jsx`:
  - Added a local search/filter input (`searchQuery`) for quick data retrieval.
  - Implemented semantic grouping in the Slide-Over Modal (Identidad Legal, Contacto, Finanzas y Operaciones) to reduce cognitive load and organize the form fields.
  - Integrated `Loader2` and a Flash Feedback Overlay (`triggerFlash`) to handle loading states and display success/error notifications visually without breaking the brutalist aesthetic.
  - Hardened error handling in Supabase API calls (`fetchSuppliers`, `handleSave`, `toggleActive`).
  - **DB Schema & UI Update**: Added `bank_name` (Entidad Bancaria) column to the `suppliers` table via remote SQL execution and updated the Slide-Over Modal to include this field alongside `bank_alias`.
  - **DB Schema Update (Category Drop)**: Dropped the `category` column from `suppliers` table completely as requested.
  - **UI Update (Category Drop & Banco Addition)**: Removed the category field from the slide-over modal, payload, and the main data table grid. Replaced the `CATEGORÍA` column in the data table with a new `BANCO` column displaying the `bank_name` value.
  - **UX Improvement (Cognitive Load Reduction)**: Flattened the Slide-Over Modal structure. Removed redundant section headers, borders, and icons, opting for a clean, cohesive, density-focused layout by leveraging implicit field grouping (e.g., Contacto and Teléfono side by side).
  - **Hard Delete Functionality**: Added a "Trash" button in the Slide-Over Modal footer (visible only when editing) to allow permanent deletion of a supplier, complete with confirmation prompt and loading states.

### 2026-05-17: V2 Redone - Improvements to SkuModule
- **ready-to-go/src/layouts/SkuModule.jsx**: Upgraded module based on UX and security standards defined in SuppliersModule:
  - **UX/Visual Feedback**: Integrated `flashColor` state and overlay (`triggerFlash`) to instantly inform users of success or failure.
  - **Optimistic UI**: Modifying the active status of an SKU now updates local state immediately instead of waiting for a full `fetchData()` cycle.
  - **Error Handling Safety**: Replaced unsafe `if (error)` flows with robust `try/catch` blocks in all Supabase API calls.
  - **Hard Delete Functionality**: Added `Trash2` button to the editing slide-over to permanently remove mistakenly created SKUs.
  - **Visual Polish**: Added `Loader2` spinner to the save button to indicate background activity.

### Nuevo MÃ³dulo: Master Pagos (2026-05-17)
- **MasterPagos.jsx**: CreaciÃ³n del nuevo layout para la configuraciÃ³n de obligaciones financieras, siguiendo la arquitectura de Fase 4.2.
  - ImplementaciÃ³n de 3 tabs: "Costos Noche" (`finance_opening_cost_defs`), "Costos Mensuales" (`cost_definitions`) y "ParÃ¡metros" (`payment_categories` / `payment_methods`).
  - **LÃ³gica de Datos**: Se excluyen los costos con `frequency = 'per_event'` de la vista de Costos Mensuales, dejÃ¡ndola exclusivamente para obligaciones periÃ³dicas (`monthly`, `quarterly`, `semestral`, `annual`).
  - **RefactorizaciÃ³n de UI**: Se eliminaron del layout los campos redundantes o sin uso activo (`category`, `due_day`, `amount_mode`) para maximizar la legibilidad. Se implementÃ³ funcionalidad de "Eliminar Regla" (`handleDelete`) en la tabla.
  - Reemplazo del patrÃ³n legacy de "Inline Editing" por "Slide-Over Modals" absolutos a la derecha, respetando las directrices de interfaz de Midnight Club ERP.
  - Registro del nuevo layout en el sub-navegador `MASTERS` de `App.jsx`.

### Workdays - Correcciones de Cierre y P&L (2026-05-16)

- **WorkdaysNightChief.jsx**: Se solucionÃƒÂ³ un bug en la operaciÃƒÂ³n "Cierre Final" donde el guardado del cierre de caja (`cash_closings`) fallaba con un error de restricciÃƒÂ³n ÃƒÂºnica `cash_closings_event_date_key`. La instrucciÃƒÂ³n `.insert()` fue reemplazada por un `.upsert(..., { onConflict: 'event_date' })` para garantizar que la acciÃƒÂ³n sea idempotente y evitar bloqueos en el cierre de jornada.
- **WorkdaysBreakEven.jsx**: Agregada la tabla de "Eficiencia de Barra" al estado de resultados. Esta tabla cruza el consumo teÃƒÂ³rico (CSV cargado por el Night Chief) contra el consumo fÃƒÂ­sico real (`Apertura - Cierre` cargado por el Encargado de Barra) para cada SKU. Calcula la "Diferencia" (Faltantes/Sobrantes) y su consecuente "Impacto Financiero" multiplicando la desviaciÃƒÂ³n por el costo del producto, presentÃƒÂ¡ndolo bajo las estrictas directrices de Brutalismo Funcional sin uso indebido del color rojo.
- **TabInventario.jsx**: Se agregÃƒÂ³ un filtro `.in('categoria_id', [...])` a la consulta de Supabase para que el mÃƒÂ³dulo del encargado solo muestre productos de las categorÃƒÂ­as "Bebidas" e "Insumo Barra", excluyendo el resto del catÃƒÂ¡logo (insumos de oficina, limpieza, caja) para mantener la vista operativa limpia.
- **Database (`master_sku`)**: Se ejecutÃƒÂ³ un `UPDATE` masivo para reasignar todos los 58 productos del catÃƒÂ¡logo a la categorÃƒÂ­a "Bebidas" (`92efbbc7-5dea-40d2-9d2f-86665703a759`), unificando la vista en Master SKU a peticiÃƒÂ³n de operaciones.
- **App.jsx**: Inyectadas correctamente las rutas de `MasterVouchersModule` y `BarInventoryModule` en el switch principal del enrutador.
- **Base de Datos (Supabase CLI)**: Ejecutada remotamente la migración SQL para crear la tabla `bar_inventory`. Se retiró el trigger de auto-actualización que llamaba a la función `handle_updated_at` (que es propia de V1 y no existe en V2 Redone) para evitar errores fatales de creación en la base de datos de producción.
- **TabInventario.jsx**: Solucionado un segundo error de Schema donde se filtraba por `is_active` en lugar de la columna real `active` en la tabla `master_sku`, permitiendo finalmente cargar el catÃƒÂ¡logo.
- **TabInventario.jsx**: Solucionado el error `TabInventario.jsx:62 Error fetching inventory data` corrigiendo la referencia a la columna de base de datos de `master_sku.name` a `master_sku.nombre`.

- **EncargadoBarra.jsx / TabInventario.jsx**: SimplificaciÃƒÂ³n radical del mÃƒÂ³dulo de inventario. Se eliminÃƒÂ³ por completo la mÃƒÂ¡quina de estados compleja (`PENDING_OPENING` -> `ACTIVE` -> `CLOSED`) y los indicadores visuales en el header.
- **TabInventario.jsx**: RediseÃƒÂ±ado como una hoja de cÃƒÂ¡lculo (spreadsheet) de alta densidad. Ahora el encargado solo visualiza el "Producto", "FÃƒÂ­sico Inicio" y "FÃƒÂ­sico Cierre" en la misma vista, permitiendo cargar ambos valores simultÃƒÂ¡neamente sin carga cognitiva ni bloqueos. La acciÃƒÂ³n "Guardar Cambios" realiza un upsert transparente usando `bar_stock_snapshots`.
- **EncargadoBarra.jsx**: Eliminada la pestaÃƒÂ±a y lÃƒÂ³gica de gestiÃƒÂ³n de "Staff" (`TabStaff.jsx`). Siguiendo la nueva arquitectura, el costo y control de nÃƒÂ³mina se asume directamente desde la planificaciÃƒÂ³n (Planner), haciendo redundante e inconsistente el control de asistencia a nivel de barra.
- **EncargadoBarra.jsx**: Solucionado un crash (ReferenceError: useEffect is not defined) que dejaba la pantalla en negro al montar el mÃƒÂ³dulo, aÃƒÂ±adiendo la importaciÃƒÂ³n faltante de `useEffect`.
- **WorkdaysNightChief.jsx**: Solucionado el error `null value in column "event_date" of relation "cash_closings"`. Se agregÃƒÂ³ `event_date: activeWorkday.work_date` al payload de inserciÃƒÂ³n durante el "Cierre Final" para respetar el constraint de la tabla.
- **WorkdaysBreakEven.jsx**: Cambiada la lÃƒÂ³gica de cÃƒÂ¡lculo del P&L. Los ingresos por Cajas Operativas (POS) ahora reflejan el "Declarado (FÃƒÂ­sico/Digital)" en lugar de la diferencia de conciliaciÃƒÂ³n. Si hay 0 declarado, el ingreso operativo es 0, independientemente de lo que diga el sistema.
- **WorkdaysBreakEven.jsx**: Los Egresos de "NÃƒÂ³mina Liquidada" ahora se calculan en base al staff planificado en el Planner multiplicÃƒÂ¡ndolo por el `base_rate` del rol (dado que aÃƒÂºn no hay un mÃƒÂ³dulo de liquidaciÃƒÂ³n en el Night Chief, se asume la planificaciÃƒÂ³n como el gasto real pagado).
- **App.jsx**: Modificada la funciÃƒÂ³n `handleNavigation` para aceptar un parÃƒÂ¡metro de `context` (ej. `{ date: '2026-05-15' }`) permitiendo inicializar vistas con estado pre-configurado.
- **WorkdaysPlanner.jsx**: Interceptado el error `23505` al intentar "Abrir Noche" cuando ya existe otra jornada abierta. Ahora consulta Supabase para recuperar la fecha de la jornada activa real y redirige automÃƒÂ¡ticamente usando `onNavigate`.
- **WorkdaysNightChief.jsx**: AÃƒÂ±adida la prop `initialDate` para inicializar el estado `selectedDate`, de forma que al ser redirigido desde el Planner, se posicione directamente en la jornada que estÃƒÂ¡ bloqueando el flujo.

### Night Chief - Flujo de Cierre Final (2026-05-10)

- **WorkdaysNightChief.jsx:** ImplementaciÃƒÂ³n del botÃƒÂ³n y workflow de "Cierre Final".
  - **Pre-Validaciones (Bloqueo):** El botÃƒÂ³n de cierre se deshabilita por defecto y solo se habilita si las tres fuentes de datos estÃƒÂ¡n importadas (`recaudacionData`, `consumoData`, y datos de Passline). Si falta alguna, se muestra un texto de advertencia detallando el faltante.
  - **Slide-Over Modal:** Se reemplazÃƒÂ³ el concepto de modal tradicional por un panel lateral (Slide-Over) respetando la directriz de Brutalismo Funcional y fondo oscuro (#0A0A0A).
  - **Cierre de Caja (`cash_closings`):** Se consolida la sumatoria de las cajas fÃƒÂ­sicas (declarado vs. sistema) y se inserta un registro ÃƒÂºnico consolidado para la jornada.
  - **Cierre Operativo (`staff_accruals`):** Se integra la llamada al RPC `admin_generate_workday_accruals` para registrar la deuda salarial del personal que trabajÃƒÂ³ la jornada, implementando tambiÃƒÂ©n un fallback por seguridad.
  - **Persistencia y Estado:** Al confirmar, se actualiza el `status` de la jornada en `work_days` a `CLOSED` y la UI se bloquea para prevenir futuras modificaciones operativas.
  - **RefactorizaciÃƒÂ³n UI:** Se movieron los botones de "Subir CSV (Fallback)" y "Sincronizar API" de la barra de acciones superior al encabezado de la tabla "Cajas Operativas (POS)", homologando el patrÃƒÂ³n visual con las otras tablas de importaciÃƒÂ³n.
  - **Bugfix (Schema Mismatch):** Se corrigiÃƒÂ³ la asignaciÃƒÂ³n de columnas en el payload de inserciÃƒÂ³n de `cash_closings`, mapeando a los campos reales de la tabla (`total_system`, `total_declared`, `total_difference`) para resolver el error de schema cache reportado por Supabase.

### Night Chief Ã¢â‚¬â€� Passline BoleterÃƒÂ­a Integration (2026-05-10)

- **WorkdaysNightChief.jsx:** Added two new Passline ticket summary tables below the POS terminals table.
  - **Passline Members:** Single-row summary showing Tickets Solicitados, Validados, and No Validados. Parsed from Passline CSV export by counting `Estado del eticket` values.
  - **Passline General:** Multi-row grouped table by `Tipo` column, showing Comprados, Validados, and No Validados per ticket type, with totals row in `tfoot`.
  - Both tables use independent CSV file inputs (no DB persistence, frontend-only parsing).
  - CSV parser handles quoted fields with commas using regex-based field splitting.
  - Layout uses `xl:grid-cols-2` responsive grid to sit side-by-side on wide monitors.
  - Empty states show ticket icon with import prompt.
  - New Lucide icons imported: `Upload`, `Ticket`, `Users`.

### Night Chief Ã¢â‚¬â€� Consumo & RecaudaciÃƒÂ³n Tables (2026-05-10)

- **WorkdaysNightChief.jsx:** Added two full-width GBOL import tables below Passline.
  - **RecaudaciÃƒÂ³n:** Columns: ArtÃƒÂ­culo, Q. Paga (units), Q. Sin Cargo (units), Total $ (pesos). Footer sums all columns.
  - **Consumo:** Columns: Producto, Cantidad (supports decimals), Costo Total $. Footer sums all columns.
  - Both parsers dynamically locate the header row by scanning first 10 lines for key column names, handling GBOL's multi-line metadata headers.
  - Totals rows in source CSVs (empty product name) are automatically skipped.
  - New Lucide icons: `ShoppingCart`, `BarChart3`.
  - **DB Persistence (FormulaMid):** Connected to legacy tables `consumption_reports`/`consumption_details` and `revenue_reports`/`revenue_details`.
  - Added `sku_name text` and `total_cost numeric` columns to `consumption_details` (migration).
  - Idempotent write: DELETE existing report for date Ã¢â€ â€™ INSERT report Ã¢â€ â€™ INSERT details.
  - `fetchNightChiefData` loads persisted data on page load by `operational_date`.

### Master Screens UI/UX Audit Ã¢â‚¬â€� Cycle 1 (2026-05-10)

- **Auth:** Removed temporary auth bypass in `App.jsx` (line 49). Login component now renders properly when no Supabase session exists.
- **Proveedores:** Added `rounded-2xl` to slide-over submit button for design system consistency.
- **SKU:** Added `rounded-2xl` to slide-over submit button.
- **NÃƒÂ³mina:** Added `rounded-2xl` to slide-over submit button. Standardized table container bg from `#0A0A0A` to `bg-brand-bg` and thead bg from `#111111` to `bg-[#0A0A0A]`. Humanized role display by stripping `STAFF_` prefix from role badges.
- **Tarifario:** Added `rounded-2xl` to slide-over submit button. Standardized table container bg to `bg-brand-bg` and thead to `bg-[#0A0A0A]`. Changed `CRÃƒï¿½TICO` note from `text-brand-error` (red) to `text-brand-muted` (grey) Ã¢â‚¬â€� red is reserved for actual errors per design rules.
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
- Created `MasterNomina.jsx` module (`MASTERS > NÃƒâ€œMINA PERSONAL`), implementing the Dual View pattern (CRUD + Grid) with a side-sheet Slide-Over absolute modal.
- Fixed Source Gap in `profiles` schema: `MasterNomina.jsx` intentionally removes `phone` and `email` properties to align perfectly with the actual Postgres Supabase columns.
- Modularized `EncargadoBarra.jsx` into `EncargadoBarraHub.jsx` orchestrating 3 sub-components (`TabStaff`, `TabReposiciones`, `TabInventario`).
- Implemented "Onboarding Express" in `TabStaff.jsx` allowing Bar Managers to create new `profiles` directly (ring-fenced by `area = BARRA`) using the newly granted RLS permissions.
- Removed "Cierre Anterior" column from `TabInventario.jsx` to clean up the UI for the Bar Manager.
- Renamed "Reposiciones" tab to "Recepciones" (`TabRecepciones.jsx`) aligning with the verified physical reception flow in `replenishment_receipts`.
- Connected `TabInventario.jsx` to real Supabase endpoints: fetching active `work_days`, creating `bar_sessions`, and inserting immutable rows into `bar_stock_snapshots` for Opening and Closing operations.
- Completed full backend persistence for `WorkdaysPlanner.jsx`: The "Confirmar & Generar QRs" action (`handleLockPlan`) now performs an atomic transaction upserting the `work_days` status to `PLANNED`, persisting the staff matrix directly into `work_day_staff_planning`, and wiping/re-inserting the fixed costs into `finance_payments` (`status: PENDING`).
- Implemented a Slide-Over Modal in `WorkdaysPlanner.jsx` for creating "Costos Ad-hoc" (exceptional costs). These are merged with recurring costs in the UI and seamlessly persisted to `finance_payments` with `source_type: 'AD_HOC'`.
- Scaffolded `WorkdaysNightChief.jsx` module as the central operational control panel (only available when a workday is `ACTIVE`). Implements a 4-KPI dashboard (Ingresos GBOL, Costos, AnomalÃƒÂ­as Stock, Health Score) and a 3-step action workflow for closing the night: GBOL Sync, RPC Accrual Generation (`admin_generate_workday_accruals`), and Final Closing (`rpc_close_work_day`).

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
- **Planner UI**: Added a brutalist-styled warning message in `WorkdaysPlanner.jsx` that dynamically appears above the action button when a previously planned date is loaded, alerting the user that confirming will overwrite existing data. Also changed the button text contextually to "Actualizar PlanificaciÃƒÂ³n".
- **UI Polish**: Updated global styling to use Plus Jakarta Sans, strict `#0A0A0A` background, and modern rounded corners for a premium Google-like feel.
- Enhanced `Configuraciones.jsx` (`Sistema & Operaciones`): Added full CRUD capabilities (Edit and Delete) for both `master_categories` (Familias de Productos) and `pos_terminals` (Terminales POS) via Slide-Over Modals, aligning with the Functional Brutalism design language.
- Fixed `WorkdaysNightChief.jsx` UI state to correctly reflect the simulated GBOL synchronization process. The "Sincronizar GBOL" action now updates the `terminals` state to inject mock `FacturaciÃƒÂ³n Sistema` values and changes the crossover status from "Esperando Datos" to "Esperando Cajero" on the data table.

- **GbolService**: Adjusted CSV header parsing to prioritize cajanom over caja to ensure successful mapping with friendly names from POS terminals.

- **WorkdaysNightChief**: Removida la inyecciÃƒÂ³n de datos mockeados (Math.random()) tras la sincronizaciÃƒÂ³n del CSV. El componente ahora recarga los datos reales de facturaciÃƒÂ³n desde Supabase.
- **GbolService**: Actualizado el parseador de CSV para detectar dinÃƒÂ¡micamente las cabeceras (ignorando las 3 lÃƒÂ­neas descriptivas iniciales de GBOL) y asÃƒÂ­ procesar exitosamente los tickets en staging.
- **Database**: MigraciÃƒÂ³n estructural a la tabla closing_terminals para incorporar work_day_id, system_digital y declared_digital para dar soporte al cierre de cajas unificado en Night Chief.

- **GbolService**: Refactorizado populateSystemAmounts para usar upsert en lugar de update. Esto asegura que los registros en closing_terminals se creen si la jornada aÃƒÂºn no tenÃƒÂ­a cierres de caja inicializados, resolviendo el problema de totales vacÃƒÂ­os (--) tras la importaciÃƒÂ³n del CSV.
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
- **Persistence (ConsolidaciÃƒÂ³n)**: Added a "Consolidar Resultado" action that securely updates the `net_result` column on the `work_days` table with the newly calculated Net Result, finalizing the night's operations.

### [2026-05-10] Workdays Planner - Refactor EstÃƒÂ©tico
- **WorkdaysPlanner.jsx**: Se cambiÃƒÂ³ la clase `rounded-md` por `rounded-xl` en el input de `staffQty` (cantidades de Staff) para unificar el lenguaje de diseÃƒÂ±o visual "Brutalismo Funcional" alineando los bordes de la UI.

### [2026-05-10] Fine Polish - Brutalismo Funcional
### [2026-05-16] UI/UX Navigation Refactor (Global Date)
- **App.jsx**: Hoisted `selectedDate` up as a `globalDate` state. This state is now passed down to the `WorkdaysPlanner`, `WorkdaysNightChief`, and `WorkdaysBreakEven` components. This allows users to select a date once and switch between the three modules without losing context.
- **SPA Efficiency**: Refactored `WorkdaysPlanner.jsx`, `WorkdaysNightChief.jsx`, and `WorkdaysBreakEven.jsx` to replace the jarring full-component unmount (`isLoading = true` replacing the whole view) with a non-destructive `isFetchingBackground` state. The UI now gracefully dims (`opacity-50`) and shows an "Actualizando..." / "Sincronizando..." indicator during data refetches, massively improving perceived performance and fulfilling the requirement of preventing the full page reload sensation.
- **WorkdaysNightChief.jsx**: Se alinearon a la derecha los botones de importaciÃƒÂ³n (CSV/API) en todas las tablas usando iconos lucide-react de tamaÃƒÂ±o estÃƒÂ¡ndar (`w-4 h-4` / `size={16}`). Se mejorÃƒÂ³ el feedback visual (hover/focus) de los inputs de ediciÃƒÂ³n en lÃƒÂ­nea para declaraciÃƒÂ³n de cajas, con bordes y bg sutiles.
- **WorkdaysBreakEven.jsx**: Mantenimiento del grid a 2 columnas. Se asegurÃƒÂ³ el uso exclusivo de `Intl.NumberFormat` para mÃƒÂ©tricas financieras. Se eliminÃƒÂ³ la dependencia visual de rojo (`text-brand-error`) para el resultado negativo (faltante) de Cajas Operativas en la columna Ingresos, reemplazÃƒÂ¡ndolo por un gris neutro (`text-brand-muted`) de acuerdo con la polÃƒÂ­tica restrictiva de "NingÃƒÂºn rojo en finanzas".

### [2026-05-16] Bugfix: Consumo de Sistema vs FÃƒÂ­sico
- **WorkdaysNightChief.jsx**: El parser del archivo CSV de "Consumo de Sistema" guardaba los registros en `consumption_details` con `sku_id = null`, insertando ÃƒÂºnicamente texto plano (`sku_name`). Se refactorizÃƒÂ³ la funciÃƒÂ³n `handleConsumoCsv` para que consulte dinÃƒÂ¡micamente la tabla `master_sku` durante la inserciÃƒÂ³n y mapee de forma proactiva cada producto a su `sku_id` correcto, asegurando la integridad referencial en la base de datos.
- **WorkdaysBreakEven.jsx**: La "Eficiencia de Barra" fallaba silenciosamente cruzando los datos porque buscaba igualdades estrictas entre IDs que eran nulos. Se implementÃƒÂ³ un "Fallback de Compatibilidad" donde los `cDetailsArray` que no tengan un `sku_id` asignado buscarÃƒÂ¡n resolverse en memoria cruzando `sku_name` contra la vista de todos los SKUs de la BD. Esto arregla inmediatamente la vista para las subidas previas sin forzar al usuario a volver a subir el CSV.
- **WorkdaysBreakEven.jsx**: Se agregÃƒÂ³ una nueva fila "Faltantes de Barra (Impacto EconÃƒÂ³mico de Diferencias)" a la tabla de Egresos Reales. Esta fila calcula automÃƒÂ¡ticamente la sumatoria de todos los impactos financieros positivos (faltantes donde el consumo fÃƒÂ­sico superÃƒÂ³ al reportado por el sistema) y lo suma dinÃƒÂ¡micamente al total de Egresos, afectando el Resultado Neto final de la jornada.

### [2026-05-16] UI/UX Navigation (Reportes)
- **App.jsx**: Se agregÃƒÂ³ un nuevo tab principal en el Top Bar llamado `REPORTE`, ubicado a la derecha de `MASTERS`. Se implementÃƒÂ³ su correspondiente sub-nav secundaria con la vista "Reportes Generales".
- **ReportesLayout.jsx**: Se creÃƒÂ³ la estructura inicial (shell) para el nuevo mÃƒÂ³dulo de reportes, manteniendo la estÃƒÂ©tica de "Brutalismo Funcional" y la navegaciÃƒÂ³n en cascada sin recargas.

### [2026-05-16] Data Engine & ConciliaciÃ³n de Barra (Reportes)
- **useNightReport.js**: CreaciÃ³n del Data Engine para el mÃ³dulo de Reportes. Este hook actÃºa como motor en memoria para cruzar datos financieros de Night Chief (Cajas/Passline), Planner (RRHH/Adhoc) y la conciliaciÃ³n de Barra.
- **ReportesLayout.jsx**: Refactor completo del Dashboard de Reportes. Se conectÃ³ a `globalDate` y se implementÃ³ un diseÃ±o de alta densidad (Brutalismo Funcional) basado en tarjetas de KPIs (Ingresos, Egresos, P&L, Health Score).
- **ConciliaciÃ³n de Barra (Sistema vs Real)**: Se integrÃ³ una tabla de auditorÃ­a dedicada dentro del Dashboard de Reportes. Calcula en tiempo real las diferencias unitarias y el impacto econÃ³mico (PÃ©rdidas/Sobros) derivado del stock fÃ­sico vs consumo reportado por sistema (CSV).

### [2026-05-16] UX/UI Refactor Reportes (HistÃ³rico y Desglose Fiscal)
- **UX Maestro-Detalle (ReportesLayout)**: Se modificÃ³ la UI del mÃ³dulo de Reportes para que, al ingresar, el usuario vea primero un listado de todas las jornadas con estado 'cerrada' (HistÃ³rico). Al seleccionar una fila, se navega al Dashboard AnalÃ­tico de esa fecha especÃ­fica, evitando la dependencia obligatoria del selector de fecha global.
- **Desglose Fiscal de Ingresos (useNightReport)**: Se integrÃ³ la tabla `import_gbol_facturacion` al motor de datos. Ahora los ingresos se separan estructuralmente en: Efectivo Facturado (blanco), Efectivo No Facturado (negro), Ingresos Digitales (digital+tarjeta+MP), y Tickets Passline.
- **CÃ¡lculo Impositivo (Egresos)**: Se agregÃ³ un nuevo renglÃ³n automÃ¡tico en la estructura de egresos ('Impuestos'), el cual calcula por defecto un 21% sobre la suma de Ingresos Digitales + Efectivo Facturado, impactando dinÃ¡micamente en el P&L Neto de la auditorÃ­a.

### [2026-05-16] Motor de Comisiones Digitales (Data Engine)
- **CÃ¡lculo de Pasarelas**: Se incorporÃ³ la extracciÃ³n de las retenciones paramÃ©tricas alojadas en `payment_commission_config` directamente dentro del hook `useNightReport.js`.
- **LÃ³gica MatemÃ¡tica**: El motor ahora computa dinÃ¡micamente las comisiones por pasarela (MercadoPago y Tarjetas) calculando la comisiÃ³n pura y agregÃ¡ndole la alÃ­cuota de IVA correspondiente. Este desglose impacta ahora sobre un nuevo renglÃ³n de Egresos ('Comisiones Zoco/MP/Tarjetas') en el frontend, garantizando una liquidaciÃ³n del P&L que resta los peajes de cobranza de manera precisa sin necesidad de vistas SQL (sustituyendo a la antigua `vw_workday_commissions`).

### [2026-05-16] Hotfix Query Reportes HistÃ³ricos
- **CorrecciÃ³n Case Sensitivity**: Se corrigiÃ³ el query de Supabase en `ReportesLayout.jsx` que buscaba jornadas cerradas. En Postgres los strings son case-sensitive y el sistema guarda el status como `CLOSED` (mayÃºsculas), no `closed`. Esto soluciona el bug donde el dashboard de histÃ³rico aparecÃ­a vacÃ­o incluso habiendo cerrado jornadas recientemente.

### [2026-05-16] Ajuste Fino en LÃ³gica de Faltantes (AuditorÃ­a)
- **Faltante de Caja P&L**: Se ajustÃ³ la ecuaciÃ³n de useNightReport.js. Si diferenciaCaja es negativo (robo/pÃ©rdida/descuadre en caja), ahora se extrae y se suma como una penalidad real dentro de los Egresos (ugaCaja), impactando negativamente en el P&L Neto para tener un resultado real del negocio.
- **Sobrante de Caja P&L**: A la inversa, si hay mÃ¡s dinero fÃ­sico que el facturado, se suma ahora a los Ingresos Totales de la noche.
- **UI Desglose Fugas**: En ReportesLayout.jsx, la fuga de caja ahora se muestra directamente en color rojo dentro de la Estructura de Costos. AdemÃ¡s, la tabla de ConciliaciÃ³n de Barra ya no muestra el confuso signo menos para los faltantes; indica claramente [N] (Faltante) o [N] (Sobrante).

### [2026-05-16] Hard Reset de Base de Datos
- **Purga de Operaciones**: Se ejecutÃ³ un `TRUNCATE TABLE work_days CASCADE;` y `TRUNCATE TABLE consumption_reports CASCADE;` para eliminar todo el historial de jornadas operativas (incluyendo sus dependencias en cascada: cierres de caja, nÃ³minas, stock en barra, pagos, etc.) de manera que se pueda probar la ingesta y el cÃ¡lculo del reporte en un entorno limpio y en cero.

### [2026-05-17] UX/UI Refactor - Inventario Barra Responsivo
- **TabInventario.jsx**: Se migraron los inputs numÃƒÂ©ricos a type='text' con inputMode='decimal' interceptando el cambio para convertir las comas a puntos, permitiendo asÃƒÂ­ al usuario usar su teclado de preferencia y validando siempre el ingreso.
- **Mobile Responsiveness**: Se modificÃƒÂ³ el layout (Action Bar y Tabla de SKUs) utilizando propiedades fluidas y breakpoints sm: para que la aplicaciÃƒÂ³n sea 100% usable desde un dispositivo mÃƒÂ³vil sin desbordes horizontales.

### [2026-05-17] Hotfix - Importador CSV Passline (Separadores)
- **WorkdaysNightChief.jsx**: Se actualizÃƒÂ³ el parser de archivos CSV (handleMembersCsv y handleGeneralCsv) para soportar de manera dinÃƒÂ¡mica tanto coma (,) como punto y coma (;) como separadores. AdemÃƒÂ¡s, ahora se limpian las comillas residuales en la fila de cabeceras (headers) para prevenir el error 'No se encontrÃƒÂ³ la columna Estado del eticket' cuando Passline exporta con comillas y punto y coma.

### [2026-05-17] Fix - Passline Ingresos (Break Even)
- **WorkdaysBreakEven.jsx / useNightReport.js**: Se modificÃƒÂ³ la consulta a stg_passline_tickets para eliminar el filtro .ilike('estado_ticket', '%validada%'). A partir de ahora, el cÃƒÂ¡lculo de ingresos por Passline General suma **todos los tickets vendidos** independientemente de si fueron validados (escaneados en puerta) o no, reflejando el ingreso econÃƒÂ³mico real de la plataforma.

### [2026-05-17] Hotfix - Importador CSV GBOL (Comillas)
- **gbolService.js**: Se replico el algoritmo de parseo CSV avanzado utilizado en Passline para limpiar las dobles comillas residuales tanto en las cabeceras como en los valores de los registros exportados por el sistema de Facturacion Electronica de GBOL. Esto soluciona los fallos de inyeccion al subir el CSV en Night Chief.

### [2026-05-17] Hard Reset de Base de Datos (Pruebas)
- **Purga de Operaciones**: Se ejecuto un TRUNCATE TABLE work_days CASCADE; y las sentencias equivalentes para consumption_reports, revenue_reports, import_gbol_facturacion y stg_passline_tickets. Esto elimina todo el historial operativo y financiero para iniciar las pruebas del entorno limpio y en cero.

## [2026-05-17]
### Fixed
- **Night Chief**: Se agregÃ³ una alerta especÃ­fica al importar CSVs vacÃ­os (4 bytes) para Consumo y RecaudaciÃ³n, evitando confusiÃ³n cuando se proveen archivos corruptos en lugar de CSV vÃ¡lidos.


### Added
- **Night Chief**: IntegraciÃ³n de librerÃ­a \xlsx\ para permitir importaciÃ³n nativa de archivos \.xlsx\ y \.xls\ sin necesidad de conversiÃ³n previa para RecaudaciÃ³n y Consumo.


### 2024-05-17: Implementación del Módulo Admin Pagos
- **App.jsx**: Añadida navegación principal para el tab 'PAGOS' con su respectivo sub-nav dropdown.
- **AdminPagos.jsx**: Nuevo módulo con enfoque de 'Brutalismo Funcional'. Integra Dashboard de métricas financieras (pendientes, atrasados, liquidados) y la 'Cola de Pagos'.
- **RPCs Integration**: Se mapearon las funciones atómicas PostgreSQL (dmin_approve_payment, dmin_mark_payment_done, dmin_undo_payment_done) asegurando la integridad de transacciones.
- **Operaciones Lote (Bulk)**: Se resolvió el Source Gap sobre Liquidación Masiva implementando un Promise.all desde el frontend para llamar iterativamente a dmin_mark_payment_done asegurando atomicidad relativa.

### Fixed
- **Break Even**: Solucionado error de precisiÃ³n en punto flotante al mostrar el Consumo FÃ­sico y la Diferencia, redondeando los valores a un mÃ¡ximo de 1 decimal.


### 2024-05-17: Rollback del Modulo Admin Pagos
- **App.jsx**: Eliminado tab 'PAGOS' del Top Bar de navegacion y sus rutas secundarias.
- **AdminPagos.jsx**: Modulo completamente eliminado debido a incremento excesivo de complejidad en la capa operativa del frontend.

### 2024-05-17: Edicion Inline en Stock Central
- **OperacionesStock.jsx**: Incorporada capacidad de edicion inline para la columna 'Stock Act.' que permite mutar la tabla \inventory_stock\ mediante onBlur o Enter, mejorando la agilidad en los ajustes de inventario. La persistencia se asegura delegando la atomicidad a la funcion upsert en base al \sku_id\.

### 2026-05-17: V2 Redone — Module 01: Profiles + PIN Auth
- **Supabase**: Created new project 'Redone' (ID: vabekvkijcvbyqvrxrss) in MidnighuClub_Org, region sa-east-1.
- **Migration**: create_profiles — single profiles table with PIN-based auth (no RLS, no Supabase Auth).
- **Seed data**: Admin user (PIN: 1234) inserted.
- **Files created**:
  - eady-to-go/db/01_profiles.md — Module documentation.
  - eady-to-go/lib/supabase.js — New Supabase client.
  - eady-to-go/.env.local — New project credentials.

### 2026-05-17: V2 Redone — Admin Shell + PIN Login + Module Index
- **ready-to-go/src/App.jsx**: V2 App shell with PIN auth context, top bar (brand + role badge + avatar dropdown), and router switch with commented placeholders for all 14 future modules.
- **ready-to-go/src/contexts/AuthContext.jsx**: PIN-based auth via profiles.pin lookup. No Supabase Auth, no JWT, no RLS.
- **ready-to-go/src/layouts/Login.jsx**: Minimal PIN login screen. Numeric input, password masked, auto-focus.
- **ready-to-go/src/layouts/AdminIndex.jsx**: Module map organized by 5 operational phases (Masters, Planificacion, Ejecucion, La Noche, Reportes). Status dots (live/wip/pending). Only live modules are clickable.
- **ready-to-go/src/layouts/ProfilesModule.jsx**: Full CRUD for team profiles with slide-over panel. Role selector, PIN field, active toggle.
- **ready-to-go/src/index.css**: V2 design tokens (added brand-card, brand-accent, brand-warning, JetBrains Mono).
- **index.html**: Entry point switched to ready-to-go/src/main.jsx.
- **.env.local**: Root env updated to Redone project credentials.

### 2026-05-17: V2 Redone — Module 02: Suppliers
- **ready-to-go/db/02_suppliers.md**: Created DB documentation and SQL schema for suppliers. Includes CHECK constraints for categories ('bar', 'limpieza', etc.).
- **ready-to-go/src/layouts/SuppliersModule.jsx**: Built UI for supplier CRUD. Slide-over panel for create/edit.
- **ready-to-go/src/App.jsx**: Wired up suppliers route.
- **ready-to-go/src/layouts/AdminIndex.jsx**: Flipped suppliers module status to live.

### 2026-05-17: V2 Redone - Module 03: SKU Catalog
- **ready-to-go/db/03_sku.md**: Created DB documentation and SQL schema for SKUs. Includes CHECK constraints for categories and FK to suppliers.
- **ready-to-go/src/layouts/SkuModule.jsx**: Built UI for SKU CRUD following functional brutalist design. Added slide-over panel for create/edit.
- **ready-to-go/src/App.jsx**: Wired up SKU route.
- **ready-to-go/src/layouts/AdminIndex.jsx**: Flipped SKU module status to live.

### 2026-05-17: V2 Redone - Supabase Migration Execution
- **ready-to-go/db/02_suppliers.md & 03_sku.md**: Executed SQL migrations via Supabase CLI (`--linked`) directly to the `vabekvkijcvbyqvrxrss` remote project using an updated access token, bypassing local MCP connection issues. Tables are now live. Documentation updated to reflect successful execution.
-   * * B a r I n v e n t o r y M o d u l e . j s x * * :   S e   c o r r i g i e r o n   l o s   n o m b r e s   d e   l a s   c o l u m n a s   e n   l a   c o n s u l t a   d e   ' w o r k _ d a y s '   ( c a m b i a n d o   ' d a t e '   y   ' l o c a t i o n '   p o r   ' w o r k _ d a t e '   y   ' e v e n t _ n a m e ' )   l o   q u e   c a u s a b a   q u e   l a   c a r g a   d e   j o r n a d a s   f a l l a r a   d e   f o r m a   s i l e n c i o s a   y   m o s t r a r a   s i e m p r e   ' S i n   j o r n a d a s   a c t i v a s ' .  
 
 # # #   2 0 2 6 - 0 5 - 1 7 :   V 2   R e d o n e   -   P h a s e   2 . 5 :   B i n a r y   O p e r a t i o n s   M i g r a t i o n 
 -   * * d b / 0 8 _ w o r k _ d a y s . m d * * :   U p d a t e d   s c h e m a   a n d   e x e c u t e d   S Q L   t o   c h a n g e   s t a t u s   e n u m   t o   j u s t   ' o p e n ' ,   ' c l o s e d ' ,   ' c a n c e l l e d ' ,   m i g r a t i n g   e x i s t i n g   r o w s   f r o m   ' d r a f t ' ,   ' p l a n n e d ' ,   ' a c t i v e '   t o   ' o p e n ' . 
 -   * * W o r k D a y s M o d u l e . j s x * * :   I n s e r t   d e f a u l t   s t a t u s   t o   ' o p e n ' . 
 -   * * S t a f f P l a n M o d u l e . j s x * * :   R e m o v e d   a d m i n   ' a p p r o v e A l l '   r e q u i r e m e n t .   F e t c h   o p e n / c l o s e d   s t a t u s e s .   M a d e   f u l l y   r e a d / w r i t e   w h i l e   ' o p e n ' . 
 -   * * O p e n i n g C o s t s M o d u l e . j s x * * :   R e m o v e d   i n t e r n a l   ' a p p r o v e d '   s t a t u s   a n d   ' a p p r o v e A l l ' .   L o c k   e n t i r e l y   i f   w o r k   d a y   i s   ' c l o s e d ' . 
 -   * * B a r I n v e n t o r y M o d u l e . j s x * * :   R e f a c t o r e d   t o   r e m o v e   i n t e r n a l   l o c k   s t a t u s e s .   E n t i r e   m o d u l e   i s   e d i t a b l e   w h i l e   d a y   i s   ' o p e n ' . 
 -   * * N i g h t O p s M o d u l e . j s x * * :   A d a p t e d   t o   u s e   ' o p e n ' / ' c l o s e d '   b i n a r y   l i f e c y c l e ,   r e m o v i n g   i n t e r m e d i a t e   s t a t e s .  
 
### 2026-05-17 - SKU Mapping and CSV Import Resilience Update
- **Feature**: Added system_id to skus table and SkuModule.jsx to map custom POS IDs.
- **Feature**: Upgraded CSV import in NightReportModule.jsx to support matching by both system_id (e.g. from 'articulo') and string 
ame, prioritizing ID matches for perfect mapping accuracy without relying strictly on text.


### 2026-05-17 - Bulk SKU Import
- **Database**: Imported 16 operational SKUs directly from \CONSUMO BARRAS 24_01 2026.csv\ into the \skus\ table, assigning their respective \system_id\ values (e.g., Speed Lata -> 18, Absolut -> 30) to establish a perfect reconciliation baseline.


### 2026-05-17 - Auditory Calculation Fix
- **NightReportModule**: Inverted the difference calculation logic in the Eficiencia de Barra table. \Diferencia = Sistema - F�sico\ as requested, labeling positive values as FALTANTE (Red). However, P&L penalization remains strictly bound to physical loss (\F�sico > Sistema\) to prevent false operational losses.
### 2026-05-19: Operativo Dashboard Implementation
- **UI/UX**: Created OperativoIndex.jsx implementing a 2x2 tactical grid for the 'operativo' role.
- **Routing**: Refactored App.jsx to conditionally render OperativoIndex when user.role is 'operativo'.
- **Architecture**: Enforced role-based dashboarding to reduce cognitive load and remove administrative modules from the operative view.

### 2026-05-19: WorkDaysModule Cleanup
- **UI**: Removed the redundant 'ASIST.' column from the main table in \WorkDaysModule.jsx\, updating table colSpans and simplifying the data presentation for a cleaner UI.

### Hotfix: Vite Base Path
- **vite.config.js**: Changed base path from '/redone/' to '/' to resolve black screen rendering error when accessing root URL in local dev environment.
