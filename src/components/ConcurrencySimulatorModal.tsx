import React, { useState } from 'react';
import { useUrbana } from '../context/UrbanaContext';
import {
  Sparkles,
  X,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  WifiOff,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface ConcurrencySimulatorModalProps {
  onClose: () => void;
}

export const ConcurrencySimulatorModal: React.FC<ConcurrencySimulatorModalProps> = ({ onClose }) => {
  const {
    eventos,
    simularCarreraConcurrente,
    isOfflineContingency,
    setIsOfflineContingency,
    contingencyQueue,
    registrarVentaContingencia,
    conciliarContingencia,
    salasEnsayo,
    reservarSalaEnsayo,
  } = useUrbana();

  const [activeTab, setActiveTab] = useState<'concurrencia' | 'contingencia' | 'pasarela' | 'salas'>('concurrencia');

  // Estado del Simulador de Concurrencia
  const eventoObj = eventos[0];
  const funcionObj = eventoObj?.funciones[0];
  // Elegir una butaca disponible
  const butacaPrueba = funcionObj?.butacas.find((b) => b.estado === 'disponible') || funcionObj?.butacas[0];

  const [simulandoCarrera, setSimulandoCarrera] = useState(false);
  const [resultadoCarrera, setResultadoCarrera] = useState<{
    ganador: 'Web' | 'Presencial';
    perdedor: 'Web' | 'Presencial';
    tiempoWebMs: number;
    tiempoBoleteriaMs: number;
    mensajeExito: string;
    mensajeRechazo: string;
    butacaId: string;
  } | null>(null);

  // Estado del Simulador de Contingencia Guiado
  const [pasoContingencia, setPasoContingencia] = useState<number>(1);
  const [contingenciaInfo, setContingenciaInfo] = useState<string | null>(null);

  // Estado del Simulador de Solapamiento de Salas
  const [salaTestId, setSalaTestId] = useState(salasEnsayo[0]?.id || '');
  const [resultadoTestSala, setResultadoTestSala] = useState<{ exito: boolean; mensaje: string } | null>(null);

  const ejecutarTestCarrera = async () => {
    if (!funcionObj || !butacaPrueba) return;
    setSimulandoCarrera(true);
    setResultadoCarrera(null);

    // Esperar 400ms para simular el tráfico en red
    await new Promise((r) => setTimeout(r, 400));
    const res = await simularCarreraConcurrente(funcionObj.id, butacaPrueba.id);
    setResultadoCarrera(res);
    setSimulandoCarrera(false);
  };

  const ejecutarTestSolapamientoSala = () => {
    // Intentar registrar una colisión deliberada contra una reserva existente
    const res = reservarSalaEnsayo(
      'esp-colon',
      'sala-colon-1',
      'Banda Competidora (Intento Simultáneo)',
      'Carlos Test',
      '+54 223 999-0000',
      '2026-10-28',
      '18:00', // Colisiona con la reserva de 17:00 a 19:00
      '20:00'
    );

    setResultadoTestSala({
      exito: res.success,
      mensaje: res.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#121620] border border-[#2e394d] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative my-auto">
        {/* Cabecera del Laboratorio */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-[#171e2c] via-[#1b2333] to-[#141a27] border-b border-[#293549] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Laboratorio de Pruebas e Ingeniería de Software</span>
              </h2>
              <p className="text-xs text-slate-400">
                Demostración interactiva de los 4 requerimientos críticos del documento Urbana Cult (Grupo 15)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Escenarios */}
        <div className="px-6 pt-4 bg-[#0e1219] border-b border-[#212b3c] flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('concurrencia')}
            className={`px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'concurrencia'
                ? 'border-amber-400 text-amber-300 bg-[#141a26]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            1. Carrera Concurrente (RF-09 / HU-01)
          </button>
          <button
            onClick={() => setActiveTab('contingencia')}
            className={`px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'contingencia'
                ? 'border-amber-400 text-amber-300 bg-[#141a26]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            2. Modo Contingencia & Conciliación (RB-10 / RF-26)
          </button>
          <button
            onClick={() => setActiveTab('pasarela')}
            className={`px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'pasarela'
                ? 'border-amber-400 text-amber-300 bg-[#141a26]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            3. Pasarela & Timeout Incierto (RB-02)
          </button>
          <button
            onClick={() => setActiveTab('salas')}
            className={`px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'salas'
                ? 'border-amber-400 text-amber-300 bg-[#141a26]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            4. Anti-Solapamiento Salas (RF-15 / HU-04)
          </button>
        </div>

        {/* Contenido de Escenarios */}
        <div className="p-6 space-y-6">
          {/* ESCENARIO 1: CARRERA CONCURRENTE WEB VS BOLETERÍA */}
          {activeTab === 'concurrencia' && (
            <div className="space-y-4">
              <div className="bg-[#17202e] p-4 rounded-xl border border-[#2d3a50] text-xs space-y-2">
                <span className="font-bold text-amber-300 text-sm block">
                  Requerimiento RF-09 / RNF-03: Cero casos de sobreventa concurrente
                </span>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Hipótesis de prueba:</strong> Un espectador en el portal web y el boletero en la taquilla física intentan confirmar simultáneamente la adquisición de la <strong>misma butaca</strong> (ej: Fila {butacaPrueba?.fila} - Asiento {butacaPrueba?.numero}). El sistema debe asegurar exclusión mutua transaccional: una solicitud adquiere el bloqueo atómico y la otra es rechazada inmediatamente con mensaje informativo, garantizando que nunca se confirmen dos ventas para la misma ubicación física.
                </p>
              </div>

              {/* Botón de Lanzamiento de Simulación */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0e1219] p-4 rounded-xl border border-[#242e40]">
                <div>
                  <span className="text-xs text-slate-400 block">Butaca objetivo seleccionada:</span>
                  <span className="text-sm font-bold font-mono text-white">
                    Fila {butacaPrueba?.fila} - Asiento {butacaPrueba?.numero} ({eventoObj?.titulo})
                  </span>
                </div>

                <button
                  disabled={simulandoCarrera}
                  onClick={ejecutarTestCarrera}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {simulandoCarrera ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin" />
                      <span>Simulando carrera transaccional...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Ejecutar Carrera Web vs Boletería</span>
                    </>
                  )}
                </button>
              </div>

              {/* Resultado Visual de la Carrera */}
              {resultadoCarrera && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Canal Ganador */}
                    <div className="bg-[#12241d] border border-emerald-500/60 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase font-mono">
                          GANADOR: CANAL {resultadoCarrera.ganador.toUpperCase()}
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-xs text-emerald-200">
                        {resultadoCarrera.mensajeExito}
                      </p>
                      <div className="text-[11px] font-mono text-emerald-300/80 pt-1 border-t border-emerald-500/20">
                        Tiempo de respuesta: {resultadoCarrera.ganador === 'Web' ? resultadoCarrera.tiempoWebMs : resultadoCarrera.tiempoBoleteriaMs} ms · Lock Adquirido
                      </div>
                    </div>

                    {/* Canal Perdedor */}
                    <div className="bg-[#241416] border border-red-500/60 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-400 uppercase font-mono">
                          RECHAZADO: CANAL {resultadoCarrera.perdedor.toUpperCase()}
                        </span>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      </div>
                      <p className="text-xs text-red-200">
                        {resultadoCarrera.mensajeRechazo}
                      </p>
                      <div className="text-[11px] font-mono text-red-300/80 pt-1 border-t border-red-500/20">
                        Divergencia entre canales: 0 sobreventas · Auditoría registrada (RF-21)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ESCENARIO 2: MODO CONTINGENCIA Y CONCILIACIÓN */}
          {activeTab === 'contingencia' && (
            <div className="space-y-4">
              <div className="bg-[#17202e] p-4 rounded-xl border border-[#2d3a50] text-xs space-y-2">
                <span className="font-bold text-amber-300 text-sm block">
                  Regla RB-10 y Requerimiento RF-26: Continuidad Operativa ante Caída de Red
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Ante un corte de conectividad en una sala de teatro de Mar del Plata, la boletería física no puede quedar paralizada, pero tampoco puede vender butacas que la web podría seguir ofreciendo. La solución diseñada:
                  <br />
                  1. El inventario digital <strong>excluye previamente un Bloque de Contingencia</strong> (Fila D).
                  <br />
                  2. Durante el corte, la taquilla solo emite tiques de ese bloque.
                  <br />
                  3. Al volver la red, el motor de conciliación valida y sincroniza las operaciones con auditoría.
                </p>
              </div>

              {/* Pasos interactivos guiados */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    isOfflineContingency
                      ? 'bg-[#18202d] border-red-500/60 text-red-200'
                      : 'bg-[#10141d] border-[#252f42] text-slate-400'
                  }`}
                >
                  <span className="font-bold block font-mono text-xs">PASO 1: CORTE DE RED</span>
                  <p className="text-[11px]">
                    Simula la pérdida de internet. Bloquea filas A-C y habilita la Fila D.
                  </p>
                  <button
                    onClick={() => setIsOfflineContingency(!isOfflineContingency)}
                    className="w-full py-1.5 px-2 rounded bg-[#20293b] text-white hover:bg-[#2c3850] font-semibold text-xs transition-colors"
                  >
                    {isOfflineContingency ? 'Restablecer Conexión' : 'Cortar Conexión (Offline)'}
                  </button>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    contingencyQueue.length > 0
                      ? 'bg-[#18202d] border-amber-500/60 text-amber-200'
                      : 'bg-[#10141d] border-[#252f42] text-slate-400'
                  }`}
                >
                  <span className="font-bold block font-mono text-xs">PASO 2: VENTA MANUAL</span>
                  <p className="text-[11px]">
                    Emite tique físico de papel (#TALON-PAPEL) sobre la Fila D.
                  </p>
                  <button
                    disabled={!isOfflineContingency}
                    onClick={() => {
                      if (!funcionObj) return;
                      const butacaD = funcionObj.butacas.find(
                        (b) => b.fila === 'D' && !contingencyQueue.some((q) => q.butacaId === b.id)
                      );
                      if (butacaD) {
                        registrarVentaContingencia(funcionObj.id, butacaD.id, 'Espectador Offline Demo');
                      }
                    }}
                    className="w-full py-1.5 px-2 rounded bg-[#20293b] text-white hover:bg-[#2c3850] font-semibold text-xs disabled:opacity-40 transition-colors"
                  >
                    Emitir Tique Físico D
                  </button>
                </div>

                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    !isOfflineContingency && contingencyQueue.length > 0
                      ? 'bg-[#18202d] border-emerald-500/60 text-emerald-200'
                      : 'bg-[#10141d] border-[#252f42] text-slate-400'
                  }`}
                >
                  <span className="font-bold block font-mono text-xs">PASO 3: CONCILIACIÓN</span>
                  <p className="text-[11px]">
                    Reconecta y ejecuta el algoritmo de conciliación sin pisar ventas.
                  </p>
                  <button
                    disabled={isOfflineContingency || contingencyQueue.length === 0}
                    onClick={() => {
                      const res = conciliarContingencia();
                      setContingenciaInfo(
                        `Conciliadas ${res.exitosas} ventas de contingencia. Cero conflictos detectados.`
                      );
                    }}
                    className="w-full py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs disabled:opacity-40 transition-colors"
                  >
                    Conciliar Cola ({contingencyQueue.length})
                  </button>
                </div>
              </div>

              {contingenciaInfo && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{contingenciaInfo}</span>
                </div>
              )}
            </div>
          )}

          {/* ESCENARIO 3: PASARELA & TIMEOUT INCIERTO (RB-02) */}
          {activeTab === 'pasarela' && (
            <div className="space-y-4">
              <div className="bg-[#17202e] p-4 rounded-xl border border-[#2d3a50] text-xs space-y-2">
                <span className="font-bold text-amber-300 text-sm block">
                  Regla de Negocio RB-02 / Escenario 3: Tratamiento de Pagos Inciertos
                </span>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Principio TGS:</strong> En sistemas abiertos con pasarelas de pago bancarias, cuando expira el tiempo de espera (10 min) sin confirmación definitiva, <strong>el software NO debe liberar automáticamente la localidad</strong> porque el dinero podría haber sido debitado de la cuenta del comprador. En su lugar, el sistema cambia el estado a <em>«Pendiente de conciliación»</em> y abre un ticket en la mesa de soporte para verificar con el procesador antes de liberar el aforo.
                </p>
              </div>

              <div className="p-4 bg-[#0e1219] rounded-xl border border-[#232b3b] space-y-3 text-xs">
                <h4 className="font-bold text-white">Flujo de Protección de Aforo:</h4>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-300 font-mono text-[11px]">
                  <div className="p-2.5 rounded bg-[#18202d] border border-[#2b374a] text-center w-full">
                    1. Reserva Temporal (10 min)
                  </div>
                  <span>→</span>
                  <div className="p-2.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 text-center w-full">
                    2. Timeout / Pago Incierto
                  </div>
                  <span>→</span>
                  <div className="p-2.5 rounded bg-red-950/80 text-red-200 border border-red-500/40 text-center w-full">
                    3. Localidad Bloqueada (No Liberar)
                  </div>
                  <span>→</span>
                  <div className="p-2.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-center w-full">
                    4. Auditoría & Ticket Soporte
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ESCENARIO 4: ANTI-SOLAPAMIENTO DE SALAS DE ENSAYO */}
          {activeTab === 'salas' && (
            <div className="space-y-4">
              <div className="bg-[#17202e] p-4 rounded-xl border border-[#2d3a50] text-xs space-y-2">
                <span className="font-bold text-amber-300 text-sm block">
                  Requerimiento RF-15 / HU-04: Prevención de Reservas Superpuestas
                </span>
                <p className="text-slate-300 leading-relaxed">
                  En los centros culturales de Mar del Plata, bandas y elencos reservan salas acústicas y cajas negras. La regla RF-15 impide que dos grupos reciban confirmación para la misma sala en intervalos horarios solapados.
                </p>
              </div>

              <div className="bg-[#0e1219] p-4 rounded-xl border border-[#232b3b] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="text-slate-400 block">Reserva existente de prueba:</span>
                  <span className="font-bold font-mono text-amber-300">
                    Sala Orquestal Colón · 28/10/2026 de 17:00 a 19:00 hs (Confirmada)
                  </span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">
                    Se intentará reservar de 18:00 a 20:00 hs para provocar conflicto horario.
                  </span>
                </div>

                <button
                  onClick={ejecutarTestSolapamientoSala}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-colors shadow"
                >
                  Probar Reserva Superpuesta
                </button>
              </div>

              {resultadoTestSala && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed animate-fade-in ${
                    resultadoTestSala.exito
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                      : 'bg-red-950 border-red-500 text-red-200'
                  }`}
                >
                  <div className="font-bold mb-1 flex items-center gap-2">
                    {resultadoTestSala.exito ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    <span>Resultado de la Validación:</span>
                  </div>
                  {resultadoTestSala.mensaje}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
