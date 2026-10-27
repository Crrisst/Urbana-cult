import React, { useState } from 'react';
import { UrbanaProvider, useUrbana } from './context/UrbanaContext';
import { Header } from './components/Header';
import { PublicPortal } from './components/PublicPortal';
import { BoxOfficePOS } from './components/BoxOfficePOS';
import { SpaceAdminView } from './components/SpaceAdminView';
import { UrbanaAdminView } from './components/UrbanaAdminView';
import { ConcurrencySimulatorModal } from './components/ConcurrencySimulatorModal';
import { ShieldCheck, Sparkles, WifiOff, Users } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('cartelera');
  const [showLabModal, setShowLabModal] = useState<boolean>(false);
  const { currentRole, currentEspacio, isOfflineContingency } = useUrbana();

  return (
    <div className="min-h-screen bg-[#0c0f14] text-[#e6edf3] flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLab={() => setShowLabModal(true)}
      />

      {/* Floating Status Badge */}
      <div className="bg-[#121620] border-b border-[#212838] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Entorno Activo:</span>
            <span className="font-semibold text-amber-300">
              {currentRole === 'publico' && 'Público / Portal Web'}
              {currentRole === 'boleteria' && `Boletería Física (${currentEspacio.nombre})`}
              {currentRole === 'admin_espacio' && `Administrador de Espacio (${currentEspacio.nombre})`}
              {currentRole === 'urbana_admin' && 'Dirección Ejecutiva & Finanzas Urbana Cult'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            {isOfflineContingency ? (
              <span className="text-red-400 flex items-center gap-1 font-semibold">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Boletería en Modo Contingencia (RB-10)</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Inventario Sincronizado</span>
              </span>
            )}
            <button
              onClick={() => setShowLabModal(true)}
              className="text-amber-400 hover:text-amber-300 underline font-sans"
            >
              Abrir Laboratorio de Pruebas
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'cartelera' && <PublicPortal />}
        {activeTab === 'boleteria' && <BoxOfficePOS />}
        {activeTab === 'gestion_espacio' && <SpaceAdminView />}
        {activeTab === 'admin_urbana' && <UrbanaAdminView />}
      </main>

      {/* Footer Cultural & Académico */}
      <footer className="bg-[#0b0e14] border-t border-[#1d2330] py-8 px-4 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold text-slate-300">Urbana Cult</span>
              <span>·</span>
              <span>Plataforma de Eventos y Cultura Digital</span>
              <span>·</span>
              <span className="text-amber-400/80 font-mono">Mar del Plata</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Entrega Final de Ingeniería de Software (Grupo N.º 15) · Año 2026
            </p>
            <p className="text-[10px] text-slate-600">
              Integrantes: Sergio Vargas · Diego Rodríguez · Brian David Lavandera · Cristian Villagra | Docente: Ayelén Natalia Arias Gómez
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400 font-mono">SaaS Multi-Tenant</span>
            <span>·</span>
            <span className="text-slate-400 font-mono">Prevención de Sobreventa RF-09</span>
            <span>·</span>
            <span className="text-slate-400 font-mono">Regla RB-10 Contingencia</span>
          </div>
        </div>
      </footer>

      {/* Modal de Laboratorio de Pruebas Críticas */}
      {showLabModal && (
        <ConcurrencySimulatorModal onClose={() => setShowLabModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <UrbanaProvider>
      <AppContent />
    </UrbanaProvider>
  );
}
