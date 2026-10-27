import React, { useState } from 'react';
import { useUrbana } from '../context/UrbanaContext';
import { Evento, IncidenteCobro } from '../types';
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  Info,
  DollarSign,
  Search,
  Filter,
  Radio,
} from 'lucide-react';

export const UrbanaAdminView: React.FC = () => {
  const {
    espacios,
    eventos,
    ventas,
    totalGMV,
    totalComisiones,
    auditoria,
    incidentes,
    resolverIncidente,
    pausarOReanudarLiquidacion,
    actualizarDestacados,
    registrarAlertaProveedor,
  } = useUrbana();

  const [activeTab, setActiveTab] = useState<'gobernanza' | 'liquidaciones' | 'incidentes' | 'auditoria'>('gobernanza');

  // Filtros de Auditoría
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [busquedaAuditoria, setBusquedaAuditoria] = useState<string>('');

  // Modal para Destacar Evento (RF-22)
  const [modalDestacado, setModalDestacado] = useState<Evento | null>(null);
  const [criterioDestacado, setCriterioDestacado] = useState('Rotación entre espacios');
  const [motivoDestacado, setMotivoDestacado] = useState('Acuerdo de cartelera equilibrada para fin de semana largo en Mar del Plata');

  // Modal Resolver Incidente (RF-24)
  const [incidenteSeleccionado, setIncidenteSeleccionado] = useState<IncidenteCobro | null>(null);
  const [notaResolucion, setNotaResolucion] = useState('Contracargo verificado con la pasarela externa. Se confirmó la anulación del cobro.');

  const handleGuardarDestacado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalDestacado) return;

    actualizarDestacados(modalDestacado.id, !modalDestacado.destacadoPortada, {
      criterio: criterioDestacado,
      motivo: motivoDestacado,
      usuario: 'direccion@urbanacult.ar',
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
    });

    setModalDestacado(null);
  };

  const handleResolverIncidente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidenteSeleccionado) return;

    resolverIncidente(incidenteSeleccionado.id, notaResolucion);
    setIncidenteSeleccionado(null);
  };

  // Filtrado de auditoría
  const auditoriaFiltrada = auditoria.filter((reg) => {
    if (filtroRol !== 'todos' && reg.rol !== filtroRol) return false;
    if (busquedaAuditoria.trim() !== '') {
      const q = busquedaAuditoria.toLowerCase();
      const matchAccion = reg.accion.toLowerCase().includes(q);
      const matchUsuario = reg.usuario.toLowerCase().includes(q);
      const matchMotivo = reg.motivo?.toLowerCase().includes(q) || false;
      const matchEntidadId = reg.entidadId.toLowerCase().includes(q);
      if (!matchAccion && !matchUsuario && !matchMotivo && !matchEntidadId) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Cabecera de Dirección y Backoffice Central */}
      <div className="bg-[#121620] border border-[#262f40] rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Módulo Central de Gobernanza, Auditoría y Finanzas</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Panel de Dirección Urbana Cult
          </h1>
          <p className="text-xs text-slate-400">
            Control de la red de 25 espacios asociados en Mar del Plata, cálculo de comisiones y trazabilidad inmutable.
          </p>
        </div>

        {/* Botón para simular webhook de pasarela (RF-28) */}
        <button
          onClick={() => {
            registrarAlertaProveedor(
              'retencion_fondos',
              'Alerta de pasarela: Retención preventiva de fondos por verificación fiscal del procesador.',
              'critica'
            );
            setActiveTab('incidentes');
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/80 border border-red-500/60 text-red-300 hover:bg-red-900 text-xs font-semibold transition-all shadow"
          title="Simular alerta crítica del proveedor de pagos (RF-28)"
        >
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>Simular Alerta de Pasarela (RF-28)</span>
        </button>
      </div>

      {/* KPIs Macro Financieros (Sección 3.5 del documento) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121620] p-5 rounded-xl border border-[#242c3d] space-y-1">
          <span className="text-xs text-slate-400 block font-mono">
            Volumen Bruto (GMV Actual)
          </span>
          <span className="text-2xl font-bold font-mono text-white tabular-nums">
            ${totalGMV.toLocaleString('es-AR')} ARS
          </span>
          <span className="text-[11px] text-slate-500 block">
            Hipótesis modelo teórico: $120.000.000/mes
          </span>
        </div>

        <div className="bg-[#121620] p-5 rounded-xl border border-[#242c3d] space-y-1">
          <span className="text-xs text-slate-400 block font-mono">
            Comisiones Retenidas (10%)
          </span>
          <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
            ${totalComisiones.toLocaleString('es-AR')} ARS
          </span>
          <span className="text-[11px] text-slate-500 block">
            Ingreso bruto proyectado: $12.600.000/mes
          </span>
        </div>

        <div className="bg-[#121620] p-5 rounded-xl border border-[#242c3d] space-y-1">
          <span className="text-xs text-slate-400 block font-mono">
            Incidentes de Cobro Abiertos
          </span>
          <span className="text-2xl font-bold font-mono text-orange-400 tabular-nums">
            {incidentes.filter((i) => i.estado !== 'resuelto').length}
          </span>
          <span className="text-[11px] text-slate-500 block">
            {incidentes.length} incidentes totales gestionados
          </span>
        </div>

        <div className="bg-[#121620] p-5 rounded-xl border border-[#242c3d] space-y-1">
          <span className="text-xs text-slate-400 block font-mono">
            Eventos en Bitácora (RF-21)
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {auditoria.length}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Trazabilidad transaccional inmutable
          </span>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="flex items-center gap-2 border-b border-[#232b3b] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('gobernanza')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'gobernanza'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Gobernanza de Portada (RF-22)</span>
        </button>
        <button
          onClick={() => setActiveTab('liquidaciones')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'liquidaciones'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Liquidaciones & Pausas (RB-12)</span>
        </button>
        <button
          onClick={() => setActiveTab('incidentes')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'incidentes'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Gestión de Incidentes (RF-24)</span>
        </button>
        <button
          onClick={() => setActiveTab('auditoria')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'auditoria'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Bitácora de Auditoría (RF-18 / RF-21)</span>
        </button>
      </div>

      {/* PESTAÑA 1: GOBERNANZA DE PORTADA (RF-22 / HU-07) */}
      {activeTab === 'gobernanza' && (
        <div className="space-y-4">
          <div className="bg-[#121620] p-4 rounded-xl border border-[#242c3d] text-xs text-slate-300 space-y-1">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400" />
              <span>Regla de Transparencia Cultural (RF-22)</span>
            </h3>
            <p>
              Para evitar decisiones arbitrarias en la promoción de espectáculos, la selección de obras destacadas en portada exige registrar explícitamente el criterio acordado por la red (rotación entre espacios, diversidad de disciplinas, campañas vigentes) y el motivo documentado.
            </p>
          </div>

          <div className="bg-[#121620] border border-[#242c3d] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              Catálogo de Obras y Estado en Portada
            </h3>

            <div className="divide-y divide-[#1f2838]">
              {eventos.map((evt) => (
                <div key={evt.id} className="py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{evt.titulo}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({evt.espacioNombre})</span>
                      {evt.destacadoPortada && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          DESTACADO EN PORTADA
                        </span>
                      )}
                    </div>
                    {evt.justificacionDestacado && (
                      <p className="text-[11px] text-slate-400">
                        Criterio: <em>{evt.justificacionDestacado.criterio}</em> · Motivo: {evt.justificacionDestacado.motivo} ({evt.justificacionDestacado.fecha})
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setModalDestacado(evt);
                      setCriterioDestacado(
                        evt.destacadoPortada ? 'Fin de ciclo de rotación' : 'Rotación entre espacios'
                      );
                      setMotivoDestacado(
                        evt.destacadoPortada
                          ? 'Cumplió período de destaque; rota a otra sala de la red.'
                          : 'Aprobado en acta de coordinación cultural.'
                      );
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                      evt.destacadoPortada
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400'
                    }`}
                  >
                    {evt.destacadoPortada ? 'Retirar de Portada' : 'Destacar con Justificación'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: LIQUIDACIONES Y ALERTA DE PASARELA (RF-28 / RB-12) */}
      {activeTab === 'liquidaciones' && (
        <div className="space-y-4">
          <div className="bg-[#121620] border border-[#242c3d] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              Liquidaciones por Espacio Cultural Asociado (RB-12)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#252f42] text-slate-400 font-mono">
                    <th className="py-2 px-3">Espacio Cultural</th>
                    <th className="py-2 px-3">Ciudad / Barrio</th>
                    <th className="py-2 px-3">Comisión</th>
                    <th className="py-2 px-3">Ventas Confirmadas</th>
                    <th className="py-2 px-3">Neto Acumulado</th>
                    <th className="py-2 px-3">Estado Liquidación</th>
                    <th className="py-2 px-3 text-right">Acción de Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2636] font-mono text-slate-200">
                  {espacios.map((esp) => {
                    const ventasEspacio = ventas.filter((v) => v.espacioId === esp.id && v.estadoPago === 'Aprobado');
                    const neto = ventasEspacio.reduce((s, v) => s + v.netoEspacio, 0);

                    return (
                      <tr key={esp.id} className="hover:bg-[#18202e]">
                        <td className="py-3 px-3 font-bold text-white">{esp.nombre}</td>
                        <td className="py-3 px-3 text-slate-300">{esp.barrio}, {esp.ciudad}</td>
                        <td className="py-3 px-3 text-amber-400">{esp.comisionEntradas}%</td>
                        <td className="py-3 px-3">{ventasEspacio.length} tiques</td>
                        <td className="py-3 px-3 font-bold text-emerald-400 tabular-nums">
                          ${neto.toLocaleString('es-AR')} ARS
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              esp.estadoLiquidacion === 'activo'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-red-950 text-red-300'
                            }`}
                          >
                            {esp.estadoLiquidacion === 'activo' ? 'HABILITADA' : 'PAUSADA (RB-12)'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {esp.estadoLiquidacion === 'activo' ? (
                            <button
                              onClick={() => {
                                const mot = prompt(
                                  'Ingrese el motivo documentado para pausar las liquidaciones de este espacio (RB-12):',
                                  'Alerta preventiva de pasarela o sospecha de contracargos'
                                );
                                if (mot) pausarOReanudarLiquidacion(esp.id, 'pausar', mot);
                              }}
                              className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 justify-end ml-auto"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Pausar Liquidación</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                const mot = prompt(
                                  'Ingrese evidencia de conciliación para reanudar liquidaciones (RB-12):',
                                  'Fondos acreditados y conciliados con el proveedor de pagos'
                                );
                                if (mot) pausarOReanudarLiquidacion(esp.id, 'reanudar', mot);
                              }}
                              className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 justify-end ml-auto"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Reanudar Liquidación</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: GESTIÓN DE INCIDENTES (RF-24 / HU-09) */}
      {activeTab === 'incidentes' && (
        <div className="space-y-4">
          <div className="bg-[#121620] border border-[#242c3d] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              Mesa de Incidentes y Reclamos de Cobro (RF-24 / HU-09)
            </h3>

            <div className="space-y-3">
              {incidentes.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-[#171f2d] border border-[#273347] rounded-xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-xs">{inc.id}</span>
                      <span className="text-white font-semibold text-xs">{inc.espacioNombre}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          inc.prioridad === 'critica'
                            ? 'bg-red-950 text-red-300 border border-red-500/40'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {inc.prioridad}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inc.estado === 'resuelto'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-orange-950 text-orange-300'
                        }`}
                      >
                        {inc.estado.toUpperCase()}
                      </span>
                      {inc.estado !== 'resuelto' && (
                        <button
                          onClick={() => setIncidenteSeleccionado(inc)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs"
                        >
                          Resolver Caso
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{inc.descripcion}</p>

                  <div className="pt-2 border-t border-[#232c3d] space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Historial de Acciones y Notificaciones:
                    </span>
                    {inc.historialAcciones.map((h, i) => (
                      <div key={i} className="text-[11px] text-slate-400 font-mono flex gap-2">
                        <span className="text-slate-500">{h.fecha}</span>
                        <span className="text-amber-400/80">[{h.usuario}]</span>
                        <span className="text-slate-300">{h.nota}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: BITÁCORA DE AUDITORÍA (RF-18 / RF-21) */}
      {activeTab === 'auditoria' && (
        <div className="space-y-4">
          <div className="bg-[#121620] border border-[#242c3d] rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Bitácora de Auditoría Inmutable (RF-18 / RF-21 / HU-06)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Registro cronológico de cambios de estado, transacciones y bloqueos de seguridad.
                </p>
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busquedaAuditoria}
                    onChange={(e) => setBusquedaAuditoria(e.target.value)}
                    placeholder="Filtrar por acción, motivo, ID..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#18202d] border border-[#2d384d] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  className="bg-[#18202d] border border-[#2d384d] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="publico">Rol: Público</option>
                  <option value="boleteria">Rol: Boletería</option>
                  <option value="admin_espacio">Rol: Admin Espacio</option>
                  <option value="urbana_admin">Rol: Urbana Admin</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#252f42] text-slate-400 font-mono">
                    <th className="py-2 px-3">Fecha y Hora</th>
                    <th className="py-2 px-3">Usuario & Rol</th>
                    <th className="py-2 px-3">Acción Registrada</th>
                    <th className="py-2 px-3">Entidad / ID</th>
                    <th className="py-2 px-3">Detalle / Motivo</th>
                    <th className="py-2 px-3">Canal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2636] font-mono text-slate-200">
                  {auditoriaFiltrada.map((item) => (
                    <tr key={item.id} className="hover:bg-[#18202e]">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{item.timestamp}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-white block">{item.usuario}</span>
                        <span className="text-[10px] text-amber-400/80">{item.rol}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-300">{item.accion}</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {item.entidad} <span className="text-slate-500">({item.entidadId})</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate" title={item.motivo}>
                        {item.motivo || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-[#20293a] text-slate-300 text-[10px]">
                          {item.canal || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criterio Destacado de Portada (RF-22) */}
      {modalDestacado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121620] border border-[#283244] w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white">
              Justificación de Destaque en Portada (RF-22)
            </h3>
            <p className="text-xs text-slate-400">
              Registrar el criterio institucional para <strong>{modalDestacado.titulo}</strong>.
            </p>

            <form onSubmit={handleGuardarDestacado} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Criterio Institucional Aprobado</label>
                <select
                  value={criterioDestacado}
                  onChange={(e) => setCriterioDestacado(e.target.value)}
                  className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Rotación entre espacios">Rotación entre espacios asociados</option>
                  <option value="Diversidad de disciplinas">Diversidad de disciplinas y géneros</option>
                  <option value="Fomento a la música emergente">Fomento y estreno local</option>
                  <option value="Patrimonio cultural marplatense">Patrimonio cultural marplatense</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Motivo / Fundamentación</label>
                <textarea
                  rows={3}
                  required
                  value={motivoDestacado}
                  onChange={(e) => setMotivoDestacado(e.target.value)}
                  className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-[#232c3c] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalDestacado(null)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Confirmar y Registrar en Bitácora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Resolver Incidente (RF-24) */}
      {incidenteSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121620] border border-[#283244] w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white">
              Resolución de Incidente #{incidenteSeleccionado.id}
            </h3>
            <p className="text-xs text-slate-400">{incidenteSeleccionado.descripcion}</p>

            <form onSubmit={handleResolverIncidente} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nota de Resolución Documentada</label>
                <textarea
                  rows={3}
                  required
                  value={notaResolucion}
                  onChange={(e) => setNotaResolucion(e.target.value)}
                  className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-[#232c3c] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIncidenteSeleccionado(null)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold"
                >
                  Marcar como Resuelto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
