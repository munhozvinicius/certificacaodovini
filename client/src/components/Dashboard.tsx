import { useState } from 'react';
import type { ResultadoCiclo, RegistroVenda, FaixaReceita, ResultadoMensal } from '../types/certification';
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
  ChevronDown,
  Target,
  X,
  Package,
  FileText
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

  if (receita >= faixas[faixas.length - 1].receitaMinima) {
    faixaAtual = faixas[faixas.length - 1].faixa;
    faixaAtualObj = faixas[faixas.length - 1];
    proximaFaixa = null;
  }

  const receitaParaProxima = proximaFaixa ? proximaFaixa.receitaMinima - receita : 0;
  const percentualProgresso = faixaAtualObj
    ? ((receita - faixaAtualObj.receitaMinima) / (faixaAtualObj.receitaMaxima - faixaAtualObj.receitaMinima)) * 100
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
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return meses[mes - 1];
}

export default function Dashboard({ resultado, vendas }: DashboardProps) {
  const [mesExpandido, setMesExpandido] = useState<number | null>(null);
  const [parceiroFiltro, setParceiroFiltro] = useState<'TODOS' | 'SAFE_TI' | 'TECH'>('TODOS');
  const [produtoSelecionado, setProdutoSelecionado] = useState<{
    mes: number;
    categoria: string;
    pedidos: RegistroVenda[];
  } | null>(null);

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

  // Filtra vendas por parceiro
  const vendasFiltradas = parceiroFiltro === 'TODOS'
    ? vendas
    : vendas.filter(v => v.parceiro === parceiroFiltro);

  // Conta vendas por parceiro
  const vendasSafeTI = vendas.filter(v => v.parceiro === 'SAFE_TI').length;
  const vendasTech = vendas.filter(v => v.parceiro === 'TECH').length;

  // Recalcula resultados mensais com vendas filtradas
  const resultadosMensaisFiltrados = resultadosMensais.map(resMes => {
    // Filtra vendas deste mês
    const vendasDoMes = vendasFiltradas.filter(v => {
      const vMes = v.dataAtivacao.getMonth() + 1;
      const vAno = v.dataAtivacao.getFullYear();
      return vMes === resMes.mes && vAno === resMes.ano;
    });

    // Recalcula receitas por categoria
    const receitas = {
      dadosAvancados: 0,
      vozAvancada: 0,
      digitalTI: 0,
      novosProdutos: 0,
      locacao: 0,
      licencas: 0
    };

    vendasDoMes.forEach(v => {
      const valor = v.valorBrutoSN;
      switch (v.categoria) {
        case 'DADOS_AVANCADOS': receitas.dadosAvancados += valor; break;
        case 'VOZ_AVANCADA': receitas.vozAvancada += valor; break;
        case 'DIGITAL_TI': receitas.digitalTI += valor; break;
        case 'NOVOS_PRODUTOS': receitas.novosProdutos += valor; break;
        case 'LOCACAO_EQUIPAMENTOS': receitas.locacao += valor; break;
        case 'LICENCAS': receitas.licencas += valor; break;
      }
    });

    // Recalcula pontos (usando as mesmas funções do cálculo original)
    const pontosDadosAvancados = calcularPontosPorFaixa(receitas.dadosAvancados, FAIXAS_DADOS_AVANCADOS);
    const pontosVozAvancada = calcularPontosPorFaixa(receitas.vozAvancada, FAIXAS_VOZ_AVANCADA);
    const pontosDigitalTI = calcularPontosPorFaixa(receitas.digitalTI, FAIXAS_DIGITAL_TI);
    const pontosNovosProdutos = calcularPontosPorFaixa(receitas.novosProdutos, FAIXAS_NOVOS_PRODUTOS);
    const pontosLocacao = calcularPontosPorFaixa(receitas.locacao, FAIXAS_LOCACAO_EQUIPAMENTOS);
    const pontosLicencas = calcularPontosPorFaixa(receitas.licencas, FAIXAS_LICENCAS);

    return {
      mes: resMes.mes,
      ano: resMes.ano,
      receitaDadosAvancados: receitas.dadosAvancados,
      receitaVozAvancada: receitas.vozAvancada,
      receitaDigitalTI: receitas.digitalTI,
      receitaNovosProdutos: receitas.novosProdutos,
      receitaLocacaoEquipamentos: receitas.locacao,
      receitaLicencas: receitas.licencas,
      pontosDadosAvancados,
      pontosVozAvancada,
      pontosDigitalTI,
      pontosNovosProdutos,
      pontosLocacaoEquipamentos: pontosLocacao,
      pontosLicencas,
      pontosTotal: pontosDadosAvancados + pontosVozAvancada + pontosDigitalTI + pontosNovosProdutos + pontosLocacao + pontosLicencas
    };
  });

  // Calcula receita total (filtrada)
  const receitaTotal = vendasFiltradas.reduce((acc, v) => acc + v.valorBrutoSN, 0);

  // Encontra próxima classificação
  const classificacaoAtualIndex = CLASSIFICACOES.findIndex(c => c.classificacao === classificacao);
  const proximaClassificacao = classificacaoAtualIndex < CLASSIFICACOES.length - 1
    ? CLASSIFICACOES[classificacaoAtualIndex + 1]
    : null;

  // Função para pegar pedidos por categoria e mês (com filtro de parceiro)
  const getPedidosPorCategoria = (mes: number, ano: number, categoria: string) => {
    console.log(`[GET PEDIDOS] Buscando pedidos - Mês: ${mes}, Ano: ${ano}, Categoria: ${categoria}, Parceiro: ${parceiroFiltro}`);
    const pedidos = vendasFiltradas.filter(v => {
      const vMes = v.dataAtivacao.getMonth() + 1;
      const vAno = v.dataAtivacao.getFullYear();
      const match = vMes === mes && vAno === ano && v.categoria === categoria;
      if (match) {
        console.log(`  ✓ Match: ${v.nomeCliente} - ${v.produto} - R$ ${v.valorBrutoSN}`);
      }
      return match;
    });
    console.log(`[GET PEDIDOS] Total encontrado: ${pedidos.length}`);
    return pedidos;
  };

  return (
    <div className="dashboard-container fade-in">
      {/* Header */}
      <div className="dashboard-header glass-card">
        <div className="period-info">
          <Calendar size={32} />
          <div>
            <h2>Certificação Especialista Vivo</h2>
            <p>Período: Julho/2025 - Dezembro/2025 (2º Ciclo)</p>
          </div>
        </div>

        <div className="partner-filter">
          <label>Parceiro:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${parceiroFiltro === 'TODOS' ? 'active' : ''}`}
              onClick={() => setParceiroFiltro('TODOS')}
            >
              Todos ({vendas.length})
            </button>
            <button
              className={`filter-btn ${parceiroFiltro === 'SAFE_TI' ? 'active' : ''}`}
              onClick={() => setParceiroFiltro('SAFE_TI')}
            >
              SAFE-TI ({vendasSafeTI})
            </button>
            <button
              className={`filter-btn ${parceiroFiltro === 'TECH' ? 'active' : ''}`}
              onClick={() => setParceiroFiltro('TECH')}
            >
              JLC TECH ({vendasTech})
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo Geral */}
      <div className="summary-cards">
        <div className="summary-card glass-card">
          <div className="card-header">
            <Award size={24} />
            <h3>Classificação</h3>
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
            <Target size={24} />
            <h3>Pontuação Média</h3>
          </div>
          <div className="card-value text-gradient">
            {formatarPontuacao(pontuacaoMedia)}
          </div>
          <div className="card-footer">Média do ciclo</div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <DollarSign size={24} />
            <h3>Receita Total</h3>
          </div>
          <div className="card-value text-gradient">
            {formatarMoeda(receitaTotal)}
          </div>
          <div className="card-footer">{vendasFiltradas.length} vendas</div>
        </div>
      </div>

      {/* Cards Mensais Compactos */}
      <div className="monthly-cards-container">
        <h2 className="section-title">
          <BarChart3 size={24} />
          Performance Mensal
        </h2>

        <div className="monthly-cards-grid">
          {resultadosMensaisFiltrados.map((mes, idx) => (
            <MonthCard
              key={idx}
              mes={mes}
              isExpanded={mesExpandido === idx}
              onToggle={() => setMesExpandido(mesExpandido === idx ? null : idx)}
              onProductClick={(categoria) => {
                const pedidos = getPedidosPorCategoria(mes.mes, mes.ano, categoria);
                setProdutoSelecionado({ mes: mes.mes, categoria, pedidos });
              }}
            />
          ))}
        </div>
      </div>

      {/* Modal de Pedidos */}
      {produtoSelecionado && (
        <PedidosModal
          mes={produtoSelecionado.mes}
          categoria={produtoSelecionado.categoria}
          pedidos={produtoSelecionado.pedidos}
          onClose={() => setProdutoSelecionado(null)}
        />
      )}
    </div>
  );
}

// Componente de Card Mensal
function MonthCard({
  mes,
  isExpanded,
  onToggle,
  onProductClick
}: {
  mes: ResultadoMensal;
  isExpanded: boolean;
  onToggle: () => void;
  onProductClick: (categoria: string) => void;
}) {
  const receitaTotal = mes.receitaDadosAvancados + mes.receitaVozAvancada + mes.receitaDigitalTI +
    mes.receitaNovosProdutos + mes.receitaLocacaoEquipamentos + mes.receitaLicencas;

  const produtos = [
    { nome: 'Dados Avançados', categoria: 'DADOS_AVANCADOS', receita: mes.receitaDadosAvancados, pontos: mes.pontosDadosAvancados, cor: '#3b82f6', faixas: FAIXAS_DADOS_AVANCADOS },
    { nome: 'Voz Avançada', categoria: 'VOZ_AVANCADA', receita: mes.receitaVozAvancada, pontos: mes.pontosVozAvancada, cor: '#8b5cf6', faixas: FAIXAS_VOZ_AVANCADA },
    { nome: 'Digital/TI', categoria: 'DIGITAL_TI', receita: mes.receitaDigitalTI, pontos: mes.pontosDigitalTI, cor: '#10b981', faixas: FAIXAS_DIGITAL_TI },
    { nome: 'Novos Produtos', categoria: 'NOVOS_PRODUTOS', receita: mes.receitaNovosProdutos, pontos: mes.pontosNovosProdutos, cor: '#f59e0b', faixas: FAIXAS_NOVOS_PRODUTOS },
    { nome: 'Locação', categoria: 'LOCACAO_EQUIPAMENTOS', receita: mes.receitaLocacaoEquipamentos, pontos: mes.pontosLocacaoEquipamentos, cor: '#ec4899', faixas: FAIXAS_LOCACAO_EQUIPAMENTOS },
    { nome: 'Licenças', categoria: 'LICENCAS', receita: mes.receitaLicencas, pontos: mes.pontosLicencas, cor: '#6366f1', faixas: FAIXAS_LICENCAS }
  ];

  return (
    <div className={`month-card glass-card ${isExpanded ? 'expanded' : ''}`}>
      {/* Header compacto */}
      <div className="month-card-header" onClick={onToggle}>
        <div className="month-info">
          <h3>{getMesNome(mes.mes)}/{mes.ano}</h3>
          <div className="month-stats">
            <span className="revenue">{formatarMoeda(receitaTotal)}</span>
            <span className="points">{formatarPontuacao(mes.pontosTotal)} pts</span>
          </div>
        </div>
        <div className="expand-icon">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="month-card-content">
          <div className="products-grid">
            {produtos.map((prod, idx) => {
              const info = calcularInfoFaixa(prod.receita, prod.faixas);
              return (
                <div
                  key={idx}
                  className="product-mini-card"
                  style={{ borderLeftColor: prod.cor }}
                  onClick={() => onProductClick(prod.categoria)}
                >
                  <div className="product-mini-header">
                    <h4 style={{ color: prod.cor }}>{prod.nome}</h4>
                    <Package size={16} style={{ color: prod.cor }} />
                  </div>
                  <div className="product-mini-stats">
                    <div className="stat">
                      <span className="label">Receita</span>
                      <span className="value">{formatarMoeda(prod.receita)}</span>
                    </div>
                    <div className="stat">
                      <span className="label">Pontos</span>
                      <span className="value" style={{ color: prod.cor }}>
                        {formatarPontuacao(prod.pontos)}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="label">Faixa</span>
                      <span className="value">F{info.faixaAtual}</span>
                    </div>
                  </div>
                  {info.proximaFaixa && (
                    <div className="product-mini-progress">
                      <div className="progress-bar-mini">
                        <div
                          className="progress-fill-mini"
                          style={{
                            width: `${info.percentualProgresso}%`,
                            backgroundColor: prod.cor
                          }}
                        />
                      </div>
                      <span className="next-target">
                        {formatarMoeda(info.receitaParaProxima)} para F{info.proximaFaixa.faixa}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Modal de Pedidos
function PedidosModal({
  mes,
  categoria,
  pedidos,
  onClose
}: {
  mes: number;
  categoria: string;
  pedidos: RegistroVenda[];
  onClose: () => void;
}) {
  const nomesCategoria: Record<string, string> = {
    'DADOS_AVANCADOS': 'Dados Avançados',
    'VOZ_AVANCADA': 'Voz Avançada + VVN',
    'DIGITAL_TI': 'Digital/TI',
    'NOVOS_PRODUTOS': 'Novos Produtos',
    'LOCACAO_EQUIPAMENTOS': 'Locação de Equipamentos',
    'LICENCAS': 'Licenças'
  };

  const receitaTotal = pedidos.reduce((acc, p) => acc + p.valorBrutoSN, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>
              <FileText size={24} />
              {nomesCategoria[categoria]} - {getMesNome(mes)}
            </h2>
            <p>{pedidos.length} pedidos • Receita total: {formatarMoeda(receitaTotal)}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="pedidos-table-container">
            <table className="pedidos-table">
              <thead>
                <tr>
                  <th>Pedido SN</th>
                  <th>Cliente</th>
                  <th>Produto</th>
                  <th>Data Ativação</th>
                  <th>Valor Bruto</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td><strong>{pedido.pedidoSN}</strong></td>
                    <td>
                      <div className="client-info">
                        <span className="client-name">{pedido.nomeCliente}</span>
                        <span className="client-cnpj">{pedido.cnpj}</span>
                      </div>
                    </td>
                    <td>{pedido.produto}</td>
                    <td>{pedido.dataAtivacao.toLocaleDateString('pt-BR')}</td>
                    <td><strong>{formatarMoeda(pedido.valorBrutoSN)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
