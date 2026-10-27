import React from 'react';
import { useUrbana } from '../context/UrbanaContext';
import { RolUsuario } from '../types';
import { Ticket, Building2, ShieldCheck, Sparkles, RefreshCw, Radio } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLab: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenLab }) => {
  const {
    currentRole,
    setCurrentRole,
    currentEspacio,
    isOfflineContingency,
    contingencyQueue,
    resetToInitialData,
  } = useUrbana();

  const roleLabels: { role: RolUsuario; label: string; icon: React.ReactNode }[] = [
    { role: 'publico', label: 'Espectador (Web)', icon: <Ticket className="w-3.5 h-3.5" /> },
    { role: 'boleteria', label: 'Boletería Física', icon: <Radio className="w-3.5 h-3.5" /> },
    { role: 'admin_espacio', label: 'Admin Espacio (B2B)', icon: <Building2 className="w-3.5 h-3.5" /> },
    { role: 'urbana_admin', label: 'Urbana Central', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0d1117]/95 backdrop-blur border-b border-[#21262d] px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Zone 1: Brand & Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-slate-950 text-lg shadow-md shadow-amber-500/10">
            UC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-sans">
                Urbana Cult
              </span>
              <span className="text-xs text-amber-400/90 font-mono">
                Mar del Plata
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Plataforma de Eventos y Cultura Digital · Ecosistema Multi-Tenant
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium bg-[#161b22] p-1 rounded-lg border border-[#30363d] overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('cartelera')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'cartelera'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Cartelera Web
          </button>
          <button
            onClick={() => {
              setActiveTab('boleteria');
              if (currentRole === 'publico') setCurrentRole('boleteria');
            }}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'boleteria'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Boletería Física</span>
            {isOfflineContingency && (
              <span className="w-2 h-2 rounded-full bg-red-500" title="Modo Contingencia RB-10 Activo" />
            )}
            {contingencyQueue.length > 0 && (
              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-mono">
                {contingencyQueue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('gestion_espacio');
              if (currentRole === 'publico' || currentRole === 'boleteria') setCurrentRole('admin_espacio');
            }}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'gestion_espacio'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Gestión Espacio (B2B)
          </button>
          <button
            onClick={() => {
              setActiveTab('admin_urbana');
              setCurrentRole('urbana_admin');
            }}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'admin_urbana'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Urbana Central & Auditoría
          </button>
        </nav>

        {/* Zone 3: Interactive Role Switcher & Labs */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenLab}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/30 hover:bg-orange-500/25 transition-all shadow-sm"
            title="Abrir Simulador de Concurrencia y Contingencia"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Laboratorio de Pruebas</span>
          </button>

          {/* Role selector dropdown */}
          <div className="flex items-center bg-[#161b22] border border-[#30363d] rounded-lg p-0.5">
            <select
              value={currentRole}
              onChange={(e) => {
                const newRole = e.target.value as RolUsuario;
                setCurrentRole(newRole);
                if (newRole === 'publico') setActiveTab('cartelera');
                if (newRole === 'boleteria') setActiveTab('boleteria');
                if (newRole === 'admin_espacio') setActiveTab('gestion_espacio');
                if (newRole === 'urbana_admin') setActiveTab('admin_urbana');
              }}
              className="bg-transparent text-xs text-slate-200 px-2.5 py-1.5 outline-none font-medium cursor-pointer"
            >
              <option value="publico" className="bg-[#161b22] text-slate-200">Rol: Público / Espectador</option>
              <option value="boleteria" className="bg-[#161b22] text-slate-200">Rol: Boletería Taquilla</option>
              <option value="admin_espacio" className="bg-[#161b22] text-slate-200">Rol: Admin Espacio ({currentEspacio.nombre.substring(0, 16)}...)</option>
              <option value="urbana_admin" className="bg-[#161b22] text-slate-200">Rol: Urbana Cult Central</option>
            </select>
          </div>

          {/* Reset Demo button */}
          <button
            onClick={() => {
              if (window.confirm('¿Desea restaurar los datos de demostración a su estado inicial?')) {
                resetToInitialData();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title="Reiniciar datos iniciales de prueba"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
