import { useState } from 'react';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import type { ResultadoCiclo } from '../types/certification';
import { CLASSIFICACOES } from '../types/certification';
import { simularMeta, getNomeClassificacao, formatarMoeda, formatarPontuacao } from '../utils/calculoCertificacao';
import './Simulador.css';

interface SimuladorProps {
  resultado: ResultadoCiclo | null;
}

export default function Simulador({ resultado }: SimuladorProps) {
  const [metaSelecionada, setMetaSelecionada] = useState<number>(3500); // Prata
  const [mesesRestantes, setMesesRestantes] = useState<number>(3);

  if (!resultado) {
    return (
      <div className="simulador-empty fade-in">
        <div className="empty-state glass-card">
          <AlertCircle size={64} className="empty-icon" />
          <h2>Nenhum Dado Disponível</h2>
          <p>Importe suas planilhas primeiro para usar o simulador</p>
        </div>
      </div>
    );
  }

  const mediaMensalAtual = resultado.pontuacaoMedia;
  const receitaMediaMensal =
    resultado.resultadosMensais.reduce((acc, r) =>
      acc + r.receitaDadosAvancados + r.receitaVozAvancada + r.receitaDigitalTI, 0
    ) / resultado.resultadosMensais.length;

  const simulacao = simularMeta({
    metaPontuacao: metaSelecionada,
    mesesRestantes,
    mediaMensalAtual,
    receitaMediaMensal
  });

  return (
    <div className="simulador-container fade-in">
      <div className="simulador-header glass-card">
        <Target size={32} className="header-icon" />
        <h2 className="text-gradient">Simulador de Metas</h2>
        <p>Calcule o que é necessário para atingir sua meta de certificação</p>
      </div>

      <div className="simulador-grid">
        {/* Configurações */}
        <div className="config-card glass-card">
          <h3>Configurações</h3>

          <div className="form-group">
            <label>Meta de Classificação</label>
            <select
              className="select"
              value={metaSelecionada}
              onChange={(e) => setMetaSelecionada(Number(e.target.value))}
            >
              {CLASSIFICACOES.filter(c => c.classificacao !== 'NAO_CERTIFICADO').map(c => (
                <option key={c.classificacao} value={c.pontuacaoMinima}>
                  {getNomeClassificacao(c.classificacao)} ({c.pontuacaoMinima}+ pontos)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Meses Restantes no Ciclo</label>
            <input
              type="number"
              className="input"
              min="1"
              max="6"
              value={mesesRestantes}
              onChange={(e) => setMesesRestantes(Number(e.target.value))}
            />
          </div>

          <div className="current-stats">
            <div className="stat-item">
              <span className="stat-label">Pontuação Atual</span>
              <span className="stat-value">{formatarPontuacao(mediaMensalAtual)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Receita Média Mensal</span>
              <span className="stat-value">{formatarMoeda(receitaMediaMensal)}</span>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="results-card glass-card">
          <h3>Resultados da Simulação</h3>

          <div className="result-item">
            <span className="result-label">Meta de Pontuação</span>
            <span className="result-value text-gradient">
              {formatarPontuacao(simulacao.metaPontuacao)}
            </span>
          </div>

          <div className="result-item">
            <span className="result-label">Pontos Necessários</span>
            <span className="result-value">
              {formatarPontuacao(simulacao.pontosNecessarios)}
            </span>
          </div>

          <div className="result-item">
            <span className="result-label">Pontos por Mês</span>
            <span className="result-value">
              {formatarPontuacao(simulacao.pontosPorMes)}
            </span>
          </div>

          <div className="result-item">
            <span className="result-label">Receita Necessária/Mês</span>
            <span className="result-value">
              {formatarMoeda(simulacao.receitaNecessariaMensal)}
            </span>
          </div>

          <div className="probability-card">
            <div className="probability-label">Probabilidade de Sucesso</div>
            <div className="probability-bar">
              <div
                className="probability-fill"
                style={{ width: `${simulacao.probabilidadeSucesso}%` }}
              />
            </div>
            <div className="probability-value">
              {simulacao.probabilidadeSucesso.toFixed(0)}%
            </div>
          </div>

          <div className="projected-class">
            <TrendingUp size={20} />
            <span>Classificação Projetada:</span>
            <span className={`badge badge-${simulacao.classificacaoProjetada.toLowerCase().replace('_', '-')}`}>
              {getNomeClassificacao(simulacao.classificacaoProjetada)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
