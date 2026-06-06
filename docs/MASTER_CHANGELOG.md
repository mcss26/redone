# Midnight Club - Master Changelog

## 2026-06-06
### Module Review & Documentation Initialization
- **System:** Commenced a fresh documentation cycle for Midnight Club System 4.0 to maintain a streamlined and updated context.
- **Architecture:** Analyzed `OperativoIndex.jsx` and recorded its structure as the Golden Standard for all Index-type layouts in `MASTER_DECISIONS.md`.
- **Action:** Initialized clean states for `MASTER_CHANGELOG.md` and `MASTER_DECISIONS.md`.

### Data Entry & CRUD Architecture Standardized
- **Architecture:** Audited `WorkDaysModule`, `OpeningCostsModule`, and `SkuModule`.
- **System:** Formally documented the "CRUD & Data Entry" Golden Standard in `MASTER_DECISIONS.md`. This includes Slide-Over panel patterns, strict `null` data mapping, explicit `loading`/`saving` states, and high-density raw data tables.

### Role Index Validation
- **Architecture:** Audited `ContadorIndex.jsx` and verified its strict alignment with the Index Screen Golden Standard. No structural refactoring was required.

### Bug Fix: Cost Templates Deletion
- **System:** Added `handleDelete` function to `CostTemplatesModule.jsx` to allow users to permanently delete cost templates from the master template list, completing its CRUD lifecycle.

### Feature: Global Messages Board (Muro de Novedades)
- **System:** Creada tabla `global_messages` en Supabase para almacenamiento asíncrono de notas.
- **Architecture/UI:** Implementado `<GlobalMessagesBoard />` como un contenedor fijo (Always On) en todos los módulos de Index (`AdminIndex`, `OperativoIndex`, `ContadorIndex`). Provee comunicación en vivo inter-rol.
