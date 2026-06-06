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
