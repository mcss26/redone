# Midnight Club - UI/UX Decisions Log

## 2026-06-06: Two-Tier Typographic Navigation (Admin Index)
**Context:** The `AdminIndex.jsx` previously used a standard dashboard grid with cards, icons, and badges. While standard, it violated the Functional Brutalism directives when rendering ~18 global modules.
**Decision:** We implemented a "Two-Tier Typographic Navigation" pattern. 
- Tier 1 renders the high-level Phases (`MASTERS | PLANIFICACIÓN...`) as inline text links separated by pipes (`|`).
- Tier 2 renders the modules belonging to the selected Phase below it, separated by dots (`·`).
**Rationale:** This completely strips out containers, boxes, borders, and icons, bringing the high-density Admin screen into perfect architectural alignment with the `OperativoIndex` and `ContadorIndex` screens. It relies strictly on typography (`text-[9px] uppercase tracking-widest`) and color states (`text-brand-muted` vs `text-brand-text`) to guide the user.
