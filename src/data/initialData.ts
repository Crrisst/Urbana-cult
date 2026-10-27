import { EspacioCultural, Evento, Funcion, Butaca, TransaccionVenta, SalaEnsayo, ReservaSalaEnsayo, RegistroAuditoria, IncidenteCobro } from '../types';

export const ESPACIOS_INICIALES: EspacioCultural[] = [
  {
    id: 'esp-colon',
    nombre: 'Teatro Colón Mar del Plata',
    direccion: 'Hipólito Yrigoyen 1665',
    barrio: 'Centro',
    ciudad: 'Mar del Plata',
    telefono: '+54 (0223) 499-6555',
    email: 'contacto@teatrocolonmdp.cultura.gob.ar',
    capacidadGeneral: 250,
    comisionEntradas: 10,
    comisionSalasB2B: 8,
    estadoLiquidacion: 'activo',
  },
  {
    id: 'esp-septimo',
    nombre: 'Centro Cultural Séptimo Fuego',
    direccion: 'Bolívar 3675',
    barrio: 'San Juan',
    ciudad: 'Mar del Plata',
    telefono: '+54 (0223) 495-9572',
    email: 'administracion@septimofuego.com.ar',
    capacidadGeneral: 90,
    comisionEntradas: 10,
    comisionSalasB2B: 8,
    estadoLiquidacion: 'activo',
  },
  {
    id: 'esp-club-tri',
    nombre: 'Club Tri - Espacio Cultural & Música',
    direccion: '20 de Septiembre 2650',
    barrio: 'La Perla',
    ciudad: 'Mar del Plata',
    telefono: '+54 (0223) 488-1200',
    email: 'produccion@clubtri.com.ar',
    capacidadGeneral: 140,
    comisionEntradas: 10,
    comisionSalasB2B: 8,
    estadoLiquidacion: 'activo',
  },
  {
    id: 'esp-club-teatro',
    nombre: 'El Club del Teatro',
    direccion: 'Rivadavia 3422',
    barrio: 'Centro Comercial',
    ciudad: 'Mar del Plata',
    telefono: '+54 (0223) 493-2104',
    email: 'salas@elclubdelteatro.org',
    capacidadGeneral: 75,
    comisionEntradas: 10,
    comisionSalasB2B: 8,
    estadoLiquidacion: 'activo',
  },
];

// Generador de butacas para una función (4 filas x 8 asientos = 32 butacas)
// Fila D (D1 a D8) reservada como Bloque de Contingencia (RB-10)
function generarButacas(funcionId: string, precioBase: number, vendidosWeb: string[] = [], vendidosPresencial: string[] = []): { butacas: Butaca[]; bloqueContingenciaIds: string[] } {
  const butacas: Butaca[] = [];
  const filas = ['A', 'B', 'C', 'D'];
  const bloqueContingenciaIds: string[] = [];

  for (const fila of filas) {
    for (let num = 1; num <= 8; num++) {
      const id = `${funcionId}-${fila}${num}`;
      const isContingencia = fila === 'D';

      if (isContingencia) {
        bloqueContingenciaIds.push(id);
      }

      let estado: Butaca['estado'] = 'disponible';
      let canalVenta: Butaca['canalVenta'] = undefined;

      if (isContingencia) {
        estado = 'bloque_contingencia';
      } else if (vendidosWeb.includes(`${fila}${num}`)) {
        estado = 'vendido_web';
        canalVenta = 'Web';
      } else if (vendidosPresencial.includes(`${fila}${num}`)) {
        estado = 'vendido_presencial';
        canalVenta = 'Presencial';
      }

      butacas.push({
        id,
        fila,
        numero: num,
        estado,
        precio: precioBase,
        canalVenta,
      });
    }
  }

  return { butacas, bloqueContingenciaIds };
}

