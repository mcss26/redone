# Midnight Club - UI/UX Decisions Log

## 2026-06-14: Playwright-Driven Deep Visual Audit Remediation
**Context:** The UI was audited visually using automated Playwright screenshots across all 22 active views. We identified recurring discrepancies with the Functional Brutalism standards, specifically concerning rounded solid inputs and nested `bg-brand-surface` wrappers in tables and topbars.
**Decision:** We conducted a mass remediation focusing on three architectural corrections:
1. **Report Sub-Nav Realignment (`App.jsx`):** Removed the pill-shaped background wrapper from the Report modules sub-navigation. The topbar must strictly employ text-based floating navigation without explicit containers, matching the `Admin` and `Contador` sub-navs.
2. **Form Field Transparency Enforcement:** Any standard CRUD slide-over input must strictly use `bg-transparent border-b rounded-none px-0`, deliberately breaking the modern "rounded pill" convention to favor raw, terminal-like data entry fields.
3. **Container Purge in High-Density Tables (`NightOpsModule.jsx`):** Stripped out background opacity scales (`bg-brand-surface/30`, etc.) from nested tables. Hierarchical separation must be achieved exclusively via typography (tracking, size) and raw `border-b` divisions, never via solid background shapes.

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

## 2026-06-06: Brutalismo Funcional en Autenticación (Login)
**Context:** La pantalla de Login mantenía un diseño de 'tarjeta' flotante con bordes redondeados (Glassmorphism), lo que desentonaba drásticamente con la estética agresiva de alta densidad y contenedor purgado ('Container Purge') de los paneles Index.
**Decision:** Rediseño completo bajo los principios de Brutalismo Funcional.
**Guidelines:**
1. Eliminación total de contenedores y sombreados. El formulario flota directamente sobre el 'Deep Void' (`bg-brand-bg`).
2. Continuidad Tipográfica: Se utiliza una variante masiva del título (`text-[7rem]`) para igualar el impacto de la lectura de nombres en las pantallas Index, eliminando la sensación de 'landing page' e infundiendo la sensación de terminal operativa.
3. Input como consola: Línea de base cruda (`border-b-2`) con tracking extremo en lugar de campos de texto estándar.
4. Botón estricto: Bloque macizo sincronizado con el ancho del input, usando estados `disabled:bg-brand-surface` para visibilidad clara pero pasiva.
