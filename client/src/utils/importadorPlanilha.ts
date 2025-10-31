import * as XLSX from 'xlsx';
import type { RegistroVenda, TipoVenda, ParceiroVivo, AreaAtuacao } from '../types/certification';

/**
 * Identifica a categoria do produto baseado no nome
 */
export function identificarCategoriaProduto(produto: string):
  'DADOS_AVANCADOS' | 'VOZ_AVANCADA' | 'DIGITAL_TI' | 'NOVOS_PRODUTOS' | 'LOCACAO_EQUIPAMENTOS' | 'LICENCAS' {

  const produtoLower = produto.toLowerCase();

  // Dados Avançados: Internet Dedicada, VPN IP, Vivo Internet Satélite, Vox, Frame Relay
  if (
    produtoLower.includes('internet dedicada') ||
    produtoLower.includes('vpn') ||
    produtoLower.includes('satélite') ||
    produtoLower.includes('satelite') ||
    produtoLower.includes('vox') ||
    produtoLower.includes('frame relay')
  ) {
    return 'DADOS_AVANCADOS';
  }

  // Voz Avançada + VVN: VVN, SIP, NUM, DDR, 0800
  if (
    produtoLower.includes('vvn') ||
    produtoLower.includes('sip') ||
    produtoLower.includes('num') ||
    produtoLower.includes('ddr') ||
    produtoLower.includes('0800')
  ) {
    return 'VOZ_AVANCADA';
  }

  // Digital/TI
  if (
    produtoLower.includes('digital') ||
    produtoLower.includes('ti') ||
    produtoLower.includes('cloud') ||
    produtoLower.includes('nuvem') ||
    produtoLower.includes('one shot')
  ) {
    return 'DIGITAL_TI';
  }

  // Licenças: Microsoft, Google Workspace
  if (
    produtoLower.includes('microsoft') ||
    produtoLower.includes('office') ||
    produtoLower.includes('google workspace') ||
    produtoLower.includes('licença') ||
    produtoLower.includes('licenca')
  ) {
    return 'LICENCAS';
  }

  // Locação de Equipamentos
  if (
    produtoLower.includes('locação') ||
    produtoLower.includes('locacao') ||
    produtoLower.includes('equipamento')
  ) {
    return 'LOCACAO_EQUIPAMENTOS';
  }

  // Novos Produtos (Energia, etc)
  if (
    produtoLower.includes('energia') ||
    produtoLower.includes('novo')
  ) {
    return 'NOVOS_PRODUTOS';
  }

  // Default: Dados Avançados (categoria mais comum)
  return 'DADOS_AVANCADOS';
}

/**
 * Identifica o parceiro Vivo baseado no texto
 */
export function identificarParceiro(parceiro: string): ParceiroVivo {
  const parceiroLower = parceiro.toLowerCase();

  if (parceiroLower.includes('jcl')) return 'JCL';
  if (parceiroLower.includes('tech')) return 'TECH';
  if (parceiroLower.includes('safe') || parceiroLower.includes('ti')) return 'SAFE_TI';

  return 'JCL'; // Default
}

/**
 * Normaliza valor monetário de diferentes formatos
 */
export function normalizarValor(valor: any): number {
  if (typeof valor === 'number') return valor;

  if (typeof valor === 'string') {
    // Remove símbolos de moeda e espaços
    let valorLimpo = valor.replace(/[R$\s]/g, '');
    // Substitui vírgula por ponto
    valorLimpo = valorLimpo.replace(',', '.');
    // Remove pontos de milhares (ex: 1.000.00 -> 1000.00)
    valorLimpo = valorLimpo.replace(/\.(?=\d{3})/g, '');

    const numero = parseFloat(valorLimpo);
    return isNaN(numero) ? 0 : numero;
  }

  return 0;
}

/**
 * Normaliza data de diferentes formatos
 */
