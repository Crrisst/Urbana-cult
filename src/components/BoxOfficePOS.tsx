import React, { useState } from 'react';
import { useUrbana } from '../context/UrbanaContext';
import { Funcion, Butaca, TransaccionVenta } from '../types';
import { SeatMap } from './SeatMap';
import { DigitalTicketModal } from './DigitalTicketModal';
import {
  Radio,
  Wifi,
  WifiOff,
  Ticket,
  Printer,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  User,
  CreditCard,
  Banknote,
  ShieldAlert,
} from 'lucide-react';

export const BoxOfficePOS: React.FC = () => {
  const {
    currentEspacio,
    currentEspacioId,
    setCurrentEspacioId,
    espacios,
    eventos,
    ventaBoleteriaPresencial,
    isOfflineContingency,
    setIsOfflineContingency,
    contingencyQueue,
    registrarVentaContingencia,
    conciliarContingencia,
  } = useUrbana();

  // Filtrar eventos por el espacio actual del boletero (Aislamiento Multi-Tenant RF-03)
  const eventosDelEspacio = eventos.filter((e) => e.espacioId === currentEspacioId);
  const [selectedEventoId, setSelectedEventoId] = useState<string>(
    eventosDelEspacio[0]?.id || eventos[0]?.id
  );

  const eventoActual = eventos.find((e) => e.id === selectedEventoId) || eventosDelEspacio[0];
  const [selectedFuncionId, setSelectedFuncionId] = useState<string>(
    eventoActual?.funciones[0]?.id || ''
  );

  const funcionActual = eventoActual?.funciones.find((f) => f.id === selectedFuncionId) || eventoActual?.funciones[0];

  // Estado de la venta en ventanilla
  const [butacaSeleccionada, setButacaSeleccionada] = useState<Butaca | null>(null);
  const [nombreComprador, setNombreComprador] = useState<string>('Espectador en Ventanilla');
  const [metodoPago, setMetodoPago] = useState<string>('Efectivo Taquilla');
  const [mensajeOperacion, setMensajeOperacion] = useState<{ tipo: 'exito' | 'error' | 'alerta'; texto: string } | null>(null);
  const [transaccionImpresa, setTransaccionImpresa] = useState<TransaccionVenta | null>(null);
  const [resultadoConciliacion, setResultadoConciliacion] = useState<{ exitosas: number; conflictos: number; detalles: string[] } | null>(null);

  const handleSelectButaca = (butaca: Butaca) => {
    setButacaSeleccionada(butaca);
    setMensajeOperacion(null);
  };

  const handleVentaVentanilla = () => {
    if (!funcionActual || !butacaSeleccionada) return;

    if (isOfflineContingency) {
      // Modo Contingencia (RB-10 / HU-10)
      const res = registrarVentaContingencia(funcionActual.id, butacaSeleccionada.id, nombreComprador);
      if (res.success) {
        setMensajeOperacion({
          tipo: 'alerta',
          texto: res.message,
        });
        setButacaSeleccionada(null);
      } else {
        setMensajeOperacion({
          tipo: 'error',
          texto: res.message,
        });
      }
    } else {
      // Venta Presencial Normal en Línea
      const res = ventaBoleteriaPresencial(
        funcionActual.id,
        butacaSeleccionada.id,
        nombreComprador,
        metodoPago
      );

      if (res.success && res.transaccion) {
        setTransaccionImpresa(res.transaccion);
        setMensajeOperacion({
          tipo: 'exito',
          texto: res.message,
        });
        setButacaSeleccionada(null);
      } else {
        setMensajeOperacion({
          tipo: 'error',
          texto: res.message,
        });
      }
    }
  };

  const handleConciliarOffline = () => {
    const res = conciliarContingencia();
    setResultadoConciliacion(res);
    setMensajeOperacion({
      tipo: 'exito',
      texto: `Conciliación finalizada: ${res.exitosas} operaciones integradas al registro central sin conflictos de sobreventa.`,
    });
  };

  // Contadores de la función actual
  const totalButacas = funcionActual ? funcionActual.butacas.length : 0;
  const libres = funcionActual ? funcionActual.butacas.filter((b) => b.estado === 'disponible').length : 0;
  const vendidasWeb = funcionActual ? funcionActual.butacas.filter((b) => b.estado === 'vendido_web').length : 0;
  const vendidasPresencial = funcionActual ? funcionActual.butacas.filter((b) => b.estado === 'vendido_presencial').length : 0;
  const bloqueContingencia = funcionActual ? funcionActual.butacas.filter((b) => b.fila === 'D').length : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Barra de Control de Taquilla & Estado de Conexión */}
      <div className="bg-[#121620] border border-[#262f40] rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Radio className="w-3.5 h-3.5" />
            <span>Punto de Venta Presencial (POS) · Terminal Boletería</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Boletería Física: {currentEspacio.nombre}
          </h1>
          <p className="text-xs text-slate-400">
            {currentEspacio.direccion} · {currentEspacio.barrio}, Mar del Plata
          </p>
        </div>

        {/* Interruptor de Modo Contingencia / Caída de Conexión (RB-10 / HU-10) */}
        <div className="flex items-center gap-3 bg-[#18202e] p-2 rounded-xl border border-[#2d384d]">
          <div className="text-right">
            <span className="block text-[11px] text-slate-400">Estado de Red</span>
            <span
              className={`text-xs font-bold font-mono ${
                isOfflineContingency ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {isOfflineContingency ? 'SIN CONEXIÓN (RB-10)' : 'EN LÍNEA (SYNC < 3s)'}
            </span>
          </div>

          <button
            onClick={() => {
              const nuevoEstado = !isOfflineContingency;
              setIsOfflineContingency(nuevoEstado);
              setMensajeOperacion({
                tipo: nuevoEstado ? 'alerta' : 'exito',
                texto: nuevoEstado
                  ? 'MODO CONTINGENCIA ACTIVADO (RB-10): Caída de red simulada. Se bloquea la sala general y se habilita únicamente la emisión física del Bloque de Contingencia (Fila D).'
                  : 'Conexión a internet restablecida. Podés ejecutar la conciliación de tiques emitidos.',
              });
            }}
            className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs font-bold transition-all shadow ${
              isOfflineContingency
                ? 'bg-red-950/80 text-red-200 border-red-500 hover:bg-red-900'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60'
            }`}
            title="Simular caída o restablecimiento de conexión a internet (RB-10)"
          >
            {isOfflineContingency ? (
              <>
                <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />
                <span>Simulando Caída</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Simular Corte Red</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerta de Modo Contingencia Activo */}
      {isOfflineContingency && (
        <div className="p-4 bg-red-950/70 border border-red-500/80 rounded-xl text-xs text-red-200 space-y-2 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2 font-bold text-sm text-red-300">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span>PROTOCOLO DE CONTINUIDAD OPERATIVA EN CURSO (RB-10 / HU-10)</span>
          </div>
          <p className="leading-relaxed">
            Se ha interrumpido la conexión con la base central. Para evitar la doble asignación de localidades con la web, el sistema ha bloqueado las filas ordinarias (A, B, C). La taquilla solo puede emitir tiques manuales sobre las localidades del <strong>Bloque Físico de Contingencia (Fila D)</strong> previamente excluidas de la venta digital.
          </p>
          <div className="text-[11px] font-mono text-amber-300 pt-1">
            Tiques físicos emitidos en espera de reconexión: {contingencyQueue.length}
          </div>
        </div>
      )}

      {/* Selectores de Espectáculo y Función */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#121620] p-4 rounded-xl border border-[#242c3d]">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            1. Seleccionar Espectáculo:
          </label>
          <select
            value={selectedEventoId}
            onChange={(e) => {
              setSelectedEventoId(e.target.value);
              const ev = eventos.find((x) => x.id === e.target.value);
              if (ev && ev.funciones[0]) {
                setSelectedFuncionId(ev.funciones[0].id);
              }
              setButacaSeleccionada(null);
            }}
            className="w-full bg-[#18202d] border border-[#2f394d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {eventosDelEspacio.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.titulo} ({evt.disciplina.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            2. Función / Horario:
          </label>
          <select
            value={selectedFuncionId}
            onChange={(e) => {
              setSelectedFuncionId(e.target.value);
              setButacaSeleccionada(null);
            }}
            className="w-full bg-[#18202d] border border-[#2f394d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            {eventoActual?.funciones.map((fn) => (
              <option key={fn.id} value={fn.id}>
                {fn.fecha} a las {fn.hora} hs ({fn.salaNombre})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs de Ocupación en Tiempo Real */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#121620] p-3 rounded-xl border border-[#242c3d]">
          <span className="text-[11px] text-slate-400 block">Aforo Total</span>
          <span className="text-xl font-bold font-mono text-white tabular-nums">{totalButacas}</span>
        </div>
        <div className="bg-[#121620] p-3 rounded-xl border border-[#242c3d]">
          <span className="text-[11px] text-slate-400 block">Disponibles</span>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">{libres}</span>
        </div>
        <div className="bg-[#121620] p-3 rounded-xl border border-[#242c3d]">
          <span className="text-[11px] text-slate-400 block">Vendidas Web</span>
          <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">{vendidasWeb}</span>
        </div>
        <div className="bg-[#121620] p-3 rounded-xl border border-[#242c3d]">
          <span className="text-[11px] text-slate-400 block">Vendidas Ventanilla</span>
          <span className="text-xl font-bold font-mono text-violet-400 tabular-nums">{vendidasPresencial}</span>
        </div>
        <div className="bg-[#121620] p-3 rounded-xl border border-[#242c3d]">
          <span className="text-[11px] text-slate-400 block">Cupo Contingencia</span>
          <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">{bloqueContingencia}</span>
        </div>
      </div>

      {/* Layout de Despacho: Mapa + Panel de Venta Rápida */}
      {funcionActual ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Mapa de Butacas */}
          <div className="lg:col-span-8 space-y-4">
            <SeatMap
              funcion={funcionActual}
              selectedButacaId={butacaSeleccionada?.id}
              onSelectButaca={handleSelectButaca}
              isBoleteriaView={true}
            />
          </div>

          {/* Panel de Despacho en Ventanilla */}
          <div className="lg:col-span-4 bg-[#121620] p-5 rounded-xl border border-[#262f40] flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>Despacho Rápido en Taquilla</span>
              </h3>

              {butacaSeleccionada ? (
                <div className="bg-[#171f2c] p-4 rounded-xl border border-amber-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Ubicación:</span>
                    <span className="text-sm font-bold font-mono text-amber-300">
                      Fila {butacaSeleccionada.fila} - Butaca {butacaSeleccionada.numero}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Tipo de Localidad:</span>
                    <span className="text-xs font-mono text-slate-200">
                      {butacaSeleccionada.fila === 'D' ? 'Bloque de Contingencia (RB-10)' : 'Butaca Regular'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#29364a]">
                    <span className="text-xs text-slate-300">Cobro en Ventanilla:</span>
                    <span className="text-base font-bold font-mono text-white tabular-nums">
                      ${butacaSeleccionada.precio.toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-[#293448] rounded-xl text-xs text-slate-400">
                  {isOfflineContingency
                    ? 'Seleccioná una butaca de la Fila D (Bloque de Contingencia) para emitir tique físico manual.'
                    : 'Hacé clic en cualquier butaca libre para despachar una entrada en ventanilla.'}
                </div>
              )}

              {/* Mensajes de resultado */}
              {mensajeOperacion && (
                <div
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    mensajeOperacion.tipo === 'exito'
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-500/50'
                      : mensajeOperacion.tipo === 'alerta'
                      ? 'bg-amber-950/80 text-amber-200 border border-amber-500/50'
                      : 'bg-red-950/80 text-red-200 border border-red-500/50'
                  }`}
                >
                  {mensajeOperacion.texto}
                </div>
              )}

              {/* Formulario rápido de taquilla */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">
                    Identificación / Nombre del Espectador
                  </label>
                  <input
                    type="text"
                    value={nombreComprador}
                    onChange={(e) => setNombreComprador(e.target.value)}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {!isOfflineContingency && (
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">
                      Método de Cobro en Taquilla
                    </label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="w-full bg-[#18202d] border border-[#2c384d] rounded px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="Efectivo Taquilla">Efectivo en Ventanilla</option>
                      <option value="Tarjeta Débito POS">Tarjeta Débito (POS Físico)</option>
                      <option value="Tarjeta Crédito POS">Tarjeta Crédito (POS Físico)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de Venta / Emisión */}
            <div className="space-y-2 pt-2 border-t border-[#202738]">
              <button
                disabled={!butacaSeleccionada}
                onClick={handleVentaVentanilla}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow ${
                  isOfflineContingency
                    ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 disabled:opacity-40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40'
                }`}
              >
                <Printer className="w-4 h-4" />
                <span>
                  {isOfflineContingency
                    ? 'Emitir Tique Manual Contingencia (RB-10)'
                    : 'Confirmar Cobro e Imprimir Entrada (POS)'}
                </span>
              </button>

              {/* Botón de Conciliación si hay tiques en cola y estamos online */}
              {!isOfflineContingency && contingencyQueue.length > 0 && (
                <button
                  onClick={handleConciliarOffline}
                  className="w-full py-2.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    Conciliar {contingencyQueue.length} Tiques de Contingencia (RF-26)
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Cola de Tiques Físicos Emitidos en Modo Contingencia */}
      {contingencyQueue.length > 0 && (
        <div className="bg-[#121620] border border-amber-500/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">
                Cola de Tiques Físicos de Contingencia Emitidos ({contingencyQueue.length})
              </h4>
            </div>
            {!isOfflineContingency && (
              <button
                onClick={handleConciliarOffline}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Sincronizar y Conciliar Ahora (RF-26)
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#252f42] text-slate-400 font-mono">
                  <th className="py-2 px-3">Tique Manual</th>
                  <th className="py-2 px-3">Butaca</th>
                  <th className="py-2 px-3">Precio</th>
                  <th className="py-2 px-3">Comprador</th>
                  <th className="py-2 px-3">Fecha y Hora</th>
                  <th className="py-2 px-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2636] font-mono text-slate-200">
                {contingencyQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-[#18202e]">
                    <td className="py-2 px-3 text-amber-400 font-bold">{item.comprobanteFisico}</td>
                    <td className="py-2 px-3">Fila {item.fila} - Asiento {item.numero}</td>
                    <td className="py-2 px-3 tabular-nums">${item.precio.toLocaleString('es-AR')} ARS</td>
                    <td className="py-2 px-3">{item.compradorNombre}</td>
                    <td className="py-2 px-3 text-slate-400">{item.fechaVenta}</td>
                    <td className="py-2 px-3 text-amber-400">Pendiente Conciliación</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resultados del Motor de Conciliación (RF-26) */}
      {resultadoConciliacion && (
        <div className="bg-[#121620] border border-emerald-500/50 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Informe de Conciliación Ejecutado (RF-26)</span>
            </h4>
            <button
              onClick={() => setResultadoConciliacion(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cerrar informe
            </button>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <p>
              Operaciones conciliadas con éxito: <strong>{resultadoConciliacion.exitosas}</strong> · Conflictos derivados a revisión manual: <strong>{resultadoConciliacion.conflictos}</strong>
            </p>
            <ul className="list-disc pl-5 text-[11px] text-slate-400 space-y-0.5">
              {resultadoConciliacion.detalles.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Modal de Tique Impreso de Ventanilla */}
      {transaccionImpresa && (
        <DigitalTicketModal
          transaccion={transaccionImpresa}
          onClose={() => setTransaccionImpresa(null)}
        />
      )}
    </div>
  );
};
