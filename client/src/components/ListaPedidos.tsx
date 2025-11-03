import { useEffect, useMemo, useState } from 'react';
import { FileText, DollarSign, Trash2, CheckCircle2, XCircle, Filter } from 'lucide-react';
import type { RegistroVenda } from '../types/certification';
import { PARCEIRO_LABELS } from '../types/certification';
import { VISAO_PARCEIRO_OPCOES, type VisaoParceiro } from '../utils/parceiros';
import { formatarMoeda } from '../utils/calculoCertificacao';
import { normalizarValor } from '../utils/importadorPlanilha';
import './ListaPedidos.css';

type CampoEditavel =
  | 'pedidoSN'
  | 'valorBrutoSN'
  | 'nomeCliente'
  | 'produto'
  | 'dataAtivacao'
  | 'categoria'
  | 'nomeRede'
  | 'parceiro';

type ParceiroFiltro = VisaoParceiro;

interface ListaPedidosProps {
  vendas: RegistroVenda[];
  titulo?: string;
  modoEdicao?: boolean;
  onEditar?: (id: string, campo: CampoEditavel, valor: string) => void;
  onRemover?: (id: string) => void;
  onConfirmar?: () => void;
  onCancelar?: () => void;
}

const CATEGORIAS_LABEL: Record<RegistroVenda['categoria'], string> = {
  DADOS_AVANCADOS: 'Dados Avançados',
  VOZ_AVANCADA: 'Voz Avançada',
  DIGITAL_TI: 'Digital / TI',
  NOVOS_PRODUTOS: 'Novos Produtos',
  LOCACAO_EQUIPAMENTOS: 'Locação de Equipamentos',
  LICENCAS: 'Licenças'
};

