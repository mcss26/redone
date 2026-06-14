# Midnight Club - UI/UX Changelog

## 2026-06-14
### Mass Remediation: Standardizing Inputs and Touch Targets
- **Modules:** `WorkDaysModule.jsx`, `NightReportModule.jsx`, `ProfilesModule.jsx`, `SkuModule.jsx`, `OpeningCostsModule.jsx`, `FixedCostsModule.jsx`, `PaymentsModule.jsx`
- **Action:** Standardized all inputs across slide-over panels to use the `border-b` brutalist style (`bg-transparent border-b border-brand-border/50`). Removed any remaining native `alert()` or `console.error` calls and replaced them with the unified `window.UI.toast`. Increased touch target size for primary action buttons inside tables to a minimum of 44x44px.
- **Reason:** To adhere to the "Functional Brutalism" constraints, maximizing accessibility (larger touch areas) and maintaining uniform feedback mechanisms without blocking UI threads.

### Payments & Fixed Costs UI Alignment
- **Modules:** `PaymentsModule.jsx`, `FixedCostsModule.jsx`
- **Action:** Replaced the pure brutalist (transparent border-b) form inputs in the slide-overs with the curved surface inputs (`bg-brand-surface rounded-xl border border-brand-border`) to perfectly align with the `OpeningCostsModule` and `StaffPlanModule` standards. Added KPI grids at the bottom of the tables with `text-2xl` values. Standardized the Neon Status Dots so that 'paid' is universally blue (`bg-blue-500` with matching shadow glow) and 'pending'/'approved' is yellow. Added hover highlight to table rows and fixed table cell paddings. Added `rounded-xl` to Slide-Over footer buttons.
- **Reason:** To achieve 100% aesthetic homogeneity and consistency across all modules in the "Contador / Pagos" phase versus the "Operaciones" phase.

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
- Rediseño brutalista del GlobalMessagesBoard: Eliminados los contenedores, los bordes redondeados y los fondos. Ahora el componente se muestra como una consola monocromática ('Terminal Log') con tipografía mono, integrada orgánicamente a la pantalla, siguiendo la regla de 'Container Purge' y minimización de bordes.
- Rediseño brutalista del Login: Eliminado el contenedor tipo tarjeta (Glassmorphism). Ahora el formulario se compone exclusivamente de elementos tipográficos suspendidos sobre el fondo 'Deep Void'. El input se simplificó a una línea base (border-b-2) con texto extra grande monospace, y el botón se estiró con espaciado de letras extremo (tracking-[0.4em]) para aumentar la sofisticación.
- Ajuste de proporciones en el Login Brutalista: Se corrigió la alineación del input integrando el icono de candado en la misma línea, controlando el ancho a max-w-xs para que el botón deshabilitado y el input formen un bloque geométrico perfecto. Se redujo el espaciado interno (space-y) para restaurar la coherencia visual.
- Login: Reemplazado el encabezado básico por una estructura tipográfica gigante (text-[7rem]) idéntica a los nombres de los usuarios en los módulos Index. Se dividió 'MIDNIGHT' y 'CLUB' en dos líneas apiladas con leading ultracompacto para un impacto visual masivo y consistente con la estética del resto del sistema.

### Auditoria Barra Functional Brutalism Refactoring
- **Module:** `src/layouts/AuditoriaBarraModule.jsx`
- **Action:** Aplicación estricta de las reglas de Functional Brutalism. Se eliminó el botón explícito `< VOLVER` (`<ArrowLeft>`). Se eliminaron los contenedores de tarjetas (`bg-brand-surface`, `rounded-2xl`) alrededor de la tabla y del resumen superior, haciendo que los datos fluyan directamente sobre el fondo (`Container Purge`). Se ajustaron las tipografías de los selectores, inputs y botones para ser transparentes con solo bordes inferiores, y se hizo uso intensivo de `tracking-widest` y `uppercase` con tamaños comprimidos (`text-[8px]`, `text-[10px]`).
- **Reason:** Alineación total con el manual de estilo `.agents/rules/frontend-rules.md`, maximizando la densidad de datos y eliminando el ruido visual en módulos de reporte.

### Correcciones de Auditoría UI/UX (Accesibilidad, Animaciones y Encoding)
- **Modules:** `index.css`, `index.html`, `ProfilesModule.jsx`, `SkuModule.jsx`, `AdminIndex.jsx`, `ContadorIndex.jsx`, `GlobalMessagesBoard.jsx`, `Login.jsx`
- **Action:** 
  1. Se agregó `--color-brand-danger` y `.animate-slide-in` en `index.css`.
  2. Se agregó la utilidad `.no-scrollbar` para ocultar nativamente la barra de scroll en navegaciones horizontales.
  3. Se removieron todas las tildes y caracteres especiales de los títulos principales (ej. `CATÁLOGO` -> `CATALOGO`, `BITÁCORA` -> `BITACORA`, `▼` -> ícono `<ChevronDown />`) para resolver permanentemente bugs de encoding en el build y consolidar el diseño *Raw Brutalism*.
  4. Se corrigió la accesibilidad modificando el `lang="es"` y permitiendo zoom de usuario en `index.html`.
  5. Se agregaron pares `htmlFor`/`id` a los formularios de Perfiles y SKU para lectores de pantalla.
- **Reason:** Atender las advertencias críticas, altas y medias de la última auditoría, y refinar la interacción (slide-in) y accesibilidad sin sacrificar la homogeneidad visual de la app.

- 2026-06-14 - Refactor UI/UX Auditoría: Eliminado window.confirm, implementado GlobalUI, remediado Container Purge y dependencias huérfanas en módulos CRUD. Añadido isMountedRef en useEffects para seguridad asíncrona.
- 2026-06-14 - Hotfix: Resolución de errores de sintaxis masivos provocados por migración de window.confirm. Añadidos los paréntesis de cierre en condicionales asíncronos en 13 módulos. Vite ahora compila exitosamente.