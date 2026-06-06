# Midnight Club - UI/UX Changelog

## 2026-06-06
### StaffPlanModule Table Simplification
- **Module:** `src/layouts/StaffPlanModule.jsx`
- **Action:** Removed the redundant "APROBADOS" column from the main data table.
- **Reason:** To maximize data density and reduce visual noise, adhering to the "Functional Brutalism" principles. The visual indicator of approval state is completely covered by the neon status dot in the "ESTADO" column. The "SOLICITADOS" column was renamed to "CANT." and now dynamically renders the effective quantity (approved quantity if approved, requested quantity otherwise).

### Slide-Over CTA Button Unification (Contador Modules)
- **Module:** `PaymentsModule.jsx` & `FixedCostsModule.jsx`
- **Action:** Updated the `Guardar / Confirmar` CTA buttons in the Slide-Over panels to use the unified solid contrast block (`bg-brand-text text-brand-bg`).
- **Reason:** To adhere strictly to the Functional Brutalism standards established in `SkuModule.jsx`. The previous implementation used text-only buttons with borders which did not provide sufficient visual weight for the primary mutation action in a high-density environment.

### Top Bar Sub-Navigation (Contador)
- **Module:** `App.jsx` (TopBar Shell Component)
- **Action:** Added the `Contador Sub-Nav` dynamically rendered absolute-centered menu for finance/reporting views (`payments`, `fixed_costs`, `night_report`, `monthly_report`, `annual_report`).
- **Reason:** To enforce the global Component Architecture rule (Section A) which mandates the omission of sidebars in favor of a full-width Top Bar with absolutely centered sub-navigation, matching the Operativo user experience.

### Admin Index Functional Brutalism Refactoring
- **Module:** `src/layouts/AdminIndex.jsx`
- **Action:** Completely dismantled the "Dashboard Card" UI grid and replaced it with a Two-Tier Typographic Navigation system. Removed all Lucide React icons, neon status dots on modules, and `bg-brand-surface` containers.
- **Reason:** To perfectly align the Global Admin view with the operative "Functional Brutalism" constraints, minimizing visual noise and prioritizing extreme data density. Users now select a "Phase" (Tier 1) to render the corresponding inline "Modules" (Tier 2).

### Mass Remediation: Masters Modules
- **Modules:** `ProfilesModule`, `SuppliersModule`, `StaffRolesModule`, `CostTemplatesModule`, `FixedCostTemplatesModule`, `PosTerminalsModule`, `MasterVouchersModule`
- **Action:** Executed an automated "Container Purge" by removing all `bg-brand-surface border border-brand-border rounded-2xl` wrappers around tables. Converted all Slide-Over inputs to `bg-transparent border-b`. Replaced all `rounded-xl` save buttons with the solid edge-to-edge Block Button pattern (`flex-1 bg-brand-text text-brand-bg`).
- **Reason:** To strictly enforce the Functional Brutalism design system (Rules 24 and 26) established by the Golden Standards (`OpeningCostsModule` and `StockRequestsModule`) across all 7 Master views, ensuring 100% aesthetic homogeneity.

### Mass Header Alignment: Masters Modules
- **Modules:** `ProfilesModule`, `SuppliersModule`, `StaffRolesModule`, `CostTemplatesModule`, `FixedCostTemplatesModule`, `PosTerminalsModule`, `MasterVouchersModule`
- **Action:** Removed the explicit `< VOLVER` (`<ArrowLeft>`) button from the headers and aligned the structure with the "Catálogo SKU" (`SkuModule.jsx`) Golden Standard. Replaced large, pill-shaped solid add buttons (`+ NUEVO`) with textual ghost buttons and unified header layouts (e.g. `flex items-end justify-between mb-4`) without descriptive subtitles.
- **Reason:** To strictly enforce the top bar navigation policy ("No Back Button Policy" in `frontend-rules.md`) and achieve pixel-perfect layout alignment from the tables upward across all Master modules, adopting the exact minimalist aesthetics of the Sku Catalog.
