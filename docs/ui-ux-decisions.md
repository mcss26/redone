# Midnight Club - UI/UX Decisions Log

## 2026-06-06: Two-Tier Typographic Navigation (Admin Index)
**Context:** The `AdminIndex.jsx` previously used a standard dashboard grid with cards, icons, and badges. While standard, it violated the Functional Brutalism directives when rendering ~18 global modules.
**Decision:** We implemented a "Two-Tier Typographic Navigation" pattern. 
- Tier 1 renders the high-level Phases (`MASTERS | PLANIFICACIÓN...`) as inline text links separated by pipes (`|`).
- Tier 2 renders the modules belonging to the selected Phase below it, separated by dots (`·`).
**Rationale:** This completely strips out containers, boxes, borders, and icons, bringing the high-density Admin screen into perfect architectural alignment with the `OperativoIndex` and `ContadorIndex` screens. It relies strictly on typography (`text-[9px] uppercase tracking-widest`) and color states (`text-brand-muted` vs `text-brand-text`) to guide the user.

## 2026-06-06: Master Modules Header Standardization
**Context:** The `SkuModule` (Catálogo SKU) was functioning as the golden standard for master modules, featuring no explicit `< VOLVER` button, a ghost add button, and a raw typography title block without subtext. The other 7 master modules retained legacy containers, subtexts, solid Pill buttons, and back arrows.
**Decision:** All master modules (`Profiles`, `Suppliers`, `StaffRoles`, `CostTemplates`, `FixedCostTemplates`, `PosTerminals`, `MasterVouchers`) have been strictly aligned to the `SkuModule`'s header format.
**Rationale:** Enforces the "No Back Button Policy" dictating that backward navigation must rely on the TopBar central logo, creating a true "Control Panel" feel across the entire system. Removes redundant descriptive subtexts to improve data density.
