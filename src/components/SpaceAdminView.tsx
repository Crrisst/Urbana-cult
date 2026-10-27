import React, { useState } from 'react';
import { useUrbana } from '../context/UrbanaContext';
import { Disciplina } from '../types';
import {
  Building2,
  Calendar,
  Clock,
  Plus,
  Music,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Filter,
} from 'lucide-react';

export const SpaceAdminView: React.FC = () => {
  const {
    espacios,
    currentEspacioId,
    setCurrentEspacioId,
    currentEspacio,
    eventos,
    salasEnsayo,
    reservasSalas,
    reservarSalaEnsayo,
    cancelarReservaSala,
    ventas,
    crearEvento,
  } = useUrbana();

  const [activeTab, setActiveTab] = useState<'espectaculos' | 'salas' | 'liquidaciones'>('espectaculos');

  // Modales
  const [modalNuevoEvento, setModalNuevoEvento] = useState(false);
  const [modalNuevaReservaSala, setModalNuevaReservaSala] = useState(false);

  // Formulario Nuevo Evento (HU-03)
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaSinopsis, setNuevaSinopsis] = useState('');
  const [nuevaDisciplina, setNuevaDisciplina] = useState<Disciplina>('teatro');
  const [nuevoPrecio, setNuevoPrecio] = useState(10000);
  const [nuevaFecha, setNuevaFecha] = useState('2026-11-12');
  const [nuevaHora, setNuevaHora] = useState('21:00');
  const [nuevaSala, setNuevaSala] = useState('Sala Principal');
  const [nuevaCapacidad, setNuevaCapacidad] = useState(32);
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null);

  // Formulario Reserva Sala Ensayo (HU-04)
  const salasDelEspacio = salasEnsayo.filter((s) => s.espacioId === currentEspacioId);
  const [salaSeleccionadaId, setSalaSeleccionadaId] = useState(salasDelEspacio[0]?.id || '');
  const [bandaNombre, setBandaNombre] = useState('Trío de Jazz Mardel');
  const [contactoNombre, setContactoNombre] = useState('Esteban Valenzuela');
  const [contactoTelefono, setContactoTelefono] = useState('+54 223 600-1122');
  const [fechaEnsayo, setFechaEnsayo] = useState('2026-10-28');
  const [horaInicioEnsayo, setHoraInicioEnsayo] = useState('18:00');
  const [horaFinEnsayo, setHoraFinEnsayo] = useState('20:00');
  const [errorReservaSala, setErrorReservaSala] = useState<string | null>(null);
  const [exitoReservaSala, setExitoReservaSala] = useState<string | null>(null);

  // Datos filtrados estrictamente para este espacio (Multi-Tenant RF-03)
  const misEventos = eventos.filter((e) => e.espacioId === currentEspacioId);
  const misReservasSalas = reservasSalas.filter((r) => r.espacioId === currentEspacioId);
  const misVentas = ventas.filter((v) => v.espacioId === currentEspacioId && v.estadoPago === 'Aprobado');

  const gmvEspacio = misVentas.reduce((sum, v) => sum + v.importeBruto, 0);
  const comisionRetenida = misVentas.reduce((sum, v) => sum + v.comisionMonto, 0);
  const netoEspacio = misVentas.reduce((sum, v) => sum + v.netoEspacio, 0);

  const handleSubmitNuevoEvento = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCreacion(null);

    const res = crearEvento({
      espacioId: currentEspacioId,
      espacioNombre: currentEspacio.nombre,
      titulo: nuevoTitulo,
      sinopsis: nuevaSinopsis,
      disciplina: nuevaDisciplina,
      imagen: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
      duracionMinutos: 90,
      calificacion: '+12',
      precioBase: Number(nuevoPrecio),
      funciones: [
        {
          fecha: nuevaFecha,
          hora: nuevaHora,
          salaNombre: nuevaSala,
          capacidadTotal: Number(nuevaCapacidad),
          precio: Number(nuevoPrecio),
        },
      ],
    });

    if (res.success) {
      setModalNuevoEvento(false);
      setNuevoTitulo('');
      setNuevaSinopsis('');
    } else {
      setErrorCreacion(res.message);
    }
  };

  const handleSubmitReservaSala = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorReservaSala(null);
    setExitoReservaSala(null);

    const res = reservarSalaEnsayo(
      currentEspacioId,
      salaSeleccionadaId || salasDelEspacio[0]?.id,
      bandaNombre,
      contactoNombre,
      contactoTelefono,
      fechaEnsayo,
      horaInicioEnsayo,
      horaFinEnsayo
    );

    if (res.success) {
      setExitoReservaSala(res.message);
      setTimeout(() => {
        setModalNuevaReservaSala(false);
        setExitoReservaSala(null);
      }, 1500);
    } else {
      setErrorReservaSala(res.message);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Cabecera B2B con selector de Espacio Cultural (RF-02 / RF-03) */}
      <div className="bg-[#121620] border border-[#252e3e] rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Módulo de Gestión para Espacios Asociados (B2B Multi-Tenant)</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Panel de Administración: {currentEspacio.nombre}
          </h1>
          <p className="text-xs text-slate-400">
            Aislamiento de datos activo (RF-03): Solo visualiza eventos y finanzas de este centro cultural.
          </p>
        </div>

        {/* Selector de Tenant para evaluar la separación de datos */}
        <div className="flex items-center gap-2 bg-[#18202d] p-2 rounded-xl border border-[#2d394d]">
          <span className="text-xs text-slate-400 whitespace-nowrap">Cambiar Espacio:</span>
          <select
            value={currentEspacioId}
            onChange={(e) => setCurrentEspacioId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-amber-300 outline-none cursor-pointer"
          >
            {espacios.map((esp) => (
              <option key={esp.id} value={esp.id} className="bg-[#18202d] text-slate-200">
                {esp.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navegación por pestañas B2B */}
      <div className="flex items-center gap-2 border-b border-[#232b3b] pb-2">
        <button
          onClick={() => setActiveTab('espectaculos')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'espectaculos'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Espectáculos & Funciones ({misEventos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('salas')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'salas'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Salas de Ensayo B2B ({salasDelEspacio.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('liquidaciones')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'liquidaciones'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Liquidaciones y Finanzas ({misVentas.length} ventas)</span>
        </button>
      </div>

      {/* PESTAÑA 1: ESPECTÁCULOS & FUNCIONES */}
      {activeTab === 'espectaculos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                Obras y Eventos del Establecimiento
              </h2>
              <p className="text-xs text-slate-400">
                Límite de aforo máximo habilitado por ordenanza: {currentEspacio.capacidadGeneral} localidades
              </p>
            </div>
            <button
              onClick={() => {
                setErrorCreacion(null);
                setModalNuevoEvento(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Nuevo Evento (HU-03)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {misEventos.map((evt) => (
              <div
                key={evt.id}
                className="bg-[#121620] border border-[#232b3b] rounded-xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                      {evt.disciplina} · {evt.duracionMinutos} min
                    </span>
                    <h3 className="text-lg font-bold text-white">{evt.titulo}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                      ${evt.precioBase.toLocaleString('es-AR')} ARS
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{evt.sinopsis}</p>

                {/* Lista de funciones configuradas */}
                <div className="space-y-2 pt-2 border-t border-[#1e2635]">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    Funciones Programadas:
                  </span>
                  {evt.funciones.map((fn) => {
                    const ocupadas = fn.butacas.filter((b) => b.estado !== 'disponible').length;
                    return (
                      <div
                        key={fn.id}
                        className="flex items-center justify-between bg-[#171f2c] px-3 py-2 rounded-lg text-xs"
                      >
                        <span className="text-slate-300 font-mono">
                          {fn.fecha} · {fn.hora} hs ({fn.salaNombre})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">
                            {ocupadas}/{fn.capacidadTotal} ocupadas
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-semibold">
                            En Cartelera
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 2: SALAS DE ENSAYO B2B (RF-15 / HU-04) */}
      {activeTab === 'salas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                Módulo de Alquiler de Salas de Ensayo (RF-15 / HU-04)
              </h2>
              <p className="text-xs text-slate-400">
                Prevención algorítmica de solapamiento horario y comisión B2B del 8%
              </p>
            </div>
            <button
              onClick={() => {
                setErrorReservaSala(null);
                setExitoReservaSala(null);
                setModalNuevaReservaSala(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Reserva de Ensayo</span>
            </button>
          </div>

          {/* Cards de Salas del espacio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {salasDelEspacio.map((sala) => (
              <div
                key={sala.id}
                className="bg-[#121620] border border-[#232b3b] rounded-xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase">
                      Sala Tipo {sala.tipo} · Hasta {sala.capacidadPersonas} músicos
                    </span>
                    <h3 className="text-base font-bold text-white">{sala.nombre}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                    ${sala.precioHora.toLocaleString('es-AR')}/hora
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block font-medium">Equipamiento:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {sala.equipamiento.map((eq, i) => (
                      <span
                        key={i}
                        className="text-[11px] text-slate-300 bg-[#18202d] px-2 py-0.5 rounded border border-[#273244]"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Listado de Reservas de Ensayo */}
          <div className="bg-[#121620] border border-[#232b3b] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Reservas Confirmadas de Ensayos ({misReservasSalas.length})
            </h3>

            {misReservasSalas.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No hay reservas activas registradas para este espacio.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#252f42] text-slate-400 font-mono">
                      <th className="py-2 px-3">Banda / Elenco</th>
                      <th className="py-2 px-3">Sala</th>
                      <th className="py-2 px-3">Fecha & Horario</th>
                      <th className="py-2 px-3">Total Bruto</th>
                      <th className="py-2 px-3">Comisión B2B (8%)</th>
                      <th className="py-2 px-3">Neto Sala</th>
                      <th className="py-2 px-3">Estado</th>
                      <th className="py-2 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2636] font-mono text-slate-200">
                    {misReservasSalas.map((res) => (
                      <tr key={res.id} className="hover:bg-[#18202e]">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-white block">{res.bandaNombre}</span>
                          <span className="text-[10px] text-slate-400">{res.contactoNombre} ({res.contactoTelefono})</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{res.salaNombre}</td>
                        <td className="py-2.5 px-3 text-amber-300">
                          {res.fecha} · {res.horaInicio} a {res.horaFin} ({res.duracionHoras}h)
                        </td>
                        <td className="py-2.5 px-3 tabular-nums">${res.importeTotal.toLocaleString('es-AR')}</td>
                        <td className="py-2.5 px-3 tabular-nums text-amber-400">-${res.comisionB2B.toLocaleString('es-AR')}</td>
                        <td className="py-2.5 px-3 tabular-nums text-emerald-400 font-bold">
                          ${res.netoEspacio.toLocaleString('es-AR')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              res.estado === 'confirmada'
                                ? 'bg-emerald-950 text-emerald-300'
                                : 'bg-red-950 text-red-300'
                            }`}
                          >
                            {res.estado.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {res.estado === 'confirmada' && (
                            <button
                              onClick={() => {
                                const mot = prompt('Ingrese el motivo de la cancelación (HU-04 Escenario 2):');
                                if (mot) cancelarReservaSala(res.id, mot);
                              }}
                              className="text-red-400 hover:text-red-300 text-[11px] underline"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PESTAÑA 3: LIQUIDACIONES Y FINANZAS (HU-05) */}
      {activeTab === 'liquidaciones' && (
        <div className="space-y-6">
          {/* Tarjetas de Resumen Financiero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#121620] p-5 rounded-xl border border-[#232b3b] space-y-1">
              <span className="text-xs text-slate-400 block font-mono">
                Recaudación Bruta (GMV)
              </span>
              <span className="text-2xl font-bold font-mono text-white tabular-nums">
                ${gmvEspacio.toLocaleString('es-AR')} ARS
              </span>
              <span className="text-[11px] text-slate-500 block">
                Total de entradas vendidas confirmadas
              </span>
            </div>

            <div className="bg-[#121620] p-5 rounded-xl border border-[#232b3b] space-y-1">
              <span className="text-xs text-slate-400 block font-mono">
                Comisión Urbana Cult ({currentEspacio.comisionEntradas}%)
              </span>
              <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                -${comisionRetenida.toLocaleString('es-AR')} ARS
              </span>
              <span className="text-[11px] text-slate-500 block">
                Retención de plataforma por servicios SaaS
              </span>
            </div>

            <div className="bg-[#121620] p-5 rounded-xl border border-[#232b3b] space-y-1">
              <span className="text-xs text-slate-400 block font-mono">
                Saldo Neto a Liquidar
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                ${netoEspacio.toLocaleString('es-AR')} ARS
              </span>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    currentEspacio.estadoLiquidacion === 'activo'
                      ? 'bg-emerald-950 text-emerald-300'
                      : 'bg-red-950 text-red-300'
                  }`}
                >
                  {currentEspacio.estadoLiquidacion === 'activo'
                    ? 'LIQUIDACIÓN ACTIVA'
                    : 'PAUSADA POR RIESGO (RB-12)'}
                </span>
              </div>
            </div>
          </div>

          {/* Listado de Operaciones Confirmadas */}
          <div className="bg-[#121620] border border-[#232b3b] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">
              Detalle de Ventas por Función (Trazabilidad HU-05)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#252f42] text-slate-400 font-mono">
                    <th className="py-2 px-3">ID Venta</th>
                    <th className="py-2 px-3">Evento</th>
                    <th className="py-2 px-3">Ubicación</th>
                    <th className="py-2 px-3">Canal</th>
                    <th className="py-2 px-3">Bruto</th>
                    <th className="py-2 px-3">Comisión (10%)</th>
                    <th className="py-2 px-3">Neto</th>
                    <th className="py-2 px-3">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2636] font-mono text-slate-200">
                  {misVentas.map((v) => (
                    <tr key={v.id} className="hover:bg-[#18202e]">
                      <td className="py-2 px-3 text-amber-400 font-semibold">{v.id}</td>
                      <td className="py-2 px-3 text-slate-300">{v.eventoTitulo}</td>
                      <td className="py-2 px-3">{v.butacaEtiqueta}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            v.canal === 'Web'
                              ? 'bg-sky-950 text-sky-300'
                              : v.canal === 'Presencial'
                              ? 'bg-violet-950 text-violet-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {v.canal}
                        </span>
                      </td>
                      <td className="py-2 px-3 tabular-nums">${v.importeBruto.toLocaleString('es-AR')}</td>
                      <td className="py-2 px-3 tabular-nums text-amber-400">-${v.comisionMonto.toLocaleString('es-AR')}</td>
                      <td className="py-2 px-3 tabular-nums text-emerald-400 font-bold">${v.netoEspacio.toLocaleString('es-AR')}</td>
                      <td className="py-2 px-3 text-slate-400">{v.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Evento (HU-03) */}
      {modalNuevoEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121620] border border-[#283244] w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#232c3c] pb-3">
              <h3 className="text-base font-bold text-white">
                Publicar Espectáculo / Función (HU-03)
              </h3>
              <button
                onClick={() => setModalNuevoEvento(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorCreacion && (
              <div className="p-3 rounded-lg bg-red-950 border border-red-500/50 text-xs text-red-200">
                {errorCreacion}
              </div>
            )}

            <form onSubmit={handleSubmitNuevoEvento} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Título de la Obra o Recital</label>
                <input
                  type="text"
                  required
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  placeholder="ej: Noche de Jazz en el Mar"
                  className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Sinopsis</label>
                <textarea
                  rows={2}
                  required
                  value={nuevaSinopsis}
                  onChange={(e) => setNuevaSinopsis(e.target.value)}
                  placeholder="Breve descripción del espectáculo..."
                  className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Disciplina</label>
                  <select
                    value={nuevaDisciplina}
                    onChange={(e) => setNuevaDisciplina(e.target.value as Disciplina)}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="teatro">Teatro</option>
                    <option value="musica">Música en Vivo</option>
                    <option value="danza">Danza</option>
                    <option value="talleres">Talleres</option>
                    <option value="festivales">Festivales</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Precio Entrada ($ ARS)</label>
                  <input
                    type="number"
                    required
                    value={nuevoPrecio}
                    onChange={(e) => setNuevoPrecio(Number(e.target.value))}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={nuevaHora}
                    onChange={(e) => setNuevaHora(e.target.value)}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Sala</label>
                  <input
                    type="text"
                    value={nuevaSala}
                    onChange={(e) => setNuevaSala(e.target.value)}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    Capacidad (Máx: {currentEspacio.capacidadGeneral})
                  </label>
                  <input
                    type="number"
                    required
                    value={nuevaCapacidad}
                    onChange={(e) => setNuevaCapacidad(Number(e.target.value))}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#232c3c] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoEvento(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Publicar en Cartelera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reserva Sala de Ensayo (HU-04) */}
      {modalNuevaReservaSala && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121620] border border-[#283244] w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#232c3c] pb-3">
              <h3 className="text-base font-bold text-white">
                Reserva de Sala de Ensayo (Validación Anti-Solapamiento RF-15)
              </h3>
              <button
                onClick={() => setModalNuevaReservaSala(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorReservaSala && (
              <div className="p-3 rounded-lg bg-red-950 border border-red-500/50 text-xs text-red-200">
                {errorReservaSala}
              </div>
            )}

            {exitoReservaSala && (
              <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-500/50 text-xs text-emerald-200">
                {exitoReservaSala}
              </div>
            )}

            <form onSubmit={handleSubmitReservaSala} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Sala a Alquilar</label>
                <select
                  value={salaSeleccionadaId}
                  onChange={(e) => setSalaSeleccionadaId(e.target.value)}
                  className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {salasDelEspacio.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} (${s.precioHora.toLocaleString('es-AR')}/h)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nombre de la Banda o Elenco</label>
                <input
                  type="text"
                  required
                  value={bandaNombre}
                  onChange={(e) => setBandaNombre(e.target.value)}
                  className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Persona de Contacto</label>
                  <input
                    type="text"
                    required
                    value={contactoNombre}
                    onChange={(e) => setContactoNombre(e.target.value)}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="text"
                    required
                    value={contactoTelefono}
                    onChange={(e) => setContactoTelefono(e.target.value)}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={fechaEnsayo}
                    onChange={(e) => setFechaEnsayo(e.target.value)}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={horaInicioEnsayo}
                    onChange={(e) => setHoraInicioEnsayo(e.target.value)}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    required
                    value={horaFinEnsayo}
                    onChange={(e) => setHoraFinEnsayo(e.target.value)}
                    className="w-full bg-[#18202d] border border-[#2c384d] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#232c3c] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevaReservaSala(false)}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
