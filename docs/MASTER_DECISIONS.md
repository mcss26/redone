# Master Decision Log (V1 & V2)

## Índice de Contenidos

## Archivo: DECISIONS.md
- [DECISIONS.md (COMPRESSED)](#decisions-md-compressed)
  - [[2026-05-18] - Annual Report Live Aggregation](#2026-05-18-annual-report-live-aggregation)
  - [D15. Passline CSV Deduplication [2026-05-17]](#d15-passline-csv-deduplication-2026-05-17)
  - [D1. Pivot: Landing Ã¢â€ â€™ ERP [2026-05-09]](#d1-pivot-landing-erp-2026-05-09)
  - [D2. Role-Based Architecture [2026-05-09]](#d2-role-based-architecture-2026-05-09)
  - [D3. Aesthetic: Functional Brutalism [2026-05-09]](#d3-aesthetic-functional-brutalism-2026-05-09)
  - [D4. Config Consolidation [2026-05-09]](#d4-config-consolidation-2026-05-09)
  - [D5. Supabase Auth Layer [2026-05-09]](#d5-supabase-auth-layer-2026-05-09)
  - [D6. Admin Shell: Top Bar [2026-05-09]](#d6-admin-shell-top-bar-2026-05-09)
  - [D7. Operations Dashboard [2026-05-09]](#d7-operations-dashboard-2026-05-09)
  - [D8. Status Indicators [2026-05-09]](#d8-status-indicators-2026-05-09)
  - [D9. Workdays Module [2026-05-09]](#d9-workdays-module-2026-05-09)
  - [D10. Workdays Persistence [2026-05-09]](#d10-workdays-persistence-2026-05-09)
  - [D11. Profile Access & RLS Gap [2026-05-10]](#d11-profile-access-rls-gap-2026-05-10)
  - [D12. Data Engine Frontend [2026-05-16]](#d12-data-engine-frontend-2026-05-16)
  - [D13. Admin Pagos RPCs [2026-05-17]](#d13-admin-pagos-rpcs-2026-05-17)
  - [D14. Rollback Admin Pagos [2026-05-17]](#d14-rollback-admin-pagos-2026-05-17)
  - [D15. V2 "Redone" Pivot [2026-05-17]](#d15-v2-redone-pivot-2026-05-17)
  - [D16. V2 SKU Catalog [2026-05-17]](#d16-v2-sku-catalog-2026-05-17)
  - [D17. V2 One-Step Stock [2026-05-17]](#d17-v2-one-step-stock-2026-05-17)
  - [D18. NightOps Replicate System Button [2026-05-17]](#d18-nightops-replicate-system-button-2026-05-17)
    - [[D19] Reemplazo de Eficiencia de Barra por Stock Aprobado](#d19-reemplazo-de-eficiencia-de-barra-por-stock-aprobado)
    - [[D20] Desglose de Costos Pagados en lugar de Tablas Redundantes](#d20-desglose-de-costos-pagados-en-lugar-de-tablas-redundantes)
    - [[D21] Dependency Cleanup & Production Polish [2026-05-18]](#d21-dependency-cleanup-production-polish-2026-05-18)
    - [[D22] Auditoría Mensual Viva y Gráficos Nativos](#d22-auditor-a-mensual-viva-y-gr-ficos-nativos)
## Archivo: DECISIONS_legacy_backup.md
- [Midnight Club OS - Decision Log](#midnight-club-os-decision-log)
  - [Context](#context)
  - [Decisions](#decisions)
    - [15. Passline CSV Ingestion Deduplication](#15-passline-csv-ingestion-deduplication)
    - [1. Project Pivot: From Landing Page to ERP](#1-project-pivot-from-landing-page-to-erp)
    - [2. Role-Based Architecture](#2-role-based-architecture)
    - [4. Configuration Consolidation](#4-configuration-consolidation)
    - [3. Aesthetic Constraints: Functional Brutalism](#3-aesthetic-constraints-functional-brutalism)
    - [4. Visual Polish: Modern Google Aesthetic](#4-visual-polish-modern-google-aesthetic)
    - [5. Supabase Authentication Layer](#5-supabase-authentication-layer)
    - [6. Admin Shell Architecture (Top Bar)](#6-admin-shell-architecture-top-bar)
    - [7. Operations Dashboard Redesign & Interactive KPIs](#7-operations-dashboard-redesign-interactive-kpis)
    - [8. Status Indicator Aesthetics](#8-status-indicator-aesthetics)
    - [9. Workdays Module State & Data Constraints](#9-workdays-module-state-data-constraints)
    - [10. Workdays Persistence Rules](#10-workdays-persistence-rules)
    - [11. Profile Access & RLS Gap](#11-profile-access-rls-gap)
    - [[2026-05-16] Data Engine Frontend para Reportes](#2026-05-16-data-engine-frontend-para-reportes)
    - [13. Admin Pagos - Transaccionalidad RPC y Bulk Frontend](#13-admin-pagos-transaccionalidad-rpc-y-bulk-frontend)
    - [14. Rollback Admin Pagos](#14-rollback-admin-pagos)
    - [15. V2 Architecture Pivot — "Redone"](#15-v2-architecture-pivot-redone)
    - [16. V2 Redone - SKU Catalog Constraints](#16-v2-redone-sku-catalog-constraints)
    - [17. V2 Redone - One-Step Stock Approval (Receiving Module Removal)](#17-v2-redone-one-step-stock-approval-receiving-module-removal)



### --- SOURCE: DECISIONS.md --- ###

# DECISIONS.md (COMPRESSED)

## [2026-05-18] - Annual Report Live Aggregation

**Context**: El usuario solicito un reporte anual vivo.
**Decision**: Reutilizar la arquitectura del reporte mensual (MonthlyReportModule) y aplicarla a nivel anual (AnnualReportModule). No se crearan tablas de agregacion intermedias (mes a mes) para mantener la Single Source of Truth y la precision de las jornadas cerradas/abiertas.
**Consequences**: Garantiza que un cambio retroactivo en enero impacte de inmediato en el balance anual. Requirio un pequeno ajuste para agrupar por aÃ±os en vez de meses.

## D15. Passline CSV Deduplication [2026-05-17]

Deduplicate by `ID ticket` (entities) and `ID Compra` (revenue). Passline duplicates `Total` per ticket row in same purchase.

## D1. Pivot: Landing Ã¢â€ â€™ ERP [2026-05-09]

Internal OS/ERP for nightclub. Manages stock, sales, roles.

## D2. Role-Based Architecture [2026-05-09]

Roles: Admin (full), Accounting (payments), Operative (daily). Auth+RLS via Supabase.

## D3. Aesthetic: Functional Brutalism [2026-05-09]

Monochromatic dark. NO RED in UI. NO AI glowing/gradients. Green=success, Red=error only. Font: Plus Jakarta Sans. BG: `#0A0A0A`. Corners: `rounded-xl`/`rounded-2xl`.

## D4. Config Consolidation [2026-05-09]

Merged `MasterCategorias` + `MasterPOS` Ã¢â€ â€™ single `Configuraciones` 50/50 split-view.

## D5. Supabase Auth Layer [2026-05-09]

Global Auth wrapper (`Login.jsx`). RLS blocks anon queries Ã¢â€ â€™ organic auth required.

## D6. Admin Shell: Top Bar [2026-05-09]

Top Bar + Sub-Nav Dropdown replaces sidebar. Maximizes horizontal space.

## D7. Operations Dashboard [2026-05-09]

Separated ingestion (CSV) from visualization. KPIs = interactive table filters.

## D8. Status Indicators [2026-05-09]

Glowing dots (`w-2 h-2 rounded-full`) instead of pill badges. Green=active, Red=inactive.

## D9. Workdays Module [2026-05-09]

- State: `ACTIVE` Ã¢â€ â€™ `CLOSED` only. No `PENDING` on master record.
- Use `base_rate` from `master_staff_roles` (not deprecated `base_salary`).
- UUIDs via `gen_random_uuid()`.
- Explicit "COSTO TOTAL PROYECTADO" KPI.

## D10. Workdays Persistence [2026-05-09]

- Staff Ã¢â€ â€™ `work_day_staff_planning` (not obsolete `staff_assignments`).
- Opening costs Ã¢â€ â€™ query `finance_opening_cost_defs`, export to `finance_payments` as `PENDING`.
- Convocation Ã¢â€ â€™ `staff_convocations`.
- Payroll Ã¢â€ â€™ invoke `admin_generate_workday_accruals`.

## D11. Profile Access & RLS Gap [2026-05-10]

`anon` writes on `profiles` bounded by `WITH CHECK (is_auth_user = false)`. Operatives need writes without auth session.

## D12. Data Engine Frontend [2026-05-16]

Migrated SQL views Ã¢â€ â€™ frontend `useNightReport.js` in-memory engine. Promise.all atomic tables. Instant date switching. Live Health Score + Bar Diffs.

## D13. Admin Pagos RPCs [2026-05-17]

Payment queue via RPCs (`admin_approve_payment`, `admin_mark_payment_done`, `admin_undo_payment_done`). Bulk = `Promise.all` client-side loop.

## D14. Rollback Admin Pagos [2026-05-17]

Module removed entirely. Too much transactional friction for SPA.

## D15. V2 "Redone" Pivot [2026-05-17]

Complete redesign. New Supabase project (vabekvkijcvbyqvrxrss). 20 tables. No RLS, no triggers, no views, no functions. Week cycle Mar-Lun. 4 roles: Operativo, Admin, Contador, Viewer. English columns. Text CHECK constraints (no ENUMs). Frontend-computed reports. Code in `src/`, `lib/`, `db/` (flattened from `ready-to-go/` in Step 1.1).

## D16. V2 SKU Catalog [2026-05-17]

`skus` table: text CHECK for categories ('bebida','insumo'Ã¢â‚¬Â¦). FK to `suppliers`.

## D17. V2 One-Step Stock [2026-05-17]

Removed `ReceivingModule.jsx` and two-step verification. Approval = Delivery = Cost assumed. Dropped `received_qty`, `receipt_status`, `received_at` from `stock_requests`.

## D18. NightOps Replicate System Button [2026-05-17]

Added explicit 'IGUALAR SISTEMA' button in NightOpsModule instead of automatic population to reduce operation friction while preventing false positives on physical cash counts.

### [D19] Reemplazo de Eficiencia de Barra por Stock Aprobado

**Contexto**: El flujo de auditoría de insumos requería comparar importaciones de CSV con el consumo físico, pero el nuevo flujo V2 centraliza esto al aprobar solicitudes de stock y pasarlas a `opening_costs`.
**Decisión**: Se elimina la tabla de 'Eficiencia de Barra' y se reemplaza por 'Inversión en Insumos (Stock Aprobado)' en NightReportModule, mostrando los items aprobados (cantidad y costo) directamente desde `stock_requests`.
**Consecuencias**: Se elimina la dependencia de CSVs de consumo para esta vista, alineando el reporte con la inversión real aprobada por proveedores.

### [D20] Desglose de Costos Pagados en lugar de Tablas Redundantes

**Contexto**: Mostrar los items aprobados desde \stock_requests\ en una tabla separada duplicaba visualmente la inversión que ya estaba consolidada y pagada en el panel de Egresos.
**Decisión**: Eliminar la tabla de Inversión en Insumos y en su lugar detallar 'Costos Pagados' en tres filas precisas: Costos Recurrentes (provenientes de un template_id), Costos Ad-Hoc (sin template), e Insumos Pagados (identificados por título automático).
**Consecuencias**: El P&L queda mucho más limpio y no hay código o vistas fantasma sin relevancia financiera final.

# DECISIONS.md (COMPRESSED)

## [2026-05-18] - Annual Report Live Aggregation

**Contexto**: El usuario solicito un reporte anual vivo.
**Decisión**: Reutilizar la arquitectura del reporte mensual (MonthlyReportModule) y aplicarla a nivel anual (AnnualReportModule). No se crearan tablas de agregacion intermedias (mes a mes) para mantener la Single Source of Truth y la precision de las jornadas cerradas/abiertas.
**Consecuencias**: Garantiza que un cambio retroactivo en enero impacte de inmediato en el balance anual. Requirio un pequeno ajuste para agrupar por aÃ±os en vez de meses.

## D15. Passline CSV Deduplication [2026-05-17]

Deduplicate by `ID ticket` (entities) and `ID Compra` (revenue). Passline duplicates `Total` per ticket row in same purchase.

## D1. Pivot: Landing Ã¢â€ â€™ ERP [2026-05-09]

Internal OS/ERP for nightclub. Manages stock, sales, roles.

## D2. Role-Based Architecture [2026-05-09]

Roles: Admin (full), Accounting (payments), Operative (daily). Auth+RLS via Supabase.

## D3. Aesthetic: Functional Brutalism [2026-05-09]

Monochromatic dark. NO RED in UI. NO AI glowing/gradients. Green=success, Red=error only. Font: Plus Jakarta Sans. BG: `#0A0A0A`. Corners: `rounded-xl`/`rounded-2xl`.

## D4. Config Consolidation [2026-05-09]

Merged `MasterCategorias` + `MasterPOS` Ã¢â€ â€™ single `Configuraciones` 50/50 split-view.

## D5. Supabase Auth Layer [2026-05-09]

Global Auth wrapper (`Login.jsx`). RLS blocks anon queries Ã¢â€ â€™ organic auth required.

## D6. Admin Shell: Top Bar [2026-05-09]

Top Bar + Sub-Nav Dropdown replaces sidebar. Maximizes horizontal space.

## D7. Operations Dashboard [2026-05-09]

Separated ingestion (CSV) from visualization. KPIs = interactive table filters.

## D8. Status Indicators [2026-05-09]

Glowing dots (`w-2 h-2 rounded-full`) instead of pill badges. Green=active, Red=inactive.

## D9. Workdays Module [2026-05-09]

- State: `ACTIVE` Ã¢â€ â€™ `CLOSED` only. No `PENDING` on master record.
- Use `base_rate` from `master_staff_roles` (not deprecated `base_salary`).
- UUIDs via `gen_random_uuid()`.
- Explicit "COSTO TOTAL PROYECTADO" KPI.

## D10. Workdays Persistence [2026-05-09]

- Staff Ã¢â€ â€™ `work_day_staff_planning` (not obsolete `staff_assignments`).
- Opening costs Ã¢â€ â€™ query `finance_opening_cost_defs`, export to `finance_payments` as `PENDING`.
- Convocation Ã¢â€ â€™ `staff_convocations`.
- Payroll Ã¢â€ â€™ invoke `admin_generate_workday_accruals`.

## D11. Profile Access & RLS Gap [2026-05-10]

`anon` writes on `profiles` bounded by `WITH CHECK (is_auth_user = false)`. Operatives need writes without auth session.

## D12. Data Engine Frontend [2026-05-16]

Migrated SQL views Ã¢â€ â€™ frontend `useNightReport.js` in-memory engine. Promise.all atomic tables. Instant date switching. Live Health Score + Bar Diffs.

## D13. Admin Pagos RPCs [2026-05-17]

Payment queue via RPCs (`admin_approve_payment`, `admin_mark_payment_done`, `admin_undo_payment_done`). Bulk = `Promise.all` client-side loop.

## D14. Rollback Admin Pagos [2026-05-17]

Module removed entirely. Too much transactional friction for SPA.

## D15. V2 "Redone" Pivot [2026-05-17]

Complete redesign. New Supabase project (vabekvkijcvbyqvrxrss). 20 tables. No RLS, no triggers, no views, no functions. Week cycle Mar-Lun. 4 roles: Operativo, Admin, Contador, Viewer. English columns. Text CHECK constraints (no ENUMs). Frontend-computed reports. Code in `src/`, `lib/`, `db/` (flattened from `ready-to-go/` in Step 1.1).

## D16. V2 SKU Catalog [2026-05-17]

`skus` table: text CHECK for categories ('bebida','insumo'Ã¢â‚¬Â¦). FK to `suppliers`.

## D17. V2 One-Step Stock [2026-05-17]

Removed `ReceivingModule.jsx` and two-step verification. Approval = Delivery = Cost assumed. Dropped `received_qty`, `receipt_status`, `received_at` from `stock_requests`.

## D18. NightOps Replicate System Button [2026-05-17]

Added explicit 'IGUALAR SISTEMA' button in NightOpsModule instead of automatic population to reduce operation friction while preventing false positives on physical cash counts.

### [D19] Reemplazo de Eficiencia de Barra por Stock Aprobado

**Contexto**: El flujo de auditoría de insumos requería comparar importaciones de CSV con el consumo físico, pero el nuevo flujo V2 centraliza esto al aprobar solicitudes de stock y pasarlas a `opening_costs`.
**Decisión**: Se elimina la tabla de 'Eficiencia de Barra' y se reemplaza por 'Inversión en Insumos (Stock Aprobado)' en NightReportModule, mostrando los items aprobados (cantidad y costo) directamente desde `stock_requests`.
**Consecuencias**: Se elimina la dependencia de CSVs de consumo para esta vista, alineando el reporte con la inversión real aprobada por proveedores.

### [D20] Desglose de Costos Pagados en lugar de Tablas Redundantes

**Contexto**: Mostrar los items aprobados desde \stock_requests\ en una tabla separada duplicaba visualmente la inversión que ya estaba consolidada y pagada en el panel de Egresos.
**Decisión**: Eliminar la tabla de Inversión en Insumos y en su lugar detallar 'Costos Pagados' en tres filas precisas: Costos Recurrentes (provenientes de un template_id), Costos Ad-Hoc (sin template), e Insumos Pagados (identificados por título automático).
**Consecuencias**: El P&L queda mucho más limpio y no hay código o vistas fantasma sin relevancia financiera final.

### [D21] Dependency Cleanup & Production Polish [2026-05-18]

**Contexto**: Se requería preparar el build de producción V2.
**Decisión**: Se purgaron `clsx` y `tailwind-merge` del paquete a favor de template strings nativos en JSX. Se escribió la master doc `README.md` con todo el setup de variables.
**Consecuencias**: App lista para producción sin bloating de dependencias.

### [D22] Auditoría Mensual Viva y Gráficos Nativos

**Contexto**: El reporte mensual presentaba demasiada densidad de columnas (carga cognitiva alta), dependía de tablas legacy ('night_sales') y no lograba separar los gastos reales de la provisión impositiva.
**Decisión**: Simplificar la tabla a 5 columnas clave. Aislar los impuestos en un KPI propio 'Pasivo Impositivo'. Incorporar gráficos Brutalistas nativos (CSS/SVG) para evitar sobrecargar el package.json con librerías externas de charting. Consultar también jornadas 'open' para permitir proyecciones en tiempo real.
**Consecuencias**: Mejor lectura gerencial y proyección inmediata de impuestos a retener. El módulo ahora refleja el mismo P&L estricto que NightReportModule.

### [D23] Supabase Limits Mitigation (Zero Aggregation Protection) [2026-05-20]

**Contexto**: La arquitectura V2 eliminó las vistas SQL para el cálculo financiero (Zero Aggregation Tables), moviendo toda la carga matemática de P&L al frontend. Esto provocó que reportes de múltiples días (Annual, Monthly) y noches con alta rotación chocaran contra el límite nativo de 1000 filas de la PostgREST API de Supabase, truncando silenciosamente los montos financieros reales.
**Decisión**: Implementar un Helper centralizado de capa de datos (`fetchAll()`) en `lib/queryHelper.js`. Este helper encapsula la lógica recursiva/iterativa de `.range()` para asegurar la descarga del 100% de la tabla solicitada antes de retornar la promesa a los módulos.
**Consecuencias**: Se mantiene el paradigma de calcular todo en memoria desde el cliente garantizando precisión matemática al centavo, a expensas de un ligero overhead de iteración de red en el Reporte Anual. Es una protección indispensable para `stg_passline_tickets`, `import_gbol_facturacion`, `night_cash_closing` y `opening_costs`.

### --- SOURCE: DECISIONS_legacy_backup.md --- ###

# Midnight Club OS - Decision Log

## Context

This document tracks core architectural, aesthetic, and functional decisions for the Midnight Club project. All AI agents must read this before proposing or executing changes.

## Decisions

### 15. Passline CSV Ingestion Deduplication

- **Date**: 2026-05-17
- **Decision**: Passline ticket CSV imports MUST deduplicate rows by `ID ticket` and isolate revenue sum (`Total`) strictly by `ID Compra`.
- **Reasoning**: Passline exports duplicate the `Total` transaction amount on every individual ticket row within the same purchase. Simple aggregation of `Total` inflates revenue exponentially. Furthermore, repeated exports/re-validations create duplicate rows for the same ticket. Deduplicating by `ID Compra` for revenue and `ID ticket` for the ticket entities guarantees 100% accurate financial injection to `useNightReport.js` without altering database schema or UI logic.

### 1. Project Pivot: From Landing Page to ERP

- **Date**: 2026-05-09
- **Decision**: The project is no longer a marketing landing page. It is an internal Operating System / ERP for a nightclub.
- **Reasoning**: The system needs to manage stock and sales balances across specific operational roles.

### 2. Role-Based Architecture

- **Date**: 2026-05-09
- **Decision**: The system is built around strict staff profiles (Admin, Operative, Accounting, + hidden roles).
- **Details**:
  - *Admin*: Absolute access.
  - *Accounting*: Deep accountability and payments.
  - *Operative*: Daily operational screens.
  - Authentication and RLS (Row Level Security) via Supabase will enforce this.

### 4. Configuration Consolidation

- **Date**: 2026-05-09
- **Decision**: Merged `MasterCategorias` and `MasterPOS` into a single `Configuraciones` 50/50 split-view module.
- **Reasoning**: Both tables are small and static. Keeping them separate broke the "High Density" rule. A split view creates a more powerful "Control Panel" feel.

### 3. Aesthetic Constraints: Functional Brutalism

- **Date**: 2026-05-09
- **Decision**: Strict monochromatic brutalism (Greys and Black).
- **Rules**:
  - NO RED in the default UI.
  - NO "AI-style" glowing circles or gradients.
  - NO redundant text or fluffy descriptions. High information density.
  - **Interaction Feedback**: Green flash exclusively for confirmation/success. Red flash exclusively for cancellation/errors.

### 4. Visual Polish: Modern Google Aesthetic
- **Date**: 2026-05-09
- **Decision**: Refined the strict brutalism into a modern, Google-like clean aesthetic.
- **Details**:
  - Global typography set to **Plus Jakarta Sans** (clean, geometric).
  - Main background color strictly `#0A0A0A` (Deep void).
  - Replaced hard zero-radius borders with smooth `rounded-xl` and `rounded-2xl` for surfaces to provide a premium, modern software feel while maintaining the high contrast monochromatic scheme.

### 5. Supabase Authentication Layer
- **Date**: 2026-05-09
- **Decision**: Implemented global Auth wrapping (`Login.jsx`) over the entire application.
- **Reasoning**: Supabase's Row Level Security (RLS) blocks queries made with the Anon Key. Instead of bypassing RLS with a Service Role Key, we chose to implement organic authentication. The app is completely inaccessible without a valid admin session.

### 6. Admin Shell Architecture (Top Bar)
- **Date**: 2026-05-09
- **Decision**: Replaced the traditional Sidebar with a Top Bar + Secondary Sub-Nav Dropdown. Strictly aligned to `GEMINI.md` brutalism rules.
- **Reasoning**: A Top Bar navigation frees up massive horizontal screen space. The UI was purged of all "generic AI UI" fluff, resulting in a pure layout where the Index is simply a massive "ADMINISTRACIÃ“N" watermark, and the TopBar maintains perfect uppercase alignment ("MIDNIGHT CLUB" | "MASTERS"). Avatar hides logout logic.

### 7. Operations Dashboard Redesign & Interactive KPIs
- **Date**: 2026-05-09
- **Decision**: Separated data ingestion (CSV dropzones) from visualization in `OperacionesStock.jsx`. Made top KPIs interactive to function as main table filters.
- **Reasoning**: The legacy screen overloaded ingestion and visualization. Removing the left panel maximizes horizontal space for stock scanning (High Density). Using KPIs as state filters reduces UI clutter by eliminating the need for complex filter sidebars, directly aligning with brutalist principles.

### 8. Status Indicator Aesthetics
- **Date**: 2026-05-09
- **Decision**: Standardized state/status visualization globally to use minimalistic glowing dots (`w-2 h-2 rounded-full`) instead of large pill-shaped badges for Activo/Inactivo.
- **Reasoning**: Pill badges occupy too much visual weight and text space in high-density tables. A simple, universally understood colored dot (Green = Active, Red = Inactive) conveys the exact same information while reinforcing the "Control Panel / Hardware" aesthetic.

### 9. Workdays Module State & Data Constraints
- **Date**: 2026-05-09
- **Decision**: Addressed architectural gaps discovered in legacy documentation (`legacy-planner.md` and `legacy-nightchief.md`).
- **Details**:
  - **State Machine Integrity**: The `work_days` table strictly transitions from `ACTIVE` to `CLOSED`. The frontend will NOT attempt to push a `PENDING` state to the master record (as `PENDING` only applies to children like `closing_terminals`).
  - **Staff Costs**: We strictly use `base_rate` from `master_staff_roles`. The deprecated `base_salary` field is banned to prevent Postgres Error 42703.
  - **UUID Generation for QRs**: Native frontend UUIDs will be generated using a modern, robust method (or delegated to Supabase's `gen_random_uuid()`) to prevent the blockers described in legacy ticket TK-001.
  - **KPI Visibility**: `WorkdaysPlanner.jsx` will introduce an explicit "COSTO TOTAL PROYECTADO" metric, solving the legacy gap where this total was only indirectly implied by the "Break-even" figure.

### 10. Workdays Persistence Rules
- **Date**: 2026-05-09
- **Decision**: Finalized the data pipeline for locking the Planner based on legacy architecture.
- **Details**:
  - **Staff Planning**: The quantities defined in the Planner must be persisted strictly into `work_day_staff_planning` (`work_day_id`, `role_id`, `quantity`). The table `staff_assignments` is obsolete and must not be used.
  - **Opening Costs Pipeline**: The Planner strictly queries `finance_opening_cost_defs` for its "Costos Apertura" panel, deliberately omitting `cost_definitions` (which are recurring monthly/weekly obligations handled solely by Admin Pagos). Upon locking the plan, these opening definitions are exported into `finance_payments` with status `PENDING`, linked via `opening_def_id`.
  - **Convocation**: Staff assignment is done by mapping `profiles` to `staff_convocations`.
  - **Payroll**: At the end of the night, `admin_generate_workday_accruals` must be invoked to convert convocations into `staff_accruals`.

### 11. Profile Access & RLS Gap
- **Date**: 2026-05-10
- **Decision**: Enabled `anon` role writes on the `profiles` table, bounded by a strict `WITH CHECK (is_auth_user = false)`.
- **Reasoning**: Operative roles (like Encargados) need to update staff profiles but operate entirely without an active Supabase `auth` session. Since `get_my_role()` checks `auth.uid()`, the strict RLS blocked them. By opening `anon` with a check, we allow the UI to function while protecting actual system users (`is_auth_user = true`) from unauthenticated manipulation.

### [2026-05-16] Data Engine Frontend para Reportes
- **Contexto**: El sistema original (legacy) dependía de vistas SQL ( w_workday_pnl) para agrupar ingresos, egresos y control de stock.
- **Decisión**: Se migra toda esta lógica al Frontend creando un **Data Engine en memoria (useNightReport.js)**.
- **Razón**: Mejora extrema de performance de SPA. Las vistas de Base de datos (joins de múltiples tablas) generaban tiempos de carga bloqueantes al cambiar de fecha. Al traer datos puros a memoria (tablas atómicas usando Promise.all) y calcularlos en el navegador, los cambios de fecha son instantáneos y permiten depuración matemática directa sobre el código JavaScript.
- **Efecto secundario**: La métrica de 'Health Score' y las 'Diferencias de Barra' (impacto económico) se calculan en vivo, lo cual previene posibles desfasajes que ocurrían en vistas materializadas.

### 13. Admin Pagos - Transaccionalidad RPC y Bulk Frontend
- **Date**: 2026-05-17
- **Decision**: Toda la cola de pagos se delegó a RPCs de PostgreSQL (`admin_approve_payment`, `admin_mark_payment_done`, `admin_undo_payment_done`). Las transacciones en bloque ("Bulk Pay") se procesan mediante un `Promise.all` iterando sobre el cliente en lugar de un RPC masivo único.
- **Reasoning**: Mantener la lógica de negocio en RPC previene problemas de concurrencia y fire-and-forget en UI, cumpliendo con la regla de Clean State. El Source Gap respecto a la transacción grupal fue resuelto manejando el bucle desde frontend para evitar la necesidad de refactorizar el backend, asumiendo la relativa baja latencia y el control transaccional local.

### 14. Rollback Admin Pagos
- **Date**: 2026-05-17
- **Decision**: Eliminacion completa del modulo de Admin Pagos de la arquitectura del frontend.
- **Reasoning**: A pesar de integrar los RPCs de Supabase y el Bulk Promise.all, el modulo anadia demasiada friccion transaccional y complejidad a la SPA. Se descarta para mantener la simplicidad y el enfoque de alto nivel del sistema.

### 15. V2 Architecture Pivot — "Redone"
- **Date**: 2026-05-17
- **Decision**: Complete system redesign. New Supabase project, new DB schema (~16 tables vs ~58), no RLS, no triggers, no deprecated tables. Architecture follows the real operational week (Mar→Lun) with 4 user roles (Operativo, Admin, Contador, Viewer).
- **Reasoning**: V1 (FormulaMid) accumulated too much accidental complexity: 60+ tables, RLS blocking operations, over-engineered payment rules, deprecated tables never dropped, confusing multi-step approval chains. The new design strips to the operational bone — every table maps directly to a real-world action in the club's weekly cycle. Code migrates to `ready-to-go/` with per-module DB documentation in `ready-to-go/db/`.
- **Key changes**: English column names, simple text CHECK constraints instead of complex enums, frontend-computed break-even/reports instead of SQL views, unified planning screen (costs + staff + stock in one flow), explicit Contador role for payment execution.

### 16. V2 Redone - SKU Catalog Constraints
- **Date**: 2026-05-17
- **Decision**: Designed the `skus` table to strictly enforce categories ('bebida', 'insumo', etc.) via text CHECK constraints instead of ENUMs, and enforced a direct FK dependency on `suppliers`.
- **Reasoning**: Text CHECK constraints are easier to migrate and update than Postgres ENUMs, fitting the "no-magic" V2 philosophy. The FK ensures data integrity without relying on frontend logic.

### 17. V2 Redone - One-Step Stock Approval (Receiving Module Removal)
- **Date**: 2026-05-17
- **Decision**: Eliminated the `ReceivingModule.jsx` and the two-step verification flow for stock. Dropped `received_qty`, `receipt_status`, and `received_at` from the `stock_requests` table.
- **Reasoning**: To reduce operational friction, the system now assumes that `Stock Aprobado = Stock Entregado = Costo Asumido`. Approving a stock request immediately impacts the night's projected P&L. This simplifies the ERP flow, removing unnecessary bureaucratic checks that are often batch-processed at the end of the night anyway.
### 2026-05-19: Role-Based Tactical Dashboards
**Context:** Operative roles (like Encargados) were previously seeing the global Admin dashboard, creating visual noise and potential for confusion since they couldn't access many administrative modules.
**Decision:** Implemented a dedicated tactical dashboard (\OperativoIndex.jsx\) exclusive for the \operativo\ role. This dashboard uses a 2x2 grid containing only actionable modules for the active night (Jornadas, Costos Apertura, Plan Staff, Solicitud Stock).
**Consequences:**
- **Pros:** Massive reduction in cognitive load for operatives, ensuring they only see tools required for their physical tasks on the floor.
- **Cons:** Any new module intended for operatives must now be explicitly added to \OperativoIndex.jsx\, breaking away from a single global dashboard configuration.
