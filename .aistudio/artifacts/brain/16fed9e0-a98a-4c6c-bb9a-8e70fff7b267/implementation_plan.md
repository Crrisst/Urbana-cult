# Urbana Cult - Prototipo Funcional de Plataforma Cultural y Ticketing Multi-Tenant

Prototipo interactivo y de alta fidelidad para **Urbana Cult**, la plataforma SaaS de gestión cultural y venta unificada de entradas de Mar del Plata, integrando venta digital y boletería física sobre un inventario centralizado con prevención activa de sobreventa, modo de contingencia física ante cortes de conectividad y conciliación posterior, simulación de pasarelas de pago con reservas temporales, y gestión de salas de ensayo.

## Decisiones Críticas y Confirmaciones del Usuario

> [!IMPORTANT]
> El alcance, módulos interactivos y lenguaje visual han sido confirmados a partir de los requerimientos y la especificación de ingeniería de software (Entrega Final - Grupo 15):

- **Alcance del Sistema**: Ecosistema completo con selector interactivo de roles en tiempo real:
  1. *Espectador / Público (B2C)*: Cartelera cultural, filtros por disciplina y espacio, mapa interactivo de localidades, reserva temporal de 10 minutos y checkout.
  2. *Boletería Física (POS Presencial)*: Despacho rápido en ventanilla, venta en efectivo/tarjeta física, consulta y bloqueo inmediato de butacas en inventario compartido.
  3. *Administrador de Espacio Cultural (B2B Multi-Tenant)*: Gestión de espectáculos, funciones, salas, aforos, precios, salas de ensayo y reportes de liquidación propios.
  4. *Administración Central y Dirección Urbana Cult*: Configuración de comisiones (10% eventos, 8% salas B2B), selección transparente y auditada de destacados en portada (RF-22), tablero financiero con cálculo de GMV y comisiones, y módulo de alertas de proveedor e incidencias de cobro (RF-24 / RF-28).
- **Escenarios Críticos y Simuladores Interactivos**:
  1. *Simulador Concurrente (RF-09 / HU-01 / HU-02)*: Simulación en paralelo de compra web vs. boletería física intentando adjudicar la última butaca disponible; verificación de bloqueo atómico y rechazo informado al segundo intento.
  2. *Modo Contingencia Offline y Conciliación (RF-26 / RB-10 / HU-10)*: Venta física acotada a un bloque de contingencia reservado previamente; simulación de caída de red, venta manual y motor de conciliación diferida con detección de conflictos.
  3. *Simulador de Pasarela de Pagos (RF-12 / RB-02 / HU-02)*: Reserva temporal con cuenta regresiva, estados transaccionales (`Pendiente`, `Aprobado`, `Rechazado`, `Pendiente de conciliación`), y liberación o retención segura de inventario.
  4. *Módulo de Salas de Ensayo (RF-15 / HU-04)*: Reserva por franjas horarias con validación contra solapamientos y cálculo de comisión de alquiler B2B.
- **Dirección Visual**: Cultural contemporáneo oscuro (`#0c0f14` / `#161b22`) con acentos cálidos y vibrantes (ámbar cultural `#f59e0b`, terracota `#f97316` y esmeralda de confirmación `#10b981`), tipografía geométrica legible (`Plus Jakarta Sans`), números tabulares monoespaciados para aforos y montos, y disciplina anti-slop (sin pills estáticas innecesarias ni tarjetas anidadas).

---

## 1. Visión General y Concepto Central

- **Propósito**: Resolver de manera definitiva la fragmentación operativa de los 25 espacios culturales asociados de Mar del Plata, eliminando el riesgo de sobreventa entre taquilla y web, asegurando la transparencia en las liquidaciones económicas y proveyendo un mecanismo de contingencia auditable cuando se interrumpa la conectividad en salas de teatro.
- **Audiencia y Actores**:
  - *Espectadores marplatenses y turistas*: Búsqueda fluida y compra garantizada sin dobles cobros ni pérdida de butacas durante el pago.
  - *Personal de boletería física*: Interfaz ultra-rápida de despacho en ventanilla con teclado numérico y actualización instantánea (< 3s).
  - *Gestores de centros culturales y salas*: Control autónomo y aislado de sus eventos y salas de ensayo (aislamiento multi-tenant).
  - *Equipo central de Urbana Cult*: Gobernanza participativa, control de comisiones del 10%, trazabilidad completa mediante bitácora de auditoría y gestión de incidentes de pasarela.

---

## 2. Experiencia de Usuario y Diseño Visual

### Flujos Clave de Interacción
1. **Selector de Rol & Entorno**: Barra superior fija que permite al evaluador o usuario alternar instantáneamente entre la perspectiva de Público, Boletero de Sala, Administrador del Espacio "Teatro Colón MdP" / "Centro Cultural Séptimo Fuego" o Administrador Central Urbana Cult.
2. **Flujo de Venta Pública Web**:
   - Exploración de cartelera filtrable (Teatro, Música en vivo, Danza, Talleres).
   - Selección de función, visualización de aforo gráfico (butacas numeradas y campo general).
   - Bloqueo transaccional de localidad: inicio de temporizador de reserva de 10 min.
   - Pasarela simulada: el usuario puede probar escenarios de éxito, rechazo de tarjeta o forzar timeout para observar el paso a "Pendiente de conciliación".
   - Emisión de ticket digital con código único de trazabilidad y QR simulado.
3. **Flujo de Boletería Física (POS)**:
   - Panel de rápida selección con un clic de butacas libres.
   - Marcación como venta en taquilla física (`Canal: Presencial`).
   - Sincronización en vivo que deshabilita esa butaca en el portal web de inmediato.
