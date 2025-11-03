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
import {
  getNomeClassificacao,
  formatarMoeda,
  formatarPontuacao
} from '../utils/calculoCertificacao';
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

const CATEGORIAS_CONFIG: Record<RegistroVenda['categoria'], { titulo: string; faixas: FaixaReceita[] }> = {
  DADOS_AVANCADOS: { titulo: 'Dados Avançados', faixas: FAIXAS_DADOS_AVANCADOS },
  VOZ_AVANCADA: { titulo: 'Voz Avançada', faixas: FAIXAS_VOZ_AVANCADA },
  DIGITAL_TI: { titulo: 'Digital / TI', faixas: FAIXAS_DIGITAL_TI },
  NOVOS_PRODUTOS: { titulo: 'Novos Produtos', faixas: FAIXAS_NOVOS_PRODUTOS },
  LOCACAO_EQUIPAMENTOS: { titulo: 'Locação de Equipamentos', faixas: FAIXAS_LOCACAO_EQUIPAMENTOS },
  LICENCAS: { titulo: 'Licenças', faixas: FAIXAS_LICENCAS }
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
  if (parceiro === 'SAFE_TI') return 'SAFE/TI';
  if (parceiro === 'JCL') return 'JLC';
  return 'Tech';
}

export default function Dashboard({ resultado, vendas }: DashboardProps) {
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);
  const [categoriaAberta, setCategoriaAberta] = useState<RegistroVenda['categoria'] | null>(null);

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

  const vendasDoMes = useMemo(() => {
    if (!mesSelecionado) return [] as RegistroVenda[];
    return vendas.filter(venda => formatarChaveMes(venda.dataAtivacao.getFullYear(), venda.dataAtivacao.getMonth() + 1) === mesSelecionado);
  }, [mesSelecionado, vendas]);

  const timelineData = useMemo(() => resultadosMensais.map(r => ({
    mes: `${r.mes.toString().padStart(2, '0')}/${r.ano}`,
    dadosAvancados: r.receitaDadosAvancados,
    vozAvancada: r.receitaVozAvancada,
    digitalTI: r.receitaDigitalTI,
    total: r.receitaDadosAvancados + r.receitaVozAvancada + r.receitaDigitalTI + r.receitaNovosProdutos + r.receitaLocacaoEquipamentos + r.receitaLicencas
  })), [resultadosMensais]);

  const resumoParceiros = useMemo(() => {
    const mapa = new Map<RegistroVenda['parceiro'], { parceiro: RegistroVenda['parceiro']; receita: number; pedidos: number }>();
    vendasDoMes.forEach(venda => {
      if (!mapa.has(venda.parceiro)) {
        mapa.set(venda.parceiro, { parceiro: venda.parceiro, receita: 0, pedidos: 0 });
      }
      const item = mapa.get(venda.parceiro)!;
      item.receita += venda.valorBrutoSN;
      item.pedidos += 1;
    });
    return Array.from(mapa.values()).sort((a, b) => b.receita - a.receita);
  }, [vendasDoMes]);

  const produtosResumo = useMemo(() => {
    const mapa = new Map<string, { produto: string; categoria: RegistroVenda['categoria']; receita: number; pedidos: number }>();
    vendasDoMes.forEach(venda => {
      if (!mapa.has(venda.produto)) {
        mapa.set(venda.produto, { produto: venda.produto, categoria: venda.categoria, receita: 0, pedidos: 0 });
      }
      const item = mapa.get(venda.produto)!;
      item.receita += venda.valorBrutoSN;
      item.pedidos += 1;
    });
    return Array.from(mapa.values()).sort((a, b) => b.receita - a.receita).slice(0, 6);
  }, [vendasDoMes]);

  const categoriasResumo: CategoriaResumo[] = useMemo(() => {
    if (!resumoMensalSelecionado) return [];

    const base: Array<{ chave: RegistroVenda['categoria']; receita: number; pontos: number }> = [
      { chave: 'DADOS_AVANCADOS', receita: resumoMensalSelecionado.receitaDadosAvancados, pontos: resumoMensalSelecionado.pontosDadosAvancados },
      { chave: 'VOZ_AVANCADA', receita: resumoMensalSelecionado.receitaVozAvancada, pontos: resumoMensalSelecionado.pontosVozAvancada },
      { chave: 'DIGITAL_TI', receita: resumoMensalSelecionado.receitaDigitalTI, pontos: resumoMensalSelecionado.pontosDigitalTI },
      { chave: 'NOVOS_PRODUTOS', receita: resumoMensalSelecionado.receitaNovosProdutos, pontos: resumoMensalSelecionado.pontosNovosProdutos },
      { chave: 'LOCACAO_EQUIPAMENTOS', receita: resumoMensalSelecionado.receitaLocacaoEquipamentos, pontos: resumoMensalSelecionado.pontosLocacaoEquipamentos },
      { chave: 'LICENCAS', receita: resumoMensalSelecionado.receitaLicencas, pontos: resumoMensalSelecionado.pontosLicencas }
    ];

    return base.map(item => {
      const { titulo, faixas } = CATEGORIAS_CONFIG[item.chave];
      const progresso = calcularProgressoCategoria(item.receita, faixas);
      const vendasCategoria = vendasDoMes.filter(venda => venda.categoria === item.chave);

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
  }, [resumoMensalSelecionado, vendasDoMes]);

  const pontosMesSelecionado = resumoMensalSelecionado?.pontosTotal ?? 0;
  const receitaMesSelecionado = resumoMensalSelecionado
    ? resumoMensalSelecionado.receitaDadosAvancados +
      resumoMensalSelecionado.receitaVozAvancada +
      resumoMensalSelecionado.receitaDigitalTI +
      resumoMensalSelecionado.receitaNovosProdutos +
      resumoMensalSelecionado.receitaLocacaoEquipamentos +
      resumoMensalSelecionado.receitaLicencas
    : 0;

  const nomeMesSelecionado = resumoMensalSelecionado
    ? obterNomeMes(resumoMensalSelecionado.mes, resumoMensalSelecionado.ano)
    : 'Período não selecionado';

  return (
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
            <p>Receita consolidada com pontuação calculada conforme o manual de certificação.</p>
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
              <strong>{vendasDoMes.length}</strong>
            </div>
          </div>
        </div>

        <div className="partner-summary">
          {resumoParceiros.map(parceiro => (
            <div key={parceiro.parceiro} className="partner-card">
              <span className="partner-label">{formatarNomeParceiro(parceiro.parceiro)}</span>
              <span className="partner-value">{formatarMoeda(parceiro.receita)}</span>
              <span className="partner-sub">{parceiro.pedidos} pedido{parceiro.pedidos !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
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
  );
}
