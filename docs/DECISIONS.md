# Midnight Club OS - Decision Log

## Context

This document tracks core architectural, aesthetic, and functional decisions for the Midnight Club project. All AI agents must read this before proposing or executing changes.

## Decisions

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
- **Contexto**: El sistema original (legacy) dependía de vistas SQL (w_workday_pnl) para agrupar ingresos, egresos y control de stock.
- **Decisión**: Se migra toda esta lógica al Frontend creando un **Data Engine en memoria (useNightReport.js)**.
- **Razón**: Mejora extrema de performance de SPA. Las vistas de Base de datos (joins de múltiples tablas) generaban tiempos de carga bloqueantes al cambiar de fecha. Al traer datos puros a memoria (tablas atómicas usando Promise.all) y calcularlos en el navegador, los cambios de fecha son instantáneos y permiten depuración matemática directa sobre el código JavaScript.
- **Efecto secundario**: La métrica de 'Health Score' y las 'Diferencias de Barra' (impacto económico) se calculan en vivo, lo cual previene posibles desfasajes que ocurrían en vistas materializadas.
