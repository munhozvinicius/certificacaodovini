import { useState } from 'react';
import type { ResultadoCiclo, RegistroVenda, FaixaReceita } from '../types/certification';
import {
  getNomeClassificacao,
  formatarMoeda,
  formatarPontuacao,
  calcularPontosPorFaixa
} from '../utils/calculoCertificacao';
import {
  FAIXAS_DADOS_AVANCADOS,
  FAIXAS_VOZ_AVANCADA,
  FAIXAS_DIGITAL_TI,
  FAIXAS_NOVOS_PRODUTOS,
  FAIXAS_LOCACAO_EQUIPAMENTOS,
  FAIXAS_LICENCAS,
  CLASSIFICACOES
} from '../types/certification';
import {
  TrendingUp,
  DollarSign,
  Award,
  Calendar,
  BarChart3,
  AlertCircle,
  ChevronRight,
  Target
} from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
  resultado: ResultadoCiclo | null;
  vendas: RegistroVenda[];
}

interface FaixaInfo {
  faixaAtual: number;
  pontosAtuais: number;
  receitaAtual: number;
  proximaFaixa: FaixaReceita | null;
  receitaParaProxima: number;
  percentualProgresso: number;
}

function calcularInfoFaixa(receita: number, faixas: FaixaReceita[]): FaixaInfo {
  const pontos = calcularPontosPorFaixa(receita, faixas);

  let faixaAtual = 0;
  let faixaAtualObj: FaixaReceita | null = null;
  let proximaFaixa: FaixaReceita | null = null;

  // Encontra faixa atual
  for (let i = 0; i < faixas.length; i++) {
    if (receita >= faixas[i].receitaMinima && receita < faixas[i].receitaMaxima) {
      faixaAtual = faixas[i].faixa;
      faixaAtualObj = faixas[i];
      if (i < faixas.length - 1) {
        proximaFaixa = faixas[i + 1];
      }
      break;
    }
  }

  // Se está na última faixa
  if (receita >= faixas[faixas.length - 1].receitaMinima) {
    faixaAtual = faixas[faixas.length - 1].faixa;
    faixaAtualObj = faixas[faixas.length - 1];
    proximaFaixa = null;
  }

  const receitaParaProxima = proximaFaixa
    ? proximaFaixa.receitaMinima - receita
    : 0;

  const percentualProgresso = faixaAtualObj
    ? ((receita - faixaAtualObj.receitaMinima) /
       (faixaAtualObj.receitaMaxima - faixaAtualObj.receitaMinima)) * 100
    : 0;

  return {
    faixaAtual,
    pontosAtuais: pontos,
    receitaAtual: receita,
    proximaFaixa,
    receitaParaProxima,
    percentualProgresso: Math.min(100, percentualProgresso)
  };
}

function getMesNome(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes - 1];
}

