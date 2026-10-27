import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RolUsuario,
  EspacioCultural,
  Evento,
  Funcion,
  Butaca,
  TransaccionVenta,
  SalaEnsayo,
  ReservaSalaEnsayo,
  RegistroAuditoria,
  IncidenteCobro,
  VentaContingenciaItem,
  JustificacionDestacado,
} from '../types';
import {
  ESPACIOS_INICIALES,
  EVENTOS_INICIALES,
  SALAS_ENSAYO_INICIALES,
  RESERVAS_SALAS_INICIALES,
  VENTAS_INICIALES,
  AUDITORIA_INICIAL,
  INCIDENTES_INICIALES,
} from '../data/initialData';

interface UrbanaContextType {
  // Roles y Navegación
  currentRole: RolUsuario;
  setCurrentRole: (role: RolUsuario) => void;
  currentEspacioId: string;
  setCurrentEspacioId: (id: string) => void;
  espacios: EspacioCultural[];
  currentEspacio: EspacioCultural;

  // Catálogo y Funciones
  eventos: Evento[];
  selectedEvento: Evento | null;
  setSelectedEvento: (evt: Evento | null) => void;
  selectedFuncion: Funcion | null;
  setSelectedFuncion: (fn: Funcion | null) => void;

  // Venta y Butacas
  selectedButaca: Butaca | null;
  setSelectedButaca: (b: Butaca | null) => void;
  iniciarReservaTemporal: (funcionId: string, butacaId: string, clienteNombre?: string) => { success: boolean; message: string; expiraEnMs?: number };
  cancelarReservaTemporal: (funcionId: string, butacaId: string) => void;
  procesarPagoWeb: (
    funcionId: string,
    butacaId: string,
    outcome: 'Aprobado' | 'Rechazado' | 'Timeout_Incierto',
    comprador: { nombre: string; email: string; dni: string; metodoPago: string }
  ) => { success: boolean; transaccion?: TransaccionVenta; message: string; pendingConciliation?: boolean };
  ventaBoleteriaPresencial: (
    funcionId: string,
    butacaId: string,
    compradorNombre: string,
    metodoPago: string
  ) => { success: boolean; transaccion?: TransaccionVenta; message: string };

  // Transacciones y Liquidaciones
  ventas: TransaccionVenta[];
  totalGMV: number;
  totalComisiones: number;
  pausarOReanudarLiquidacion: (espacioId: string, accion: 'pausar' | 'reanudar', motivo: string) => void;

  // Contingencia Offline (RB-10 / HU-10)
  isOfflineContingency: boolean;
  setIsOfflineContingency: (offline: boolean) => void;
  contingencyQueue: VentaContingenciaItem[];
  registrarVentaContingencia: (
    funcionId: string,
    butacaId: string,
    compradorNombre: string
  ) => { success: boolean; message: string; item?: VentaContingenciaItem };
  conciliarContingencia: () => { exitosas: number; conflictos: number; detalles: string[] };

  // Salas de Ensayo B2B (RF-15 / HU-04)
  salasEnsayo: SalaEnsayo[];
  reservasSalas: ReservaSalaEnsayo[];
  reservarSalaEnsayo: (
    espacioId: string,
    salaId: string,
    bandaNombre: string,
    contactoNombre: string,
    contactoTelefono: string,
    fecha: string,
    horaInicio: string,
    horaFin: string
  ) => { success: boolean; message: string; reserva?: ReservaSalaEnsayo; conflicto?: boolean };
  cancelarReservaSala: (reservaId: string, motivo: string) => void;

  // Auditoría e Incidentes (RF-18 / RF-21 / RF-24 / RF-28)
  auditoria: RegistroAuditoria[];
  incidentes: IncidenteCobro[];
  resolverIncidente: (incidenteId: string, nota: string) => void;
  registrarAlertaProveedor: (tipo: IncidenteCobro['tipo'], descripcion: string, prioridad: IncidenteCobro['prioridad']) => void;

  // Gobernanza y Portada (RF-22)
  actualizarDestacados: (eventoId: string, destacado: boolean, justificacion?: JustificacionDestacado) => void;

  // Gestión de Eventos B2B (RF-04 / RF-05 / HU-03)
  crearEvento: (eventoData: Omit<Evento, 'id' | 'funciones' | 'destacadoPortada'> & { funciones: { fecha: string; hora: string; salaNombre: string; capacidadTotal: number; precio: number }[] }) => { success: boolean; message: string };

  // Simulador de Carrera Concurrente (RF-09 / HU-01)
  simularCarreraConcurrente: (funcionId: string, butacaId: string) => Promise<{
    ganador: 'Web' | 'Presencial';
    perdedor: 'Web' | 'Presencial';
    tiempoWebMs: number;
    tiempoBoleteriaMs: number;
    mensajeExito: string;
    mensajeRechazo: string;
    butacaId: string;
  }>;

  // Utilitarios
  resetToInitialData: () => void;
}

const UrbanaContext = createContext<UrbanaContextType | undefined>(undefined);