// Funciones y eventos
const f1Data = generarButacas('fn-brote-01', 12000, ['A1', 'A2', 'B3', 'B4'], ['A5', 'A6', 'C1']);
const f2Data = generarButacas('fn-brote-02', 12000, ['A3', 'A4'], ['B1', 'B2']);
const f3Data = generarButacas('fn-piazzolla-01', 15000, ['A1', 'A2', 'A3', 'B5', 'B6', 'C4'], ['A4', 'B1', 'B2']);
const f4Data = generarButacas('fn-tempestad-01', 9500, ['A1', 'A2', 'C2'], ['B3', 'B4']);
const f5Data = generarButacas('fn-indie-01', 8500, ['A1', 'A2', 'A7', 'A8', 'B1'], ['B7', 'B8']);
const f6Data = generarButacas('fn-taller-01', 14000, ['A1'], ['A2']);

export const EVENTOS_INICIALES: Evento[] = [
  {
    id: 'evt-brote',
    espacioId: 'esp-colon',
    espacioNombre: 'Teatro Colón Mar del Plata',
    titulo: 'El Brote (De Emiliano Dionisi)',
    sinopsis: 'Un actor en los márgenes de una compañía de teatro clásico comienza a desdibujar los límites entre la ficción teatral y su propia realidad. Una obra multipremiada de dramaturgia frenética.',
    disciplina: 'teatro',
    imagen: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
    duracionMinutos: 90,
    calificacion: '+14',
    precioBase: 12000,
    destacadoPortada: true,
    justificacionDestacado: {
      criterio: 'Rotación y diversidad artística',
      motivo: 'Aprobado por mesa directiva de la red: Obra destacada del mes con alto interés cultural y cupo equitativo.',
      usuario: 'curaduria@urbanacult.ar',
      fecha: '2026-10-20 11:30',
    },
    funciones: [
      {
        id: 'fn-brote-01',
        eventoId: 'evt-brote',
        fecha: '2026-10-29',
        hora: '21:00',
        salaNombre: 'Sala Principal Mayor',
        capacidadTotal: 32,
        butacas: f1Data.butacas,
        bloqueContingenciaIds: f1Data.bloqueContingenciaIds,
        estado: 'programada',
      },
      {
        id: 'fn-brote-02',
        eventoId: 'evt-brote',
        fecha: '2026-10-30',
        hora: '21:30',
        salaNombre: 'Sala Principal Mayor',
        capacidadTotal: 32,
        butacas: f2Data.butacas,
        bloqueContingenciaIds: f2Data.bloqueContingenciaIds,
        estado: 'programada',
      },
    ],
  },
  {
    id: 'evt-piazzolla',
    espacioId: 'esp-colon',
    espacioNombre: 'Teatro Colón Mar del Plata',
    titulo: 'Astor Piazzolla: Ecos del Atlántico',
    sinopsis: 'Ensamble de cámara marplatense rindiendo homenaje al repertorio revolucionario del maestro Astor Piazzolla, nacido en Mar del Plata. Bandoneón solista, violín, piano y contrabajo.',
    disciplina: 'musica',
    imagen: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
    duracionMinutos: 105,
    calificacion: 'ATP',
    precioBase: 15000,
    destacadoPortada: true,
    justificacionDestacado: {
      criterio: 'Patrimonio cultural marplatense',
      motivo: 'Ciclo oficial conmemorativo con auspicio de la red de salas independientes.',
      usuario: 'direccion@urbanacult.ar',
      fecha: '2026-10-18 09:15',
    },
    funciones: [
      {
        id: 'fn-piazzolla-01',
        eventoId: 'evt-piazzolla',
        fecha: '2026-11-01',
        hora: '20:30',
        salaNombre: 'Sala Acústica Colón',
        capacidadTotal: 32,
        butacas: f3Data.butacas,
        bloqueContingenciaIds: f3Data.bloqueContingenciaIds,
        estado: 'programada',
      },
    ],
  },
  {
    id: 'evt-tempestad',
    espacioId: 'esp-septimo',
    espacioNombre: 'Centro Cultural Séptimo Fuego',
    titulo: 'La Tempestad Rioplatense',
    sinopsis: 'Adaptación visceral en clave costera del clásico shakesperiano. Teatro físico, poesía popular y texturas sonoras en vivo en una atmósfera íntima y autogestionada.',
    disciplina: 'teatro',
    imagen: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80',
    duracionMinutos: 75,
    calificacion: '+12',
    precioBase: 9500,
    destacadoPortada: false,
    funciones: [
      {
        id: 'fn-tempestad-01',
        eventoId: 'evt-tempestad',
        fecha: '2026-10-31',
        hora: '21:00',
        salaNombre: 'Sala Teatral Íntima',
        capacidadTotal: 32,
        butacas: f4Data.butacas,
        bloqueContingenciaIds: f4Data.bloqueContingenciaIds,
        estado: 'programada',
      },
    ],
  },
  {
    id: 'evt-indie',
    espacioId: 'esp-club-tri',
    espacioNombre: 'Club Tri - Espacio Cultural & Música',
    titulo: 'Festival Sonidos de la Costa: Club Tri',
    sinopsis: 'Noche de bandas emergentes de la escena indie y synthpop marplatense. Dj sets en vinilo, visuales analógicas y barra artesanal de productores locales.',
    disciplina: 'festivales',
    imagen: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    duracionMinutos: 180,
    calificacion: '+18',
    precioBase: 8500,
    destacadoPortada: true,
    justificacionDestacado: {
      criterio: 'Fomento a la música emergente',
      motivo: 'Cupo rotativo de fin de semana para salas de música contemporánea.',
      usuario: 'marketing@urbanacult.ar',
      fecha: '2026-10-22 17:40',
    },
    funciones: [
      {
        id: 'fn-indie-01',
        eventoId: 'evt-indie',
        fecha: '2026-11-06',
        hora: '22:00',
        salaNombre: 'Pista Escenario Club Tri',
        capacidadTotal: 32,
        butacas: f5Data.butacas,
        bloqueContingenciaIds: f5Data.bloqueContingenciaIds,
        estado: 'programada',
      },
    ],
  },
  {
    id: 'evt-taller',
    espacioId: 'esp-club-teatro',
    espacioNombre: 'El Club del Teatro',
    titulo: 'Taller Intensivo de Dirección Escénica y Espacio',
    sinopsis: 'Seminario práctico de 3 jornadas para directores, dramaturgos y actores. Análisis del espacio escénico, iluminación expresiva y ritmo interpretativo.',
    disciplina: 'talleres',
    imagen: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    duracionMinutos: 120,
    calificacion: 'ATP',
    precioBase: 14000,
    destacadoPortada: false,
    funciones: [
      {
        id: 'fn-taller-01',
        eventoId: 'evt-taller',
        fecha: '2026-11-07',
        hora: '17:00',
        salaNombre: 'Aula / Laboratorio Escénico',
        capacidadTotal: 32,
        butacas: f6Data.butacas,
        bloqueContingenciaIds: f6Data.bloqueContingenciaIds,
        estado: 'programada',
      },
    ],
  },
];

