---
trigger: manual
glob:
description: Senior AI Frontend Architect / ux ui driven developer
---

## Agent Flow — MUST FOLLOW

**CRITICAL AND MANDATORY AGENT PROTOCOL. AUGMENTS AND OVERRIDES GEMINI.md WHEN WORKING ON FRONTEND (DO NOT IGNORE):**

1. **READ BEFORE ACTING:** Before answering, executing, or writing any code, you are STRICTLY REQUIRED to read `docs/MASTER_CHANGELOG.md` and `docs/MASTER_DECISIONS.md` to understand the global context. THEN, read `docs/ui-ux-decisions.md` and `docs/ui-ux-changelog.md` to understand the specific frontend patterns.
2. **WRITE BEFORE FINISHING (FRONTEND SCOPE):** You are STRICTLY FORBIDDEN from ending your turn without logging your changes. Every single time you make a UI/UX tweak, styling change, or structural frontend adjustment, you MUST append a detailed entry to `docs/ui-ux-changelog.md` (and `docs/ui-ux-decisions.md` if an architectural UI/UX decision was made). Do NOT log these in the MASTER logs.
3. **GLOBAL WRITE DELEGATION:** ONLY update `docs/MASTER_CHANGELOG.md` if a major functional module or feature was completed that affects the global full-stack overview.
4. **VERIFY SCHEMA BEFORE QUERYING:** Before executing queries or creating components tied to a database table, you MUST verify the exact table name and schema via Supabase query using the supabase-cli-executor skill. Never guess columns.
5. **REVIEW & ALIGN:** Before executing any changes, review what was previously done in the module you are working on to fully understand the context. Make sure you understand the goal completely before acting. Once a task is completed, you MUST ensure the user is completely satisfied with the result before proposing to move on to another module.

## Aesthetic Constraints & Principles: Functional Brutalism

We are building a dark-mode, high-density control panel. The design strictly prioritizes high data density, extreme reduction of cognitive load in nocturnal operative environments, elimination of redundant containers, and secure Role-Based Access Control (RBAC) routing. Interactions must be atomic, resilient through explicit promise handling, and provide immediate visual feedback.

- **Palette**: Deep Void `#0A0A0A` (Background), `brand-bg` (`#111111`), `brand-surface` (`#1A1A1A`), `brand-border` (`#333333`), `brand-text` (`#E5E5E5`), `brand-muted` (`#737373`).
- **Typography**: Google Font `Plus Jakarta Sans` globally. Micro-headers and secondary labels should be compressed (e.g., `text-[8px] uppercase tracking-[0.3em]`) to reduce visual noise. "JetBrains Mono" or standard mono for data tables and numbers.
- **No Red in UI (Golden Rule)**: Red (`text-brand-error`) is reserved EXCLUSIVELY for critical anomalies (e.g., physical stock shortages), errors, or permanent deletions. Expected operational expenses (like payroll or costs) must NOT use red. Success or confirmation is exclusively green. `text-brand-muted` should be used for conventional negative financial results and subtexts.
- **Container Purge (Raw Data Tables)**: Do NOT use solid background boxes or cards (`bg-brand-surface`, `rounded-2xl`) around tables or primary views unless absolutely necessary. Data should flow directly over `bg-brand-bg` divided only by subtle horizontal lines (`border-b`).
- **Minimalist Status Dots**: Avoid using verbose text badges (e.g., "PENDING" or "APPROVED"). Use colored dots with subtle glow effects instead (`w-2 h-2 rounded-full`), relying on tooltips (`title` attribute) for the actual text status to clear the data matrix.
- **Edges**: If containers must be used (like in Slide-Overs), use `rounded-xl` or `rounded-2xl` for smooth, modern software edges. Form fields should be transparent with a raw bottom border (`border-b`).

## Component Architecture (ERP Patterns)

### A. TOP BAR SHELL & NAVIGATION

- Omit sidebar implementation in favor of a full-width Top Bar (`TopBar`) to maximize horizontal screen real estate, with absolutely centered sub-navigation (`absolute left-1/2 -translate-x-1/2`).
- Include a secondary Sub-Nav Dropdown for deep module linking (e.g., MASTERS).
- **No Back Button Policy:** Eliminate explicit `< VOLVER` buttons in operational modules; backward navigation relies on the central logo in the `TopBar`.

### B. DATA VISUALIZATION & KPIs

- KPIs must double as interactive state filters for the tables below them.
- Separate data ingestion (file drops, forms) from visualization into distinct, dedicated views.

### C. SLIDE-OVER MODALS (Side-Sheets) & IN-APP TOOLING

- All creation/editing of records happens in an absolute-positioned right-side slide-over panel, NOT centered modals. This keeps context visible. Keep inputs minimal; drop unnecessary help texts or fields.
- **In-App Tooling:** To avoid context switching for operative users, integrate native tools directly at the point of need (e.g., inject a `SimpleCalculator` widget in the Stock Requests Slide-Over to auto-fill quantities).

### D. HIGH DENSITY TABLES

- No pagination unless strictly required. Favor full-width tables.
- Use `text-xs` or `text-[10px]`, `tracking-widest`, `uppercase` for table headers.
- Always implement local `.filter()` and `.sort()` on the frontend for speed once data is loaded. Headers should double as interactive sort toggles.

## Security & Resiliency (Error Handling & RBAC)

### 1. Conditional Rendering for Security (RBAC UI)

- Do not use the `disabled` state on restricted action buttons.
- Under Functional Brutalism, apply literal DOM removal using `useAuth()`. If the user lacks permissions (e.g., `user?.role !== 'admin'`), the element or the approval column must not exist in the rendered code, eliminating visual noise.

### 2. Error Handling and Data Resilience

- **DB Interactions:** Wrap every Supabase call in robust `try/catch` blocks.
- **Payload Sanitization:** Implement strict mapping of empty strings to nulls (`"" -> null`) in payloads before inserting into the database to prevent corrupt records.
- **Visual Polish (Async Feedback):**
  - Use the `Loader2` component in save buttons to represent background activity.
  - Implement the `triggerFlash` overlay (green for success, red for catastrophic failures), informing the state without breaking the raw UI aesthetic.
- **Optimized Reloads (Background Fetch):** Replace unmounting of entire components (e.g., `isLoading = true`) with non-destructive update states. Use `isFetchingBackground` to apply `opacity-50` to the module while data syncs, preventing the sensation of a page reload.
- **Memory Leak Prevention:** In concurrent async operations (e.g., `Promise.all`), integrate the `isMounted` control pattern during promise resolution to avoid state updates on unmounted components, applying silent fail-safes if data is missing.

## Technical Requirements

- **Stack:** React 19, Tailwind CSS v3.4.17, Supabase JS Client, Lucide React for icons.
- **Data Fetching:** Always fetch data `useEffect` on mount. Avoid mock data. All inserts must map empty strings `""` to `null`.
- **Responsive:** Desktop-first. This is an internal tool designed for wide monitors and POS terminals.
- **Routing:** Handled via conditional rendering in `App.jsx` based on a global `currentView` state. Session persistence should utilize `localStorage`.

**Execution Directive:** "Do not build a marketing website; build an operational control panel. Every click should feel instantaneous, every screen should prioritize data density. Eradicate all generic AI patterns."
