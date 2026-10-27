import React from 'react';
import { Butaca, Funcion } from '../types';
import { useUrbana } from '../context/UrbanaContext';
import { ShieldAlert, Clock, CheckCircle2, Ticket } from 'lucide-react';

interface SeatMapProps {
  funcion: Funcion;
  selectedButacaId?: string;
  onSelectButaca: (butaca: Butaca) => void;
  isBoleteriaView?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  funcion,
  selectedButacaId,
  onSelectButaca,
  isBoleteriaView = false,
}) => {
  const { isOfflineContingency, contingencyQueue } = useUrbana();

  // Organizar butacas por filas
  const filas = ['A', 'B', 'C', 'D'];

  const getButacaColor = (b: Butaca) => {
    // Si está en la cola de contingencia local
    const enColaContingencia = contingencyQueue.some(q => q.butacaId === b.id) || b.contingenciaVendidoOffline;
    if (enColaContingencia) {
      return 'bg-amber-600/40 text-amber-200 border-amber-500 font-bold';
    }

    if (b.id === selectedButacaId) {
      return 'bg-amber-400 text-slate-950 border-amber-300 font-bold scale-105 shadow-md shadow-amber-400/20';
    }

    switch (b.estado) {
      case 'disponible':
        return 'bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-300 border-emerald-500/50 hover:scale-105 transition-transform cursor-pointer';
      case 'reservado_temporal':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/60 animate-pulse cursor-not-allowed';
      case 'vendido_web':
        return 'bg-sky-950/60 text-sky-400 border-sky-600/40 opacity-80 cursor-not-allowed';
      case 'vendido_presencial':
        return 'bg-violet-950/60 text-violet-300 border-violet-600/40 opacity-80 cursor-not-allowed';
      case 'bloque_contingencia':
        if (isOfflineContingency && isBoleteriaView) {
          // En modo offline, el bloque de contingencia está habilitado para vender
          return 'bg-amber-950/80 hover:bg-amber-800 text-amber-200 border-amber-500 border-dashed hover:scale-105 transition-transform cursor-pointer ring-1 ring-amber-400/50';
        }
        return 'bg-[#1e1b18] text-amber-500/70 border-amber-600/30 border-dashed cursor-not-allowed';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getButacaBadge = (b: Butaca) => {
    const enColaContingencia = contingencyQueue.some(q => q.butacaId === b.id) || b.contingenciaVendidoOffline;
    if (enColaContingencia) return 'Tique Físico';
    if (b.estado === 'reservado_temporal') return '10m';
    if (b.estado === 'vendido_web') return 'Web';
    if (b.estado === 'vendido_presencial') return 'POS';
    if (b.estado === 'bloque_contingencia') return 'CTG';
    return `$${(b.precio / 1000).toFixed(0)}k`;
  };

  return (
    <div className="w-full bg-[#12161f] border border-[#262c38] rounded-xl p-5 md:p-6 shadow-inner">
      {/* Escenario */}
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="h-2 w-full bg-gradient-to-r from-amber-600/20 via-amber-400 to-amber-600/20 rounded-full" />
        <div className="text-center mt-2">
          <span className="text-[11px] font-mono tracking-widest uppercase text-amber-300/80 bg-[#161c28] px-3 py-1 rounded border border-[#2a3447]">
            ESCENARIO PRINCIPAL / PISTA
          </span>
        </div>
      </div>

      {/* Grid de Butacas */}
      <div className="space-y-3.5 max-w-xl mx-auto">
        {filas.map((fila) => {
          const butacasDeFila = funcion.butacas.filter(b => b.fila === fila);
          const isFilaContingencia = fila === 'D';

          return (
            <div key={fila} className="flex items-center gap-2 md:gap-3">
              {/* Etiqueta de fila */}
              <div className="w-6 text-xs font-mono font-bold text-slate-400 flex items-center justify-center">
                {fila}
              </div>

              {/* Contenedor de asientos */}
              <div className="flex-1 grid grid-cols-8 gap-1.5 md:gap-2">
                {butacasDeFila.map((butaca) => {
                  const isClickable =
                    (butaca.estado === 'disponible' && (!isOfflineContingency || !isBoleteriaView)) ||
                    (isOfflineContingency && isBoleteriaView && butaca.fila === 'D' && !contingencyQueue.some(q => q.butacaId === butaca.id));

                  return (
                    <button
                      key={butaca.id}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => onSelectButaca(butaca)}
                      className={`h-11 md:h-12 rounded-lg border text-xs font-mono flex flex-col items-center justify-center relative transition-all ${getButacaColor(
                        butaca
                      )}`}
                      title={`${fila}${butaca.numero}: ${butaca.estado} - $${butaca.precio.toLocaleString('es-AR')}`}
                    >
                      <span className="font-semibold text-xs leading-none">
                        {fila}{butaca.numero}
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5 leading-none">
                        {getButacaBadge(butaca)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Indicador de contingencia en fila D */}
              {isFilaContingencia && (
                <div className="hidden sm:flex items-center text-[10px] text-amber-400/80 font-mono whitespace-nowrap pl-2">
                  <ShieldAlert className="w-3 h-3 mr-1 text-amber-400" />
                  Bloque Contingencia (RB-10)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-8 pt-5 border-t border-[#212836] flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-500/60" />
          <span>Disponible ({funcion.butacas.filter(b => b.estado === 'disponible').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-amber-950 border border-amber-500 animate-pulse" />
          <span>Reserva Temporal (10 min)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-sky-950 border border-sky-500/60" />
          <span>Vendido Web</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-violet-950 border border-violet-500/60" />
          <span>Vendido Boletería</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-[#1e1b18] border border-dashed border-amber-500/70" />
          <span>Bloque Físico Contingencia (RB-10)</span>
        </div>
      </div>
    </div>
  );
};