export const SALAS_ENSAYO_INICIALES: SalaEnsayo[] = [
  {
    id: 'sala-colon-1',
    espacioId: 'esp-colon',
    nombre: 'Sala de Ensayo Orquestal',
    tipo: 'acustica',
    capacidadPersonas: 20,
    equipamiento: ['Piano de cola Yamaha', 'Atriles de madera', 'Tratamiento acústico difusor', 'Aire acondicionado'],
    precioHora: 12000,
  },
  {
    id: 'sala-septimo-1',
    espacioId: 'esp-septimo',
    nombre: 'Caja Negra Teatral - Sala 1',
    tipo: 'general',
    capacidadPersonas: 15,
    equipamiento: ['Tarimas modulares', 'Parrilla básica de luces', 'Cámara negra perimetral', 'Equipo sonido bluetooth'],
    precioHora: 9000,
  },
  {
    id: 'sala-tri-1',
    espacioId: 'esp-club-tri',
    nombre: 'Laboratorio de Sonido & Ensayo Bandas',
    tipo: 'grabacion',
    capacidadPersonas: 8,
    equipamiento: ['Batería Pearl Vision', 'Ampli bajo Fender Rumble', '2 Amplis guitarra Marshall', 'Consola Allen & Heath 16ch'],
    precioHora: 11000,
  },
  {
    id: 'sala-club-teatro-1',
    espacioId: 'esp-club-teatro',
    nombre: 'Sala Espejos & Expresión Corporal',
    tipo: 'danza',
    capacidadPersonas: 18,
    equipamiento: ['Piso flotante de madera', 'Barrales dobles', 'Espejos de pared completa', 'Vestuarios'],
    precioHora: 8500,
  },
];

