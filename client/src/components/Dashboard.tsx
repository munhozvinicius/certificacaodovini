import type { ResultadoCiclo, RegistroVenda } from '../types/certification';
import { getNomeClassificacao, formatarMoeda, formatarPontuacao } from '../utils/calculoCertificacao';
import { TrendingUp, DollarSign, Award, Calendar, BarChart3, AlertCircle } from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  resultado: ResultadoCiclo | null;
  vendas: RegistroVenda[];
}

export default function Dashboard({ resultado, vendas }: DashboardProps) {
  if (!resultado || vendas.length === 0) {
    return (
      <div className="dashboard-empty fade-in">
        <div className="empty-state glass-card">
          <AlertCircle size={64} className="empty-icon" />
          <h2>Nenhum Dado Disponível</h2>
          <p>Importe suas planilhas para visualizar o dashboard de performance</p>
          <button className="btn btn-primary">
            <BarChart3 size={18} />
            Importar Planilhas
          </button>
        </div>
      </div>
    );
  }

  const { classificacao, bonusPercentual, pontuacaoMedia, resultadosMensais } = resultado;

  // Calcula receita total
  const receitaTotal = resultadosMensais.reduce((acc, r) =>
    acc + r.receitaDadosAvancados + r.receitaVozAvancada + r.receitaDigitalTI +
    r.receitaNovosProdutos + r.receitaLocacaoEquipamentos + r.receitaLicencas, 0
  );

  // Calcula pontuação total
  const pontuacaoTotal = resultadosMensais.reduce((acc, r) => acc + r.pontosTotal, 0);

  return (
    <div className="dashboard-container fade-in">
      {/* Cards de Resumo */}
      <div className="summary-cards">
        <div className="summary-card glass-card">
          <div className="card-header">
            <Award size={24} />
            <h3>Classificação Atual</h3>
          </div>
          <div className="card-value">
            <span className={`badge badge-${classificacao.toLowerCase().replace('_', '-')}`}>
              {getNomeClassificacao(classificacao)}
            </span>
          </div>
          <div className="card-footer">
            Bônus: {bonusPercentual}%
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <TrendingUp size={24} />
            <h3>Pontuação Média</h3>
          </div>
          <div className="card-value text-gradient">
            {formatarPontuacao(pontuacaoMedia)}
          </div>
          <div className="card-footer">
            Total: {formatarPontuacao(pontuacaoTotal)} pontos
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <DollarSign size={24} />
            <h3>Receita Total</h3>
          </div>
          <div className="card-value text-gradient">
            {formatarMoeda(receitaTotal)}
          </div>
          <div className="card-footer">
            {vendas.length} vendas registradas
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <Calendar size={24} />
            <h3>Período</h3>
          </div>
          <div className="card-value">
            Jul-Dez/2025
          </div>
          <div className="card-footer">
            2º Ciclo
          </div>
        </div>
      </div>

      {/* Tabela de Resultados Mensais */}
      <div className="monthly-results glass-card">
        <h3>Resultados Mensais</h3>
        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Dados Avançados</th>
                <th>Voz Avançada</th>
                <th>Digital/TI</th>
                <th>Pontos</th>
              </tr>
            </thead>
            <tbody>
              {resultadosMensais.map((r, index) => (
                <tr key={index}>
                  <td>{r.mes.toString().padStart(2, '0')}/{r.ano}</td>
                  <td>{formatarMoeda(r.receitaDadosAvancados)}</td>
                  <td>{formatarMoeda(r.receitaVozAvancada)}</td>
                  <td>{formatarMoeda(r.receitaDigitalTI)}</td>
                  <td className="points-cell">{formatarPontuacao(r.pontosTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
