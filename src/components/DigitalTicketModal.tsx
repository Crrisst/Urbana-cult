import React from 'react';
import { TransaccionVenta } from '../types';
import { CheckCircle2, QrCode, Printer, X, ShieldCheck } from 'lucide-react';

interface DigitalTicketModalProps {
  transaccion: TransaccionVenta;
  onClose: () => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({ transaccion, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#12161f] border border-[#2a3447] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative text-slate-200">
        {/* Header con gradiente teatral */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-slate-950 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-slate-950 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-wider">
              Comprobante Oficial de Entrada
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {transaccion.eventoTitulo}
          </h2>
          <p className="text-sm font-medium opacity-90 mt-0.5">
            {transaccion.espacioNombre} · Mar del Plata
          </p>
        </div>

        {/* Cuerpo del tique */}
        <div className="p-6 space-y-6">
          {/* Identificadores clave */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#181e2b] p-4 rounded-xl border border-[#273247] text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">ID Transacción</span>
              <span className="font-mono font-semibold text-amber-400">{transaccion.id}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Código Boletería</span>
              <span className="font-mono font-semibold text-white">{transaccion.codigoComprobante}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Canal de Venta</span>
              <span className="font-mono font-semibold text-emerald-400">{transaccion.canal}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Ubicación</span>
              <span className="font-semibold text-white">{transaccion.butacaEtiqueta}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Monto Pagado</span>
              <span className="font-mono font-bold text-white tabular-nums">${transaccion.importeBruto.toLocaleString('es-AR')} ARS</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Estado de Pago</span>
              <span className="font-semibold text-emerald-400">{transaccion.estadoPago}</span>
            </div>
          </div>

          {/* Información del comprador y QR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-[#0e121a] border border-[#202738]">
            <div className="space-y-1.5 text-xs">
              <div>
                <span className="text-slate-400">Titular de la entrada: </span>
                <span className="font-semibold text-white">{transaccion.compradorNombre}</span>
              </div>
              {transaccion.compradorEmail && (
                <div>
                  <span className="text-slate-400">Correo: </span>
                  <span className="text-slate-300">{transaccion.compradorEmail}</span>
                </div>
              )}
              {transaccion.compradorDni && (
                <div>
                  <span className="text-slate-400">DNI: </span>
                  <span className="font-mono text-slate-300">{transaccion.compradorDni}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400">Medio: </span>
                <span className="text-slate-300">{transaccion.metodoPago}</span>
              </div>
              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Inventario centralizado y protegido contra sobreventa</span>
              </div>
            </div>

            {/* QR Simulado */}
            <div className="flex flex-col items-center justify-center p-3 bg-white text-slate-950 rounded-xl shadow">
              <QrCode className="w-20 h-20 text-slate-900" />
              <span className="text-[9px] font-mono font-bold mt-1 tracking-tight">
                {transaccion.codigoComprobante}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#21293a] text-slate-200 hover:bg-[#2b354a] transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Descargar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md shadow-amber-500/20"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
