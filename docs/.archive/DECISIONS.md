Master Decision Log: Midnight Club ERP

1. Arquitectura de Sistemas y Evolución del Núcleo (DB & Core)
La transición estratégica de la Versión 1 (V1) a la Versión 2 (V2 Redone) representa un pivot arquitectónico hacia el minimalismo operativo. Mientras la V1 colapsó bajo el peso de ~58 tablas y una lógica de base de datos sobrecargada, la V2 simplifica el ecosistema a solo 20 tablas esenciales. Este rediseño no es solo cosmético; responde a la necesidad de eliminar la latencia crítica de los Database Joins y los desfasajes crónicos en vistas materializadas. El nuevo proyecto (ID: vabekvkijcvbyqvrxrss) opera bajo un ciclo operativo real de Martes a Lunes (Mar--Lun), alineando el esquema técnico con la realidad del flujo comercial del club.
Estructura de Roles y Gestión de RLS Gaps
Se ha implementado un modelo de cuatro perfiles con alcances estrictamente definidos. Una decisión arquitectónica clave fue permitir anon writes en la tabla profiles (D11), limitada por un CHECK (is\_auth\_user = false). Esto resuelve el "RLS Gap": permite que los Operativos actualicen perfiles de staff sin requerir una sesión de autenticación activa, protegiendo simultáneamente las cuentas de usuarios con privilegios de sistema.
Rol Alcance Operativo Responsabilidades Clave
Administrador Acceso Determinista Total Configuración de catálogos, auditoría global y gestión de staff.
Contador Contabilidad Profunda Ejecución de pagos y supervisión de flujos financieros netos.
Operativo Ejecución de Campo Gestión de stock, planificación de staff y costos de apertura por noche.
Viewer Auditoría Pasiva Visualización de reportes analíticos sin capacidad de mutación de estado.
Restricciones Técnicas y Convenciones
\* Esquema Determinista: Columnas estrictamente en inglés con CHECK constraints de texto (D16) en lugar de ENUMs de Postgres para las categorías de la tabla skus. Esta filosofía de "no-magic" facilita migraciones y evita la opacidad de los tipos personalizados de DB.
\* Data Entry Minimalism: Se purgó el campo UNIDAD del catálogo. El sistema asume de forma sistémica la carga por unidad para reducir la fricción en la entrada de datos.
Capa "So What?": Al mover la lógica de agregación del servidor al cliente, transformamos la base de datos en un almacén de datos atómicos. Esto no solo mejora la mantenibilidad, sino que permite una velocidad de desarrollo industrial, donde el frontend actúa como el único orquestador de la verdad matemática.
\--------------------------------------------------------------------------------
1. Filosofía de Diseño: Brutalismo Funcional y UX Operativa
La estética "Functional Brutalism" es una herramienta de ingeniería diseñada para mitigar la fatiga cognitiva en entornos de alta densidad de datos. No se busca la decoración, sino la utilidad pura.
Reglas Estéticas y Refinamiento Moderno
\* Cromatismo y Tipografía: Uso estricto de #0A0A0A (Deep Void) y tipografía Plus Jakarta Sans. Los radios rounded-xl y rounded-2xl suavizan el brutalismo para mantener una percepción de software premium de grado industrial sin sacrificar el contraste.
\* Purga de Clutter Visual: Se eliminó el badge de rol del usuario y se implementó el centrado absoluto de la sub-navegación (absolute left-1/2 -translate-x-1/2) para equilibrar el peso visual.
\* Aprove Action Purge: Si un usuario no tiene permiso para una acción (ej. aprobación de costos para un Operativo), el elemento se remueve completamente del DOM. El sistema no utiliza estados "deshabilitados" que generen ruido visual; si no puedes actuar, el control no existe.
\* Back Button Purge: Se eliminó el botón "< VOLVER" de los 4 módulos operativos. Por principio brutalista, cualquier elemento redundante es residuo. El logo "MIDNIGHT CLUB" actúa como el ancla de navegación nativa para el retroceso.
Indicadores de Estado de Alta Densidad
El reemplazo de badges de texto por Status Dots (puntos brillantes de color w-2 h-2) maximiza el espacio horizontal. Un punto verde comunica "Activo" o "Aprobado" de forma instantánea, dejando la carga textual pesada para el nivel del tooltip, permitiendo que las tablas de datos fluyan sin interrupciones visuales.
\--------------------------------------------------------------------------------
1. Flujos Operativos y Logística de Stock
La operatividad se centra en la eliminación de la fricción administrativa en los puntos de mayor estrés: la barra y el depósito.
Sistema de Paso Único y Automatización
\* One-Step Stock Approval (D17): Se eliminó el ReceivingModule.jsx. La aprobación ahora implica entrega y asunción de costo inmediata. Este flujo lineal simplifica el ERP, asumiendo que el control físico y el sistémico deben converger en un solo clic.
\* Staff Plan Role Defaults (D22): Para reducir errores humanos, el sistema enlaza el "Tarifario" del Admin con el "Staff Plan". Al seleccionar un rol, la aplicación autocompleta la default\_quantity, eliminando clics innecesarios.
\* Botón "IGUALAR SISTEMA" (D18): En NightOps, se implementó este control manual para sincronizar datos, evitando la carga automática que suele generar falsos positivos en los conteos de efectivo físico.
In-App Tooling
Se inyectó una Calculadora Cruda directamente en el Slide-Over de Solicitud de Stock. Esta herramienta maneja conversiones de unidades a cajas in situ, evitando que el operario abandone la aplicación, reforzando la autonomía en el "Point of Need".
Capa "So What?": El "Operative Catalog Empowerment" traslada la confianza al punto de ejecución. Permitir que el rol operativo edite catálogos de SKUs elimina los cuellos de botella del Administrador, permitiendo una cadena de suministro interna ágil y auto-correctiva.
\--------------------------------------------------------------------------------
1. Inteligencia Financiera y Motor de Reportes (Data Engine)
El cerebro analítico del sistema es el useNightReport.js, un motor de datos en memoria que prescinde de las limitaciones de PostgREST y las vistas SQL tradicionales.
Data Engine y Protección de Integridad
Para garantizar precisión matemática al centavo frente al límite de 1000 filas de Supabase, se implementó la Zero Aggregation Protection (D23). El helper recursivo fetchAll asegura la descarga completa de:
\* stg\_passline\_tickets
\* import\_gbol\_facturacion
\* night\_cash\_closing
\* opening\_costs
Lógica de Deduplicación y Consolidación
\* Passline CSV Deduplication (D15): El sistema deduplica por ID ticket (entidades) e isola el ingreso por ID Compra. Esto previene la inflación exponencial de ingresos causada por el formato de exportación de Passline.
\* Estructura de Egresos: Los costos se consolidan en tres categorías: Recurrentes, Ad-Hoc e Insumos Pagados (identificados por títulos automáticos), eliminando la necesidad de tablas de egresos redundantes.
\* Fixed Costs: Gestionados mediante gráficos Brutalistas nativos (CSS/SVG) para evitar el inflado del bundle con librerías externas.
Capa "So What?": La "Annual Report Live Aggregation" garantiza que cualquier cambio retroactivo en una jornada impacte el balance anual en tiempo real. Se preserva la Single Source of Truth sin depender de tablas de agregación intermedias que suelen corromperse con el tiempo.
\--------------------------------------------------------------------------------
1. Infraestructura, Despliegue y Estabilidad (DevOps)
La estabilidad operativa se logra mediante un pipeline de despliegue optimizado y herramientas de gestión que omiten dependencias pesadas.
Pipeline de Despliegue y Tooling
\* GitHub Pages (D24): Se corrigió el despliegue ajustando base: '/redone/' en Vite y forzando la fuente a "GitHub Actions" para servir exclusivamente el código compilado en ./dist.
\* Supabase CLI Executor: Uso de supabase-cli-executor.js mediante node-fetch. Esto permite inyectar SQL vía Management API, evitando dependencias de Docker que bloqueaban el desarrollo local.
\* Optimización de Bundle: Purga total de clsx y tailwind-merge (D21) en favor de template strings nativos, logrando una carga ultra-ligera en dispositivos de punto de venta.
Capa "So What?": El protocolo de diagnóstico ante un Error 521 prioriza verificar si la instancia gratuita de Supabase ha sido pausada. Estas decisiones aseguran la continuidad operativa sin incurrir en costos de infraestructura, manteniendo la resiliencia del ERP en entornos de producción.
\--------------------------------------------------------------------------------
1. Auditoría Técnica: Source Gaps y Riesgos No Resueltos
\* Rollback de Admin Pagos (D14): Se identificó un pivot crítico donde se eliminó el módulo completo de pagos debido a la fricción transaccional excesiva para una SPA. Esta funcionalidad queda fuera del alcance actual por diseño.
\* Network Overhead (D23): El uso de fetchAll para garantizar precisión financiera genera un riesgo de latencia creciente en el Reporte Anual a medida que el histórico de datos se expande de forma recursiva.
\* Prorrateo de Costos Fijos: Actualmente, los costos estructurales impactan solo el cierre mensual. No existe un prorrateo diario, lo que puede distorsionar la visión de rentabilidad neta en jornadas individuales.
\* Granular Supplier Override (D23): La capacidad de sobrescribir proveedores en solicitudes de stock permite flexibilidad, pero introduce el riesgo de divergencia de datos entre el Catálogo Maestro de SKUs y las transacciones reales.
Declaración de Conformidad: Este documento constituye el registro final y oficial de las decisiones arquitectónicas para el Midnight Club ERP V2 Redone, validado bajo los estándares de brutalismo funcional e integridad determinista.
