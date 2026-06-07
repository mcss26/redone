# Midnight Club - Master Decisions Log

## 2026-06-06: Establishment of the "Index Screen" Golden Standard
**Context:** Initiation of a clean documentation and module review phase.
**Decision:** `src/layouts/OperativoIndex.jsx` is officially designated as the architectural and structural standard for all Role-Based Index screens.

**Technical Pattern Guidelines (Golden Standard):**
1. **Data Fetching:** Must use `useEffect` on mount with an `isMounted` flag to prevent state updates on unmounted components. E.g., Active workday fetching via Supabase `single()` with error handling for `PGRST116` (No rows found).
2. **Routing / Navigation:** Managed via a pure array of objects (e.g., `MODULES = [{ id: '...', label: '...' }]`), rendering dynamically and utilizing an `onNavigate` prop passed from the parent router.
3. **Data Density & State Feedback:** Loading states must be explicitly handled (`isLoading`). Essential contextual data (like Active Workday status) is cleanly separated into a fixed footer/ticker, ensuring global context visibility without cluttering the primary interaction zone.
4. **Resilience:** Fallback parsing for data (e.g., extracting the first name with a fallback to a default string if undefined).

**Rationale:** This establishes a consistent, predictable, and highly performant entry point for all personas (Admin, Operativo, Logístico, etc.). It strictly adheres to the data-first operational mandate, ensuring instantaneous data availability without mock data.

## 2026-06-06: Establishment of the "CRUD & Data Entry" Golden Standard
**Context:** Review of `WorkDaysModule.jsx`, `OpeningCostsModule.jsx`, and `SkuModule.jsx`.
**Decision:** These modules officially dictate the architectural standard for all future CRUD/Data-Entry views across the application.

**Technical Pattern Guidelines (CRUD Golden Standard):**
1. **Container & Layout:** Must use a `h-full flex relative` container with a `flex-1 overflow-y-auto` main content area. Actions and titles sit strictly above the data table.
2. **Slide-Over Panel for Forms:** All creation and editing actions MUST occur within a right-aligned absolute Slide-Over panel (`animate-slide-in`), avoiding modals or separate routes. Overlay must be `bg-black/30 z-40`.
3. **Strict Data Mapping:** Forms must map empty string inputs (`""`) to `null` before Supabase insertion/updating to respect database constraints. Numbers must be parsed explicitly (`parseFloat`, `parseInt`) or defaulted to `0` or `null`.
4. **State Management:** Distinct states for `loading` (data fetch) and `saving` (form submission). A visual non-blocking `flashColor` overlay provides instantaneous feedback for success/error operations.
5. **Table Rendering:** Raw data format prioritizing density. Minimal borders (`border-b border-brand-border/30`). Loading and empty states must explicitly span all columns (`colSpan={N}`) to preserve table structure. Status indicators must use the unified dots system with neon shadow effects (`shadow-[0_0_6px_rgba(...)]`).
6. **Data Fetching Consistency:** `useEffect` and `useCallback` combinations mapped to `fetchData` functions, handling initial loads and post-save refreshes efficiently.

**Rationale:** This layout prioritizes extreme data density and rapid interaction suitable for POS and administrative high-frequency use. Slide-overs keep the user anchored to the context of the data table while performing mutations.

## 2026-06-06: Asynchronous Inter-role Communication (Global Messages)
**Context:** Need for asynchronous communication between Admin, Operativo, and Contador without relying on external apps (WhatsApp) and maintaining system traceability.
**Decision:** Implementation of a "Global Messages Board" directly integrated into the Index Screens.
**Technical Pattern Guidelines:**
1. **Always-On Visibility:** The messages board (`<GlobalMessagesBoard />`) is placed permanently above the Active Workday Footer Ticker in all Index modules, eschewing hidden Slide-Overs or Modals to ensure immediate visibility of critical operational notes.
2. **Realtime Sync:** Uses Supabase realtime subscriptions (`postgres_changes`) to instantly broadcast messages to all connected clients.
3. **Flat Hierarchy:** A single `global_messages` table without role-based Row Level Security filtering ensures all operational roles share the exact same contextual awareness (Global Wall).

## 2026-06-07: Strict Supabase Error Handling & Destructuring
**Context:** Identification of a critical bug in `NightOpsModule` and `GbolService` where `delete()` queries failed silently without throwing errors, causing duplicate data insertions during CSV imports.
**Decision:** All asynchronous Supabase operations (especially `.delete()`, `.insert()`, and `.upsert()`) MUST destructure `{ data, error }` and actively throw the error if present.
**Technical Pattern Guidelines:**
1. **Never Assume Success:** Do not use `await supabase.from(...).delete()` without capturing its return object. Always use `const { error } = await supabase...; if (error) throw error;`.
2. **Visual Error Propagation:** Empty `catch` blocks or raw `console.error` are strictly forbidden. All intercepted errors must be displayed to the user via the `window.UI?.toast(err.message, 'danger')` method to maintain interaction visibility.
**Rationale:** Supabase/PostgreSQL will often fail silently (e.g., due to missing RLS policies or timeout) returning an `error` object instead of throwing a JavaScript exception. Without explicit handling, the UI will proceed to the next execution block, corrupting data flow.

## 2026-06-07: Data Idempotency & RLS Bypass for CSV Imports
**Context:** Repeated CSV file uploads (Passline General, Members, GBOL) caused duplicated database entries. The pre-insertion `.delete()` was silently blocked by Row Level Security (RLS) for authenticated users, and static delete constraints (`neq`) caused overlap with unexpected data.
**Decision:** All idempotency deletions (pre-insertion purges) for bulk data imports MUST use an isolated `publicSupabase` client to bypass RLS, and MUST strictly scope constraints to the dynamically parsed content of the file.
**Technical Pattern Guidelines:**
1. **Isolated Client:** Create a client instance with `{ auth: { persistSession: false, autoRefreshToken: false } }` to forcefully execute operations with the `anon_key` privileges globally when RLS blocks authenticated users from administrative deletions.
2. **Dynamic Constraints (Overwriting):** Never use static `.neq` or generic `.eq` for cleaning up before an insert if the table stores mixed data. Extract the unique identifiers/types from the parsed CSV (e.g., `const uniqueTipos = [...new Set(dbRows.map(r => r.tipo_ticket))];`) and strictly apply an `.in('tipo_ticket', uniqueTipos)` constraint to only overwrite the exact categories provided in the file without touching historical data.

## 2026-06-07: Low-risk Router Lazy Loading (Performance Overhaul - Phase 1)
**Context:** The application suffered from severe memory bloat and slow initial loading because the `App.jsx` router statically imported 20+ heavy CRUD and Report modules simultaneously.
**Decision:** Implementation of `React.lazy()` exclusively for sub-modules defined in `ROUTE_MAP`, keeping core Index screens and Login statically imported.
**Technical Pattern Guidelines:**
1. **Zero-Intrusion on First Access:** Never lazy load the primary role indexes (`AdminIndex`, `OperativoIndex`, etc.) or the `Login` screen. These must remain statically bound to the main bundle to guarantee 0ms latency upon authentication or initial load.
2. **Immersive Suspense Fallback:** The `<Suspense>` fallback must not be a generic white screen or a standard spinner. It must use `<ViewLoader />`, an immersive component aligned with the "Midnight Club" aesthetic (dark overlay, pulse/blur effects, functional typography) to mask the loading phase naturally.
**Rationale:** This surgically reduces the initial JavaScript payload size and runtime memory consumption without compromising the perceived instantaneous speed of the application's main entry points.
