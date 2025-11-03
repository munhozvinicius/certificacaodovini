import { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Award,
  Calendar,
  BarChart3,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Target
} from 'lucide-react';
import type { ResultadoCiclo, RegistroVenda } from '../types/certification';
import { CLASSIFICACOES, PARCEIRO_LABELS, PARCEIROS_VIVO } from '../types/certification';
import {
  getNomeClassificacao,
  formatarMoeda,
  formatarPontuacao,
  agruparVendasPorMes,
  calcularResultadoMensal
} from '../utils/calculoCertificacao';
import {
  VISAO_PARCEIRO_OPCOES,
  type VisaoParceiro,
  obterRotuloParceiro,
  normalizarParceiroValor
} from '../utils/parceiros';
import {
  FAIXAS_DADOS_AVANCADOS,
  FAIXAS_VOZ_AVANCADA,
  FAIXAS_DIGITAL_TI,
  FAIXAS_NOVOS_PRODUTOS,
  FAIXAS_LOCACAO_EQUIPAMENTOS,
  FAIXAS_LICENCAS,
  type FaixaReceita
} from '../types/certification';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import './Dashboard.css';

interface DashboardProps {
  resultado: ResultadoCiclo | null;
  vendas: RegistroVenda[];
}

type CategoriaResumo = {
  chave: RegistroVenda['categoria'];
  titulo: string;
  receita: number;
  pontos: number;
  faixaAtual: FaixaReceita;
  proximaFaixa: FaixaReceita | null;
  faltaParaProxima: number;
  progresso: number;
  vendas: RegistroVenda[];
};

type AlertaDashboard = {
  tipo: 'info' | 'risco';
  mensagem: string;
};

const CATEGORIAS_CONFIG: Record<RegistroVenda['categoria'], { titulo: string; faixas: FaixaReceita[] }> = {
  DADOS_AVANCADOS: { titulo: 'Dados Avançados', faixas: FAIXAS_DADOS_AVANCADOS },
  VOZ_AVANCADA: { titulo: 'Voz Avançada', faixas: FAIXAS_VOZ_AVANCADA },
  DIGITAL_TI: { titulo: 'Digital / TI', faixas: FAIXAS_DIGITAL_TI },
  NOVOS_PRODUTOS: { titulo: 'Novos Produtos', faixas: FAIXAS_NOVOS_PRODUTOS },
  LOCACAO_EQUIPAMENTOS: { titulo: 'Locação de Equipamentos', faixas: FAIXAS_LOCACAO_EQUIPAMENTOS },
  LICENCAS: { titulo: 'Licenças', faixas: FAIXAS_LICENCAS }
};

const TORRE_LABELS: Record<RegistroVenda['torre'], string> = {
  AVANCADOS: 'Avançados',
  TI_GUD: 'TI / GUD',
  TECH: 'Tech'
};

function obterFaixaAtual(receita: number, faixas: FaixaReceita[]): FaixaReceita {
  const padrao = faixas[0];
  for (const faixa of faixas) {
    if (receita >= faixa.receitaMinima && receita < faixa.receitaMaxima) {
      return faixa;
    }
  }
  return faixas[faixas.length - 1] ?? padrao;
}

function calcularProgressoCategoria(receita: number, faixas: FaixaReceita[]): {
  faixaAtual: FaixaReceita;
  proximaFaixa: FaixaReceita | null;
  faltaParaProxima: number;
  progresso: number;
} {
  const faixaAtual = obterFaixaAtual(receita, faixas);
  const indiceAtual = faixas.findIndex(f => f.faixa === faixaAtual.faixa);
  const proximaFaixa = indiceAtual >= 0 && indiceAtual < faixas.length - 1 ? faixas[indiceAtual + 1] : null;

  if (!proximaFaixa) {
    return {
      faixaAtual,
      proximaFaixa: null,
      faltaParaProxima: 0,
      progresso: 1
    };
  }

  const limiteSuperior = proximaFaixa.receitaMinima;
  const intervalo = Math.max(1, limiteSuperior - faixaAtual.receitaMinima);
  const progresso = Math.min(1, Math.max(0, (receita - faixaAtual.receitaMinima) / intervalo));
  const faltaParaProxima = Math.max(0, limiteSuperior - receita);

  return {
    faixaAtual,
    proximaFaixa,
    faltaParaProxima,
    progresso
  };
}