export const RESERVAS_SALAS_INICIALES: ReservaSalaEnsayo[] = [
  {
    id: 'res-sala-101',
    espacioId: 'esp-colon',
    salaId: 'sala-colon-1',
    salaNombre: 'Sala de Ensayo Orquestal',
    bandaNombre: 'Cuarteto de Cuerdas Costero',
    contactoNombre: 'Mariana Zunino',
    contactoTelefono: '+54 223 512-3344',
    fecha: '2026-10-28',
    horaInicio: '17:00',
    horaFin: '19:00',
    duracionHoras: 2,
    importeTotal: 24000,
    comisionB2B: 1920, // 8%
    netoEspacio: 22080,
    estado: 'confirmada',
    fechaCreacion: '2026-10-25 14:00',
  },
  {
    id: 'res-sala-102',
    espacioId: 'esp-septimo',
    salaId: 'sala-septimo-1',
    salaNombre: 'Caja Negra Teatral - Sala 1',
    bandaNombre: 'Elenco Teatral "Los Náufragos"',
    contactoNombre: 'Marcos Benítez',
    contactoTelefono: '+54 223 441-9988',
    fecha: '2026-10-28',
    horaInicio: '18:00',
    horaFin: '21:00',
    duracionHoras: 3,
    importeTotal: 27000,
    comisionB2B: 2160, // 8%
    netoEspacio: 24840,
    estado: 'confirmada',
    fechaCreacion: '2026-10-26 10:15',
  },
];

export const VENTAS_INICIALES: TransaccionVenta[] = [
  {
    id: 'TX-2026-001',
    funcionId: 'fn-brote-01',
    eventoId: 'evt-brote',
    eventoTitulo: 'El Brote (De Emiliano Dionisi)',
    espacioId: 'esp-colon',
    espacioNombre: 'Teatro Colón Mar del Plata',
    butacaId: 'fn-brote-01-A1',
    butacaEtiqueta: 'Fila A - Asiento 1',
    canal: 'Web',
    importeBruto: 12000,
    comisionPorcentaje: 10,
    comisionMonto: 1200,
    netoEspacio: 10800,
    estadoPago: 'Aprobado',
    fecha: '2026-10-26 18:22',
    compradorNombre: 'Lucía Santillán',
    compradorEmail: 'lucia.santi@gmail.com',
    metodoPago: 'MercadoPago Simulado (Tarjeta Crédito)',
    codigoComprobante: 'UC-TKT-9921',
  },
  {
    id: 'TX-2026-002',
    funcionId: 'fn-brote-01',
    eventoId: 'evt-brote',
    eventoTitulo: 'El Brote (De Emiliano Dionisi)',
    espacioId: 'esp-colon',
    espacioNombre: 'Teatro Colón Mar del Plata',
    butacaId: 'fn-brote-01-A5',
    butacaEtiqueta: 'Fila A - Asiento 5',
    canal: 'Presencial',
    importeBruto: 12000,
    comisionPorcentaje: 10,
    comisionMonto: 1200,
    netoEspacio: 10800,
    estadoPago: 'Aprobado',
    fecha: '2026-10-26 19:40',
    compradorNombre: 'Jorge Morales (Ventanilla)',
    metodoPago: 'Efectivo Boletería',
    codigoComprobante: 'UC-TKT-9922',
  },
  {
    id: 'TX-2026-003',
    funcionId: 'fn-piazzolla-01',
    eventoId: 'evt-piazzolla',
    eventoTitulo: 'Astor Piazzolla: Ecos del Atlántico',
    espacioId: 'esp-colon',
    espacioNombre: 'Teatro Colón Mar del Plata',
    butacaId: 'fn-piazzolla-01-A1',
    butacaEtiqueta: 'Fila A - Asiento 1',
    canal: 'Web',
    importeBruto: 15000,
    comisionPorcentaje: 10,
    comisionMonto: 1500,
    netoEspacio: 13500,
    estadoPago: 'Aprobado',
    fecha: '2026-10-27 10:14',
    compradorNombre: 'Claudio Méndez',
    compradorEmail: 'cmendez@mdp.edu.ar',
    metodoPago: 'MercadoPago Simulado (Débito)',
    codigoComprobante: 'UC-TKT-9923',
  },
];

