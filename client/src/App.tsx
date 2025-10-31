import { useState } from 'react';
import { TrendingUp, Award, Target, FileSpreadsheet, Info } from 'lucide-react';
import type { RegistroVenda, ResultadoCiclo } from './types/certification';
import { calcularResultadoCiclo } from './utils/calculoCertificacao';
import Dashboard from './components/Dashboard';
import ImportadorPlanilhas from './components/ImportadorPlanilhas';
import Simulador from './components/Simulador';
import Creditos from './components/Creditos';
import './App.css';

type AbaAtiva = 'dashboard' | 'importar' | 'simulador' | 'creditos';

function App() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('dashboard');
  const [vendas, setVendas] = useState<RegistroVenda[]>([]);
  const [resultado, setResultado] = useState<ResultadoCiclo | null>(null);

  // Período do ciclo: Julho/2025 a Dezembro/2025
  const periodoInicio = new Date(2025, 6, 1); // Julho
  const periodoFim = new Date(2025, 11, 31); // Dezembro

  // Atualiza resultado quando vendas mudam
  const atualizarResultado = (novasVendas: RegistroVenda[]) => {
    setVendas(novasVendas);
    if (novasVendas.length > 0) {
      const novoResultado = calcularResultadoCiclo(novasVendas, periodoInicio, periodoFim);
      setResultado(novoResultado);
    } else {
      setResultado(null);
    }
  };

  const handleVendasImportadas = (novasVendas: RegistroVenda[]) => {
    const vendasCombinadas = [...vendas, ...novasVendas];
    atualizarResultado(vendasCombinadas);
    setAbaAtiva('dashboard');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header glass-card">
        <div className="header-content">
          <div className="header-title">
            <Award className="header-icon" size={32} />
            <div>
              <h1 className="text-gradient">Certificação Especialista com o Vini</h1>
              <p className="header-subtitle">Acompanhamento de Certificação Vivo Empresas 2º Ciclo</p>
            </div>
          </div>

          <nav className="nav-tabs">
            <button
              className={`nav-tab ${abaAtiva === 'dashboard' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('dashboard')}
            >
              <TrendingUp size={18} />
              Dashboard
            </button>
            <button
              className={`nav-tab ${abaAtiva === 'importar' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('importar')}
            >
              <FileSpreadsheet size={18} />
              Importar
            </button>
            <button
              className={`nav-tab ${abaAtiva === 'simulador' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('simulador')}
            >
              <Target size={18} />
              Simulador
            </button>
            <button
              className={`nav-tab ${abaAtiva === 'creditos' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('creditos')}
            >
              <Info size={18} />
              Créditos
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {abaAtiva === 'dashboard' && (
          <Dashboard resultado={resultado} vendas={vendas} />
        )}

        {abaAtiva === 'importar' && (
          <ImportadorPlanilhas onVendasImportadas={handleVendasImportadas} />
        )}

        {abaAtiva === 'simulador' && (
          <Simulador resultado={resultado} />
        )}

        {abaAtiva === 'creditos' && (
          <Creditos />
        )}
      </main>
    </div>
  );
}

export default App;
