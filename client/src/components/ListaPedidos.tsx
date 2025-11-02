import { FileText, DollarSign, Building2, Calendar } from 'lucide-react';
import type { RegistroVenda } from '../types/certification';
import { formatarMoeda } from '../utils/calculoCertificacao';
import './ListaPedidos.css';

interface ListaPedidosProps {
  vendas: RegistroVenda[];
}

export default function ListaPedidos({ vendas }: ListaPedidosProps) {
  if (vendas.length === 0) {
    return null;
  }

  // Ordena por data de ativação (mais recente primeiro)
  const vendasOrdenadas = [...vendas].sort((a, b) =>
    b.dataAtivacao.getTime() - a.dataAtivacao.getTime()
  );

  return (
    <div className="lista-pedidos-container fade-in">
      <div className="lista-pedidos-card glass-card">
        <div className="lista-pedidos-header">
          <FileText size={32} className="header-icon" />
          <h2>Pedidos Importados</h2>
          <p className="pedidos-count">{vendas.length} pedido{vendas.length !== 1 ? 's' : ''} encontrado{vendas.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="pedidos-lista">
          {vendasOrdenadas.map((venda) => (
            <div key={venda.id} className="pedido-card glass-card">
              <div className="pedido-header">
                <div className="pedido-numero">
                  <span className="pedido-label">Pedido SN</span>
                  <span className="pedido-sn">{venda.pedidoSN}</span>
                </div>
                <div className="pedido-valor">
                  <DollarSign size={20} />
                  <span className="valor">{formatarMoeda(venda.valorBrutoSN)}</span>
                </div>
              </div>

              <div className="pedido-info">
                <div className="info-row">
                  <Building2 size={16} />
                  <div className="info-content">
                    <span className="info-label">Cliente:</span>
                    <span className="info-value">{venda.nomeCliente}</span>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">🏢</span>
                  <div className="info-content">
                    <span className="info-label">CNPJ:</span>
                    <span className="info-value">{venda.cnpj}</span>
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-icon">📦</span>
                  <div className="info-content">
                    <span className="info-label">Produto:</span>
                    <span className="info-value">{venda.produto}</span>
                  </div>
                </div>

                <div className="info-row">
                  <Calendar size={16} />
                  <div className="info-content">
                    <span className="info-label">Data Ativação:</span>
                    <span className="info-value">
                      {venda.dataAtivacao.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {venda.pedidosAgrupados && venda.pedidosAgrupados.length > 1 && (
                  <div className="pedidos-agrupados">
                    <span className="agrupados-label">
                      📌 Pedidos Agrupados ({venda.pedidosAgrupados.length}):
                    </span>
                    <div className="agrupados-lista">
                      {venda.pedidosAgrupados.map(pedido => (
                        <span key={pedido} className="pedido-agrupado-badge">
                          {pedido}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pedido-meta">
                  <span className="badge badge-categoria">{venda.categoria.replace(/_/g, ' ')}</span>
                  <span className="badge badge-tipo">{venda.tipoVenda}</span>
                  {venda.nomeRede && (
                    <span className="badge badge-parceiro">{venda.nomeRede}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lista-pedidos-resumo glass-card">
          <div className="resumo-item">
            <span className="resumo-label">Total de Pedidos:</span>
            <span className="resumo-valor">{vendas.length}</span>
          </div>
          <div className="resumo-item">
            <span className="resumo-label">Receita Total:</span>
            <span className="resumo-valor destaque">
              {formatarMoeda(vendas.reduce((sum, v) => sum + v.valorBrutoSN, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
