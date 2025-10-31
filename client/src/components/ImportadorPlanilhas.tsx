import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import type { RegistroVenda, TorrePlanilha } from '../types/certification';
import { importarPlanilhaExcel, validarArquivoExcel, MAPEAMENTOS_PADRAO } from '../utils/importadorPlanilha';
import './ImportadorPlanilhas.css';

interface ImportadorPlanilhasProps {
  onVendasImportadas: (vendas: RegistroVenda[]) => void;
}

export default function ImportadorPlanilhas({ onVendasImportadas }: ImportadorPlanilhasProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [torreSelecionada, setTorreSelecionada] = useState<TorrePlanilha>('AVANCADOS');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

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
    setSucesso(false);

    try {
      // Usa o mapeamento padrão para a torre selecionada
      const mapeamento = MAPEAMENTOS_PADRAO[torreSelecionada];

      const vendas = await importarPlanilhaExcel(arquivo, mapeamento);
      onVendasImportadas(vendas);
      setSucesso(true);
      setArquivo(null);

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      setErro(`Erro ao importar planilha: ${error}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="importador-container fade-in">
      <div className="importador-card glass-card">
        <div className="importador-header">
          <FileSpreadsheet size={32} className="header-icon" />
          <h2>Importar Planilhas</h2>
          <p>Faça upload das planilhas de ativação para processar automaticamente</p>
        </div>

        {/* Seletor de Torre */}
        <div className="torre-selector">
          <label htmlFor="torre-select">Selecione a Torre/Planilha:</label>
          <select
            id="torre-select"
            className="select"
            value={torreSelecionada}
            onChange={(e) => setTorreSelecionada(e.target.value as TorrePlanilha)}
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

        {sucesso && (
          <div className="message success-message">
            <CheckCircle size={20} />
            <span>Planilha importada com sucesso!</span>
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
          <h3>Colunas Esperadas - Torre {torreSelecionada === 'AVANCADOS' ? 'Avançados' : torreSelecionada === 'TI_GUD' ? 'TI/GUD' : 'Tech'}</h3>
          <ul>
            <li><strong>DT_RFS:</strong> Data de referência do serviço (mês da competência)</li>
            <li><strong>DS_PRODUTO:</strong> Descrição/nome do produto ou serviço</li>
            <li><strong>VL_BRUTO_SN:</strong> Valor bruto sem desconto</li>
            <li><strong>TIPO_GANHO_DETALHE:</strong> Tipo do movimento (GANHO, PERDA ou MIGRAÇÃO)</li>
          </ul>

          <div className="regra-importante">
            <strong>⚠️ Regra Importante:</strong>
            <p>Somente serão contabilizados registros onde <strong>TIPO_GANHO_DETALHE = "GANHO"</strong></p>
            <p>Migrações e Perdas não computam receita para a certificação</p>
          </div>

          <div className="colunas-opcionais">
            <h4>Colunas Opcionais:</h4>
            <ul>
              <li>CNPJ</li>
              <li>CLIENTE</li>
              <li>PARCEIRO</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
