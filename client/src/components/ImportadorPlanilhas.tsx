import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import type { RegistroVenda } from '../types/certification';
import { importarPlanilhaExcel, validarArquivoExcel, type MapeamentoColunas } from '../utils/importadorPlanilha';
import './ImportadorPlanilhas.css';

interface ImportadorPlanilhasProps {
  onVendasImportadas: (vendas: RegistroVenda[]) => void;
}

export default function ImportadorPlanilhas({ onVendasImportadas }: ImportadorPlanilhasProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
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
      // Mapeamento padrão das colunas (ajuste conforme suas planilhas)
      const mapeamento: MapeamentoColunas = {
        dataAtivacao: 'Data Ativação',
        valorBruto: 'Valor Bruto SN',
        tipo: 'Tipo',
        parceiro: 'Parceiro',
        produto: 'Produto',
        cnpj: 'CNPJ',
        cliente: 'Cliente',
        area: 'Área'
      };

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
          <h3>Colunas Esperadas na Planilha</h3>
          <ul>
            <li><strong>Data Ativação:</strong> Data de ativação do serviço</li>
            <li><strong>Valor Bruto SN:</strong> Valor bruto sem desconto</li>
            <li><strong>Tipo:</strong> Venda ou Migração</li>
            <li><strong>Parceiro:</strong> JCL, TECH ou SAFE TI</li>
            <li><strong>Produto:</strong> Nome do produto/serviço</li>
            <li><strong>CNPJ:</strong> CNPJ do cliente</li>
            <li><strong>Cliente:</strong> Nome do cliente</li>
            <li><strong>Área:</strong> Dentro ou Fora (opcional)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
