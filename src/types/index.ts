/**
 * Definiciones de tipos del sistema Urbana Cult (Mar del Plata)
 * Basado en la Especificación de Requerimientos de Software (ERS) y TGS
 */

export type RolUsuario = 'publico' | 'boleteria' | 'admin_espacio' | 'urbana_admin';

export type Disciplina = 'teatro' | 'musica' | 'danza' | 'talleres' | 'festivales';

export type EstadoButaca = 
  | 'disponible' 
  | 'reservado_temporal' 
  | 'vendido_web' 
  | 'vendido_presencial' 
  | 'bloque_contingencia';

export interface Butaca {
  id: string; // ej: "B-A1"
  fila: string; // ej: "A"
  numero: number; // ej: 1
  estado: EstadoButaca;
  precio: number;
  reservaExpira?: number; // timestamp ms
  reservaCliente?: string;
  canalVenta?: 'Web' | 'Presencial' | 'Contingencia';
  contingenciaVendidoOffline?: boolean;
}

export interface Funcion {
  id: string;
  eventoId: string;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:mm
  salaNombre: string;
  capacidadTotal: number;
  butacas: Butaca[];
  bloqueContingenciaIds: string[]; // Butacas reservadas para caída de red (RB-10)
  estado: 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
}

export interface JustificacionDestacado {
  criterio: string; // ej: "Rotación acordada", "Diversidad de disciplinas", "Campaña local"
  motivo: string;
  usuario: string;
  fecha: string;
}

export interface Evento {
  id: string;
  espacioId: string;
  espacioNombre: string;
  titulo: string;
  sinopsis: string;
  disciplina: Disciplina;
  imagen: string;
  duracionMinutos: number;
  calificacion: string;
  precioBase: number;
  funciones: Funcion[];
  destacadoPortada: boolean;
  justificacionDestacado?: JustificacionDestacado;
}

export interface EspacioCultural {
  id: string;
  nombre: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  telefono: string;
  email: string;
  capacidadGeneral: number;
  comisionEntradas: number; // Por defecto 10%
  comisionSalasB2B: number; // Por defecto 8%
  estadoLiquidacion: 'activo' | 'pausado_por_riesgo';
  motivoPausa?: string;
}

export type CanalVenta = 'Web' | 'Presencial' | 'Contingencia';

export type EstadoPago = 
  | 'Aprobado' 
  | 'Pendiente' 
  | 'Rechazado' 
  | 'Pendiente_Conciliacion';

export interface TransaccionVenta {
  id: string; // ej: "TX-2026-0842"
  funcionId: string;
  eventoId: string;
  eventoTitulo: string;
  espacioId: string;
  espacioNombre: string;
  butacaId: string;
  butacaEtiqueta: string; // ej: "Fila B - Butaca 4"
  canal: CanalVenta;
  importeBruto: number;
  comisionPorcentaje: number;
  comisionMonto: number;
  netoEspacio: number;
  estadoPago: EstadoPago;
  fecha: string;
  compradorNombre: string;
  compradorEmail?: string;
  compradorDni?: string;
  metodoPago: string; // 'MercadoPago Simulado', 'Efectivo Boletería', 'Tarjeta POS'
  contingenciaSincronizada?: boolean;
  codigoComprobante: string;
}

export interface SalaEnsayo {
  id: string;
  espacioId: string;
  nombre: string;
  tipo: 'acustica' | 'general' | 'danza' | 'grabacion';
  capacidadPersonas: number;
  equipamiento: string[];
  precioHora: number;
}

export interface ReservaSalaEnsayo {
  id: string;
  espacioId: string;
  salaId: string;
  salaNombre: string;
  bandaNombre: string;
  contactoNombre: string;
  contactoTelefono: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // "18:00"
  horaFin: string; // "20:00"
  duracionHoras: number;
  importeTotal: number;
  comisionB2B: number; // 8%
  netoEspacio: number;
  estado: 'confirmada' | 'cancelada';
  fechaCreacion: string;
}

export interface RegistroAuditoria {
  id: string;
  timestamp: string;
  usuario: string;
  rol: RolUsuario;
  accion: string;
  entidad: string;
  entidadId: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  motivo?: string;
  canal?: string;
}

export interface IncidenteCobro {
  id: string;
  transaccionId?: string;
  espacioId: string;
  espacioNombre: string;
  tipo: 'pago_fallido' | 'pago_duplicado' | 'retencion_fondos' | 'alerta_fraude' | 'desconexion_prolongada';
  estado: 'abierto' | 'en_seguimiento' | 'resuelto';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  responsable: string;
  fechaApertura: string;
  descripcion: string;
  historialAcciones: { fecha: string; usuario: string; nota: string }[];
}

export interface VentaContingenciaItem {
  id: string;
  funcionId: string;
  butacaId: string;
  fila: string;
  numero: number;
  precio: number;
  fechaVenta: string;
  vendedor: string;
  compradorNombre: string;
  comprobanteFisico: string;
}
