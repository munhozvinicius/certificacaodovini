import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import type { RegistroVenda, TorrePlanilha } from '../types/certification';
import {
  importarPlanilhaExcel,
  validarArquivoExcel,
  MAPEAMENTOS_PADRAO,
  normalizarValor
} from '../utils/importadorPlanilha';
import ListaPedidos from './ListaPedidos';
import './ImportadorPlanilhas.css';

interface ImportadorPlanilhasProps {
  onVendasImportadas: (vendas: RegistroVenda[]) => void;
}

type CampoEdicao =
  | 'pedidoSN'
  | 'valorBrutoSN'
  | 'nomeCliente'
  | 'produto'
  | 'dataAtivacao'
  | 'categoria'
  | 'nomeRede'
  | 'parceiro';

export default function ImportadorPlanilhas({ onVendasImportadas }: ImportadorPlanilhasProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [torreSelecionada, setTorreSelecionada] = useState<TorrePlanilha>('AVANCADOS');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [vendasEmRevisao, setVendasEmRevisao] = useState<RegistroVenda[]>([]);
  const [vendasProcessadas, setVendasProcessadas] = useState<RegistroVenda[]>([]);
  const [emRevisao, setEmRevisao] = useState(false);

  const handleArquivoSelecionado = (event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivoSelecionado = event.target.files?.[0];
    if (arquivoSelecionado) {
      if (validarArquivoExcel(arquivoSelecionado)) {
        setArquivo(arquivoSelecionado);
        setErro(null);
      } else {
        setErro('Por favor, selecione um arquivo Excel válido (.xlsx, .xls ou .csv)');
        setArquivo(null);
      }
    }
  };

  const handleImportar = async () => {
    if (!arquivo) return;

    setCarregando(true);
    setErro(null);
    setMensagemSucesso(null);

    try {
      const mapeamento = MAPEAMENTOS_PADRAO[torreSelecionada];
      const vendas = await importarPlanilhaExcel(arquivo, mapeamento);

      setVendasEmRevisao(vendas);
      setEmRevisao(true);
      setMensagemSucesso('Revise os pedidos importados, ajuste valores ou exclua entradas antes de processar.');

      setArquivo(null);

      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setErro(`Erro ao importar planilha: ${error}`);
    } finally {
      setCarregando(false);
    }
  };

  const handleCancelarRevisao = () => {
    setVendasEmRevisao([]);
    setEmRevisao(false);
    setMensagemSucesso(null);
  };

  const handleEditarVenda = (id: string, campo: CampoEdicao, valor: string) => {
    setVendasEmRevisao(prev => prev.map(venda => {
      if (venda.id !== id) return venda;

      switch (campo) {
        case 'valorBrutoSN':
          return { ...venda, valorBrutoSN: normalizarValor(valor) };
        case 'dataAtivacao':
          return { ...venda, dataAtivacao: valor ? new Date(`${valor}T00:00:00`) : venda.dataAtivacao };
        case 'categoria':
          return { ...venda, categoria: valor as RegistroVenda['categoria'] };
        case 'parceiro':
          return { ...venda, parceiro: valor as RegistroVenda['parceiro'] };
        case 'nomeRede':
          return { ...venda, nomeRede: valor };
        case 'pedidoSN':
          return { ...venda, pedidoSN: valor };
        case 'nomeCliente':
          return { ...venda, nomeCliente: valor };
        case 'produto':
          return { ...venda, produto: valor };
        default:
          return venda;
      }
    }));
  };

  const handleRemoverVenda = (id: string) => {
    setVendasEmRevisao(prev => prev.filter(venda => venda.id !== id));
  };

  const handleConfirmarProcessamento = () => {
    if (vendasEmRevisao.length === 0) {
      setErro('Nenhum pedido selecionado para processamento.');
      return;
    }

    onVendasImportadas(vendasEmRevisao);
    setVendasProcessadas(vendasEmRevisao);
    setVendasEmRevisao([]);
    setEmRevisao(false);
    setMensagemSucesso('Pedidos processados e enviados para o dashboard com sucesso!');
  };

  return (
    <div className="importador-container fade-in">
      <div className="importador-card glass-card">
        <div className="importador-header">
          <FileSpreadsheet size={32} className="header-icon" />
          <h2>Importar Planilhas</h2>
          <p>Faça upload das planilhas de ativação para processar automaticamente</p>
        </div>

        <div className="torre-selector">
          <label htmlFor="torre-select">Selecione a Torre/Planilha:</label>
          <select
            id="torre-select"
            className="select"
            value={torreSelecionada}
            onChange={(event) => setTorreSelecionada(event.target.value as TorrePlanilha)}
          >
            <option value="AVANCADOS">Avançados (Dados/Voz)</option>
            <option value="TI_GUD">TI / GUD</option>
            <option value="TECH">Tech</option>
          </select>
          <p className="torre-hint">
            Cada torre possui colunas específicas. Selecione a torre correspondente à sua planilha.
          </p>
        </div>

        <div className="upload-area">
          <label htmlFor="file-input" className={`upload-label ${arquivo ? 'has-file' : ''}`}>
            <Upload size={48} />
            {arquivo ? (
              <>
                <p className="file-name">{arquivo.name}</p>
                <p className="file-size">{(arquivo.size / 1024).toFixed(2)} KB</p>
              </>
            ) : (
              <>
                <p>Arraste e solte ou clique para selecionar</p>
                <p className="upload-hint">Formatos aceitos: .xlsx, .xls, .csv</p>
              </>
            )}
          </label>
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleArquivoSelecionado}
            className="file-input"
          />
        </div>

        {erro && (
          <div className="message error-message">
            <XCircle size={20} />
            <span>{erro}</span>
          </div>
        )}

        {mensagemSucesso && (
          <div className="message success-message">
            <CheckCircle size={20} />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        <div className="importador-actions">
          <button
            className="btn btn-primary"
            onClick={handleImportar}
            disabled={!arquivo || carregando}
          >
            {carregando ? 'Importando...' : 'Importar Planilha'}
          </button>
        </div>

        <div className="importador-info glass-card">
          <h3>
            Colunas Esperadas - Torre {torreSelecionada === 'AVANCADOS' ? 'Avançados' : torreSelecionada === 'TI_GUD' ? 'TI/GUD' : 'Tech'}
          </h3>
          <ul>
            <li><strong>Coluna D - NR_CNPJ:</strong> CNPJ do cliente</li>
            <li><strong>Coluna E - NM_CLIENTE:</strong> Nome do cliente</li>
            <li><strong>Coluna H - TP_SOLICITACAO:</strong> Tipo (VENDA ou MIGRAÇÃOVENDA)</li>
            <li><strong>Coluna R - PEDIDO_SN:</strong> Número do pedido</li>
            <li><strong>Coluna T - TP_PRODUTO:</strong> Tipo do produto</li>
            <li><strong>Coluna U - DS_PRODUTO:</strong> Descrição do produto</li>
            <li><strong>Coluna AO - DT_RFB:</strong> Data de ativação</li>
            <li><strong>Coluna BE - NM_REDE:</strong> Nome da rede/parceiro</li>
          </ul>

          <div className="regra-importante">
            <strong>⚠️ Regras Importantes:</strong>
            <p><strong>1. Tipo de Solicitação:</strong> Apenas registros com <strong>TP_SOLICITACAO = "VENDA"</strong> serão contabilizados</p>
            <p><strong>2. IP Dedicado:</strong> Pedidos com <strong>"Monitora Dados"</strong> e <strong>"IP Internet"</strong> do mesmo cliente são agrupados automaticamente ao pedido principal.</p>
            <p><strong>3. Revisão Manual:</strong> Ajuste valores e parceiros antes de processar para garantir fidelidade dos relatórios.</p>
          </div>

          <div className="colunas-opcionais">
            <h4>Colunas Obrigatórias:</h4>
            <p style={{ color: 'var(--color-gray-400)', fontSize: '0.9rem' }}>
              Todas as colunas listadas acima são obrigatórias para o correto processamento da planilha.
            </p>
          </div>
        </div>
      </div>

      {emRevisao && (
        <ListaPedidos
          titulo="Revisar pedidos antes do processamento"
          vendas={vendasEmRevisao}
          modoEdicao
          onEditar={handleEditarVenda}
          onRemover={handleRemoverVenda}
          onConfirmar={handleConfirmarProcessamento}
          onCancelar={handleCancelarRevisao}
        />
      )}

      {!emRevisao && vendasProcessadas.length > 0 && (
        <ListaPedidos
          titulo="Última importação processada"
          vendas={vendasProcessadas}
        />
      )}
    </div>
  );
}
