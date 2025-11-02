import * as XLSX from 'xlsx';
import type { RegistroVenda, TipoVenda, ParceiroVivo, AreaAtuacao } from '../types/certification';

/**
 * Identifica a categoria do produto baseado no nome
 */
export function identificarCategoriaProduto(produto: string):
  'DADOS_AVANCADOS' | 'VOZ_AVANCADA' | 'DIGITAL_TI' | 'NOVOS_PRODUTOS' | 'LOCACAO_EQUIPAMENTOS' | 'LICENCAS' {

  const produtoLower = produto.toLowerCase();

  // Dados Avançados: Internet Dedicada, VPN IP, Vivo Internet Satélite, Vox, Frame Relay, IP dedicado
  if (
    produtoLower.includes('internet dedicada') ||
    produtoLower.includes('ip dedicado') ||
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

  // Digital/TI - Incluindo monitora dados
  if (
    produtoLower.includes('digital') ||
    produtoLower.includes('ti') ||
    produtoLower.includes('cloud') ||
    produtoLower.includes('nuvem') ||
    produtoLower.includes('one shot') ||
    produtoLower.includes('monitora dados')
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
 * Identifica tipo de venda/migração baseado em TP_SOLICITACAO
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
 * Verifica se um produto é relacionado a IP Dedicado
 */
export function isProdutoIPDedicado(produto: string): boolean {
  const produtoLower = produto.toLowerCase();
  return produtoLower.includes('ip dedicado') ||
         produtoLower.includes('monitora dados') ||
         produtoLower.includes('ip internet');
}

/**
 * Interface para linha bruta da planilha
 */
interface LinhaRawPlanilha {
  NR_CNPJ: string;
  NM_CLIENTE: string;
  TP_SOLICITACAO: string;
  PEDIDO_SN: string;
  TP_PRODUTO: string;
  DS_PRODUTO: string;
  DT_RFB: any;
  NM_REDE?: string;
  [key: string]: any; // Permite outras colunas
}

/**
 * Interface para grupo de pedidos IP Dedicado
 */
interface GrupoIPDedicado {
  pedidoSN: string;
  cnpj: string;
  cliente: string;
  pedidosRelacionados: {
    pedidoSN: string;
    produto: string;
    valor: number;
  }[];
  valorTotal: number;
  dataAtivacao: Date;
  tipoSolicitacao: string;
  nomeRede?: string;
}

/**
 * Agrupa pedidos de IP Dedicado com seus produtos relacionados
 */
function agruparPedidosIPDedicado(linhas: LinhaRawPlanilha[]): Map<string, GrupoIPDedicado> {
  const grupos = new Map<string, GrupoIPDedicado>();

  // Identifica pedidos principais (IP Dedicado)
  linhas.forEach(linha => {
    const produto = linha.DS_PRODUTO?.toLowerCase() || '';
    const pedidoSN = linha.PEDIDO_SN;
    const cnpj = linha.NR_CNPJ;

    if (produto.includes('ip dedicado')) {
      grupos.set(pedidoSN, {
        pedidoSN,
        cnpj,
        cliente: linha.NM_CLIENTE,
        pedidosRelacionados: [{
          pedidoSN,
          produto: linha.DS_PRODUTO,
          valor: normalizarValor(linha.VL_BRUTO_SN || 0)
        }],
        valorTotal: normalizarValor(linha.VL_BRUTO_SN || 0),
        dataAtivacao: normalizarData(linha.DT_RFB),
        tipoSolicitacao: linha.TP_SOLICITACAO,
        nomeRede: linha.NM_REDE
      });
    }
  });

  // Agrupa produtos relacionados (Monitora Dados e IP Internet)
  linhas.forEach(linha => {
    const produto = linha.DS_PRODUTO?.toLowerCase() || '';
    const cnpj = linha.NR_CNPJ;
    const pedidoSN = linha.PEDIDO_SN;

    if (produto.includes('monitora dados') || produto.includes('ip internet')) {
      // Procura o grupo correspondente pelo CNPJ
      for (const [, grupo] of grupos.entries()) {
        if (grupo.cnpj === cnpj) {
          // Adiciona o pedido relacionado
          grupo.pedidosRelacionados.push({
            pedidoSN,
            produto: linha.DS_PRODUTO,
            valor: normalizarValor(linha.VL_BRUTO_SN || 0)
          });
          grupo.valorTotal += normalizarValor(linha.VL_BRUTO_SN || 0);
          break;
        }
      }
    }
  });

  return grupos;
}

/**
 * Importa dados de uma planilha Excel com as colunas corretas
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as LinhaRawPlanilha[];

        // Agrupa pedidos de IP Dedicado
        const gruposIPDedicado = agruparPedidosIPDedicado(jsonData);

        // IDs de pedidos já processados
        const pedidosProcessados = new Set<string>();

        // Processa cada linha aplicando as regras corretas
        const vendas: RegistroVenda[] = [];

        jsonData.forEach((row, index) => {
          const pedidoSN = row.PEDIDO_SN;
          const produto = row.DS_PRODUTO || '';
          const tipoSolicitacao = row.TP_SOLICITACAO || '';

          // Se não houver produto ou pedido, ignora
          if (!produto || !pedidoSN) return;

          // Se já foi processado como parte de um grupo, pula
          if (pedidosProcessados.has(pedidoSN)) return;

          // Verifica se é IP Dedicado (pedido principal)
          if (gruposIPDedicado.has(pedidoSN)) {
            const grupo = gruposIPDedicado.get(pedidoSN)!;

            // Marca todos os pedidos do grupo como processados
            grupo.pedidosRelacionados.forEach(p => pedidosProcessados.add(p.pedidoSN));

            // REGRA: Só considera VENDA (não MIGRAÇÃOVENDA)
            if (!tipoSolicitacao.toLowerCase().includes('venda') ||
                tipoSolicitacao.toLowerCase().includes('migra')) {
              return; // Pula migrações
            }

            // Cria registro agrupado
            vendas.push({
              id: `venda-${mapeamento.torre}-${Date.now()}-${index}`,
              pedidoSN: grupo.pedidoSN,
              dataAtivacao: grupo.dataAtivacao,
              valorBrutoSN: grupo.valorTotal,
              tipoVenda: 'VENDA',
              tipoSolicitacao: grupo.tipoSolicitacao,
              parceiro: identificarParceiro(grupo.nomeRede || ''),
              produto: `IP Dedicado (${grupo.pedidosRelacionados.length} produtos)`,
              tipoProduto: row.TP_PRODUTO || '',
              categoria: 'DADOS_AVANCADOS',
              cnpj: grupo.cnpj,
              nomeCliente: grupo.cliente,
              nomeRede: grupo.nomeRede,
              areaAtuacao: 'DENTRO',
              torre: mapeamento.torre,
              pedidosAgrupados: grupo.pedidosRelacionados.map(p => p.pedidoSN)
            });
          } else if (!isProdutoIPDedicado(produto)) {
            // Processa produtos normais (não relacionados a IP Dedicado)

            // REGRA: Só considera VENDA (não MIGRAÇÃOVENDA)
            if (!tipoSolicitacao.toLowerCase().includes('venda') ||
                tipoSolicitacao.toLowerCase().includes('migra')) {
              return; // Pula migrações
            }

            vendas.push({
              id: `venda-${mapeamento.torre}-${Date.now()}-${index}`,
              pedidoSN,
              dataAtivacao: normalizarData(row.DT_RFB),
              valorBrutoSN: normalizarValor(row.VL_BRUTO_SN || 0),
              tipoVenda: identificarTipoVenda(tipoSolicitacao),
              tipoSolicitacao,
              parceiro: identificarParceiro(row.NM_REDE || ''),
              produto,
              tipoProduto: row.TP_PRODUTO || '',
              categoria: identificarCategoriaProduto(produto),
              cnpj: row.NR_CNPJ,
              nomeCliente: row.NM_CLIENTE,
              nomeRede: row.NM_REDE,
              areaAtuacao: 'DENTRO',
              torre: mapeamento.torre
            });
          }
        });

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
 * Interface para mapeamento de colunas específicas por torre
 */
export interface MapeamentoColunas {
  torre: import('../types/certification').TorrePlanilha;
}

/**
 * Mapeamentos padrão para cada torre
 * Agora as colunas são fixas e lidas pelos nomes corretos
 */
export const MAPEAMENTOS_PADRAO: Record<import('../types/certification').TorrePlanilha, MapeamentoColunas> = {
  AVANCADOS: {
    torre: 'AVANCADOS'
  },
  TI_GUD: {
    torre: 'TI_GUD'
  },
  TECH: {
    torre: 'TECH'
  }
};

/**
 * Exporta dados para Excel
 */
export function exportarParaExcel(vendas: RegistroVenda[], nomeArquivo: string = 'vendas.xlsx'): void {
  // Prepara dados para exportação
  const dadosExport = vendas.map(venda => ({
    'Pedido SN': venda.pedidoSN,
    'Data Ativação': venda.dataAtivacao.toLocaleDateString('pt-BR'),
    'Cliente': venda.nomeCliente,
    'CNPJ': venda.cnpj,
    'Produto': venda.produto,
    'Categoria': venda.categoria,
    'Valor Bruto SN': venda.valorBrutoSN.toFixed(2),
    'Tipo': venda.tipoVenda,
    'Parceiro': venda.parceiro,
    'Pedidos Agrupados': venda.pedidosAgrupados?.join(', ') || ''
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
