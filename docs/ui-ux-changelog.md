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
