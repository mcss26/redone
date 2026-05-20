# Midnight Club OS

El **Midnight Club OS** (versión *Redone V2*) es el sistema ERP (Enterprise Resource Planning) de uso interno para la gestión financiera, operativa y logística del club nocturno "Midnight Club".

Ha sido diseñado y construido con una arquitectura *Functional Brutalist*, primando la densidad de datos, los layouts expansivos y un esquema de colores restringido (dark mode + acentos de estado) para reducir la carga cognitiva durante operaciones nocturnas de alto estrés.

---

## 🛠 Tech Stack

El ecosistema está estandarizado para despliegues estáticos y backend as-a-service.

- **Frontend**: React 19
- **Estilos**: Tailwind CSS v4 (sin utilidades extra como `clsx` o `tailwind-merge` — las clases se concatenan mediante template literals).
- **Iconografía**: Lucide React
- **Backend / Database**: Supabase (PostgreSQL 15+)
- **Build Tool**: Vite (Rollup)
- **Fechas**: Day.js
- **Manejo de Datos (Importación)**: XLSX (para parseo de consumos de sistema y reportes de tiqueteras)

---

## 🚀 Setup Local

### Prerrequisitos

- Node.js >= 20.x

### Instalación

1. Clonar el repositorio.
2. Instalar las dependencias exactas del lockfile:

   ```bash
   npm ci
   ```

3. Configurar variables de entorno:
   Copiar `.env.example` a `.env.local` e introducir los valores de Supabase:

   ```bash
   cp .env.example .env.local
   ```

   *Edita `.env.local` y agrega tus credenciales (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).*
4. Iniciar servidor de desarrollo:

   ```bash
   npm run dev
   ```

---

## 📂 Estructura de Directorios

La aplicación tiene una estructura aplastada (flattened) tipo SPA:

```text
/
├── docs/                # Documentación del proyecto, CHANGELOG-v2 y bitácora de decisiones.
├── db/                  # Documentación esquema por esquema de la base de datos Supabase.
├── public/              # Assets estáticos y favicon.
├── src/
│   ├── components/      # (Si aplica) Componentes UI compartidos a futuro.
│   ├── layouts/         # Contiene TODOS los módulos operativos (e.g. WorkDaysModule.jsx).
│   ├── lib/             # Servicios y wrappers core (e.g. supabase.js).
│   ├── AuthContext.jsx  # Proveedor de estado global para sesión y RBAC (Role-Based Access Control).
│   ├── AdminIndex.jsx   # Shell principal, routing interno y TopBar.
│   ├── index.css        # Core styles y design system root.
│   └── main.jsx         # Entry point de React.
├── .env.example         # Plantilla de credenciales.
├── package.json         # Dependencias.
└── vite.config.js       # Configuración del bundler.
```

---

## 🧩 Mapa de Módulos

El ERP se compone de 19 módulos segregados en 5 categorías lógicas, siguiendo el flujo operativo semanal (Martes a Lunes).

1. **MASTERS** (Administración de entidades globales)
   - `Profiles`: Configuración de usuarios y asignación de roles.
   - `Suppliers`: Base de datos de proveedores (unificados).
   - `SKU`: Catálogo de productos.
   - `StaffRoles`: Categorías de empleados y sus tarifas base (con pre-poblado por default_quantity).
   - `CostTemplates`: Gastos recurrentes pre-cargables.
   - `PosTerminals`: Terminales físicas y lógicas del establecimiento.
   - `Vouchers`: Tipos de comprobantes aceptados (A, B, C, X).

2. **PLANIFICACIÓN** (Setup para una jornada)
   - `WorkDays`: Creación y control del ciclo de vida de la jornada (Open/Closed).
   - `OpeningCosts`: Gastos proyectados para la apertura.
   - `StaffPlan`: Asignación nominal del staff proyectado.
   - `StockRequests`: Solicitudes de insumos requeridos.

3. **EJECUCIÓN** (Tesorería)
   - `Payments`: Ejecución y track de los gastos aprobados.

4. **LA NOCHE** (Operativa en Vivo)
   - `BarInventory`: Conteo de stock físico (Apertura vs Cierre).
   - `NightOps`: Arqueo de cajas en efectivo/digital e ingesta masiva de reportes de consumo (GBOL / Passline).

5. **REPORTES** (Auditoría final)
   - `NightReport`: Resumen transaccional (P&L 3 Columnas) de la noche para auditoría y cierre.
   - `MonthlyReport`: Tendencia e histórico mensual, consolidación tributaria.
   - `AnnualReport`: Consolidado global del año en base a datos 100% transaccionales.

---

## 🔒 Roles y Accesos (Role-Gating)

El sistema emplea un sistema RBAC implementado mediante bloqueos de mutación en `AuthContext.jsx`. La UI muta (ocultando botones o mostrando badges de Sólo Lectura) dependiendo del rol de sesión.

| Rol | Alcance y Acceso |
| :--- | :--- |
| **`admin`** | Control total. Crea, edita, elimina, audita y cierra jornadas en los 19 módulos. |
| **`operativo`** | Operación Diurna. Masters (Read), Planificación Completa (Crea Costos/Staff), La Noche. |
| **`contador`** | Tesorería. Masters (Read), Ejecución (Payments), Reportes (Read/Export). |
| **`encargado`** | Personal en piso. Acceso exclusivo a BarInventory y recuento en NightOps (Scope Limitado). |
| **`viewer`** | Inversores o Consultores. Solo lectura global, enfocado en módulos de Reporte. |

> **🔐 Flujo Binario de Jornadas**: Además de roles, las operaciones de escritura están protegidas globalmente por el estado de la jornada (`work_days.status`). Las jornadas `closed` son de sólo-lectura estricta para todos los roles (audit trail), y requieren intervención SQL directa en caso de modificación excepcional extrema.
