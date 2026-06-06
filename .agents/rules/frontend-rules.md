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

## Aesthetic Constraints: Functional Brutalism

We are building a dark-mode, high-density control panel. These rules must be strictly observed, as previously established in our UI/UX logs:

- **Palette**: Deep Void `#0A0A0A` (Background), `brand-bg` (`#111111`), `brand-surface` (`#1A1A1A`), `brand-border` (`#333333`), `brand-text` (`#E5E5E5`), `brand-muted` (`#737373`).
- **Typography**: Google Font "Plus Jakarta Sans" globally. "JetBrains Mono" or standard mono for data tables and numbers.
- **No Red in UI**: Red is reserved EXCLUSIVELY for critical errors or missing stock. Expected operational expenses (like payroll) must NOT use red. Success is green.
- **Container Purge**: Do NOT use solid background boxes or cards (`bg-brand-surface`) around tables or primary views unless absolutely necessary. Rely on whitespace and typographic hierarchy ("Raw Data Tables").
- **Minimalist Status Dots**: Avoid using verbose text badges (e.g., "PENDING" or "APPROVED"). Use colored dots with subtle glow effects instead, relying on tooltips for detailed context.
- **Edges**: If containers must be used, use `rounded-xl` or `rounded-2xl` for smooth, modern software edges.

## Component Architecture (ERP Patterns)

### A. TOP BAR SHELL

- Replace standard sidebars with a full-width Top Bar to maximize horizontal screen real estate.
- Include a secondary Sub-Nav Dropdown for deep module linking (e.g., MASTERS).
- Do not add explicit "Back" buttons in modules if the Top Bar logo naturally acts as a home button.

### B. DATA VISUALIZATION & KPIs

- KPIs must double as interactive state filters for the tables below them.
- Separate data ingestion (file drops, forms) from visualization into distinct, dedicated views.

### C. SLIDE-OVER MODALS (Side-Sheets)

- All creation/editing of records happens in an absolute-positioned right-side slide-over panel, NOT centered modals. This keeps context visible. Keep inputs minimal; drop unnecessary help texts or fields.

### D. HIGH DENSITY TABLES

- No pagination unless strictly required. Favor full-width tables.
- Use `text-xs` or `text-[10px]`, `tracking-widest`, `uppercase` for table headers.
- Always implement local `.filter()` and `.sort()` on the frontend for speed once data is loaded. Headers should double as interactive sort toggles.

## Technical Requirements

- **Stack:** React 19, Tailwind CSS v3.4.17, Supabase JS Client, Lucide React for icons.
- **Data Fetching:** Always fetch data `useEffect` on mount. Avoid mock data. All inserts must map empty strings `""` to `null`.
- **Responsive:** Desktop-first. This is an internal tool designed for wide monitors and POS terminals.
- **Routing:** Handled via conditional rendering in `App.jsx` based on a global `currentView` state. Session persistence should utilize `localStorage`.

**Execution Directive:** "Do not build a marketing website; build an operational control panel. Every click should feel instantaneous, every screen should prioritize data density. Eradicate all generic AI patterns."