function obterNomeMes(mes: number, ano: number): string {
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });
}

function formatarChaveMes(ano: number, mes: number): string {
  return `${ano}-${mes.toString().padStart(2, '0')}`;
}

function formatarNomeParceiro(parceiro: RegistroVenda['parceiro']): string {
  return PARCEIRO_LABELS[normalizarParceiroValor(parceiro)];
}

export default function Dashboard({ resultado, vendas }: DashboardProps) {
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);
  const [categoriaAberta, setCategoriaAberta] = useState<RegistroVenda['categoria'] | null>(null);
  const [visaoParceiro, setVisaoParceiro] = useState<VisaoParceiro>('TODOS');
  const [detalhesMensaisAbertos, setDetalhesMensaisAbertos] = useState(false);

  useEffect(() => {
    if (!resultado) {
      setMesSelecionado(null);
      return;
    }

    if (resultado.resultadosMensais.length === 0) {
      setMesSelecionado(null);
      return;
    }

    const ordenados = [...resultado.resultadosMensais].sort((a, b) => {
      const dataA = new Date(a.ano, a.mes - 1, 1).getTime();
      const dataB = new Date(b.ano, b.mes - 1, 1).getTime();
      return dataA - dataB;
    });

    const ultimo = ordenados[ordenados.length - 1];
    setMesSelecionado(formatarChaveMes(ultimo.ano, ultimo.mes));
  }, [resultado]);

  useEffect(() => {
    setDetalhesMensaisAbertos(false);
  }, [mesSelecionado]);

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

  const receitaTotalCiclo = resultadosMensais.reduce((acc, r) =>
    acc + r.receitaDadosAvancados + r.receitaVozAvancada + r.receitaDigitalTI +
    r.receitaNovosProdutos + r.receitaLocacaoEquipamentos + r.receitaLicencas, 0
  );

  const pontuacaoTotalCiclo = resultadosMensais.reduce((acc, r) => acc + r.pontosTotal, 0);

  const mesesDisponiveis = useMemo(() => resultadosMensais
    .map(r => ({
      chave: formatarChaveMes(r.ano, r.mes),
      mes: r.mes,
      ano: r.ano,
      nome: obterNomeMes(r.mes, r.ano)
    }))
    .sort((a, b) => new Date(a.ano, a.mes - 1).getTime() - new Date(b.ano, b.mes - 1).getTime()), [resultadosMensais]);

  const resumoMensalSelecionado = useMemo(() => {
    if (!mesSelecionado) return null;
    return resultadosMensais.find(r => formatarChaveMes(r.ano, r.mes) === mesSelecionado) ?? null;
  }, [mesSelecionado, resultadosMensais]);

  const vendasNormalizadas = useMemo(
    () => vendas.map(venda => ({ ...venda, parceiro: normalizarParceiroValor(venda.parceiro) })),
    [vendas]
  );

  const vendasPorMes = useMemo(() => agruparVendasPorMes(vendasNormalizadas), [vendasNormalizadas]);

  const vendasDoMesSelecionado = useMemo(() => {
    if (!mesSelecionado) return [] as RegistroVenda[];
    return vendasNormalizadas.filter(venda =>
      formatarChaveMes(venda.dataAtivacao.getFullYear(), venda.dataAtivacao.getMonth() + 1) === mesSelecionado
    );
  }, [mesSelecionado, vendasNormalizadas]);

  const vendasDoMesFiltradas = useMemo(() => {
    if (visaoParceiro === 'TODOS') {
      return vendasDoMesSelecionado;
    }
    return vendasDoMesSelecionado.filter(venda => venda.parceiro === visaoParceiro);
  }, [visaoParceiro, vendasDoMesSelecionado]);

  const resumoMensalFiltrado = useMemo(() => {
    if (!mesSelecionado) return null;
    const [anoStr, mesStr] = mesSelecionado.split('-');
    const anoNumero = Number(anoStr);
    const mesNumero = Number(mesStr);
    return calcularResultadoMensal(mesNumero, anoNumero, vendasDoMesFiltradas);
  }, [mesSelecionado, vendasDoMesFiltradas]);

  const timelineData = useMemo(() => resultadosMensais.map(r => {
    const chave = formatarChaveMes(r.ano, r.mes);
    const vendasMes = vendasPorMes.get(chave) ?? [];
    const vendasVisao = visaoParceiro === 'TODOS'
      ? vendasMes
      : vendasMes.filter(venda => venda.parceiro === visaoParceiro);
    const calculado = calcularResultadoMensal(r.mes, r.ano, vendasVisao);
    return {
      mes: `${r.mes.toString().padStart(2, '0')}/${r.ano}`,
      dadosAvancados: calculado.receitaDadosAvancados,
      vozAvancada: calculado.receitaVozAvancada,
      digitalTI: calculado.receitaDigitalTI,
      total:
        calculado.receitaDadosAvancados +
        calculado.receitaVozAvancada +
        calculado.receitaDigitalTI +
        calculado.receitaNovosProdutos +
        calculado.receitaLocacaoEquipamentos +
        calculado.receitaLicencas
    };
  }), [resultadosMensais, vendasPorMes, visaoParceiro]);

  const resumoParceiros = useMemo(() => {
    return PARCEIROS_VIVO.map(parceiro => {
      const vendasParceiro = vendasDoMesSelecionado.filter(venda => venda.parceiro === parceiro);
      const receita = vendasParceiro.reduce((acc, venda) => acc + venda.valorBrutoSN, 0);
      return {
        parceiro,
        receita,
        pedidos: vendasParceiro.length
      };
    }).sort((a, b) => b.receita - a.receita);
  }, [vendasDoMesSelecionado]);

  const produtosResumo = useMemo(() => {
    const mapa = new Map<string, { produto: string; categoria: RegistroVenda['categoria']; receita: number; pedidos: number }>();
    vendasDoMesFiltradas.forEach(venda => {
      if (!mapa.has(venda.produto)) {
        mapa.set(venda.produto, { produto: venda.produto, categoria: venda.categoria, receita: 0, pedidos: 0 });
      }
      const item = mapa.get(venda.produto)!;
      item.receita += venda.valorBrutoSN;
      item.pedidos += 1;
    });
    return Array.from(mapa.values()).sort((a, b) => b.receita - a.receita).slice(0, 6);
  }, [vendasDoMesFiltradas]);

  const categoriasResumo: CategoriaResumo[] = useMemo(() => {
    if (!resumoMensalFiltrado) return [];

    const base: Array<{ chave: RegistroVenda['categoria']; receita: number; pontos: number }> = [
      { chave: 'DADOS_AVANCADOS', receita: resumoMensalFiltrado.receitaDadosAvancados, pontos: resumoMensalFiltrado.pontosDadosAvancados },
      { chave: 'VOZ_AVANCADA', receita: resumoMensalFiltrado.receitaVozAvancada, pontos: resumoMensalFiltrado.pontosVozAvancada },
      { chave: 'DIGITAL_TI', receita: resumoMensalFiltrado.receitaDigitalTI, pontos: resumoMensalFiltrado.pontosDigitalTI },
      { chave: 'NOVOS_PRODUTOS', receita: resumoMensalFiltrado.receitaNovosProdutos, pontos: resumoMensalFiltrado.pontosNovosProdutos },
      { chave: 'LOCACAO_EQUIPAMENTOS', receita: resumoMensalFiltrado.receitaLocacaoEquipamentos, pontos: resumoMensalFiltrado.pontosLocacaoEquipamentos },
      { chave: 'LICENCAS', receita: resumoMensalFiltrado.receitaLicencas, pontos: resumoMensalFiltrado.pontosLicencas }
    ];

    return base.map(item => {
      const { titulo, faixas } = CATEGORIAS_CONFIG[item.chave];
      const progresso = calcularProgressoCategoria(item.receita, faixas);
      const vendasCategoria = vendasDoMesFiltradas.filter(venda => venda.categoria === item.chave);

      return {
        chave: item.chave,
        titulo,
        receita: item.receita,
        pontos: item.pontos,
        faixaAtual: progresso.faixaAtual,
        proximaFaixa: progresso.proximaFaixa,
        faltaParaProxima: progresso.faltaParaProxima,
        progresso: progresso.progresso,
        vendas: vendasCategoria
      };
    });
  }, [resumoMensalFiltrado, vendasDoMesFiltradas]);

  const pontosMesSelecionado = resumoMensalFiltrado?.pontosTotal ?? 0;
  const receitaMesSelecionado = resumoMensalFiltrado
    ? resumoMensalFiltrado.receitaDadosAvancados +
      resumoMensalFiltrado.receitaVozAvancada +
      resumoMensalFiltrado.receitaDigitalTI +
      resumoMensalFiltrado.receitaNovosProdutos +
      resumoMensalFiltrado.receitaLocacaoEquipamentos +
      resumoMensalFiltrado.receitaLicencas
    : 0;

  const nomeMesSelecionado = resumoMensalSelecionado
    ? obterNomeMes(resumoMensalSelecionado.mes, resumoMensalSelecionado.ano)
    : 'Período não selecionado';

  const parceiroVisaoLabel = visaoParceiro === 'TODOS'
    ? 'Todos os parceiros'
    : obterRotuloParceiro(visaoParceiro);

  const totalPedidosVisao = vendasDoMesFiltradas.length;

  const proximaClassificacao = useMemo(() => {
    const indiceAtual = CLASSIFICACOES.findIndex(item => item.classificacao === classificacao);
    if (indiceAtual === -1 || indiceAtual === CLASSIFICACOES.length - 1) {
      return null;
    }
    return CLASSIFICACOES[indiceAtual + 1];
  }, [classificacao]);

  const pontosRestantesProximaClassificacao = proximaClassificacao
    ? Math.max(0, proximaClassificacao.pontuacaoMinima - pontuacaoMedia)
    : 0;

  const alertas = useMemo<AlertaDashboard[]>(() => {
    const itens: AlertaDashboard[] = [];

    if (visaoParceiro !== 'TODOS' && totalPedidosVisao === 0) {
      itens.push({
        tipo: 'risco',
        mensagem: `${obterRotuloParceiro(visaoParceiro)} não possui pedidos registrados em ${nomeMesSelecionado}.`
      });
    }

    categoriasResumo.forEach(categoria => {
      if (categoria.proximaFaixa && categoria.faltaParaProxima > 0 && categoria.faltaParaProxima <= 1000) {
        itens.push({
          tipo: 'info',
          mensagem: `${categoria.titulo}: faltam ${formatarMoeda(categoria.faltaParaProxima)} para alcançar a faixa ${categoria.proximaFaixa.faixa}.`
        });
      }
    });

    if (proximaClassificacao && pontosRestantesProximaClassificacao > 0) {
      itens.push({
        tipo: 'info',
        mensagem: `Faltam ${formatarPontuacao(pontosRestantesProximaClassificacao)} pontos em média para atingir ${getNomeClassificacao(proximaClassificacao.classificacao)}.`
      });
    }

    return itens;
  }, [visaoParceiro, totalPedidosVisao, nomeMesSelecionado, categoriasResumo, proximaClassificacao, pontosRestantesProximaClassificacao]);

  const periodoTexto = `${resultado.periodoInicio.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} — ${resultado.periodoFim.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;

  const resumoParceirosCiclo = useMemo(() => {
    return PARCEIROS_VIVO.map(parceiro => {
      const vendasParceiro = vendasNormalizadas.filter(venda => venda.parceiro === parceiro);
      const receita = vendasParceiro.reduce((acc, venda) => acc + venda.valorBrutoSN, 0);
      return {
        parceiro,
        receita,
        pedidos: vendasParceiro.length
      };
    }).sort((a, b) => b.receita - a.receita);
  }, [vendasNormalizadas]);

  const handleAbrirDetalhes = () => {
    setDetalhesMensaisAbertos(true);
  };

  const handleGerarOnePager = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      <div className="dashboard-container fade-in">
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
          <div className="card-footer">Bônus: {bonusPercentual}%</div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <TrendingUp size={24} />
            <h3>Pontuação Média</h3>
          </div>
          <div className="card-value text-gradient">{formatarPontuacao(pontuacaoMedia)}</div>
          <div className="card-footer">Total acumulado: {formatarPontuacao(pontuacaoTotalCiclo)} pontos</div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <DollarSign size={24} />
            <h3>Receita Total do Ciclo</h3>
          </div>
          <div className="card-value text-gradient">{formatarMoeda(receitaTotalCiclo)}</div>
          <div className="card-footer">{vendas.length} pedidos válidos</div>
        </div>

        <div className="summary-card glass-card">
          <div className="card-header">
            <Calendar size={24} />
            <h3>Mês Selecionado</h3>
          </div>
          <div className="card-value">{nomeMesSelecionado}</div>
          <div className="card-footer">Receita: {formatarMoeda(receitaMesSelecionado)}</div>
        </div>
      </div>

      <div className="month-selector glass-card">
        <h3>
          <Calendar size={18} />
          Acompanhe mês a mês
        </h3>
        <div className="month-selector-buttons">
          {mesesDisponiveis.map(mes => (
            <button
              key={mes.chave}
              type="button"
              className={`month-button ${mesSelecionado === mes.chave ? 'ativo' : ''}`}
              onClick={() => setMesSelecionado(mes.chave)}
            >
              {mes.nome}
            </button>
          ))}
        </div>
      </div>

      <div className="monthly-highlight glass-card">
        <div className="highlight-info">
          <div>
            <h3>
              <Activity size={18} />
              Performance de {nomeMesSelecionado}
            </h3>
            <p>
              Visão de <strong>{parceiroVisaoLabel}</strong>. Ajuste a jornada antes de consolidar a certificação.
            </p>
          </div>
          <div className="highlight-controls">
            <div className="partner-vision-control">
              <span className="control-label">Visão por parceiro</span>
              <div className="partner-vision-buttons">
                {VISAO_PARCEIRO_OPCOES.map(opcao => (
                  <button
                    key={opcao.valor}
                    type="button"
                    className={`toggle-button ${visaoParceiro === opcao.valor ? 'ativo' : ''}`}
                    onClick={() => setVisaoParceiro(opcao.valor)}
                  >
                    {opcao.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="highlight-buttons">
              <button type="button" className="btn btn-secondary" onClick={handleAbrirDetalhes}>
                Ver pedidos do mês
              </button>
              <button type="button" className="btn btn-primary" onClick={handleGerarOnePager}>
                Gerar One-Pager
              </button>
            </div>
          </div>
        </div>

        <div className="highlight-metrics">
          <div>
            <span>Receita</span>
            <strong>{formatarMoeda(receitaMesSelecionado)}</strong>
          </div>
          <div>
            <span>Pontos</span>
            <strong>{formatarPontuacao(pontosMesSelecionado)}</strong>
          </div>
          <div>
            <span>Pedidos</span>
            <strong>{totalPedidosVisao}</strong>
          </div>
        </div>

        <div className="partner-summary">
          {resumoParceiros.map(parceiro => {
            const ativo = visaoParceiro !== 'TODOS' && visaoParceiro === parceiro.parceiro;
            return (
              <div key={parceiro.parceiro} className={`partner-card ${ativo ? 'ativo' : ''}`}>
                <span className="partner-label">{formatarNomeParceiro(parceiro.parceiro)}</span>
                <span className="partner-value">{formatarMoeda(parceiro.receita)}</span>
                <span className="partner-sub">{parceiro.pedidos} pedido{parceiro.pedidos !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>

        {alertas.length > 0 && (
          <div className="alerts-panel">
            {alertas.map((alerta, index) => (
              <div key={`alerta-${index}`} className={`alert-chip ${alerta.tipo}`}>
                <AlertCircle size={16} />
                <span>{alerta.mensagem}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="categories-grid">
        {categoriasResumo.map(categoria => {
          const proximaPontos = categoria.proximaFaixa ? categoria.proximaFaixa.pontos : categoria.faixaAtual.pontos;
          const faltaFormatado = formatarMoeda(categoria.faltaParaProxima);

          return (
            <div key={categoria.chave} className="category-card glass-card">
              <div className="category-header">
                <h4>{categoria.titulo}</h4>
                <span className="faixa-badge">Faixa {categoria.faixaAtual.faixa}</span>
              </div>

              <div className="category-metrics">
                <div>
                  <span>Receita</span>
                  <strong>{formatarMoeda(categoria.receita)}</strong>
                </div>
                <div>
                  <span>Pontos</span>
                  <strong>{formatarPontuacao(categoria.pontos)}</strong>
                </div>
              </div>

              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${categoria.progresso * 100}%` }} />
              </div>

              <div className="next-target">
                {categoria.proximaFaixa ? (
                  <>
                    <span>Próxima faixa: {categoria.proximaFaixa.faixa}</span>
                    <p>
                      Faltam <strong>{faltaFormatado}</strong> para alcançar {formatarPontuacao(proximaPontos)} pontos.
                    </p>
                  </>
                ) : (
                  <p>Faixa máxima atingida neste segmento.</p>
                )}
              </div>

              <button
                type="button"
                className="category-toggle"
                onClick={() => setCategoriaAberta(prev => (prev === categoria.chave ? null : categoria.chave))}
              >
                {categoriaAberta === categoria.chave ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Ver produtos desse segmento
              </button>

              {categoriaAberta === categoria.chave && (
                <div className="category-details">
                  {categoria.vendas.length === 0 && <span>Nenhum pedido registrado neste segmento no mês.</span>}
                  {categoria.vendas.length > 0 && (
                    <ul>
                      {categoria.vendas.map(venda => (
                        <li key={venda.id}>
                          <div>
                            <strong>{venda.produto}</strong>
                            <span>{venda.pedidoSN} · {venda.dataAtivacao.toLocaleDateString('pt-BR')}</span>
                          </div>
                          <span>{formatarMoeda(venda.valorBrutoSN)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="charts-row">
        <div className="chart-card glass-card">
          <h3>
            <Target size={18} />
            Receita mensal comparativa
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="mes" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => formatarMoeda(value)} cursor={{ fill: 'rgba(139,92,246,0.1)' }} />
              <Legend />
              <Bar dataKey="dadosAvancados" name="Dados Avançados" fill="#8b5cf6" stackId="a" radius={[8, 8, 0, 0]} />
              <Bar dataKey="vozAvancada" name="Voz Avançada" fill="#22d3ee" stackId="a" radius={[8, 8, 0, 0]} />
              <Bar dataKey="digitalTI" name="Digital/TI" fill="#f97316" stackId="a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass-card">
          <h3>
            <BarChart3 size={18} />
            Principais produtos de {nomeMesSelecionado}
          </h3>
          <div className="top-products">
            {produtosResumo.length === 0 && <p>Nenhum produto registrado no período selecionado.</p>}
            {produtosResumo.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Pedidos</th>
                    <th>Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosResumo.map(produto => (
                    <tr key={produto.produto}>
                      <td>{produto.produto}</td>
                      <td>{CATEGORIAS_CONFIG[produto.categoria].titulo}</td>
                      <td>{produto.pedidos}</td>
                      <td>{formatarMoeda(produto.receita)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
      <PainelDetalhesMensais
        aberto={detalhesMensaisAbertos}
        onFechar={() => setDetalhesMensaisAbertos(false)}
        nomeMes={nomeMesSelecionado}
        parceiroVisao={visaoParceiro}
        vendas={vendasDoMesFiltradas}
      />

      <OnePagerResumo
        periodoTexto={periodoTexto}
        classificacao={classificacao}
        bonusPercentual={bonusPercentual}
        pontuacaoMedia={pontuacaoMedia}
        pontuacaoTotalCiclo={pontuacaoTotalCiclo}
        nomeMesSelecionado={nomeMesSelecionado}
        parceiroVisaoLabel={parceiroVisaoLabel}
        receitaMesSelecionado={receitaMesSelecionado}
        pontosMesSelecionado={pontosMesSelecionado}
        totalPedidosMes={totalPedidosVisao}
        categorias={categoriasResumo}
        parceirosMensal={resumoParceiros}
        parceirosCiclo={resumoParceirosCiclo}
        alertas={alertas}
      />
    </>
  );
}

interface PainelDetalhesMensaisProps {
  aberto: boolean;
  onFechar: () => void;
  nomeMes: string;
  parceiroVisao: VisaoParceiro;
  vendas: RegistroVenda[];
}

function PainelDetalhesMensais({ aberto, onFechar, nomeMes, parceiroVisao, vendas }: PainelDetalhesMensaisProps) {
  const grupos = useMemo(() => {
    const mapa = new Map<RegistroVenda['torre'], { titulo: string; torre: RegistroVenda['torre']; total: number; pedidos: RegistroVenda[] }>();

    vendas.forEach(venda => {
      if (!mapa.has(venda.torre)) {
        mapa.set(venda.torre, { titulo: TORRE_LABELS[venda.torre], torre: venda.torre, total: 0, pedidos: [] });
      }
      const grupo = mapa.get(venda.torre)!;
      grupo.total += venda.valorBrutoSN;
      grupo.pedidos.push(venda);
    });

    return Array.from(mapa.values()).sort((a, b) => b.total - a.total);
  }, [vendas]);

  const totalReceita = useMemo(() => vendas.reduce((acc, venda) => acc + venda.valorBrutoSN, 0), [vendas]);

  return (
    <div className={`monthly-details-overlay ${aberto ? 'ativo' : ''}`} aria-hidden={!aberto}>
      <div className="monthly-details-backdrop" onClick={onFechar} role="presentation" />
      <div className="monthly-details-panel glass-card">
        <div className="monthly-details-header">
          <div>
            <h2>Pedidos de {nomeMes}</h2>
            <p>
              Visão {parceiroVisao === 'TODOS' ? 'consolidada' : `de ${obterRotuloParceiro(parceiroVisao)}`} · {vendas.length} pedido{vendas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onFechar}>
            Fechar
          </button>
        </div>

        {vendas.length === 0 ? (
          <div className="monthly-details-empty">
            <AlertCircle size={32} />
            <p>Nenhum pedido encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="monthly-details-body">
            {grupos.map(grupo => (
              <section key={grupo.torre} className="monthly-details-group">
                <div className="group-header">
                  <h3>{grupo.titulo}</h3>
                  <div className="group-totals">
                    <span>{grupo.pedidos.length} pedido{grupo.pedidos.length !== 1 ? 's' : ''}</span>
                    <strong>{formatarMoeda(grupo.total)}</strong>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Pedido SN</th>
                      <th>Cliente</th>
                      <th>Produto</th>
                      <th>Parceiro</th>
                      <th>Data</th>
                      <th>Receita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.pedidos.map(pedido => (
                      <tr key={pedido.id}>
                        <td>{pedido.pedidoSN}</td>
                        <td>
                          <span className="cliente">{pedido.nomeCliente}</span>
                          <span className="cnpj">{pedido.cnpj}</span>
                        </td>
                        <td>{pedido.produto}</td>
                        <td>{formatarNomeParceiro(pedido.parceiro)}</td>
                        <td>{pedido.dataAtivacao.toLocaleDateString('pt-BR')}</td>
                        <td>{formatarMoeda(pedido.valorBrutoSN)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        )}

        <div className="monthly-details-footer">
          <span>Total do painel</span>
          <strong>{formatarMoeda(totalReceita)}</strong>
        </div>
      </div>
    </div>
  );
}

interface OnePagerResumoProps {
  periodoTexto: string;
  classificacao: ResultadoCiclo['classificacao'];
  bonusPercentual: number;
  pontuacaoMedia: number;
  pontuacaoTotalCiclo: number;
  nomeMesSelecionado: string;
  parceiroVisaoLabel: string;
  receitaMesSelecionado: number;
  pontosMesSelecionado: number;
  totalPedidosMes: number;
  categorias: CategoriaResumo[];
  parceirosMensal: { parceiro: RegistroVenda['parceiro']; receita: number; pedidos: number }[];
  parceirosCiclo: { parceiro: RegistroVenda['parceiro']; receita: number; pedidos: number }[];
  alertas: AlertaDashboard[];
}

function OnePagerResumo({
  periodoTexto,
  classificacao,
  bonusPercentual,
  pontuacaoMedia,
  pontuacaoTotalCiclo,
  nomeMesSelecionado,
  parceiroVisaoLabel,
  receitaMesSelecionado,
  pontosMesSelecionado,
  totalPedidosMes,
  categorias,
  parceirosMensal,
  parceirosCiclo,
  alertas
}: OnePagerResumoProps) {
  return (
    <div className="one-pager" id="one-pager">
      <header className="one-pager-header">
        <h1>Certificação Especialistas · One Pager</h1>
        <span>{periodoTexto}</span>
      </header>

      <section className="one-pager-overview">
        <div className="one-pager-card">
          <span>Classificação atual</span>
          <strong>{getNomeClassificacao(classificacao)}</strong>
          <small>Bônus {bonusPercentual}%</small>
        </div>
        <div className="one-pager-card">
          <span>Pontuação média</span>
          <strong>{formatarPontuacao(pontuacaoMedia)}</strong>
          <small>Total ciclo {formatarPontuacao(pontuacaoTotalCiclo)}</small>
        </div>
        <div className="one-pager-card">
          <span>Visão mensal</span>
          <strong>{nomeMesSelecionado}</strong>
          <small>{parceiroVisaoLabel}</small>
        </div>
      </section>

      <section className="one-pager-metrics">
        <div>
          <span>Receita do mês</span>
          <strong>{formatarMoeda(receitaMesSelecionado)}</strong>
        </div>
        <div>
          <span>Pontos gerados</span>
          <strong>{formatarPontuacao(pontosMesSelecionado)}</strong>
        </div>
        <div>
          <span>Pedidos analisados</span>
          <strong>{totalPedidosMes}</strong>
        </div>
      </section>

      <section className="one-pager-categorias">
        <h2>Receita por categoria</h2>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Receita</th>
              <th>Pontos</th>
              <th>Próxima faixa</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(categoria => (
              <tr key={categoria.chave}>
                <td>{categoria.titulo}</td>
                <td>{formatarMoeda(categoria.receita)}</td>
                <td>{formatarPontuacao(categoria.pontos)}</td>
                <td>
                  {categoria.proximaFaixa
                    ? `${categoria.proximaFaixa.faixa} · faltam ${formatarMoeda(categoria.faltaParaProxima)}`
                    : 'Faixa máxima'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="one-pager-parceiros">
        <div>
          <h2>Parceiros no mês</h2>
          <ul>
            {parceirosMensal.map(parceiro => (
              <li key={`mensal-${parceiro.parceiro}`}>
                <span>{formatarNomeParceiro(parceiro.parceiro)}</span>
                <strong>{formatarMoeda(parceiro.receita)}</strong>
                <small>{parceiro.pedidos} pedido{parceiro.pedidos !== 1 ? 's' : ''}</small>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Parceiros no ciclo</h2>
          <ul>
            {parceirosCiclo.map(parceiro => (
              <li key={`ciclo-${parceiro.parceiro}`}>
                <span>{formatarNomeParceiro(parceiro.parceiro)}</span>
                <strong>{formatarMoeda(parceiro.receita)}</strong>
                <small>{parceiro.pedidos} pedido{parceiro.pedidos !== 1 ? 's' : ''}</small>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {alertas.length > 0 && (
        <section className="one-pager-alertas">
          <h2>Avisos & Cenários</h2>
          <ul>
            {alertas.map((alerta, index) => (
              <li key={`alerta-onepager-${index}`}>{alerta.mensagem}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