export function normalizarData(data: any): Date {
  if (data instanceof Date) return data;

  if (typeof data === 'string') {
    // Tenta diferentes formatos de data
    // DD/MM/YYYY
    const regexBR = /(\d{2})\/(\d{2})\/(\d{4})/;
    const matchBR = data.match(regexBR);
    if (matchBR) {
      const [, dia, mes, ano] = matchBR;
      return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    }

    // YYYY-MM-DD
    const regexISO = /(\d{4})-(\d{2})-(\d{2})/;
    const matchISO = data.match(regexISO);
    if (matchISO) {
      const [, ano, mes, dia] = matchISO;
      return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    }
  }

  // Se for número (Excel serial date)
  if (typeof data === 'number') {
    // Excel usa 1/1/1900 como base
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    return new Date(excelEpoch.getTime() + data * msPerDay);
  }

  return new Date(); // Default: data atual
}

/**
 * Identifica tipo de ganho baseado em TIPO_GANHO_DETALHE
 */
export function identificarTipoGanho(tipoGanho: string): import('../types/certification').TipoGanho {
  const tipoLower = tipoGanho?.toLowerCase() || '';

  if (tipoLower.includes('ganho')) {
    return 'GANHO';
  }
  if (tipoLower.includes('perda')) {
    return 'PERDA';
  }
  if (tipoLower.includes('migra')) {
    return 'MIGRACAO';
  }

  return 'GANHO'; // Default
}

/**
 * Identifica tipo de venda/migração
 */
export function identificarTipoVenda(tipo: string): TipoVenda {
  const tipoLower = tipo.toLowerCase();

  if (tipoLower.includes('migra') || tipoLower.includes('migr')) {
    return 'MIGRACAO';
  }

  return 'VENDA';
}

/**
 * Identifica área de atuação
 */
export function identificarAreaAtuacao(area: string): AreaAtuacao {
  const areaLower = area?.toLowerCase() || '';

  if (areaLower.includes('fora') || areaLower.includes('externa')) {
    return 'FORA';
  }

  return 'DENTRO';
}

/**
 * Interface para mapeamento de colunas específicas por torre
 */
export interface MapeamentoColunas {
  torre: import('../types/certification').TorrePlanilha;
  dataRFS: string; // DT_RFS
  valorBrutoSN: string; // VL_BRUTO_SN
  produto: string; // DS_PRODUTO
  tipoGanhoDetalhe?: string; // TIPO_GANHO_DETALHE (obrigatório para Avançados)
  cnpj?: string;
  cliente?: string;
  parceiro?: string;
  area?: string;
}

/**
 * Mapeamentos padrão para cada torre
 */
export const MAPEAMENTOS_PADRAO: Record<import('../types/certification').TorrePlanilha, MapeamentoColunas> = {
  AVANCADOS: {
    torre: 'AVANCADOS',
    dataRFS: 'DT_RFS',
    valorBrutoSN: 'VL_BRUTO_SN',
    produto: 'DS_PRODUTO',
    tipoGanhoDetalhe: 'TIPO_GANHO_DETALHE',
    cnpj: 'CNPJ',
    cliente: 'CLIENTE',
    parceiro: 'PARCEIRO'
  },
  TI_GUD: {
    torre: 'TI_GUD',
    dataRFS: 'DT_RFS',
    valorBrutoSN: 'VL_BRUTO_SN',
    produto: 'DS_PRODUTO',
    tipoGanhoDetalhe: 'TIPO_GANHO_DETALHE',
    cnpj: 'CNPJ',
    cliente: 'CLIENTE',
    parceiro: 'PARCEIRO'
  },
  TECH: {
    torre: 'TECH',
    dataRFS: 'DT_RFS',
    valorBrutoSN: 'VL_BRUTO_SN',
    produto: 'DS_PRODUTO',
    tipoGanhoDetalhe: 'TIPO_GANHO_DETALHE',
    cnpj: 'CNPJ',
    cliente: 'CLIENTE',
    parceiro: 'PARCEIRO'
  }
};

/**
 * Importa dados de uma planilha Excel com base na torre específica
 */
