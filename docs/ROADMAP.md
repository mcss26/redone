La optimización de la navegación en el panel de administración **AdminIndex** de tu aplicación debe centrarse en reducir el costo de interacción cognitiva ($IC$) sin alterar la estructura visual actual ni añadir barras laterales. Al aprovechar la disposición que ya tienes, es posible reorganizar las 5 fases operativas y el motor de configuraciones para garantizar un flujo de trabajo fluido y sin fricciones.

Este es el plan de acción atomizado en pasos ejecutables para mejorar la navegación desde tu diseño actual:

---

### Fase 1: Auditoría y Estandarización de Etiquetas (Taxonomía)

* **Paso 1.1: Filtrado de contenido redundante u obsoleto (ROT).** Analiza el archivo `AdminIndex.jsx` y depura cualquier enlace duplicado, asegurándote de que cada uno corresponda estrictamente a una de las 5 fases activas o a las configuraciones maestras.
* **Paso 1.2: Consistencia gramatical.** Estandariza la terminología del menú o rejilla existente. Unifica el estilo para que las opciones operativas (`WORKDAYS`, `PEDIDOS DE STOCK`, `PLAN DE STAFF`) tengan una estructura gramatical coherente, eliminando nombres vagos o tildes rotas.
* **Paso 1.3: Control de longitud física de etiquetas.** Define un límite sistemático de caracteres para cada botón o elemento del menú superior para evitar truncamientos visuales (*truncation*) en diferentes anchos de pantalla.

### Fase 2: Jerarquía y Divulgación Progresiva en el Layout Existente

* **Paso 2.1: Aplanar la estructura a un máximo de 3 niveles.** Diseña las rutas del menú para que cualquier acción crítica (ej. acceder a un pedido de stock o registrar un pago) no requiera más de **3 clics de profundidad** desde la pantalla principal de `AdminIndex`.
* **Paso 2.2: Agrupar fases operativas mediante Pestañas (*Tabs*).** En el menú horizontal principal, organiza el flujo de trabajo diario de forma mutuamente excluyente utilizando pestañas visuales claras:
  * **Pestaña 1: Planificación (WORKDAYS).** Agrupa `WORKDAYS`, `COST. APERTURA`, `PLAN DE STAFF` y `PEDIDOS DE STOCK`.
  * **Pestaña 2: Operación (NIGHT CHIEF).** Agrupa `APERTURA/CIERRE BARRA` y `NIGHT CHIEF`.
  * **Pestaña 3: Finanzas (PAGOS).** Agrupa `PAGOS SEMANA` y `PAGOS MES`.
  * **Pestaña 4: Analítica (REPORTES).** Agrupa `R. NOCHE`, `AUDITORIA CONSUMO`, `R. MES` y `REPORTE ANUAL`.
* **Paso 2.3: Relegar el motor MASTERS con *Progressive Disclosure*.** No mezcles la configuración del sistema con la operación del día a día. Configura un menú desplegable compacto o un botón secundario que revele condicionalmente los catálogos paramétricos (`PERFILES`, `PROVEEDORES`, `CATÁLOGO SKU`, `TARIFARIO`, `COSTOS SEMANA`, `COSTOS MES`, `PUNTOS DE VENTA`, `COMPROBANTES`) únicamente cuando el administrador decida editarlos, manteniéndolos ocultos durante la operación diaria.

### Fase 3: Integración de Supabase y Estados de Interacción

* **Paso 3.1: Anclaje de la jornada activa en la barra de utilidades.** Extrae de la tabla `work_days` de Supabase la jornada activa (`status = 'open'`). En lugar de un elemento flotante invasivo, muestra este dato de forma estática en la parte inferior o superior del menú existente para dar un sentido espacial de ubicación (*wayfinding*).
* **Paso 3.2: Sistema de alertas no intrusivas en el menú.** Utiliza el componente que consume la tabla `global_messages` de Supabase para proyectar indicadores visuales (*badges* o contadores de notificaciones) directamente sobre la pestaña de la fase que requiera atención inmediata (ej. un aviso sobre `PEDIDOS DE STOCK` si hay una solicitud pendiente de aprobación).
* **Paso 3.3: Definición técnica de estados interactivos.** Define con total claridad los estilos CSS del menú para los estados normal, *hover* (al pasar el cursor), activo (fase seleccionada) y *focus* (para accesibilidad por teclado), reduciendo el esfuerzo de búsqueda visual del usuario.

### Fase 4: Protocolo de Validación Empírica con Usuarios

* **Paso 4.1: Redactar escenarios de prueba realistas.** Diseña entre 5 y 7 tareas basadas en objetivos reales de tu negocio (ej. "Necesitas revisar si el dinero de las cajas del punto de venta cuadró anoche, ¿dónde vas?") sin usar palabras exactas que revelen los nombres de tus menús.
* **Paso 4.2: Ejecutar una prueba de Tree Testing.** Antes de programar cambios en React, evalúa la efectividad de la jerarquía textual mediante pruebas en herramientas en línea (como Lyssna o Maze) con una muestra de usuarios.
* **Paso 4.3: Medición y optimización de métricas.** Analiza los datos de navegación recopilados:
  * **Tasa de éxito (Success Rate):** Reorganiza las secciones que caigan por debajo del 60% de éxito.
  * **Tasa de direccionalidad (DR):** Asegura un mínimo del 75% aplicando la fórmula:
        $$DR = \left( \frac{U_d}{U} \right) \times 100\%$$
        Esto te dirá el porcentaje de usuarios que llegaron directamente a la pantalla correcta sin dar rodeos o retroceder en las opciones.

---

📊 ¿Quieres que redacte el cuestionario de escenarios de navegación exactos que puedes utilizar para poner a prueba esta nueva jerarquía con tus administradores reales?