export default function Dashboard({ resultado, vendas }: DashboardProps) {
  const [mesSelecionado, setMesSelecionado] = useState<number>(0);

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

  // Pega resultado mensal selecionado ou último com dados
  const resultadoMensal = mesSelecionado < resultadosMensais.length
    ? resultadosMensais[mesSelecionado]
    : resultadosMensais[resultadosMensais.length - 1];

  // Calcula receita total
  const receitaTotal = resultadosMensais.reduce((acc, r) =>
    acc + r.receitaDadosAvancados + r.receitaVozAvancada + r.receitaDigitalTI +
    r.receitaNovosProdutos + r.receitaLocacaoEquipamentos + r.receitaLicencas, 0
  );

  // Calcula info de faixas para o mês selecionado
  const infoDadosAvancados = calcularInfoFaixa(resultadoMensal.receitaDadosAvancados, FAIXAS_DADOS_AVANCADOS);
  const infoVozAvancada = calcularInfoFaixa(resultadoMensal.receitaVozAvancada, FAIXAS_VOZ_AVANCADA);
  const infoDigitalTI = calcularInfoFaixa(resultadoMensal.receitaDigitalTI, FAIXAS_DIGITAL_TI);
  const infoNovosProdutos = calcularInfoFaixa(resultadoMensal.receitaNovosProdutos, FAIXAS_NOVOS_PRODUTOS);
  const infoLocacao = calcularInfoFaixa(resultadoMensal.receitaLocacaoEquipamentos, FAIXAS_LOCACAO_EQUIPAMENTOS);
  const infoLicencas = calcularInfoFaixa(resultadoMensal.receitaLicencas, FAIXAS_LICENCAS);

  // Encontra próxima classificação
  const classificacaoAtualIndex = CLASSIFICACOES.findIndex(c => c.classificacao === classificacao);
  const proximaClassificacao = classificacaoAtualIndex < CLASSIFICACOES.length - 1
    ? CLASSIFICACOES[classificacaoAtualIndex + 1]
    : null;

  return (
    <div className="dashboard-container fade-in">
      {/* Header com período e seletor de mês */}
      <div className="dashboard-header glass-card">
        <div className="period-info">
          <Calendar size={32} />
          <div>
            <h2>Certificação Especialista Vivo</h2>
            <p>Período: Julho/2025 - Dezembro/2025 (2º Ciclo)</p>
          </div>
        </div>

        <div className="month-selector">
          <label>Visualizar mês:</label>
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(Number(e.target.value))}
          >
            {resultadosMensais.map((r, idx) => (
              <option key={idx} value={idx}>
                {getMesNome(r.mes)}/{r.ano}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Resumo Geral */}
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
            <div>Bônus: {bonusPercentual}%</div>
            {proximaClassificacao && (
              <div className="next-tier">
                <TrendingUp size={14} />
                Próximo: {getNomeClassificacao(proximaClassificacao.classificacao)}
                ({proximaClassificacao.pontuacaoMinima - Math.floor(pontuacaoMedia)} pts)
              </div>
            )}
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <TrendingUp size={24} />
            <h3>Pontuação</h3>
          </div>
          <div className="card-value text-gradient">
            {formatarPontuacao(pontuacaoMedia)}
          </div>
          <div className="card-footer">
            Média do Ciclo
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
            {vendas.length} vendas no ciclo
          </div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <Target size={24} />
            <h3>Pontos ({getMesNome(resultadoMensal.mes)})</h3>
          </div>
          <div className="card-value text-gradient">
            {formatarPontuacao(resultadoMensal.pontosTotal)}
          </div>
          <div className="card-footer">
            {formatarMoeda(
              resultadoMensal.receitaDadosAvancados +
              resultadoMensal.receitaVozAvancada +
              resultadoMensal.receitaDigitalTI +
              resultadoMensal.receitaNovosProdutos +
              resultadoMensal.receitaLocacaoEquipamentos +
              resultadoMensal.receitaLicencas
            )}
          </div>
        </div>
      </div>

      {/* Detalhes por Produto - Mês Selecionado */}
      <div className="product-details">
        <h2 className="section-title">
          Performance por Produto - {getMesNome(resultadoMensal.mes)}/{resultadoMensal.ano}
        </h2>

        {/* Dados Avançados */}
        <ProductCard
          titulo="Dados Avançados"
          cor="#3b82f6"
          info={infoDadosAvancados}
        />

        {/* Voz Avançada */}
        <ProductCard
          titulo="Voz Avançada + VVN"
          cor="#8b5cf6"
          info={infoVozAvancada}
        />

        {/* Digital/TI */}
        <ProductCard
          titulo="Digital/TI"
          cor="#10b981"
          info={infoDigitalTI}
        />

        {/* Produtos Extras */}
        <div className="extra-products">
          <h3>Produtos Extras</h3>

          <ProductCardCompact
            titulo="Novos Produtos"
            cor="#f59e0b"
            info={infoNovosProdutos}
          />

          <ProductCardCompact
            titulo="Locação de Equipamentos"
            cor="#ec4899"
            info={infoLocacao}
          />

          <ProductCardCompact
            titulo="Licenças"
            cor="#6366f1"
            info={infoLicencas}
          />
        </div>
      </div>

      {/* Tabela de Resultados Mensais */}
      <div className="monthly-results glass-card">
        <h3>Histórico Completo do Ciclo</h3>
        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Mês</th>
                <th>Dados Avanç.</th>
                <th>Voz Avanç.</th>
                <th>Digital/TI</th>
                <th>Extras</th>
                <th>Receita Total</th>
                <th>Pontos</th>
              </tr>
            </thead>
            <tbody>
              {resultadosMensais.map((r, index) => (
                <tr
                  key={index}
                  className={index === mesSelecionado ? 'selected-month' : ''}
                  onClick={() => setMesSelecionado(index)}
                >
                  <td><strong>{getMesNome(r.mes)}/{r.ano}</strong></td>
                  <td>{formatarMoeda(r.receitaDadosAvancados)}</td>
                  <td>{formatarMoeda(r.receitaVozAvancada)}</td>
                  <td>{formatarMoeda(r.receitaDigitalTI)}</td>
                  <td>
                    {formatarMoeda(
                      r.receitaNovosProdutos +
                      r.receitaLocacaoEquipamentos +
                      r.receitaLicencas
                    )}
                  </td>
                  <td>
                    <strong>
                      {formatarMoeda(
                        r.receitaDadosAvancados +
                        r.receitaVozAvancada +
                        r.receitaDigitalTI +
                        r.receitaNovosProdutos +
                        r.receitaLocacaoEquipamentos +
                        r.receitaLicencas
                      )}
                    </strong>
                  </td>
                  <td className="points-cell">
                    <strong>{formatarPontuacao(r.pontosTotal)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente de Card de Produto (Principal)
function ProductCard({ titulo, cor, info }: {
  titulo: string;
  cor: string;
  info: FaixaInfo;
}) {
  return (
    <div className="product-card glass-card" style={{ borderLeftColor: cor }}>
      <div className="product-header">
        <div>
          <h3 style={{ color: cor }}>{titulo}</h3>
          <p className="product-revenue">{formatarMoeda(info.receitaAtual)}</p>
        </div>
        <div className="product-points">
          <Award size={32} style={{ color: cor }} />
          <span>{formatarPontuacao(info.pontosAtuais)} pts</span>
        </div>
      </div>

      <div className="faixa-info">
        <div className="faixa-atual">
          <span className="label">Faixa Atual:</span>
          <span className="value">Faixa {info.faixaAtual}</span>
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${info.percentualProgresso}%`,
              backgroundColor: cor
            }}
          />
        </div>

        {info.proximaFaixa ? (
          <div className="proxima-faixa">
            <ChevronRight size={16} />
            <span>
              Falta <strong>{formatarMoeda(info.receitaParaProxima)}</strong> para
              Faixa {info.proximaFaixa.faixa} ({info.proximaFaixa.pontos} pts)
            </span>
          </div>
        ) : (
          <div className="proxima-faixa max-tier">
            <Award size={16} />
            <span>Faixa máxima atingida!</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de Card Compacto (Extras)
function ProductCardCompact({ titulo, cor, info }: {
  titulo: string;
  cor: string;
  info: FaixaInfo;
}) {
  return (
    <div className="product-card-compact glass-card" style={{ borderLeftColor: cor }}>
      <div className="compact-header">
        <h4 style={{ color: cor }}>{titulo}</h4>
        <div className="compact-stats">
          <span className="revenue">{formatarMoeda(info.receitaAtual)}</span>
          <span className="points" style={{ color: cor }}>
            {formatarPontuacao(info.pontosAtuais)} pts
          </span>
        </div>
      </div>

      <div className="compact-faixa">
        <span>Faixa {info.faixaAtual}</span>
        {info.proximaFaixa && (
          <span className="next-info">
            Próxima: {formatarMoeda(info.receitaParaProxima)}
          </span>
        )}
      </div>
    </div>
  );
}