export function importarPlanilhaExcel(
  arquivo: File,
  mapeamento: MapeamentoColunas
): Promise<RegistroVenda[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });

        // Pega a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Converte para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Processa cada linha aplicando as regras corretas
        const vendas = jsonData
          .map((row: any, index): RegistroVenda | null => {
            const id = `venda-${mapeamento.torre}-${Date.now()}-${index}`;

            // Extrai dados obrigatórios
            const dataAtivacao = normalizarData(row[mapeamento.dataRFS]);
            const produto = row[mapeamento.produto] || '';

            // Se não houver produto, ignora a linha
            if (!produto) return null;

            // Extrai TIPO_GANHO_DETALHE
            const tipoGanhoRaw = mapeamento.tipoGanhoDetalhe
              ? row[mapeamento.tipoGanhoDetalhe]
              : '';
            const tipoGanho = identificarTipoGanho(tipoGanhoRaw);

            // REGRA IMPORTANTE: Só considera receita se TIPO_GANHO_DETALHE for "GANHO"
            let valorBrutoSN = 0;
            if (tipoGanho === 'GANHO') {
              valorBrutoSN = normalizarValor(row[mapeamento.valorBrutoSN]);
            }

            // Determina tipo de venda baseado no tipoGanho
            const tipoVenda: TipoVenda = tipoGanho === 'MIGRACAO' ? 'MIGRACAO' : 'VENDA';

            // Dados opcionais
            const parceiro = mapeamento.parceiro
              ? identificarParceiro(row[mapeamento.parceiro] || '')
              : 'JCL';
            const cnpj = mapeamento.cnpj ? row[mapeamento.cnpj] || '' : '';
            const nomeCliente = mapeamento.cliente ? row[mapeamento.cliente] || 'Cliente não especificado' : 'Cliente não especificado';
            const areaAtuacao = mapeamento.area
              ? identificarAreaAtuacao(row[mapeamento.area] || 'DENTRO')
              : 'DENTRO';

            // Identifica categoria baseada na torre e produto
            const categoria = identificarCategoriaProduto(produto);

            return {
              id,
              dataAtivacao,
              valorBrutoSN,
              tipoVenda,
              tipoGanho,
              parceiro,
              produto,
              categoria,
              cnpj,
              nomeCliente,
              areaAtuacao,
              torre: mapeamento.torre
            };
          })
          .filter((venda): venda is RegistroVenda => venda !== null); // Remove nulls

        resolve(vendas);
      } catch (error) {
        reject(new Error(`Erro ao processar planilha: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsBinaryString(arquivo);
  });
}

/**
 * Exporta dados para Excel
 */
export function exportarParaExcel(vendas: RegistroVenda[], nomeArquivo: string = 'vendas.xlsx'): void {
  // Prepara dados para exportação
  const dadosExport = vendas.map(venda => ({
    'Data Ativação': venda.dataAtivacao.toLocaleDateString('pt-BR'),
    'Cliente': venda.nomeCliente,
    'CNPJ': venda.cnpj,
    'Produto': venda.produto,
    'Categoria': venda.categoria,
    'Valor Bruto SN': venda.valorBrutoSN.toFixed(2),
    'Tipo': venda.tipoVenda,
    'Parceiro': venda.parceiro,
    'Área': venda.areaAtuacao
  }));

  // Cria workbook e worksheet
  const worksheet = XLSX.utils.json_to_sheet(dadosExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendas');

  // Gera arquivo e faz download
  XLSX.writeFile(workbook, nomeArquivo);
}

/**
 * Valida se o arquivo é um Excel válido
 */
export function validarArquivoExcel(arquivo: File): boolean {
  const extensoesValidas = ['.xlsx', '.xls', '.csv'];
  const nomeArquivo = arquivo.name.toLowerCase();

  return extensoesValidas.some(ext => nomeArquivo.endsWith(ext));
}

/**
 * Extrai nomes das colunas de uma planilha para ajudar no mapeamento
 */
export function extrairColunasPlanilha(arquivo: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
          const colunas = (jsonData[0] as any[]).filter(col => col);
          resolve(colunas);
        } else {
          resolve([]);
        }
      } catch (error) {
        reject(new Error(`Erro ao extrair colunas: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsBinaryString(arquivo);
  });
}
