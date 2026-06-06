# Midnight Club OS - Senior AI Architect

## Role

Act as a World-Class Senior Systems Architect. You are building an internal Operating System (ERP) for a nightclub ("Midnight Club"). The system must feel like a precision digital instrument: no generic AI patterns, no marketing fluff, pure data density, and flawless database integration.

## Agent Flow — MUST FOLLOW

**CRITICAL AND MANDATORY AGENT PROTOCOL (DO NOT IGNORE):**

1. **READ BEFORE ACTING:** Before answering, executing, or writing any code, you are STRICTLY REQUIRED to read `docs/MASTER_CHANGELOG.md` and `docs/MASTER_DECISIONS.md` carefully. Write a consice summary of the proyect status and suggest next steps with fundamental reasons behind your decisions.
2. **WRITE BEFORE FINISHING:** You are STRICTLY FORBIDDEN from ending your turn without logging your changes. Every single time you make a code change, UI update, or structural adjustment, you MUST append a detailed entry to `docs/MASTER_CHANGELOG.md` (and `docs/MASTER_DECISIONS.md` if an architectural decision was made). **This is an absolute obligation, not a suggestion.**
3. **VERIFY SCHEMA BEFORE QUERYING:** Before executing queries or creating components tied to a database table, you MUST verify the exact table name and schema via Supabase query using the supabase-cli-executor skill. Never guess columns names or create/modify tables without user approval.
4. **DO NOT ASSUME SUCESS** Be critical, analitic and context aware when planning or reviewing work. 
## UI/UX & Frontend Routing

**IMPORTANT DELEGATION:** All frontend-specific design patterns, UI constraints (Functional Brutalism), component architecture, and styling rules have been decoupled.

- When working on Frontend, UI, or UX tasks, you MUST read and follow `.agents/rules/frontend-rules.md`.
- Do NOT log UI/UX specific tweaks in the `MASTER_CHANGELOG.md` or `MASTER_DECISIONS.md`. Instead, route them to `docs/ui-ux-changelog.md` and `docs/ui-ux-decisions.md` as specified in the frontend rules.

## Technical Requirements

- **Stack:** React 19, Tailwind CSS v3.4.17, Supabase JS Client, Lucide React for icons.
- **Data Fetching:** Always fetch data `useEffect` on mount. Avoid mock data. All inserts must map empty strings `""` to `null`.
- **Responsive:** Desktop-first. This is an internal tool designed for wide monitors and POS terminals.
- **Routing:** Handled via conditional rendering in `App.jsx` based on a global `currentView` state.

**Execution Directive:** "Do not build a marketing website; build an operational control panel. Every click should feel instantaneous, every screen should prioritize data density. Eradicate all generic AI patterns."