export const AUDITORIA_INICIAL: RegistroAuditoria[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-26 18:22:04',
    usuario: 'espectador_web_anon',
    rol: 'publico',
    accion: 'VENTA_CONFIRMADA_WEB',
    entidad: 'Butaca',
    entidadId: 'fn-brote-01-A1',
    estadoAnterior: 'reservado_temporal',
    estadoNuevo: 'vendido_web',
    motivo: 'Pago aprobado por pasarela externa (TX-2026-001)',
    canal: 'Web',
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-26 19:40:12',
    usuario: 'boletero_colon_1',
    rol: 'boleteria',
    accion: 'VENTA_CONFIRMADA_PRESENCIAL',
    entidad: 'Butaca',
    entidadId: 'fn-brote-01-A5',
    estadoAnterior: 'disponible',
    estadoNuevo: 'vendido_presencial',
    motivo: 'Cobro en ventanilla en efectivo verificado por taquilla',
    canal: 'Presencial',
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-20 11:30:00',
    usuario: 'curaduria@urbanacult.ar',
    rol: 'urbana_admin',
    accion: 'PUBLICACION_PORTADA_ACTUALIZADA',
    entidad: 'Evento',
    entidadId: 'evt-brote',
    estadoAnterior: 'destacado:false',
    estadoNuevo: 'destacado:true',
    motivo: 'Criterio: Rotación acordada por mesa directiva B2B',
    canal: 'Backoffice',
  },
];

export const INCIDENTES_INICIALES: IncidenteCobro[] = [
  {
    id: 'INC-2026-01',
    transaccionId: 'TX-2026-PEND-09',
    espacioId: 'esp-septimo',
    espacioNombre: 'Centro Cultural Séptimo Fuego',
    tipo: 'pago_fallido',
    estado: 'en_seguimiento',
    prioridad: 'alta',
    responsable: 'Soporte B2B - Martín R.',
    fechaApertura: '2026-10-27 12:45',
    descripcion: 'Timeout de confirmación en tarjeta Visa terminada en 4412. Butaca B-2 mantenida en estado "Pendiente de conciliación" sin liberar para evitar sobreventa.',
    historialAcciones: [
      {
        fecha: '2026-10-27 12:46',
        usuario: 'sistema_conciliador',
        nota: 'Expiró ventana de 10 minutos con estado incierto del proveedor. Se aplicó RB-02.',
      },
      {
        fecha: '2026-10-27 13:10',
        usuario: 'Soporte B2B - Martín R.',
        nota: 'Consulta manual enviada a la pasarela; a la espera de confirmación de contracargo o acreditación.',
      },
    ],
  },
];