function formatarValorEntrada(valor: number): string {
  if (!Number.isFinite(valor)) {
    return '0,00';
  }

  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export default function ListaPedidos({
  vendas,
  titulo = 'Pedidos Importados',
  modoEdicao = false,
  onEditar,
  onRemover,
  onConfirmar,
  onCancelar
}: ListaPedidosProps) {
  const [parceiroFiltro, setParceiroFiltro] = useState<ParceiroFiltro>('TODOS');
  const [busca, setBusca] = useState('');
  const [valoresDigitados, setValoresDigitados] = useState<Record<string, string>>({});

  useEffect(() => {
    if (modoEdicao) {
      const novosValores: Record<string, string> = {};
      vendas.forEach(venda => {
        novosValores[venda.id] = formatarValorEntrada(venda.valorBrutoSN);
      });
      setValoresDigitados(novosValores);
    } else {
      setValoresDigitados({});
    }
  }, [modoEdicao, vendas]);

  const vendasOrdenadas = useMemo(() =>
    [...vendas].sort((a, b) => b.dataAtivacao.getTime() - a.dataAtivacao.getTime()),
  [vendas]
  );

  const vendasFiltradas = useMemo(() => {
    return vendasOrdenadas.filter(venda => {
      const correspondeParceiro = parceiroFiltro === 'TODOS' || venda.parceiro === parceiroFiltro;
      if (!correspondeParceiro) return false;

      if (!busca) return true;

      const termo = busca.toLowerCase();
      return (
        venda.pedidoSN.toLowerCase().includes(termo) ||
        venda.nomeCliente.toLowerCase().includes(termo) ||
        venda.cnpj.toLowerCase().includes(termo) ||
        venda.produto.toLowerCase().includes(termo)
      );
    });
  }, [busca, parceiroFiltro, vendasOrdenadas]);

  const totalReceita = vendasFiltradas.reduce((sum, v) => sum + v.valorBrutoSN, 0);

  if (vendas.length === 0) {
    return null;
  }

  return (
    <div className="lista-pedidos-container fade-in">
      <div className="lista-pedidos-card glass-card">
        <div className="lista-pedidos-header">
          <FileText size={32} className="header-icon" />
          <div>
            <h2>{titulo}</h2>
            <p className="pedidos-count">
              {vendasFiltradas.length} pedido{vendasFiltradas.length !== 1 ? 's' : ''} listado{vendasFiltradas.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="lista-pedidos-filtros">
          <div className="filtro-busca">
            <Filter size={18} />
            <input
              type="text"
              placeholder="Buscar por pedido, cliente ou produto"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>

          <div className="filtro-parceiro">
            {VISAO_PARCEIRO_OPCOES.map(parceiro => (
              <button
                key={parceiro.valor}
                type="button"
                className={`filtro-botao ${parceiroFiltro === parceiro.valor ? 'ativo' : ''}`}
                onClick={() => setParceiroFiltro(parceiro.valor)}
              >
                {parceiro.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pedidos-tabela-container">
          <table className="pedidos-tabela">
            <thead>
              <tr>
                <th>Pedido SN</th>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Parceiro</th>
                <th>Data</th>
                <th>Receita</th>
                {modoEdicao && <th className="acoes-col">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {vendasFiltradas.map((venda) => {
                const valorDigitado = valoresDigitados[venda.id] ?? formatarValorEntrada(venda.valorBrutoSN);

                return (
                  <tr key={venda.id}>
                    <td data-title="Pedido SN">
                      {modoEdicao ? (
                        <input
                          className="input-inline"
                          value={venda.pedidoSN}
                          onChange={(event) => onEditar?.(venda.id, 'pedidoSN', event.target.value)}
                        />
                      ) : (
                        <span className="pedido-destaque">{venda.pedidoSN}</span>
                      )}
                    </td>
                    <td data-title="Cliente">
                      <div className="info-coluna">
                        <div className="info-principal">
                          {modoEdicao ? (
                            <input
                              className="input-inline"
                              value={venda.nomeCliente}
                              onChange={(event) => onEditar?.(venda.id, 'nomeCliente', event.target.value)}
                            />
                          ) : (
                            <span>{venda.nomeCliente}</span>
                          )}
                        </div>
                        <div className="info-secundaria">{venda.cnpj}</div>
                      </div>
                    </td>
                    <td data-title="Produto">
                      {modoEdicao ? (
                        <input
                          className="input-inline"
                          value={venda.produto}
                          onChange={(event) => onEditar?.(venda.id, 'produto', event.target.value)}
                        />
                      ) : (
                        venda.produto
                      )}
                    </td>
                    <td data-title="Categoria">
                      {modoEdicao ? (
                        <select
                          className="input-inline"
                          value={venda.categoria}
                          onChange={(event) => onEditar?.(venda.id, 'categoria', event.target.value)}
                        >
                          {(Object.keys(CATEGORIAS_LABEL) as RegistroVenda['categoria'][]).map(categoria => (
                            <option key={categoria} value={categoria}>
                              {CATEGORIAS_LABEL[categoria]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="badge badge-categoria">{CATEGORIAS_LABEL[venda.categoria]}</span>
                      )}
                    </td>
                    <td data-title="Parceiro">
                      {modoEdicao ? (
                        <select
                          className="input-inline"
                          value={venda.parceiro}
                          onChange={(event) => onEditar?.(venda.id, 'parceiro', event.target.value)}
                        >
                        <option value="JLC_TECH">{PARCEIRO_LABELS.JLC_TECH}</option>
                        <option value="SAFE_TI">{PARCEIRO_LABELS.SAFE_TI}</option>
                      </select>
                    ) : (
                        <span className="badge badge-parceiro">{PARCEIRO_LABELS[venda.parceiro]}</span>
                      )}
                    </td>
                    <td data-title="Data">
                      <div className="info-coluna">
                        {modoEdicao ? (
                          <input
                            type="date"
                            className="input-inline"
                            value={venda.dataAtivacao.toISOString().slice(0, 10)}
                            onChange={(event) => onEditar?.(venda.id, 'dataAtivacao', event.target.value)}
                          />
                        ) : (
                          <div className="info-principal">{venda.dataAtivacao.toLocaleDateString('pt-BR')}</div>
                        )}
                        {venda.nomeRede && (
                          <div className="info-secundaria">
                            {modoEdicao ? (
                              <input
                                className="input-inline"
                                value={venda.nomeRede}
                                onChange={(event) => onEditar?.(venda.id, 'nomeRede', event.target.value)}
                              />
                            ) : (
                              venda.nomeRede
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td data-title="Receita" className="coluna-valor">
                      <div className="valor-wrapper">
                        <DollarSign size={16} />
                        {modoEdicao ? (
                          <input
                            className="input-inline valor"
                            value={valorDigitado}
                            onChange={(event) =>
                              setValoresDigitados(prev => ({ ...prev, [venda.id]: event.target.value }))
                            }
                            onBlur={(event) => {
                              const numero = normalizarValor(event.target.value);
                              onEditar?.(venda.id, 'valorBrutoSN', event.target.value);
                              setValoresDigitados(prev => ({ ...prev, [venda.id]: formatarValorEntrada(numero) }));
                            }}
                          />
                        ) : (
                          <span>{formatarMoeda(venda.valorBrutoSN)}</span>
                        )}
                      </div>
                    </td>
                    {modoEdicao && (
                      <td className="acoes-col">
                        <button
                          type="button"
                          className="botao-remover"
                          onClick={() => onRemover?.(venda.id)}
                        >
                          <Trash2 size={16} />
                          Remover
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}

              {vendasFiltradas.length === 0 && (
                <tr className="linha-vazia">
                  <td colSpan={modoEdicao ? 8 : 7}>
                    <div className="mensagem-vazia">
                      <XCircle size={18} />
                      Nenhum pedido corresponde aos filtros aplicados.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lista-pedidos-resumo glass-card">
          <div className="resumo-item">
            <span className="resumo-label">Pedidos Visíveis:</span>
            <span className="resumo-valor">{vendasFiltradas.length}</span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Receita Filtrada:</span>
            <span className="resumo-valor destaque">{formatarMoeda(totalReceita)}</span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Receita Total Importada:</span>
            <span className="resumo-valor">{formatarMoeda(vendas.reduce((sum, v) => sum + v.valorBrutoSN, 0))}</span>
          </div>
        </div>

        {modoEdicao && (
          <div className="acoes-revisao">
            <button type="button" className="btn btn-secondary" onClick={onCancelar}>
              <XCircle size={18} />
              Cancelar Revisão
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirmar}
              disabled={vendas.length === 0}
            >
              <CheckCircle2 size={18} />
              Processar Seleção
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