4. **Laboratorio de Concurrencia y Contingencia**:
   - Vista en pantalla dividida o modal dedicada donde dos solicitudes compiten por la misma butaca exacta: visualización gráfica de la resolución de carrera (Race Condition) por mutex/transacción atómica.
   - Prueba de caída de red con activación del bloque de contingencia de 10 butacas reservadas; emisión offline y posterior sincronización con reporte de conflictos.
5. **Panel B2B y Salas de Ensayo**:
   - Creación de eventos con validación de capacidad máxima y funciones.
   - Calendario de salas de ensayo con detección de solapamiento horario.
   - Liquidaciones de comisiones con desglose de GMV, comisión neta y estado de transferencias.
   - Bitácora de auditoría inmutable que registra cada evento transaccional con identificador, fecha, operador y canal.

### Sistema Visual & Tipografía
- **Lienzo**: Fondo oscuro profundo (`#0d1117`), superficies con bordes ultra-finos (`#21262d` / `#30363d`), sin fondos saturados ni efectos artificiales.
- **Acentos**: Ámbar teatral dorado (`#f59e0b`), naranja cálido (`#ea580c`), carmesí de advertencia (`#dc2626`) y verde menta transaccional (`#059669`).
- **Tipografía**:
  - Títulos y navegación: `Plus Jakarta Sans` con peso SemiBold y espaciado ajustado.
  - Métricas, moneda argentina (`$ ARS`), conteo de butacas y marcas de tiempo: `JetBrains Mono` con `tabular-nums`.
- **Top Bar Contract**: Logotipo "Urbana Cult · Plataforma Cultural", navegación de secciones concisas, selector de roles activo y botón de acceso a los laboratorios de simulación concurrente.

---

## 3. Decisiones de Producto y Arquitectura

### Manejo de Estado Centralizado y Concurrencia Simulada
- **Enfoque Elegido**: Store reactivo con motor transaccional en cliente (`urbanaStore`) y persistencia local `localStorage`.
- **Por qué**: Permite demostrar con fidelidad absoluta los requerimientos críticos del documento (RF-08, RF-09, RF-11, RF-26) en el entorno de evaluación, permitiendo simular milisegundos de carrera de transacciones, estados de red offline/online y tiempos de expiración reales.
- **Reglas de Negocio Implementadas**:
  - *RB-01 / RF-09*: Ninguna localidad puede asignarse dos veces a ventas confirmadas.
  - *RB-02*: Si expira la reserva temporal con pago incierto, se marca como `Pendiente de conciliación` sin liberar de inmediato para evitar sobreventa no auditada.
  - *RB-03*: Aislamiento multi-tenant; los eventos del Teatro A no son editables por el usuario del Teatro B.
  - *RB-04 / RF-16*: Comisión fija del 10% en entradas y 8% en alquileres de salas B2B; cálculos transparentes de GMV y saldo neto liquidable.
  - *RB-10 / RF-26*: Modo contingencia física limitado exclusivamente al bloque pre-asignado durante caídas de conexión.
  - *RF-22*: Registro obligatorio del criterio y justificación para destacar eventos en portada.

---

## 4. Arquitectura Técnica y Modelo de Datos

### Diagrama del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                   BARRA DE CONTROL Y SELECTOR DE ROLES                 │
│  [ Espectador B2C ]   [ Boletería Física ]   [ Admin Espacio ]  [ Urbana Admin ]
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│     PORTAL PÚBLICO & TICKETING   │             │       BOLETERÍA FÍSICA POS      │
│  · Cartelera cultural MdP       │             · Selección instantánea ventanilla│
│  · Butacas & Reservas temporales│             · Ventas efectivo / débito        │
│  · Simulador de Pasarela Pagos  │             · Modo Contingencia Offline       │
└────────────────┬────────────────┘             └────────────────┬────────────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │       MOTOR TRANSACCIONAL DE INVENTARIO       │
                 │  · Control de Concurrencia Atómica (Mutex)    │
                 │  · Cola de Expiración de Reservas (10 min)    │
                 │  · Motor de Conciliación de Contingencia      │
                 └───────────────────────┬───────────────────────┘
                                         │
         ┌───────────────────────────────┼───────────────────────────────┐
         ▼                               ▼                               ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│ GESTIÓN MULTI-   │           │ GESTIÓN SALAS DE │           │ BITÁCORA Y       │
│ TENANT (B2B)     │           │ ENSAYO B2B       │           │ LIQUIDACIONES    │
│ · Eventos/Precios│           │ · Control horario│           │ · GMV & Comisión │
│ · Aforos y cupos │           │ · Anti-solapado  │           │ · Auditoría RF-21│
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

### Entidades Principales
- **EspacioCultural**: ID, nombre, dirección en Mar del Plata, aforo general, salas de ensayo.
- **Evento & Funcion**: ID, espacioId, título, disciplina, fecha/hora, precio, aforoTotal, butacas (con estados: `disponible`, `reservado_temporal`, `vendido_web`, `vendido_presencial`, `bloque_contingencia`).
- **ReservaTemporal**: ID, funcionId, butacaId, timestampInicio, timestampExpira, status (`activa`, `completada`, `expirada`, `pendiente_conciliacion`).
- **TransaccionVenta**: ID, funcionId, butacaId, canal (`Web` | `Presencial` | `Contingencia`), importeBruto, comisionUrbana (10%), netoEspacio, estadoPago, fechaHora.
- **ReservaSalaEnsayo**: ID, espacioId, salaId, bandaNombre, fecha, horaInicio, horaFin, tarifa, comisionB2B (8%).
- **RegistroAuditoria**: ID, timestamp, usuarioRol, entidadAfectada, accion, detallePrevio, detalleNuevo, motivo.
- **IncidenteProveedor**: ID, transaccionId, tipo, estado (`abierto`, `en_seguimiento`, `resuelto`), responsable.
