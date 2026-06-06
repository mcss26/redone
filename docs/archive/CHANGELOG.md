# Master Changelog (V1 & V2)

## Índice de Contenidos

## Archivo: CHANGELOG-v2.md
- [Midnight Club OS - Redone V2 Changelog](#midnight-club-os-redone-v2-changelog)
  - [[2.18.0] - 2026-06-05](#2-18-0-2026-06-05)
 -[Added:MódulodeCostosFijosMensuales(Overheads)ymotorfinanciero](#added-m-dulo-de-costos-fijos-mensuales-overheads-y-motor-financiero)
  - [[2.16.0] - 2026-05-18](#2-16-0-2026-05-18)
 -[Fase4:Polish&DeployReadiness(Step4.1-4.3)](#fase-4-polish-deploy-readiness-step-4-1-4-3)
 -[Fase3:CodeQuality(Step3.1-ReportesFinancieros)](#fase-3-code-quality-step-3-1-reportes-financieros)
 -[Fase2:CodeQuality(Step2.4-BloqueOperativo)](#fase-2-code-quality-step-2-4-bloque-operativo)
 -[Fase2:CodeQuality(Step2.3-PlanificaciónOperativa)](#fase-2-code-quality-step-2-3-planificaci-n-operativa)
 -[Fase2:CodeQuality(Step2.2-MasterData)](#fase-2-code-quality-step-2-2-master-data)
 -[Fase1:FlattenStructure(Step1.1)](#fase-1-flatten-structure-step-1-1)
 -[Step1.2:Environment&GitHygiene](#step-1-2-environment-git-hygiene)
 -[Step1.3:PackageIdentity](#step-1-3-package-identity)
 -[Step1.4:ViteBasePath](#step-1-4-vite-base-path)
 -[Step1.5:DeployWorkflow](#step-1-5-deploy-workflow)
 -[Step1.6:Role-GatingNavigation&Mutation](#step-1-6-role-gating-navigation-mutation)
  - [[2.15.0] - 2026-05-18](#2-15-0-2026-05-18)
 -[ProductionReadinessPlanning](#production-readiness-planning)
 -[Fase0:Housekeeping(Ejecutado)](#fase-0-housekeeping-ejecutado)
  - [[2.14.0] - 2026-05-18](#2-14-0-2026-05-18)
 -[Added](#added)
  - [[2026-05-17] InicializaciÃ³n de Roadmap de Cierre](#2026-05-17-inicializaci-n-de-roadmap-de-cierre)
## Archivo: CHANGELOG_v1_compressed.md
- [Midnight Club OS - Changelog (Compressed)](#midnight-club-os-changelog-compressed)
  - [V2 Redone Entries](#v2-redone-entries)
 -[2026-05-17:V2Redone-AuditoradeConsumoyP&L(NightReport)](#2026-05-17-v2-redone-auditora-de-consumo-y-p-l-night-report)
 -[2026-05-17:V2Redone-NightOpsStaging&Parsers](#2026-05-17-v2-redone-night-ops-staging-parsers)
 -[2026-05-17:FixingPasslineCSVImports](#2026-05-17-fixing-passline-csv-imports)
 -[2026-05-17:V2Redone-NightOpsModulePorting&GBOLCSV](#2026-05-17-v2-redone-nightopsmodule-porting-gbol-csv)
 -[2026-05-17:V2Redone-Phase3(BarInventory)](#2026-05-17-v2-redone-phase-3-bar-inventory)
 -[2026-05-17:V2Redone-MasterVouchersModule](#2026-05-17-v2-redone-master-vouchers-module)
 -[2026-05-17:V2Redone-Phase2Execution(PaymentsModule)](#2026-05-17-v2-redone-phase-2-execution-payments-module)
 -[2026-05-17:V2Redone-ArchitectureSimplification(ReceivingRemoved)](#2026-05-17-v2-redone-architecture-simplification-receiving-removed)
 -[2026-05-17:V2Redone-StockRequestsModuleRefactor&FinancialTracking](#2026-05-17-v2-redone-stockrequestsmodule-refactor-financial-tracking)
 -[2026-05-17:V2Redone-OpeningCostsModuleRefactor](#2026-05-17-v2-redone-openingcostsmodule-refactor)
 -[2026-05-17:V2Redone-StaffPlanModuleFinancials](#2026-05-17-v2-redone-staffplanmodule-financials)
 -[2026-05-17:V2Redone-StaffPlanModuleRefactor](#2026-05-17-v2-redone-staffplanmodule-refactor)
 -[2026-05-17:V2Redone-WorkDaysModuleDetailsPanel](#2026-05-17-v2-redone-workdaysmodule-details-panel)
 -[2026-05-17:V2Redone-UI/UXNavigationFix(AdminIndex)](#2026-05-17-v2-redone-ui-ux-navigation-fix-adminindex)
 -[2026-05-17:V2Redone-MasterModulesUI/UXAlignment(StaffRoles&POS)](#2026-05-17-v2-redone-master-modules-ui-ux-alignment-staff-roles-pos)
 -[2026-05-17:V2Redone-SKUModuleUIAlignment](#2026-05-17-v2-redone-sku-module-ui-alignment)
 -[2026-05-17:V2Redone-Module14:NightOperations(Auditora/Sbado)](#2026-05-17-v2-redone-module-14-night-operations-auditora-sbado)
 -[2026-05-17:V2Redone-Module13:Receiving(RecepcindeStock)](#2026-05-17-v2-redone-module-13-receiving-recepcin-de-stock)
 -[2026-05-17:V2Redone-Module12:Payments(Contabilidad)](#2026-05-17-v2-redone-module-12-payments-contabilidad)
 -[2026-05-17:V2Redone-Module10&11:StaffPlan&StockRequests](#2026-05-17-v2-redone-module-10-11-staff-plan-stock-requests)
 -[2026-05-17:V2Redone-Module08&09:WorkDays&OpeningCosts](#2026-05-17-v2-redone-module-08-09-work-days-opening-costs)
 -[2026-05-17:V2Redone-Module07:POSTerminals](#2026-05-17-v2-redone-module-07-pos-terminals)
 -[2026-05-17:V2Redone-Module05:CostTemplates](#2026-05-17-v2-redone-module-05-cost-templates)
 -[2026-05-17:V2Redone-Module04:StaffRoles](#2026-05-17-v2-redone-module-04-staff-roles)
 -[2026-05-17:V2Redone-SupabaseMigrationExecution](#2026-05-17-v2-redone-supabase-migration-execution)
 -[2026-05-17:V2Redone-ImprovementstoSuppliersModule](#2026-05-17-v2-redone-improvements-to-suppliersmodule)
 -[2026-05-17:V2Redone-ImprovementstoSkuModule](#2026-05-17-v2-redone-improvements-to-skumodule)
 -[2026-05-17:V2RedoneModule01:Profiles+PINAuth](#2026-05-17-v2-redone-module-01-profiles-pin-auth)
 -[2026-05-17:V2RedoneAdminShell+PINLogin+ModuleIndex](#2026-05-17-v2-redone-admin-shell-pin-login-module-index)
 -[2026-05-17:V2RedoneModule02:Suppliers](#2026-05-17-v2-redone-module-02-suppliers)
 -[2026-05-17:V2Redone-Module03:SKUCatalog](#2026-05-17-v2-redone-module-03-sku-catalog)
 -[2026-05-17:V2Redone-SupabaseMigrationExecution](#2026-05-17-v2-redone-supabase-migration-execution)
 -[2026-05-17:V2Redone-Phase2.5:BinaryOperationsMigration](#2026-05-17-v2-redone-phase-2-5-binary-operations-migration)
 -[2026-05-17-SKUMappingandCSVImportResilienceUpdate](#2026-05-17-sku-mapping-and-csv-import-resilience-update)
 -[2026-05-17-BulkSKUImport](#2026-05-17-bulk-sku-import)
 -[2026-05-17-AuditoryCalculationFix](#2026-05-17-auditory-calculation-fix)
## Archivo: CHANGELOG_legacy_backup.md
- [Midnight Club OS - Changelog](#midnight-club-os-changelog)
  - [[Unreleased]](#unreleased)
 -[2026-05-17:V2Redone-AuditoríadeConsumoyP&L(NightReport)](#2026-05-17-v2-redone-auditor-a-de-consumo-y-p-l-night-report)
 -[2026-05-17:V2Redone-NightOpsStaging&Parsers](#2026-05-17-v2-redone-night-ops-staging-parsers)
 -[2026-05-17:FixingPasslineCSVImports](#2026-05-17-fixing-passline-csv-imports)
 -[2026-05-17:V2Redone-NightOpsModulePorting&GBOLCSV](#2026-05-17-v2-redone-nightopsmodule-porting-gbol-csv)
 -[2026-05-17:V2Redone-Phase3(BarInventory)](#2026-05-17-v2-redone-phase-3-bar-inventory)
 -[2026-05-17:V2Redone-MasterVouchersModule](#2026-05-17-v2-redone-master-vouchers-module)
 -[2026-05-17:V2Redone-Phase2Execution(PaymentsModule)](#2026-05-17-v2-redone-phase-2-execution-payments-module)
 -[2026-05-17:V2Redone-ArchitectureSimplification(ReceivingRemoved)](#2026-05-17-v2-redone-architecture-simplification-receiving-removed)
 -[2026-05-17:V2Redone-StockRequestsModuleRefactor&FinancialTracking](#2026-05-17-v2-redone-stockrequestsmodule-refactor-financial-tracking)
 -[2026-05-17:V2Redone-OpeningCostsModuleRefactor](#2026-05-17-v2-redone-openingcostsmodule-refactor)
 -[2026-05-17:V2Redone-StaffPlanModuleFinancials](#2026-05-17-v2-redone-staffplanmodule-financials)
 -[2026-05-17:V2Redone-StaffPlanModuleRefactor](#2026-05-17-v2-redone-staffplanmodule-refactor)
 -[2026-05-17:V2Redone-WorkDaysModuleDetailsPanel](#2026-05-17-v2-redone-workdaysmodule-details-panel)
 -[2026-05-17:V2Redone-UI/UXNavigationFix(AdminIndex)](#2026-05-17-v2-redone-ui-ux-navigation-fix-adminindex)
 -[2026-05-17:V2Redone-MasterModulesUI/UXAlignment(StaffRoles&POS)](#2026-05-17-v2-redone-master-modules-ui-ux-alignment-staff-roles-pos)
 -[2026-05-17:V2Redone-SKUModuleUIAlignment](#2026-05-17-v2-redone-sku-module-ui-alignment)
 -[2026-05-17:V2Redone-Module14:NightOperations(Auditoría/Sábado)](#2026-05-17-v2-redone-module-14-night-operations-auditor-a-s-bado)
 -[2026-05-17:V2Redone-Module13:Receiving(RecepcióndeStock)](#2026-05-17-v2-redone-module-13-receiving-recepci-n-de-stock)
 -[2026-05-17:V2Redone-Module12:Payments(Contabilidad)](#2026-05-17-v2-redone-module-12-payments-contabilidad)
 -[2026-05-17:V2Redone-Module10&11:StaffPlan&StockRequests](#2026-05-17-v2-redone-module-10-11-staff-plan-stock-requests)
 -[2026-05-17:V2Redone-Module08&09:WorkDays&OpeningCosts](#2026-05-17-v2-redone-module-08-09-work-days-opening-costs)
 -[2026-05-17:V2Redone-Module07:POSTerminals](#2026-05-17-v2-redone-module-07-pos-terminals)
 -[2026-05-17:V2Redone-Module05:CostTemplates](#2026-05-17-v2-redone-module-05-cost-templates)
 -[2026-05-17:V2Redone-Module04:StaffRoles](#2026-05-17-v2-redone-module-04-staff-roles)
 -[2026-05-17:V2Redone-SupabaseMigrationExecution](#2026-05-17-v2-redone-supabase-migration-execution)
 -[2026-05-17:V2Redone-ImprovementstoSuppliersModule](#2026-05-17-v2-redone-improvements-to-suppliersmodule)
 -[2026-05-17:V2Redone-ImprovementstoSkuModule](#2026-05-17-v2-redone-improvements-to-skumodule)
 -[NuevoMÃ³dulo:MasterPagos(2026-05-17)](#nuevo-m-dulo-master-pagos-2026-05-17)
 -[Workdays-CorreccionesdeCierreyP&L(2026-05-16)](#workdays-correcciones-de-cierre-y-p-l-2026-05-16)
 -[NightChief-FlujodeCierreFinal(2026-05-10)](#night-chief-flujo-de-cierre-final-2026-05-10)
 -[NightChiefÃ¢â‚¬â€�PasslineBoleterÃƒÂ­aIntegration(2026-05-10)](#night-chief-passline-boleter-a-integration-2026-05-10)
 -[NightChiefÃ¢â‚¬â€�Consumo&RecaudaciÃƒÂ³nTables(2026-05-10)](#night-chief-consumo-recaudaci-n-tables-2026-05-10)
 -[MasterScreensUI/UXAuditÃ¢â‚¬â€�Cycle1(2026-05-10)](#master-screens-ui-ux-audit-cycle-1-2026-05-10)
 -[Added](#added)
 -[Changed](#changed)
  - [[2026-05-10] Night Chief - Passline General Fixes](#2026-05-10-night-chief-passline-general-fixes)
 -[[2026-05-10]BreakEven-Real-TimeP&LDashboard](#2026-05-10-break-even-real-time-p-l-dashboard)
 -[[2026-05-10]WorkdaysPlanner-RefactorEstÃƒÂ©tico](#2026-05-10-workdays-planner-refactor-est-tico)
 -[[2026-05-10]FinePolish-BrutalismoFuncional](#2026-05-10-fine-polish-brutalismo-funcional)
 -[[2026-05-16]UI/UXNavigationRefactor(GlobalDate)](#2026-05-16-ui-ux-navigation-refactor-global-date)
 -[[2026-05-16]Bugfix:ConsumodeSistemavsFÃƒÂ­sico](#2026-05-16-bugfix-consumo-de-sistema-vs-f-sico)
 -[[2026-05-16]UI/UXNavigation(Reportes)](#2026-05-16-ui-ux-navigation-reportes)
 -[[2026-05-16]DataEngine&ConciliaciÃ³ndeBarra(Reportes)](#2026-05-16-data-engine-conciliaci-n-de-barra-reportes)
 -[[2026-05-16]UX/UIRefactorReportes(HistÃ³ricoyDesgloseFiscal)](#2026-05-16-ux-ui-refactor-reportes-hist-rico-y-desglose-fiscal)
 -[[2026-05-16]MotordeComisionesDigitales(DataEngine)](#2026-05-16-motor-de-comisiones-digitales-data-engine)
 -[[2026-05-16]HotfixQueryReportesHistÃ³ricos](#2026-05-16-hotfix-query-reportes-hist-ricos)
 -[[2026-05-16]AjusteFinoenLÃ³gicadeFaltantes(AuditorÃ­a)](#2026-05-16-ajuste-fino-en-l-gica-de-faltantes-auditor-a)
 -[[2026-05-16]HardResetdeBasedeDatos](#2026-05-16-hard-reset-de-base-de-datos)
 -[[2026-05-17]UX/UIRefactor-InventarioBarraResponsivo](#2026-05-17-ux-ui-refactor-inventario-barra-responsivo)
 -[[2026-05-17]Hotfix-ImportadorCSVPassline(Separadores)](#2026-05-17-hotfix-importador-csv-passline-separadores)
 -[[2026-05-17]Fix-PasslineIngresos(BreakEven)](#2026-05-17-fix-passline-ingresos-break-even)
 -[[2026-05-17]Hotfix-ImportadorCSVGBOL(Comillas)](#2026-05-17-hotfix-importador-csv-gbol-comillas)
 -[[2026-05-17]HardResetdeBasedeDatos(Pruebas)](#2026-05-17-hard-reset-de-base-de-datos-pruebas)
  - [[2026-05-17]](#2026-05-17)
 -[Fixed](#fixed)
 -[Added](#added)
 -[2024-05-17:ImplementacióndelMóduloAdminPagos](#2024-05-17-implementaci-n-del-m-dulo-admin-pagos)
 -[Fixed](#fixed)
 -[2024-05-17:RollbackdelModuloAdminPagos](#2024-05-17-rollback-del-modulo-admin-pagos)
 -[2024-05-17:EdicionInlineenStockCentral](#2024-05-17-edicion-inline-en-stock-central)
 -[2026-05-17:V2Redone—Module01:Profiles+PINAuth](#2026-05-17-v2-redone-module-01-profiles-pin-auth)
 -[2026-05-17:V2Redone—AdminShell+PINLogin+ModuleIndex](#2026-05-17-v2-redone-admin-shell-pin-login-module-index)
 -[2026-05-17:V2Redone—Module02:Suppliers](#2026-05-17-v2-redone-module-02-suppliers)
 -[2026-05-17:V2Redone-Module03:SKUCatalog](#2026-05-17-v2-redone-module-03-sku-catalog)
 -[2026-05-17:V2Redone-SupabaseMigrationExecution](#2026-05-17-v2-redone-supabase-migration-execution)
 -[2026-05-17-SKUMappingandCSVImportResilienceUpdate](#2026-05-17-sku-mapping-and-csv-import-resilience-update)
 -[2026-05-17-BulkSKUImport](#2026-05-17-bulk-sku-import)
 -[2026-05-17-AuditoryCalculationFix](#2026-05-17-auditory-calculation-fix)

### --- SOURCE: CHANGELOG-v2.md --- ###

# Midnight Club OS - Redone V2 Changelog

## [2.18.0] - 2026-06-05

### Added: Contador Index View
- **Frontend - ContadorIndex**: Se desarrolló una vista nativa de Index para el rol `contador`, eliminando la dependencia del Dashboard administrativo tradicional. La vista sigue el paradigma "Brutalismo Funcional" del Operativo Index (hero header con nombre de pila, ausencia de sub-nav superior, footer de Jornada Activa dinámica consultando a la tabla `work_days`).
- **Frontend - ContadorIndex (Navegación)**: Se implementó acceso directo a los módulos contables de ejecución pura (`Pagos Variables`, `Gastos Fijos`). Además, se programó un menú desplegable interactivo (`dropdown inline`) para los módulos de reporte ("Reporte de Noche", "Reporte Mensual", "Reporte Anual") optimizando la jerarquía visual sin necesidad de menús laterales y usando el componente de React para manejar el estado de apertura.
- **Enrutamiento (App.jsx)**: Se actualizó la función `renderView` para interceptar condicionalmente la ruta `'index'` cuando `user.role === 'contador'`, inyectando directamente el nuevo `ContadorIndex` e independizando por completo el flujo de usuario financiero.

### Operations UI/UX Polish (Functional Brutalism)
- **Frontend - OperativoIndex**: Se simplificó la interfaz eliminando los KPIs numéricos al lado de los botones de navegación por decisión de diseño (reducción de complejidad visual), manteniendo únicamente el indicador dinámico de "JORNADA ACTIVA" en el footer. Se optimizó el `useEffect` para extraer exclusivamente el estado de la jornada desde `work_days`, eliminando el bloque de consultas en paralelo (`Promise.all`) a las tablas operativas, mejorando el rendimiento de carga inicial.
- **Operative Modules (Data Filtering)**: Se actualizó la consulta `supabase.from('work_days')` en los módulos `OpeningCostsModule`, `StockRequestsModule` y `StaffPlanModule` de `.in('status', ['open', 'closed'])` a `.eq('status', 'open')`. Esto previene estrictamente que el sistema muestre eventos o jornadas cerradas en los selectores de planificación operativa, simplificando la vista y protegiendo el histórico.
- **Frontend - StaffPlanModule**: Se solucionó un bug lógico donde las solicitudes manuales de staff desde la vista operativa ignoraban la "Cantidad Default" configurada en el Tarifario. Ahora, el selector consulta `staff_roles` y auto-completa dinámicamente el campo de cantidad. Además, se alineó estéticamente la tabla a formato "Raw Data", eliminando los contenedores y reemplazando labels por Status Dots.
- **Frontend - SkuModule**: Se alineó el catálogo al Brutalismo Funcional de la V2. El formulario (Sidebar) de ingreso y edición fue depurado de "cajas" sólidas. Se implementó funcionalidad de ordenamiento (sort) iterativo sin íconos redundantes en los encabezados de tabla.
- **Arquitectura de Datos - SkuModule**: Se depreció por completo el campo `unit` (Unidad) de los formularios front-end por decisión de negocio ("siempre se carga por unidad"), forzando que internamente se pase siempre el valor `"unidad"` para no romper esquemas existentes de base de datos.
- **Frontend - App.jsx & Contexts**: Se implementó persistencia de sesión a través del `localStorage` (`mc_user` y `mc_active_view`), lo que impide que los recargos de navegador eliminen la sesión iniciada mediante PIN de los usuarios operativos, mejorando sustancialmente la experiencia inmersiva del POS.

### Added: Módulo de Costos Fijos Mensuales (Overheads) y motor financiero
- **Supabase API Exec**: Se restauró la skill `supabase-cli-executor.js` usando la Management API (POST `/database/query`) para evitar bloqueos por falta de Docker Desktop local.
- **Database**: Creación de tabla `monthly_fixed_costs` con RLS habilitado.
- **Frontend - UI**: Se creó `FixedCostsModule.jsx` utilizando Functional Brutalism. Permite la carga, edición, borrado y pago de costos fijos por mes.
- **Reporte Mensual**: Se integró el modelo financiero en `MonthlyReportModule.jsx` para restar la totalidad de la estructura/overheads mensual directamente del *Net Profit* bruto antes del ROI.
- **Navegación**: Se dio acceso en rol Contador y Admin en la fase de Ejecución en `AdminIndex.jsx`.

### Stock Requests & Operations Polish
- **Database (stock_requests)**: Se ejecutó un `ALTER TABLE` vía `supabase-cli-executor.js` agregando la columna `supplier_id` (uuid REFERENCES suppliers). Esto quiebra la dependencia estricta al catálogo `skus`, permitiendo al equipo operativo sobreescribir el proveedor designado a nivel de pedido individual (Granular Supplier Override).

## [2.17.0] - 2026-05-20

### Fase 4: Polish & Deploy Readiness (GitHub Pages Fix)
- **vite.config.js**: Corregido el `base: '/'` a `base: '/redone/'` para solucionar los errores de `404 Not Found` en la importación de assets estáticos (JS/CSS) y la pantalla en blanco durante el despliegue en GitHub Pages.

### Fase 3: Code Quality (Step 3.2 - Supabase Limits Mitigation)
- **Supabase Limits Mitigation**: Detectada vulnerabilidad crítica arquitectónica donde los reportes agregados (Night, Monthly, Annual) sufrían truncamiento de datos en tablas con más de 1000 filas (ej. `stg_passline_tickets`, `night_cash_closing`, `opening_costs`) debido al límite nativo `.range()` de Supabase (PostgREST API).
- **lib/queryHelper.js**: Implementado patrón de diseño de capa de acceso a datos para mitigar truncamientos de red. Creada utilidad centralizada `fetchAll(queryBuilder)` que abstrae bucles iterativos seguros mediante `.range()` secuenciales, consolidando todas las páginas en memoria para un cálculo de P&L perfecto desde el frontend.
- **Reportes Financieros**: Refactorizados `NightReportModule`, `MonthlyReportModule` y `AnnualReportModule` inyectando el helper `fetchAll()` en sus respectivos `Promise.all` agregadores. Esto garantiza precisión matemática a largo plazo para cálculos contables sin necesidad de recurrir a vistas SQL (alineado con la decisión arquitectónica V2 de *Zero Aggregation Tables*).
- **lib/gbolService.js**: Incorporado uso de `fetchAll()` en la función `populateSystemAmounts` para `import_gbol_facturacion`, blindando la persistencia de caja física incluso si la exportación del POS GBOL en una sola jornada superase los 1000 comprobantes.

## [2.16.0] - 2026-05-18

### UX/UI Polish: Cinematic Login
- **Login.jsx**: Rediseñado el módulo de Login (`src/layouts/Login.jsx`) para adoptar un estilo cinemático y refinado de "Functional Brutalism" (Ghost Glass). Implementados fondos con radial gradients profundos (`animate-slow-pulse`), bordes de cristal ahumado (`backdrop-blur-xl`), animaciones CSS nativas escalonadas (`animate-fade-in delay-100`, `animate-slide-up delay-300`) e interacciones avanzadas en el botón "AUTENTICAR" (shimmer effect y scale feedback).
- **index.css**: Agregados `@keyframes` nativos (`fade-in`, `slide-up`, `slow-pulse`, `shimmer`) y utilitarios para delays de animación a la hoja de estilos global para habilitar estas transiciones cinemáticas fluidas.

### Hotfix: ProfilesModule Role-Gating
- **ProfilesModule**: Agregado el rol `encargado` a la constante `ROLES` y `ROLE_BADGE` (asignado con color morado `purple-500`) permitiendo la creación de perfiles para los Encargados de Barra directamente desde el Panel Administrativo (EQUIPO). Previamente el rol estaba ausente en el formulario de creación, bloqueando el onboarding operativo.
- **Database (profiles)**: Ejecutada migración para reemplazar el constraint `profiles_role_check` en la tabla `profiles`, agregando `'encargado'` al `CHECK` para permitir inserciones exitosas (el constraint previo bloqueaba la creación desde la UI).

### Fase 4: Polish & Deploy Readiness (Step 4.1 - 4.3)

- **Production Build**: Verificado `npm run build` sin errores, generando un bundle de producción estable y eficiente de un solo chunk.
- **Dependency Cleanup**: Purgado `clsx` y `tailwind-merge` del entorno local, reduciendo el footprint de dependencias y alineando la base de código con el estándar de clases dinámicas mediante template strings.
- **Documentation**: Creado manual maestro de onboarding `docs/README.md` abarcando el Setup, Tech Stack, Estructura "Flattened", Mapa de Módulos (19 totales) y Matriz RBAC para los 5 roles.

### Fase 3: Code Quality (Step 3.1 - Reportes Financieros)

- **MonthlyReportModule**: Implementado bloque `try/catch` envolviendo operaciones fetch (`fetchAvailableMonths` y `fetchMonthDetails`) e incorporada función `triggerFlash` para proveer consistencia visual ante fallas de consulta.
- **AnnualReportModule**: Implementada idéntica convención de arquitectura de manejo de errores `try/catch` con `triggerFlash` para homologar al estándar V2.

### Fase 2: Code Quality (Step 2.4 - Bloque Operativo)

- **BarInventoryModule**: Integrado `try/catch` exhaustivo en `fetchBaseData` y `fetchInventory`.
- **NightOpsModule**: Implementado control de errores y mapeo riguroso de `"" -> null` en la persistencia de caja (`declared_cash`/`declared_digital`).
- **NightReportModule**: Incorporado `try/catch` con `flashColor` overlay en toda interacción y saneamiento de nulos en inserción de `financial_adjustments`.

### Fase 2: Code Quality (Step 2.3 - Planificación Operativa)

- **OpeningCostsModule**: Implementado `try/catch` exhaustivo (load, save, delete, approve) y mapeo estricto `"" -> null` para atributos clave.
- **StaffPlanModule**: Incorporada interacción `flashColor` global, resiliencia `try/catch` y limpieza estricta en payload de persistencia.
- **StockRequestsModule**: Aplicada política estricta de `try/catch` para interacciones DB y saneamiento de nulos en `notes` e IDs.

### Fase 2: Code Quality (Step 2.2 - Master Data)

- **CostTemplatesModule**: Implementado `try/catch` en load/save/toggle y `flashColor` overlay visual. Mapeo riguroso de `"" -> null` en `title` y `supplier_id`.
- **MasterVouchersModule**: Mapeo estricto de `"" -> null` en los campos `name` y `code` para evitar inserción de strings vacíos en base de datos.
- **PosTerminalsModule**: Mapeo estricto de `"" -> null` en los campos `name` y `terminal_id`.
- **ProfilesModule**: Implementado Empty State ("No hay registros.") visible cuando la tabla está vacía tras cargar.
- **StaffRolesModule**: Mapeo estricto de `"" -> null` en el campo `name` para robustez de DB.

### Fase 1: Flatten Structure (Step 1.1)

- **Flatten**: Promovidos `ready-to-go/src/`, `ready-to-go/lib/`, `ready-to-go/db/` a root. Eliminado directorio wrapper `ready-to-go/`. Actualizado `index.html` entry point de `/ready-to-go/src/main.jsx` → `/src/main.jsx`. 0 imports modificados (todas las rutas relativas `../../lib/supabase` se preservaron intactas). App verificada funcionando post-flatten via browser screenshot (login screen rendering OK).

### Step 1.2: Environment & Git Hygiene

- **`.env.example`**: Creado con placeholders (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) para onboarding seguro.
- **`.gitignore`**: Creado desde cero (no existia). Protege `.env.local` (credenciales reales), `node_modules/`, `dist/`, `supabase/.temp/`.
- **DECISIONS.md D15**: Actualizada referencia operativa de `ready-to-go/` a `src/`, `lib/`, `db/` (estructura flattened).

### Step 1.3: Package Identity

- **`package.json`**: Renombrado `redone` → `midnight-club-os`, version `1.0.0` → `2.0.0`, agregado `"private": true`, eliminados campos stale de npm-init (`main`, `directories`, `keywords`, `author`, `license`). Scripts preservados.

### Step 1.4: Vite Base Path

- **`vite.config.js`**: Evaluado `base: '/redone/'`. Correcto para GitHub Pages (repo = `redone`). Sin cambios. Si se migra a dominio propio, cambiar a `'/'`.

### Step 1.5: Deploy Workflow

- **`.github/workflows/deploy.yml`**: Agregadas env vars `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` desde GitHub Secrets al step Build. Sin esto, el build de produccion tenia credenciales Supabase como `undefined`. Node 20 ✅, `npm ci` ✅, artifact path `./dist` ✅, branch `master` ✅.
- **Build local validado**: `npm run build` exitoso post-flatten (1.68s, 1794 modulos, 617KB bundle).

### Step 1.6: Role-Gating Navigation & Mutation

- **`AuthContext.jsx`**: Implementado `ROLE_ACCESS` map para 5 roles (admin, operativo, contador, encargado, viewer). Exportadas helpers `canAccess` (para ver el módulo), `canMutate` (para Create/Edit/Delete) y `isReadOnly` (para labels).
- **`App.jsx`**: Filtrado activo de RUTAS directas (`if (!canAccess(activeView))`). Agregado color de rol `encargado`.
- **`AdminIndex.jsx`**: Reescritura total. El `MODULE_MAP` ahora se filtra dinámicamente según `canAccess()`. Módulos permitidos pero restringidos (read-only) muestran un icono de Ojo. Rol Viewer despliega un badge naranja global "SOLO LECTURA" en el header.

## [2.15.0] - 2026-05-18

### Production Readiness Planning

- **Roadmap E2E**: Creado plan de producción completo con 5 fases (P0 Housekeeping, P1 Infraestructura, P2 Code Quality, P3 Validación E2E por Roles, P4 Polish & Deploy). Identificados 10 items de deuda técnica (3 críticos: estructura anidada ready-to-go/, legacy src/ zombi con credenciales expuestas, encoding UTF-16 corrupto en docs). Mapeados 7 bloques de test E2E cubriendo los 4 roles operativos (Admin, Operativo, Contador, Encargado Barra) en un ciclo semanal Mar→Lun completo. Estimación: 4-5h de ejecución secuencial.

### Fase 0: Housekeeping (Ejecutado)

- **Step 0.1**: Eliminado `src/` legacy completo (8 archivos, 57KB). Resuelve exposición de credenciales Supabase V1 hardcodeadas en `src/lib/supabase.js` (proyecto `iyknbgmcnbpvalvsjxjz`).
- **Step 0.2**: Eliminados 3 scripts scratch del root (`compile_for_nblm.py`, `db_dump_scratch.sql`, `fix_constraint.cjs`).
- **Step 0.3**: Eliminado `.env.local` duplicado en `ready-to-go/` (idéntico al root).
- **Step 0.4**: Limpiado `supabase/.temp/` (8 archivos de caché CLI).
- **Step 0.5**: Archivado `docs/CHANGELOG.md` V1 → `docs/.archive/CHANGELOG_v1_compressed.md`.
- **Step 0.6**: Corregido encoding UTF-16 corrupto: CHANGELOG-v2.md (1,037 null bytes → 0), DECISIONS.md (232 null bytes → 0). Ambos archivos ahora UTF-8 puro.
- **Step 0.7**: Creado `ready-to-go/db/14c_night_sales.md` documentando tabla huérfana `night_sales` (0 rows, 9 cols) como RESERVED future spec para análisis de ventas por producto.
- **DB Audit (vabekvkijcvbyqvrxrss)**: 20 tablas, 0 triggers custom, 0 views, 0 funciones, RLS off (D15). Frontend V2 consume 17 tablas. `night_sales` reservada. `payments` no existe como tabla (se usa `opening_costs.status` para tracking de pagos).
- **Root final**: 6 archivos esenciales + 5 directorios. Zero código muerto.

## [2.14.0] - 2026-05-18

### Added

- **Auditoria Anual (AnnualReportModule.jsx)**: Clon funcional de MonthlyReportModule pero con agregacion y filtro por ano completo. Mantiene la filosofia de Zero Aggregation Tables, calculando ingresos, egresos e impuestos iterando sobre todas las jornadas de un ano para preservar la precision del dato transaccional.

## [2026-05-17] InicializaciÃ³n de Roadmap de Cierre

- **Docs**: Se declara `CHANGELOG.md` anterior como legacy. Todo el progreso de la V2 "Redone" se trackearÃ¡ exclusivamente aquÃ­.
- **AdminIndex**: Se eliminÃ³ el mÃ³dulo pendiente `recipes` y se habilitÃ³ `master_vouchers` ("Tipos de Comprobante") en la UI, sujeto a validaciÃ³n y creaciÃ³n en base de datos.
- **Cleanup**: Iniciado proceso de revisiÃ³n uno-a-uno de pantallas de `src/layouts` legacy contra `ready-to-go/src/layouts` para su eliminaciÃ³n segura.
- **Cleanup**: Eliminados mÃ³dulos legacy de Fase 1 (MasterProveedores, MasterSKU, MasterTarifario, MasterNomina, Configuraciones).
- **Cleanup**: Eliminados mÃ³dulos operativos legacy (WorkdaysPlanner, WorkdaysNightChief, WorkdaysBreakEven, OperacionesStock, SolicitudesStock, EncargadoBarra).
- **Cleanup**: Eliminados mÃ³dulos financieros y de reporte legacy (ReportesLayout, MasterPagos).
- **Cleanup**: Eliminados layouts generales legacy (Login, Dashboard, TableLayout, IndexLayout) y archivo `migration.sql` viejo.
- **Database Sync**: Se verificÃ³ la existencia de todos los esquemas en la base de datos (staff_roles, cost_templates, pos_terminals, work_days, etc.) los cuales ya estaban instanciados. Se ejecutÃ³ la migraciÃ³n pendiente de `voucher_types` (Tipos de Comprobante) y se enlazÃ³ como Foreign Key a `opening_costs` reemplazando el CHECK duro.
- **UI Locking**: Se estandarizÃ³ el cerrojo global (`isClosed`) en `StockRequestsModule` y se modificÃ³ la selecciÃ³n de jornadas en `PaymentsModule` para ajustarse al flujo binario ('open', 'closed'). Ambos mÃ³dulos bloquean exitosamente las mutaciones si la jornada no estÃ¡ abierta.
- **Planning**: Se generÃ³ el Roadmap E2E V2 (Fases 0â€“4) tras revisar el CHANGELOG legacy completo. Se identificaron 3 gaps crÃ­ticos: (1) `stock_requests` no impacta el P&L del NightReport, (2) 4 tablas de staging sin documentaciÃ³n `.md`, (3) sin indicador visual de carga POS/GBOL en NightReport. El plan ordena ejecuciÃ³n por dependencia de datos con prueba E2E de cierre de jornada como hito final.
- **Docs**: Creado `ready-to-go/db/14b_night_ops_staging.md` documentando las 4 tablas de staging (`stg_passline_tickets`, `import_gbol_facturacion`, `import_system_consumption`, `night_consumption`) verificadas en la DB vÃ­a Supabase CLI. Schemas confirmados 1:1.
- **Cleanup**: `docs/CHANGELOG.md` limpiado de encoding corrupto (mixed UTF-8/CP1252/UTF-16 â†’ ASCII puro) y comprimido de 69KB (477 lÃ­neas) a 28KB (220 lÃ­neas) eliminando las 35 secciones legacy V1. Backup preservado en `CHANGELOG_legacy_backup.md`.
- **Fase 1 Validation**: Verificado vÃ­a SQL que `staff_roles.base_rate` es la ÃšNICA fuente de nÃ³mina (sin `base_salary`). Confirmado uso consistente en `StaffPlanModule`, `NightReportModule` y `MonthlyReportModule`. Verificados seeds de `voucher_types` (Factura A/B/C, Recibo X, todos `active: true`). FK `opening_costs.voucher_type â†’ voucher_types.code` confirmada intacta.
- **ProfilesModule**: Agregado `handleDelete` con hard delete y `window.confirm`. Agregado botÃ³n `Trash2` en columna de acciones de la tabla. Refactoreado `handleSave` y `toggleActive` con `try/catch` + `flashColor` feedback (verde Ã©xito, rojo error). Estado anterior carecÃ­a de manejo de errores.
- **E2E Fase 2 (Browser Agent)**: Test E2E completo de los 4 mÃ³dulos de PLANIFICACIÃ“N validado exitosamente:
  - **WorkDays**: Jornada "Test E2E Browser" (24/05/2026) creada en estado `open`. 2 jornadas visibles en tabla.
  - **OpeningCosts**: Sin auto-population de templates (0 templates activos). Ad-hoc "Flete Especial Test" creado con $15,000 en DRAFT. KPI TOTAL APERTURA $15,000. Botones AD-HOC/edit/delete activos.
  - **StaffPlan**: Rol "Barback" solicitado (qty=2), aprobado. TOTAL PROYECTADO calculado dinÃ¡micamente con base_rate.
  - **StockRequests**: MÃ³dulo carga correctamente. Selector de jornada funcional. Datos existentes visibles (ABSOLUT COMUN $19,125 APPROVED). Botones activos para jornada open.
  - **isClosed Lock**: Confirmado visualmente â€” botones habilitados en jornadas `open`, sin jornadas `closed` para test inverso.
- **Suppliers Seed**: Migrados 30 proveedores desde `master_proveedores` legacy al schema V2 `suppliers`. 47 filas originales â†’ 30 tras 7 merges de duplicados (AADICAPIF, SADAIC, Distribuidora Energy, Petit Plast, Estudio Contable Torrez, Japos/Thenon, Medicem) y eliminaciÃ³n de 7 entradas espurias (personas internas, categorÃ­as de gasto, servicios no-proveedor). Campos `cbu`+`alias` â†’ `bank_alias`. Campo `category` omitido (no existe en V2). Total en DB: 30 registros.
- **SKU Seed**: Migrados 55 SKUs desde `master_sku` legacy. 3 test entries eliminados. 17 SKUs existentes actualizados (cost, volume_ml, supplier_id corregido). 38 nuevos insertados. Supplier fantasma `"1"` eliminado. Campos legacy descartados: `pack_qty`, `costo_pack`, `external_id`, `categoria_id`. Campo `unit` inferido (botella/unidad). Total: 55 SKUs (26 activos, 29 inactivos).
- **Staff Templates & Bulk Approval**: Agregada funcionalidad de plantillas por defecto en `staff_roles`. AÃ±adida columna `default_quantity` int a la DB. Actualizada creaciÃ³n en `WorkDaysModule` para pre-poblar el `staff_plan` con estos roles en status 'draft'. En `StaffPlanModule` se agregÃ³ botÃ³n "APROBAR TODO" que marca masivamente los 'draft' como 'approved', fijando automÃ¡ticamente `quantity_approved` igual a `quantity_requested`.
- **Staff Roles Seed**: Migrados 18 roles desde `master_staff_roles` legacy al schema V2 `staff_roles`. Nombres normalizados ("Enc." â†’ "Encargado de", correcciones ortogrÃ¡ficas). Campo `area` legacy descartado. 1 rol legacy omitido (Bartender) por ya existir en V2. Total en DB: 23 roles.
- **Payments Supplier Info**: Actualizado `PaymentsModule.jsx` para mostrar los datos del proveedor (CUIT, CBU, Alias, Banco y Contacto) en el slide-over al momento de registrar un pago, facilitando las transferencias bancarias directas para el Contador sin salir de la pantalla.
- **Binary Lifecycle Sync**: Refactorizados `OpeningCostsModule.jsx` y `PaymentsModule.jsx` para alinear los estados internos. Los costos nacen como `draft`, son aprobados a `approved`, y finalmente pagados como `paid`. Se agregÃ³ botÃ³n de aprobaciÃ³n en UI para completar el workflow administrativo. La restricciÃ³n CHECK fue restaurada a V1.
- **Root Cleanup**: Eliminados 23 archivos scratch/debug del root del proyecto y carpeta `dist/`. Archivos eliminados: 6x `.sql` (check.sql, check_cash_closing.sql, check_sales.sql, list_tables.sql, execute.sql), 6x `.py` (csv_analyzer, csv_head, fix, fix_cols, fix_fetch, fix_headers, fix_mock), 6x `.js/.cjs` (check_schema.cjs, check_schema.js, scratch_query.js, scratch_schema.js, read_logs.cjs, test_csv.cjs, test_import.js, test_populate.js), 2x `.txt` (help.txt, help_query.txt), 1x `.json` (db_schema.json). Root queda limpio: 6 archivos esenciales (.env.local, GEMINI.md, index.html, package.json, package-lock.json, vite.config.js) + 7 directorios.
- **E2E Fase 3 (Browser Agent)**: Test E2E completo de los 3 mÃ³dulos de EJECUCIÃ“N + LA NOCHE validado exitosamente:
  - **Prep**: Costo "Flete Especial Test" transicionado de `draft` â†’ `approved` vÃ­a SQL para habilitar flujo Payments.
  - **PaymentsModule**: NavegaciÃ³n exitosa. "Flete Especial Test" visible como PENDIENTE $15,000. Pago registrado con mÃ©todo=Digital, comprobante=Factura A, notas="Test E2E". TransiciÃ³n a PAGADO confirmada.
  - **BarInventoryModule**: Jornada Test E2E seleccionada. Modo APERTURA funcional: stock incrementado vÃ­a +/- buttons. GUARDAR INVENTARIO exitoso (upsert). Toggle a modo CIERRE exitoso. ABSOLUT COMUN stock_close=1. Segunda persistencia OK.
  - **NightOpsModule**: ESTADO: ABIERTA (banner verde). ARQUEO DE CAJAS visible con 5 terminales (BOLETERIA GENERAL 1, CAJA 1, CAJA 1.2, CAJA 2, CAJA 3). Declarado Cash=50000, Digital=120000 en BOLETERIA GENERAL 1. DIFERENCIA calculada. IMPORTAR CSV GBOL presente.
  - **Cross-Verification**: OpeningCosts confirma "Flete Especial Test" con status PAID. Integridad Paymentsâ†’OpeningCosts verificada.

- **Docs**: [2026-05-17] Corrección Plan de Pruebas: Movida acción de Cargar CSV Consumos de NightOps (Fase 3) a NightReport (Fase 4) y agregada carga Passline en Fase 3 en docs/test-drive-developing.md

- **NightOpsModule (UX)**: Agregado botón 'IGUALAR SISTEMA' en Arqueo de Cajas para pre-poblar masivamente el monto declarado en base a los datos importados del POS, reduciendo la fricción operativa cuando el efectivo/digital cuadra perfectamente (D18).
- **NightReportModule (P&L 3 Columnas)**: Refactorizado el módulo de auditoría final a un dashboard de 3 columnas (Egresos, Ingresos, Break Even) con cálculos de márgenes dinámicos. Agregado cálculo automático de impuestos sobre ventas digitales, inyección de snapshot en cierre, y panel Slide-Over para agregar ingresos/egresos manuales a través de la nueva tabla *financial_adjustments*.
- **NightReportModule (Eficiencia de Barra)**: Agregado botón temporal (DEV) 'IGUALAR A SISTEMA' para forzar que el consumo físico coincida con el del sistema, agilizando pruebas en el flujo final.
- **NightReportModule (Stock Aprobado)**: Eliminada tabla de Eficiencia de Barra y dependencias de CSV. Agregada tabla 'InversiÃ³n en Insumos (Stock Aprobado)' consumiendo directamente `stock_requests`, cerrando el flujo contable.
- **NightReportModule (Refinamiento Contable)**: Eliminada tabla redundante de 'InversiÃ³n en Insumos'. Desglosado el detalle de 'Costos Pagados' (Egresos) en tres subcategorÃ­as de P&L: Costos Recurrentes (vinculados a templates), Costos Ad-Hoc, e Insumos Pagados (derivados del lote de solicitudes de stock). Eliminadas por completo las consultas fantasma a `stock_requests`.
- **MonthlyReportModule**: Reescritura completa del mÃ³dulo. TransiciÃ³n a tabla viva (contemplando status 'open' para proyecciÃ³n y 'closed' para auditorÃ­a). EliminaciÃ³n de dependencias legacy (night_sales). IncorporaciÃ³n de grÃ¡ficos nativos (TermÃ³metro de rentabilidad, Tendencia HistÃ³rica Y/X, DistribuciÃ³n de Gasto) y aislamiento de Pasivo Impositivo.

- **MonthlyReportModule (Correcciones Contables)**: Corregida query de Passline para usar operational_date en vez de work_day_id. Agrupados los terminales de caja por jornada (filter+reduce) en lugar de tomar solo el primero. Modificada tabla para incluir impuestos en 'Egresos Totales' y cuadrar el Resultado Neto. Removido color rojo de tarjeta Pasivo Impositivo.

- **MonthlyReportModule (UI / UX)**: Refinamiento de visualizaciones. El TermÃ³metro de Rentabilidad se minimizÃ³ a una barra horizontal superior. La Tendencia HistÃ³rica ahora ocupa el ancho completo para mayor legibilidad (full-width) con fondo semi-transparente. La DistribuciÃ³n de Gastos fue rediseÃ±ada para ser minimalista, asignando colores dinÃ¡micamente segÃºn peso porcentual (Rojo = 1ro, Naranja = 2do, Amarillo = 3ro, Blanco = 4to) ordenando los rubros de mayor a menor impacto.

- **Context Compressor**: Solucionado el error de encoding (`enconded output error`) al usar la skill `context-compressor` en la consola de Windows (Powershell/CMD). Se introdujo el parámetro `--out` en `minify.js` para guardar el resultado directamente al sistema de archivos mediante `fs.writeFileSync`, evitando que el pipe de la terminal corrompa los acentos (UTF-8). También se omitió la minificación agresiva para archivos `.md`, previniendo que se rompa la estructura de los listados y cabeceras Markdown durante la compresión.
- **Context Compressor**: Ampliada la utilidad con un nuevo módulo `merge_docs.js` que unifica múltiples archivos `.md` en uno solo de forma segura. Extrae los encabezados para generar automáticamente un Índice de Contenidos (TOC) y comprime el markdown conservando la trazabilidad de los datos, ideal para generar versiones maestras consolidadas del Changelog y el Decision Log de todos los agentes.

### --- SOURCE: CHANGELOG_v1_compressed.md --- ###

> **[COMPRESSION MODE: OUTLINE]** Full granular details safely preserved in `CHANGELOG_legacy_backup.md`. This section has been compressed to an Outline to maintain an ultra-light master file.

# Midnight Club OS - Changelog (Compressed)
## V2 Redone Entries
### 2026-05-17: V2 Redone - Auditora de Consumo y P&L (Night Report)
### 2026-05-17: V2 Redone - Night Ops Staging & Parsers
### 2026-05-17: Fixing Passline CSV Imports
### 2026-05-17: V2 Redone - NightOpsModule Porting & GBOL CSV
### 2026-05-17: V2 Redone - Phase 3 (Bar Inventory)
### 2026-05-17: V2 Redone - Master Vouchers Module
### 2026-05-17: V2 Redone - Phase 2 Execution (Payments Module)
### 2026-05-17: V2 Redone - Architecture Simplification (Receiving Removed)
### 2026-05-17: V2 Redone - StockRequestsModule Refactor & Financial Tracking
### 2026-05-17: V2 Redone - OpeningCostsModule Refactor
### 2026-05-17: V2 Redone - StaffPlanModule Financials
### 2026-05-17: V2 Redone - StaffPlanModule Refactor
### 2026-05-17: V2 Redone - WorkDaysModule Details Panel
### 2026-05-17: V2 Redone - UI/UX Navigation Fix (AdminIndex)
### 2026-05-17: V2 Redone - Master Modules UI/UX Alignment (Staff Roles & POS)
### 2026-05-17: V2 Redone - SKU Module UI Alignment
### 2026-05-17: V2 Redone - Module 14: Night Operations (Auditora / Sbado)
### 2026-05-17: V2 Redone - Module 13: Receiving (Recepcin de Stock)
### 2026-05-17: V2 Redone - Module 12: Payments (Contabilidad)
### 2026-05-17: V2 Redone - Module 10 & 11: Staff Plan & Stock Requests
### 2026-05-17: V2 Redone - Module 08 & 09: Work Days & Opening Costs
### 2026-05-17: V2 Redone - Module 07: POS Terminals
### 2026-05-17: V2 Redone - Module 05: Cost Templates
### 2026-05-17: V2 Redone - Module 04: Staff Roles
### 2026-05-17: V2 Redone - Supabase Migration Execution
### 2026-05-17: V2 Redone - Improvements to SuppliersModule
### 2026-05-17: V2 Redone - Improvements to SkuModule
### 2026-05-17: V2 Redone  Module 01: Profiles + PIN Auth
### 2026-05-17: V2 Redone  Admin Shell + PIN Login + Module Index
### 2026-05-17: V2 Redone  Module 02: Suppliers
### 2026-05-17: V2 Redone - Module 03: SKU Catalog
### 2026-05-17: V2 Redone - Supabase Migration Execution
### 2026-05-17: V2 Redone - Phase 2.5: Binary Operations Migration
### 2026-05-17 - SKU Mapping and CSV Import Resilience Update
### 2026-05-17 - Bulk SKU Import
### 2026-05-17 - Auditory Calculation Fix
### --- SOURCE: CHANGELOG_legacy_backup.md --- ###
# Midnight Club OS - Changelog
## [Unreleased]
### 2026-05-17: V2 Redone - Auditoría de Consumo y P&L (Night Report)
### 2026-05-17: V2 Redone - Night Ops Staging & Parsers
### 2026-05-17: Fixing Passline CSV Imports
### 2026-05-17: V2 Redone - NightOpsModule Porting & GBOL CSV
### 2026-05-17: V2 Redone - Phase 3 (Bar Inventory)
### 2026-05-17: V2 Redone - Master Vouchers Module
### 2026-05-17: V2 Redone - Phase 2 Execution (Payments Module)
### 2026-05-17: V2 Redone - Architecture Simplification (Receiving Removed)
### 2026-05-17: V2 Redone - StockRequestsModule Refactor & Financial Tracking
### 2026-05-17: V2 Redone - OpeningCostsModule Refactor
### 2026-05-17: V2 Redone - StaffPlanModule Financials
### 2026-05-17: V2 Redone - StaffPlanModule Refactor
### 2026-05-17: V2 Redone - WorkDaysModule Details Panel
### 2026-05-17: V2 Redone - UI/UX Navigation Fix (AdminIndex)
### 2026-05-17: V2 Redone - Master Modules UI/UX Alignment (Staff Roles & POS)
### 2026-05-17: V2 Redone - SKU Module UI Alignment
### 2026-05-17: V2 Redone - Module 14: Night Operations (Auditoría / Sábado)
### 2026-05-17: V2 Redone - Module 13: Receiving (Recepción de Stock)
### 2026-05-17: V2 Redone - Module 12: Payments (Contabilidad)
### 2026-05-17: V2 Redone - Module 10 & 11: Staff Plan & Stock Requests
### 2026-05-17: V2 Redone - Module 08 & 09: Work Days & Opening Costs
### 2026-05-17: V2 Redone - Module 07: POS Terminals
### 2026-05-17: V2 Redone - Module 05: Cost Templates
### 2026-05-17: V2 Redone - Module 04: Staff Roles
### 2026-05-17: V2 Redone - Supabase Migration Execution
### 2026-05-17: V2 Redone - Improvements to SuppliersModule
### 2026-05-17: V2 Redone - Improvements to SkuModule
### Nuevo MÃ³dulo: Master Pagos (2026-05-17)
### Workdays - Correcciones de Cierre y P&L (2026-05-16)
### Night Chief - Flujo de Cierre Final (2026-05-10)
### Night Chief Ã¢â‚¬â€� Passline BoleterÃƒÂ­a Integration (2026-05-10)
### Night Chief Ã¢â‚¬â€� Consumo & RecaudaciÃƒÂ³n Tables (2026-05-10)
### Master Screens UI/UX Audit Ã¢â‚¬â€� Cycle 1 (2026-05-10)
### Added
### Changed
## [2026-05-10] Night Chief - Passline General Fixes
### [2026-05-10] Break Even - Real-Time P&L Dashboard
### [2026-05-10] Workdays Planner - Refactor EstÃƒÂ©tico
### [2026-05-10] Fine Polish - Brutalismo Funcional
### [2026-05-16] UI/UX Navigation Refactor (Global Date)
### [2026-05-16] Bugfix: Consumo de Sistema vs FÃƒÂ­sico
### [2026-05-16] UI/UX Navigation (Reportes)
### [2026-05-16] Data Engine & ConciliaciÃ³n de Barra (Reportes)
### [2026-05-16] UX/UI Refactor Reportes (HistÃ³rico y Desglose Fiscal)
### [2026-05-16] Motor de Comisiones Digitales (Data Engine)
### [2026-05-16] Hotfix Query Reportes HistÃ³ricos
### [2026-05-16] Ajuste Fino en LÃ³gica de Faltantes (AuditorÃ­a)
### [2026-05-16] Hard Reset de Base de Datos
### [2026-05-17] UX/UI Refactor - Inventario Barra Responsivo
### [2026-05-17] Hotfix - Importador CSV Passline (Separadores)
### [2026-05-17] Fix - Passline Ingresos (Break Even)
### [2026-05-17] Hotfix - Importador CSV GBOL (Comillas)
### [2026-05-17] Hard Reset de Base de Datos (Pruebas)
## [2026-05-17]
### Fixed
### Added
### 2024-05-17: Implementación del Módulo Admin Pagos
### Fixed
### 2024-05-17: Rollback del Modulo Admin Pagos
### 2024-05-17: Edicion Inline en Stock Central
### 2026-05-17: V2 Redone — Module 01: Profiles + PIN Auth
### 2026-05-17: V2 Redone — Admin Shell + PIN Login + Module Index
### 2026-05-17: V2 Redone — Module 02: Suppliers
### 2026-05-17: V2 Redone - Module 03: SKU Catalog
### 2026-05-17: V2 Redone - Supabase Migration Execution
### 2026-05-17 - SKU Mapping and CSV Import Resilience Update
### 2026-05-17 - Bulk SKU Import
### 2026-05-17 - Auditory Calculation Fix
### 2026-05-19: Operativo Dashboard Implementation
### 2026-05-19: WorkDaysModule Cleanup
### Hotfix: Vite Base Path