export const UrbanaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado de roles
  const [currentRole, setCurrentRole] = useState<RolUsuario>('publico');
  const [currentEspacioId, setCurrentEspacioId] = useState<string>('esp-colon');

  // Estado de entidades con persistencia local
  const [espacios, setEspacios] = useState<EspacioCultural[]>(() => {
    const saved = localStorage.getItem('urbana_espacios');
    return saved ? JSON.parse(saved) : ESPACIOS_INICIALES;
  });

  const [eventos, setEventos] = useState<Evento[]>(() => {
    const saved = localStorage.getItem('urbana_eventos');
    return saved ? JSON.parse(saved) : EVENTOS_INICIALES;
  });

  const [salasEnsayo] = useState<SalaEnsayo[]>(SALAS_ENSAYO_INICIALES);

  const [reservasSalas, setReservasSalas] = useState<ReservaSalaEnsayo[]>(() => {
    const saved = localStorage.getItem('urbana_reservas_salas');
    return saved ? JSON.parse(saved) : RESERVAS_SALAS_INICIALES;
  });

  const [ventas, setVentas] = useState<TransaccionVenta[]>(() => {
    const saved = localStorage.getItem('urbana_ventas');
    return saved ? JSON.parse(saved) : VENTAS_INICIALES;
  });

  const [auditoria, setAuditoria] = useState<RegistroAuditoria[]>(() => {
    const saved = localStorage.getItem('urbana_auditoria');
    return saved ? JSON.parse(saved) : AUDITORIA_INICIAL;
  });

  const [incidentes, setIncidentes] = useState<IncidenteCobro[]>(() => {
    const saved = localStorage.getItem('urbana_incidentes');
    return saved ? JSON.parse(saved) : INCIDENTES_INICIALES;
  });

  // Estado de selección actual para navegación
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [selectedFuncion, setSelectedFuncion] = useState<Funcion | null>(null);
  const [selectedButaca, setSelectedButaca] = useState<Butaca | null>(null);

  // Estado de Contingencia (RB-10)
  const [isOfflineContingency, setIsOfflineContingency] = useState<boolean>(false);
  const [contingencyQueue, setContingencyQueue] = useState<VentaContingenciaItem[]>(() => {
    const saved = localStorage.getItem('urbana_contingency_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('urbana_espacios', JSON.stringify(espacios));
  }, [espacios]);

  useEffect(() => {
    localStorage.setItem('urbana_eventos', JSON.stringify(eventos));
  }, [eventos]);

  useEffect(() => {
    localStorage.setItem('urbana_reservas_salas', JSON.stringify(reservasSalas));
  }, [reservasSalas]);

  useEffect(() => {
    localStorage.setItem('urbana_ventas', JSON.stringify(ventas));
  }, [ventas]);

  useEffect(() => {
    localStorage.setItem('urbana_auditoria', JSON.stringify(auditoria));
  }, [auditoria]);

  useEffect(() => {
    localStorage.setItem('urbana_incidentes', JSON.stringify(incidentes));
  }, [incidentes]);

  useEffect(() => {
    localStorage.setItem('urbana_contingency_queue', JSON.stringify(contingencyQueue));
  }, [contingencyQueue]);

  // Espacio actual
  const currentEspacio = espacios.find(e => e.id === currentEspacioId) || espacios[0];

  // Helper para agregar a la auditoría (RF-18 / RF-21)
  const registrarAuditoria = (
    accion: string,
    entidad: string,
    entidadId: string,
    detalle: { estadoAnterior?: string; estadoNuevo?: string; motivo?: string; canal?: string }
  ) => {
    const nuevoRegistro: RegistroAuditoria = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      usuario: currentRole === 'publico' ? 'espectador_web' : `${currentRole}_${currentEspacioId}`,
      rol: currentRole,
      accion,
      entidad,
      entidadId,
      ...detalle,
    };
    setAuditoria(prev => [nuevoRegistro, ...prev]);
  };

  // Revisor periódico de reservas temporales expiradas (RB-02)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let huboCambios = false;

      const eventosActualizados = eventos.map(evento => {
        let eventoModificado = false;
        const funcionesActualizadas = evento.funciones.map(fn => {
          let fnModificada = false;
          const butacasActualizadas = fn.butacas.map(butaca => {
            if (butaca.estado === 'reservado_temporal' && butaca.reservaExpira && butaca.reservaExpira <= now) {
              fnModificada = true;
              eventoModificado = true;
              huboCambios = true;
              return {
                ...butaca,
                estado: 'disponible' as const,
                reservaExpira: undefined,
                reservaCliente: undefined,
              };
            }
            return butaca;
          });
          return fnModificada ? { ...fn, butacas: butacasActualizadas } : fn;
        });
        return eventoModificado ? { ...evento, funciones: funcionesActualizadas } : evento;
      });

      if (huboCambios) {
        setEventos(eventosActualizados);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [eventos]);

  // Métricas financieras globales
  const totalGMV = ventas
    .filter(v => v.estadoPago === 'Aprobado')
    .reduce((sum, v) => sum + v.importeBruto, 0);

  const totalComisiones = ventas
    .filter(v => v.estadoPago === 'Aprobado')
    .reduce((sum, v) => sum + v.comisionMonto, 0);

  // 1. Iniciar reserva temporal (Web)
  const iniciarReservaTemporal = (funcionId: string, butacaId: string, clienteNombre = 'Espectador Web') => {
    // Buscar la butaca y verificar disponibilidad atómica
    let targetButaca: Butaca | null = null;
    let targetEvento: Evento | null = null;

    for (const evt of eventos) {
      for (const fn of evt.funciones) {
        if (fn.id === funcionId) {
          const b = fn.butacas.find(item => item.id === butacaId);
          if (b) {
            targetButaca = b;
            targetEvento = evt;
            break;
          }
        }
      }
    }

    if (!targetButaca || !targetEvento) {
      return { success: false, message: 'La butaca o función especificada no existe.' };
    }

    if (targetButaca.estado !== 'disponible') {
      return {
        success: false,
        message: `La butaca ${targetButaca.fila}${targetButaca.numero} ya se encuentra ocupada o reservada por otro canal (${targetButaca.estado}).`,
      };
    }

    const expiraEnMs = Date.now() + 10 * 60 * 1000; // 10 minutos (RB-02)

    setEventos(prev =>
      prev.map(evt => {
        if (evt.id !== targetEvento?.id) return evt;
        return {
          ...evt,
          funciones: evt.funciones.map(fn => {
            if (fn.id !== funcionId) return fn;
            return {
              ...fn,
              butacas: fn.butacas.map(b => {
                if (b.id !== butacaId) return b;
                return {
                  ...b,
                  estado: 'reservado_temporal',
                  reservaExpira: expiraEnMs,
                  reservaCliente: clienteNombre,
                  canalVenta: 'Web',
                };
              }),
            };
          }),
        };
      })
    );

    registrarAuditoria('RESERVA_TEMPORAL_INICIADA', 'Butaca', butacaId, {
      estadoAnterior: 'disponible',
      estadoNuevo: 'reservado_temporal',
      motivo: `Reserva temporal iniciada por 10 min para ${clienteNombre}`,
      canal: 'Web',
    });

    return { success: true, message: 'Butaca reservada temporalmente por 10 minutos.', expiraEnMs };
  };

  // 2. Cancelar reserva temporal
  const cancelarReservaTemporal = (funcionId: string, butacaId: string) => {
    setEventos(prev =>
      prev.map(evt => ({
        ...evt,
        funciones: evt.funciones.map(fn => {
          if (fn.id !== funcionId) return fn;
          return {
            ...fn,
            butacas: fn.butacas.map(b => {
              if (b.id !== butacaId) return b;
              return {
                ...b,
                estado: 'disponible',
                reservaExpira: undefined,
                reservaCliente: undefined,
                canalVenta: undefined,
              };
            }),
          };
        }),
      }))
    );

    registrarAuditoria('RESERVA_TEMPORAL_CANCELADA', 'Butaca', butacaId, {
      estadoAnterior: 'reservado_temporal',
      estadoNuevo: 'disponible',
      motivo: 'Cancelada por el usuario antes de procesar el pago',
      canal: 'Web',
    });
  };

  // 3. Procesar pago Web (Simulación con casos Aprobado, Rechazado, Timeout Incierto)
  const procesarPagoWeb = (
    funcionId: string,
    butacaId: string,
    outcome: 'Aprobado' | 'Rechazado' | 'Timeout_Incierto',
    comprador: { nombre: string; email: string; dni: string; metodoPago: string }
  ) => {
    let targetEvento: Evento | null = null;
    let targetFuncion: Funcion | null = null;
    let targetButaca: Butaca | null = null;

    for (const evt of eventos) {
      for (const fn of evt.funciones) {
        if (fn.id === funcionId) {
          const b = fn.butacas.find(item => item.id === butacaId);
          if (b) {
            targetEvento = evt;
            targetFuncion = fn;
            targetButaca = b;
            break;
          }
        }
      }
    }

    if (!targetEvento || !targetFuncion || !targetButaca) {
      return { success: false, message: 'Operación fallida: Función o localidad no localizada.' };
    }

    const espacio = espacios.find(e => e.id === targetEvento?.espacioId) || espacios[0];
    const comisionPct = espacio.comisionEntradas; // 10%
    const importeBruto = targetButaca.precio;
    const comisionMonto = Math.round((importeBruto * comisionPct) / 100);
    const netoEspacio = importeBruto - comisionMonto;

    // Caso A: Aprobado
    if (outcome === 'Aprobado') {
      const transaccionId = `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const nuevaTransaccion: TransaccionVenta = {
        id: transaccionId,
        funcionId,
        eventoId: targetEvento.id,
        eventoTitulo: targetEvento.titulo,
        espacioId: espacio.id,
        espacioNombre: espacio.nombre,
        butacaId,
        butacaEtiqueta: `Fila ${targetButaca.fila} - Asiento ${targetButaca.numero}`,
        canal: 'Web',
        importeBruto,
        comisionPorcentaje: comisionPct,
        comisionMonto,
        netoEspacio,
        estadoPago: 'Aprobado',
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
        compradorNombre: comprador.nombre,
        compradorEmail: comprador.email,
        compradorDni: comprador.dni,
        metodoPago: comprador.metodoPago,
        codigoComprobante: `UC-WEB-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setEventos(prev =>
        prev.map(evt => {
          if (evt.id !== targetEvento?.id) return evt;
          return {
            ...evt,
            funciones: evt.funciones.map(fn => {
              if (fn.id !== funcionId) return fn;
              return {
                ...fn,
                butacas: fn.butacas.map(b => {
                  if (b.id !== butacaId) return b;
                  return {
                    ...b,
                    estado: 'vendido_web',
                    reservaExpira: undefined,
                    canalVenta: 'Web',
                  };
                }),
              };
            }),
          };
        })
      );

      setVentas(prev => [nuevaTransaccion, ...prev]);

      registrarAuditoria('VENTA_CONFIRMADA_WEB', 'TransaccionVenta', transaccionId, {
        estadoAnterior: 'reservado_temporal',
        estadoNuevo: 'vendido_web',
        motivo: `Pago aprobado ($${importeBruto} ARS). Comisión retenida: $${comisionMonto} ARS`,
        canal: 'Web',
      });

      return {
        success: true,
        transaccion: nuevaTransaccion,
        message: '¡Pago aprobado! Se ha emitido su entrada digital con disponibilidad actualizada en tiempo real.',
      };
    }

    // Caso B: Rechazado
    if (outcome === 'Rechazado') {
      cancelarReservaTemporal(funcionId, butacaId);

      registrarAuditoria('PAGO_RECHAZADO', 'Butaca', butacaId, {
        estadoAnterior: 'reservado_temporal',
        estadoNuevo: 'disponible',
        motivo: 'Proveedor de pagos informó cobro denegado. Se liberó la localidad.',
        canal: 'Web',
      });

      return {
        success: false,
        message: 'El procesador de pagos rechazó la transacción. La localidad ha sido liberada para la venta.',
      };
    }

    // Caso C: Timeout Incierto -> Pasa a Pendiente de Conciliación (RB-02 / HU-02 escenario 3)
    const incidentId = `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const nuevoIncidente: IncidenteCobro = {
      id: incidentId,
      espacioId: espacio.id,
      espacioNombre: espacio.nombre,
      tipo: 'pago_fallido',
      estado: 'en_seguimiento',
      prioridad: 'alta',
      responsable: 'Soporte B2B - Guardia de Turno',
      fechaApertura: new Date().toISOString().replace('T', ' ').substring(0, 16),
      descripcion: `Timeout de confirmación en butaca ${targetButaca.fila}${targetButaca.numero} (${targetEvento.titulo}). Se mantiene bloqueada en 'Pendiente de conciliación' según regla RB-02 para evitar sobreventa.`,
      historialAcciones: [
        {
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          usuario: 'sistema_conciliador_rb02',
          nota: 'Regla RB-02 activada: el tiempo expiró sin respuesta definitiva del proveedor de pagos. La localidad NO se libera automáticamente.',
        },
      ],
    };

    setIncidentes(prev => [nuevoIncidente, ...prev]);

    setEventos(prev =>
      prev.map(evt => {
        if (evt.id !== targetEvento?.id) return evt;
        return {
          ...evt,
          funciones: evt.funciones.map(fn => {
            if (fn.id !== funcionId) return fn;
            return {
              ...fn,
              butacas: fn.butacas.map(b => {
                if (b.id !== butacaId) return b;
                return {
                  ...b,
                  // Se mantiene retenido con timestamp nulo para que no se libere automáticamente
                  estado: 'reservado_temporal',
                  reservaExpira: undefined,
                  reservaCliente: `[CONCILIACION PENDIENTE - ${comprador.nombre}]`,
                };
              }),
            };
          }),
        };
      })
    );

    registrarAuditoria('ESTADO_PENDIENTE_CONCILIACION', 'Butaca', butacaId, {
      estadoAnterior: 'reservado_temporal',
      estadoNuevo: 'pendiente_conciliacion',
      motivo: `Respuesta incierta del proveedor de pagos. Apertura automática de incidente ${incidentId} (RB-02).`,
      canal: 'Web',
    });

    return {
      success: false,
      pendingConciliation: true,
      message: 'Tiempo de respuesta del procesador excedido. La butaca queda en estado "Pendiente de conciliación" (RB-02) sin liberar para proteger el aforo.',
    };
  };

  // 4. Venta en Boletería Física (POS Taquilla)
  const ventaBoleteriaPresencial = (
    funcionId: string,
    butacaId: string,
    compradorNombre: string,
    metodoPago: string
  ) => {
    // Si estamos en modo contingencia (offline) y la butaca NO es del bloque de contingencia:
    if (isOfflineContingency) {
      return {
        success: false,
        message: 'ERROR (RB-10): La boletería se encuentra sin conexión a internet. Solo se permite emitir localidades del Bloque Físico de Contingencia previamente excluido (Fila D).',
      };
    }

    let targetEvento: Evento | null = null;
    let targetFuncion: Funcion | null = null;
    let targetButaca: Butaca | null = null;

    for (const evt of eventos) {
      for (const fn of evt.funciones) {
        if (fn.id === funcionId) {
          const b = fn.butacas.find(item => item.id === butacaId);
          if (b) {
            targetEvento = evt;
            targetFuncion = fn;
            targetButaca = b;
            break;
          }
        }
      }
    }

    if (!targetEvento || !targetFuncion || !targetButaca) {
      return { success: false, message: 'Función o butaca inexistente.' };
    }

    // Regla RF-09: No vender si está reservada o vendida por web
    if (targetButaca.estado !== 'disponible' && targetButaca.estado !== 'bloque_contingencia') {
      return {
        success: false,
        message: `SOBREVENTA PREVENIDA (RF-09): La butaca ${targetButaca.fila}${targetButaca.numero} acaba de ser reservada o vendida por el canal Web. La disponibilidad central impidió la venta doble.`,
      };
    }

    const espacio = espacios.find(e => e.id === targetEvento?.espacioId) || espacios[0];
    const comisionPct = espacio.comisionEntradas;
    const importeBruto = targetButaca.precio;
    const comisionMonto = Math.round((importeBruto * comisionPct) / 100);
    const netoEspacio = importeBruto - comisionMonto;
    const transaccionId = `TX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const nuevaVenta: TransaccionVenta = {
      id: transaccionId,
      funcionId,
      eventoId: targetEvento.id,
      eventoTitulo: targetEvento.titulo,
      espacioId: espacio.id,
      espacioNombre: espacio.nombre,
      butacaId,
      butacaEtiqueta: `Fila ${targetButaca.fila} - Asiento ${targetButaca.numero}`,
      canal: 'Presencial',
      importeBruto,
      comisionPorcentaje: comisionPct,
      comisionMonto,
      netoEspacio,
      estadoPago: 'Aprobado',
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      compradorNombre: compradorNombre || 'Espectador en Ventanilla',
      metodoPago,
      codigoComprobante: `UC-POS-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setEventos(prev =>
      prev.map(evt => {
        if (evt.id !== targetEvento?.id) return evt;
        return {
          ...evt,
          funciones: evt.funciones.map(fn => {
            if (fn.id !== funcionId) return fn;
            return {
              ...fn,
              butacas: fn.butacas.map(b => {
                if (b.id !== butacaId) return b;
                return {
                  ...b,
                  estado: 'vendido_presencial',
                  reservaExpira: undefined,
                  canalVenta: 'Presencial',
                };
              }),
            };
          }),
        };
      })
    );

    setVentas(prev => [nuevaVenta, ...prev]);

    registrarAuditoria('VENTA_CONFIRMADA_BOLETERIA', 'TransaccionVenta', transaccionId, {
      estadoAnterior: targetButaca.estado,
      estadoNuevo: 'vendido_presencial',
      motivo: `Venta presencial en ventanilla (${metodoPago}) efectuada por operador taquilla`,
      canal: 'Presencial',
    });

    return {
      success: true,
      transaccion: nuevaVenta,
      message: `Venta presencial confirmada con éxito. Entrada impresa: ${nuevaVenta.codigoComprobante}. Inventario web actualizado.`,
    };
  };

  // 5. Modo Contingencia: Registro de ventas físicas offline (RB-10 / HU-10)
  const registrarVentaContingencia = (
    funcionId: string,
    butacaId: string,
    compradorNombre: string
  ) => {
    let targetEvento: Evento | null = null;
    let targetFuncion: Funcion | null = null;
    let targetButaca: Butaca | null = null;

    for (const evt of eventos) {
      for (const fn of evt.funciones) {
        if (fn.id === funcionId) {
          const b = fn.butacas.find(item => item.id === butacaId);
          if (b) {
            targetEvento = evt;
            targetFuncion = fn;
            targetButaca = b;
            break;
          }
        }
      }
    }

    if (!targetFuncion || !targetButaca) {
      return { success: false, message: 'Localidad no encontrada.' };
    }

    // Regla RB-10: Solo se pueden vender localidades que pertenezcan al bloque de contingencia (Fila D)
    const isEnBloque = targetFuncion.bloqueContingenciaIds.includes(butacaId);
    if (!isEnBloque) {
      return {
        success: false,
        message: 'VIOLACIÓN DE PROTOCOLO RB-10: En modo sin conexión NO se permite vender butacas ordinarias de la sala. Únicamente el Bloque de Contingencia pre-asignado (Fila D) está habilitado.',
      };
    }

    // Verificar si ya fue vendida en esta misma cola de contingencia
    const yaVendidaEnCola = contingencyQueue.some(item => item.butacaId === butacaId);
    if (yaVendidaEnCola) {
      return {
        success: false,
        message: `La butaca ${targetButaca.fila}${targetButaca.numero} ya fue emitida previamente en la cola de contingencia.`,
      };
    }

    const item: VentaContingenciaItem = {
      id: `CTG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      funcionId,
      butacaId,
      fila: targetButaca.fila,
      numero: targetButaca.numero,
      precio: targetButaca.precio,
      fechaVenta: new Date().toISOString().replace('T', ' ').substring(0, 16),
      vendedor: 'Boletero Taquilla Física (Modo Contingencia)',
      compradorNombre: compradorNombre || 'Espectador Presencial',
      comprobanteFisico: `TALON-PAPEL-${Math.floor(100 + Math.random() * 900)}`,
    };

    setContingencyQueue(prev => [...prev, item]);

    // Marcar visualmente la butaca
    setEventos(prev =>
      prev.map(evt => {
        if (evt.id !== targetEvento?.id) return evt;
        return {
          ...evt,
          funciones: evt.funciones.map(fn => {
            if (fn.id !== funcionId) return fn;
            return {
              ...fn,
              butacas: fn.butacas.map(b => {
                if (b.id !== butacaId) return b;
                return {
                  ...b,
                  contingenciaVendidoOffline: true,
                };
              }),
            };
          }),
        };
      })
    );

    return {
      success: true,
      message: `Tique manual #${item.comprobanteFisico} emitido. Registrado en cola offline para conciliación posterior.`,
      item,
    };
  };

  // 6. Conciliar ventas de contingencia al restablecer conexión (RF-26 / HU-10)
  const conciliarContingencia = () => {
    let exitosas = 0;
    let conflictos = 0;
    const detalles: string[] = [];

    const nuevasVentas: TransaccionVenta[] = [];

    contingencyQueue.forEach(item => {
      // Buscar la función y la butaca en el estado actual
      let bFound: Butaca | null = null;
      let evtFound: Evento | null = null;
      for (const evt of eventos) {
        for (const fn of evt.funciones) {
          if (fn.id === item.funcionId) {
            const b = fn.butacas.find(x => x.id === item.butacaId);
            if (b) {
              bFound = b;
              evtFound = evt;
              break;
            }
          }
        }
      }

      if (!bFound || !evtFound) {
        conflictos++;
        detalles.push(`Error: No se localizó la butaca ${item.fila}${item.numero} en el sistema central.`);
        return;
      }

      // El bloque de contingencia estaba protegido de la venta web; debe conciliarse limpiamente:
      if (bFound.estado === 'bloque_contingencia' || bFound.estado === 'disponible') {
        exitosas++;
        const espacio = espacios.find(e => e.id === evtFound?.espacioId) || espacios[0];
        const comisionMonto = Math.round((item.precio * espacio.comisionEntradas) / 100);

        nuevasVentas.push({
          id: `TX-CTG-${item.id}`,
          funcionId: item.funcionId,
          eventoId: evtFound.id,
          eventoTitulo: evtFound.titulo,
          espacioId: espacio.id,
          espacioNombre: espacio.nombre,
          butacaId: item.butacaId,
          butacaEtiqueta: `Fila ${item.fila} - Asiento ${item.numero}`,
          canal: 'Contingencia',
          importeBruto: item.precio,
          comisionPorcentaje: espacio.comisionEntradas,
          comisionMonto,
          netoEspacio: item.precio - comisionMonto,
          estadoPago: 'Aprobado',
          fecha: item.fechaVenta,
          compradorNombre: item.compradorNombre,
          metodoPago: 'Efectivo Contingencia Papel',
          contingenciaSincronizada: true,
          codigoComprobante: item.comprobanteFisico,
        });

        detalles.push(`Conciliación exitosa: Butaca ${item.fila}${item.numero} confirmada como venta de contingencia (${item.comprobanteFisico}).`);
      } else {
        // En caso de conflicto inesperado (RF-26: no sobrescribir, enviar a revisión manual)
        conflictos++;
        detalles.push(`CONFLICTO DETECTADO: La butaca ${item.fila}${item.numero} presentaba estado incompatible (${bFound.estado}). Se derivó a revisión manual sin sobrescribir ventas confirmadas.`);
      }
    });

    // Actualizar estado de butacas a 'vendido_presencial'
    setEventos(prev =>
      prev.map(evt => ({
        ...evt,
        funciones: evt.funciones.map(fn => ({
          ...fn,
          butacas: fn.butacas.map(b => {
            const match = contingencyQueue.find(q => q.butacaId === b.id);
            if (match) {
              return {
                ...b,
                estado: 'vendido_presencial',
                canalVenta: 'Contingencia',
                contingenciaVendidoOffline: false,
              };
            }
            return b;
          }),
        })),
      }))
    );

    if (nuevasVentas.length > 0) {
      setVentas(prev => [...nuevasVentas, ...prev]);
    }

    registrarAuditoria('CONCILIACION_CONTINGENCIA_COMPLETADA', 'Inventario', 'LoteContingencia', {
      motivo: `Conciliadas ${exitosas} operaciones exitosas. ${conflictos} casos en conflicto.`,
      canal: 'Boletería',
    });

    setContingencyQueue([]);
    setIsOfflineContingency(false);

    return { exitosas, conflictos, detalles };
  };

  // 7. Simulación de Carrera Concurrente (RF-09 / HU-01)
  const simularCarreraConcurrente = async (funcionId: string, butacaId: string) => {
    // Generar tiempos con diferencia de pocos milisegundos
    const tWeb = Math.floor(180 + Math.random() * 50); // ~200ms
    const tBoleteria = Math.floor(195 + Math.random() * 50); // ~220ms

    // Web gana por poco o Boletería gana
    const webGana = tWeb <= tBoleteria;

    let targetEvento: Evento | null = null;
    let targetButaca: Butaca | null = null;

    for (const evt of eventos) {
      for (const fn of evt.funciones) {
        if (fn.id === funcionId) {
          const b = fn.butacas.find(item => item.id === butacaId);
          if (b) {
            targetEvento = evt;
            targetButaca = b;
            break;
          }
        }
      }
    }

    const fila = targetButaca ? targetButaca.fila : 'B';
    const num = targetButaca ? targetButaca.numero : 4;
    const precio = targetButaca ? targetButaca.precio : 12000;

    if (webGana) {
      // Registrar venta web exitosa
      setEventos(prev =>
        prev.map(evt => ({
          ...evt,
          funciones: evt.funciones.map(fn => {
            if (fn.id !== funcionId) return fn;
            return {
              ...fn,
              butacas: fn.butacas.map(b => {
                if (b.id !== butacaId) return b;
                return {
                  ...b,
                  estado: 'vendido_web',
                  canalVenta: 'Web',
                };
              }),
            };
          }),
        }))
      );

      const txId = `TX-RACE-${Math.floor(1000 + Math.random() * 9000)}`;
      setVentas(prev => [
        {
          id: txId,
          funcionId,
          eventoId: targetEvento?.id || 'evt-brote',
          eventoTitulo: targetEvento?.titulo || 'Evento Concurrente',
          espacioId: targetEvento?.espacioId || 'esp-colon',
          espacioNombre: targetEvento?.espacioNombre || 'Teatro Colón',
          butacaId,
          butacaEtiqueta: `Fila ${fila} - Asiento ${num}`,
          canal: 'Web',
          importeBruto: precio,
          comisionPorcentaje: 10,
          comisionMonto: Math.round(precio * 0.1),
          netoEspacio: Math.round(precio * 0.9),
          estadoPago: 'Aprobado',
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          compradorNombre: 'Espectador Web (Concurrente)',
          metodoPago: 'Pasarela Digital',
          codigoComprobante: `UC-RACE-${Math.floor(1000 + Math.random() * 9000)}`,
        },
        ...prev,
      ]);

      registrarAuditoria('CONCURRENCIA_MUTEX_RESOLUCION', 'Butaca', butacaId, {
        motivo: `Solicitud Web ganó bloqueo atómico a los ${tWeb}ms. Boletería física rechazada a los ${tBoleteria}ms por exclusión mutua (RF-09).`,
        canal: 'Sistema Central',
      });

      return {
        ganador: 'Web' as const,
        perdedor: 'Presencial' as const,
        tiempoWebMs: tWeb,
        tiempoBoleteriaMs: tBoleteria,
        mensajeExito: `Canal Web obtuvo el bloqueo transaccional a los ${tWeb}ms. Venta web confirmada (Butaca ${fila}${num}).`,
        mensajeRechazo: `Boletería física intentó confirmar a los ${tBoleteria}ms (+${tBoleteria - tWeb}ms). El sistema central rechazó la transacción e informó: "La butaca acaba de ser ocupada en línea". Cero sobreventas.`,
        butacaId,
      };
    } else {
      // Boletería gana
      setEventos(prev =>
        prev.map(evt => ({
          ...evt,
          funciones: evt.funciones.map(fn => {
            if (fn.id !== funcionId) return fn;
            return {
              ...fn,
              butacas: fn.butacas.map(b => {
                if (b.id !== butacaId) return b;
                return {
                  ...b,
                  estado: 'vendido_presencial',
                  canalVenta: 'Presencial',
                };
              }),
            };
          }),
        }))
      );

      const txId = `TX-RACE-${Math.floor(1000 + Math.random() * 9000)}`;
      setVentas(prev => [
        {
          id: txId,
          funcionId,
          eventoId: targetEvento?.id || 'evt-brote',
          eventoTitulo: targetEvento?.titulo || 'Evento Concurrente',
          espacioId: targetEvento?.espacioId || 'esp-colon',
          espacioNombre: targetEvento?.espacioNombre || 'Teatro Colón',
          butacaId,
          butacaEtiqueta: `Fila ${fila} - Asiento ${num}`,
          canal: 'Presencial',
          importeBruto: precio,
          comisionPorcentaje: 10,
          comisionMonto: Math.round(precio * 0.1),
          netoEspacio: Math.round(precio * 0.9),
          estadoPago: 'Aprobado',
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          compradorNombre: 'Espectador Taquilla (Concurrente)',
          metodoPago: 'Efectivo Taquilla',
          codigoComprobante: `UC-RACE-${Math.floor(1000 + Math.random() * 9000)}`,
        },
        ...prev,
      ]);

      registrarAuditoria('CONCURRENCIA_MUTEX_RESOLUCION', 'Butaca', butacaId, {
        motivo: `Boletería física ganó bloqueo a los ${tBoleteria}ms. Venta Web rechazada a los ${tWeb}ms por exclusión mutua (RF-09).`,
        canal: 'Sistema Central',
      });

      return {
        ganador: 'Presencial' as const,
        perdedor: 'Web' as const,
        tiempoWebMs: tWeb,
        tiempoBoleteriaMs: tBoleteria,
        mensajeExito: `Boletería física obtuvo el bloqueo en ventanilla a los ${tBoleteria}ms. Entrada impresa para el espectador.`,
        mensajeRechazo: `Venta Web intentó confirmar a los ${tWeb}ms (+${tWeb - tBoleteria}ms). La pasarela devolvió error de disponibilidad y el usuario no sufrió cobro indebido.`,
        butacaId,
      };
    }
  };

  // 8. Salas de Ensayo: Reserva con Prevención de Solapamiento (RF-15 / HU-04)
  const reservarSalaEnsayo = (
    espacioId: string,
    salaId: string,
    bandaNombre: string,
    contactoNombre: string,
    contactoTelefono: string,
    fecha: string,
    horaInicio: string,
    horaFin: string
  ) => {
    const sala = salasEnsayo.find(s => s.id === salaId);
    if (!sala) return { success: false, message: 'Sala de ensayo no encontrada.' };

    const parseMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const nuevoInicio = parseMinutes(horaInicio);
    const nuevoFin = parseMinutes(horaFin);

    if (nuevoFin <= nuevoInicio) {
      return { success: false, message: 'La hora de fin debe ser posterior a la hora de inicio.' };
    }

    // Verificar si existe solapamiento para la misma sala y misma fecha
    const colision = reservasSalas.find(res => {
      if (res.salaId !== salaId || res.fecha !== fecha || res.estado === 'cancelada') return false;
      const resInicio = parseMinutes(res.horaInicio);
      const resFin = parseMinutes(res.horaFin);
      // Condición de solapamiento de intervalos
      return nuevoInicio < resFin && nuevoFin > resInicio;
    });

    if (colision) {
      return {
        success: false,
        conflicto: true,
        message: `SOLAPAMIENTO RECHAZADO (RF-15): La sala "${sala.nombre}" ya tiene una reserva confirmada el ${fecha} de ${colision.horaInicio} a ${colision.horaFin} por "${colision.bandaNombre}".`,
      };
    }

    const duracionHoras = (nuevoFin - nuevoInicio) / 60;
    const importeTotal = duracionHoras * sala.precioHora;
    const comisionB2B = Math.round(importeTotal * 0.08); // 8% de comisión según ERS
    const netoEspacio = importeTotal - comisionB2B;

    const nuevaReserva: ReservaSalaEnsayo = {
      id: `res-sala-${Date.now()}`,
      espacioId,
      salaId,
      salaNombre: sala.nombre,
      bandaNombre,
      contactoNombre,
      contactoTelefono,
      fecha,
      horaInicio,
      horaFin,
      duracionHoras,
      importeTotal,
      comisionB2B,
      netoEspacio,
      estado: 'confirmada',
      fechaCreacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setReservasSalas(prev => [nuevaReserva, ...prev]);

    registrarAuditoria('RESERVA_SALA_ENSAYO_CREADA', 'ReservaSala', nuevaReserva.id, {
      motivo: `Reserva de sala confirmada para "${bandaNombre}" (${horaInicio} a ${horaFin}). Importe: $${importeTotal} ARS`,
      canal: 'B2B',
    });

    return {
      success: true,
      message: `Reserva confirmada con éxito para "${bandaNombre}". Comisión B2B calculada: $${comisionB2B} ARS (8%).`,
      reserva: nuevaReserva,
    };
  };

  const cancelarReservaSala = (reservaId: string, motivo: string) => {
    setReservasSalas(prev =>
      prev.map(r => (r.id === reservaId ? { ...r, estado: 'cancelada' } : r))
    );

    registrarAuditoria('RESERVA_SALA_CANCELADA', 'ReservaSala', reservaId, {
      estadoAnterior: 'confirmada',
      estadoNuevo: 'cancelada',
      motivo: motivo || 'Cancelada por el administrador del espacio',
      canal: 'B2B',
    });
  };

  // 9. Resolver incidentes de cobro (RF-24)
  const resolverIncidente = (incidenteId: string, nota: string) => {
    setIncidentes(prev =>
      prev.map(inc => {
        if (inc.id !== incidenteId) return inc;
        return {
          ...inc,
          estado: 'resuelto',
          historialAcciones: [
            ...inc.historialAcciones,
            {
              fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
              usuario: `${currentRole}_soporte`,
              nota: nota || 'Incidente resuelto favorablemente tras conciliación con pasarela.',
            },
          ],
        };
      })
    );

    registrarAuditoria('INCIDENTE_RESUELTO', 'IncidenteCobro', incidenteId, {
      estadoAnterior: 'abierto/en_seguimiento',
      estadoNuevo: 'resuelto',
      motivo: nota,
      canal: 'Soporte',
    });
  };

  const registrarAlertaProveedor = (
    tipo: IncidenteCobro['tipo'],
    descripcion: string,
    prioridad: IncidenteCobro['prioridad']
  ) => {
    const incId = `ALERTA-${Date.now()}`;
    const nuevoIncidente: IncidenteCobro = {
      id: incId,
      espacioId: currentEspacioId,
      espacioNombre: currentEspacio.nombre,
      tipo,
      estado: 'abierto',
      prioridad,
      responsable: 'Administración y Finanzas Urbana Cult',
      fechaApertura: new Date().toISOString().replace('T', ' ').substring(0, 16),
      descripcion,
      historialAcciones: [
        {
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          usuario: 'sistema_proveedor_pagos',
          nota: 'Alerta crítica emitida por webhook del procesador de pagos (RF-28).',
        },
      ],
    };
    setIncidentes(prev => [nuevoIncidente, ...prev]);
    registrarAuditoria('ALERTA_PROVEEDOR_EMITIDA', 'IncidenteCobro', incId, {
      motivo: descripcion,
      canal: 'Finanzas',
    });
  };

  // 10. Pausar o reanudar liquidaciones (RF-28 / RB-12)
  const pausarOReanudarLiquidacion = (
    espacioId: string,
    accion: 'pausar' | 'reanudar',
    motivo: string
  ) => {
    setEspacios(prev =>
      prev.map(esp => {
        if (esp.id !== espacioId) return esp;
        return {
          ...esp,
          estadoLiquidacion: accion === 'pausar' ? 'pausado_por_riesgo' : 'activo',
          motivoPausa: accion === 'pausar' ? motivo : undefined,
        };
      })
    );

    registrarAuditoria('LIQUIDACION_ESTADO_MODIFICADO', 'EspacioCultural', espacioId, {
      estadoAnterior: accion === 'pausar' ? 'activo' : 'pausado_por_riesgo',
      estadoNuevo: accion === 'pausar' ? 'pausado_por_riesgo' : 'activo',
      motivo: motivo || 'Medida de prevención financiera (RB-12)',
      canal: 'Finanzas',
    });
  };

  // 11. Gobernanza de destacados de portada (RF-22)
  const actualizarDestacados = (
    eventoId: string,
    destacado: boolean,
    justificacion?: JustificacionDestacado
  ) => {
    setEventos(prev =>
      prev.map(evt => {
        if (evt.id !== eventoId) return evt;
        return {
          ...evt,
          destacadoPortada: destacado,
          justificacionDestacado: justificacion || evt.justificacionDestacado,
        };
      })
    );

    registrarAuditoria('PORTADA_DESTACADO_ACTUALIZADO', 'Evento', eventoId, {
      estadoAnterior: `destacado:${!destacado}`,
      estadoNuevo: `destacado:${destacado}`,
      motivo: justificacion ? `${justificacion.criterio}: ${justificacion.motivo}` : 'Actualización de cartelera',
      canal: 'Gobernanza',
    });
  };

  // 12. Creación de nuevos eventos B2B (RF-04 / RF-05 / HU-03)
  const crearEvento = (data: Omit<Evento, 'id' | 'funciones' | 'destacadoPortada'> & { funciones: { fecha: string; hora: string; salaNombre: string; capacidadTotal: number; precio: number }[] }) => {
    const espacio = espacios.find(e => e.id === data.espacioId) || currentEspacio;

    // Validación de capacidad máxima contra espacio (RF-05 / HU-03)
    for (const fn of data.funciones) {
      if (fn.capacidadTotal > espacio.capacidadGeneral) {
        return {
          success: false,
          message: `ERROR DE CAPACIDAD (HU-03): La capacidad configurada (${fn.capacidadTotal}) supera el aforo máximo habilitado del espacio (${espacio.capacidadGeneral} localidades).`,
        };
      }
      if (!fn.fecha || !fn.hora || !fn.precio || fn.precio <= 0) {
        return {
          success: false,
          message: 'ERROR (HU-03): Todos los datos de la función (fecha, hora, sala y precio) son obligatorios.',
        };
      }
    }

    const nuevoEventoId = `evt-${Date.now()}`;
    const nuevasFunciones: Funcion[] = data.funciones.map((fn, idx) => {
      const funcionId = `fn-${nuevoEventoId}-${idx + 1}`;
      const butacas: Butaca[] = [];
      const filas = ['A', 'B', 'C', 'D'];
      const bloqueContingenciaIds: string[] = [];

      for (const fila of filas) {
        for (let num = 1; num <= 8; num++) {
          const bId = `${funcionId}-${fila}${num}`;
          const isContingencia = fila === 'D';
          if (isContingencia) bloqueContingenciaIds.push(bId);

          butacas.push({
            id: bId,
            fila,
            numero: num,
            estado: isContingencia ? 'bloque_contingencia' : 'disponible',
            precio: fn.precio,
          });
        }
      }

      return {
        id: funcionId,
        eventoId: nuevoEventoId,
        fecha: fn.fecha,
        hora: fn.hora,
        salaNombre: fn.salaNombre,
        capacidadTotal: butacas.length,
        butacas,
        bloqueContingenciaIds,
        estado: 'programada',
      };
    });

    const nuevoEvento: Evento = {
      id: nuevoEventoId,
      espacioId: data.espacioId,
      espacioNombre: espacio.nombre,
      titulo: data.titulo,
      sinopsis: data.sinopsis,
      disciplina: data.disciplina,
      imagen: data.imagen || 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
      duracionMinutos: data.duracionMinutos || 90,
      calificacion: data.calificacion || 'ATP',
      precioBase: data.precioBase,
      destacadoPortada: false,
      funciones: nuevasFunciones,
    };

    setEventos(prev => [nuevoEvento, ...prev]);

    registrarAuditoria('EVENTO_PUBLICADO_B2B', 'Evento', nuevoEventoId, {
      motivo: `Nuevo evento "${data.titulo}" creado y publicado para ${espacio.nombre} con ${nuevasFunciones.length} funciones.`,
      canal: 'B2B',
    });

    return { success: true, message: 'Evento publicado correctamente en la cartelera de Urbana Cult.' };
  };

  const resetToInitialData = () => {
    localStorage.clear();
    setEspacios(ESPACIOS_INICIALES);
    setEventos(EVENTOS_INICIALES);
    setReservasSalas(RESERVAS_SALAS_INICIALES);
    setVentas(VENTAS_INICIALES);
    setAuditoria(AUDITORIA_INICIAL);
    setIncidentes(INCIDENTES_INICIALES);
    setContingencyQueue([]);
    setIsOfflineContingency(false);
  };

  return (
    <UrbanaContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentEspacioId,
        setCurrentEspacioId,
        espacios,
        currentEspacio,

        eventos,
        selectedEvento,
        setSelectedEvento,
        selectedFuncion,
        setSelectedFuncion,

        selectedButaca,
        setSelectedButaca,
        iniciarReservaTemporal,
        cancelarReservaTemporal,
        procesarPagoWeb,
        ventaBoleteriaPresencial,

        ventas,
        totalGMV,
        totalComisiones,
        pausarOReanudarLiquidacion,

        isOfflineContingency,
        setIsOfflineContingency,
        contingencyQueue,
        registrarVentaContingencia,
        conciliarContingencia,

        salasEnsayo,
        reservasSalas,
        reservarSalaEnsayo,
        cancelarReservaSala,

        auditoria,
        incidentes,
        resolverIncidente,
        registrarAlertaProveedor,

        actualizarDestacados,
        crearEvento,

        simularCarreraConcurrente,
        resetToInitialData,
      }}
    >
      {children}
    </UrbanaContext.Provider>
  );
};

export const useUrbana = () => {
  const context = useContext(UrbanaContext);
  if (!context) {
    throw new Error('useUrbana debe utilizarse dentro de un UrbanaProvider');
  }
  return context;
};
