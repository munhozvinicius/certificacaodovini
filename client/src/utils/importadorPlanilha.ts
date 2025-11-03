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
  if (valor === null || valor === undefined) return 0;

  if (typeof valor === 'number') {
    return Number.isNaN(valor) ? 0 : valor;
  }

  if (typeof valor === 'string') {
    const valorTrim = valor.trim();

    if (!valorTrim || /^(null|nulo|nan)$/i.test(valorTrim)) {
      return 0;
    }

    const negativo = valorTrim.includes('-');

    // Mantém apenas dígitos, separadores decimais e de milhares
    let valorNumerico = valorTrim.replace(/-/g, '');
    valorNumerico = valorNumerico.replace(/[^0-9.,]/g, '');

    if (!valorNumerico) {
      return 0;
    }

    const ultimoPonto = valorNumerico.lastIndexOf('.');
    const ultimaVirgula = valorNumerico.lastIndexOf(',');

    let separadorDecimal = '';
    if (ultimaVirgula > ultimoPonto) {
      separadorDecimal = ',';
    } else if (ultimoPonto > -1) {
      separadorDecimal = '.';
    }

    let parteInteira = valorNumerico;
    let parteDecimal = '';

    if (separadorDecimal) {
      const partes = valorNumerico.split(separadorDecimal);
      parteDecimal = partes.pop() ?? '';
      parteInteira = partes.join('');

      parteInteira = parteInteira.replace(/[^0-9]/g, '');
      parteDecimal = parteDecimal.replace(/[^0-9]/g, '');

      // Se houver mais de 2 dígitos decimais, provavelmente é separador de milhares
      if (parteDecimal.length > 2) {
        parteInteira += parteDecimal;
        parteDecimal = '';
      }
    } else {
      parteInteira = parteInteira.replace(/[^0-9]/g, '');
    }

    const valorNormalizado = parteDecimal ? `${parteInteira}.${parteDecimal}` : parteInteira;
    const numero = parseFloat(valorNormalizado);

    if (Number.isNaN(numero)) {
      return 0;
    }

    return negativo ? -numero : numero;
  }

  return 0;
}

/**
 * Normaliza data de diferentes formatos
 */
export function normalizarData(data: any): Date {
  return tentarConverterData(data) ?? new Date();
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
 * Normaliza nomes de colunas para facilitar o mapeamento
 */
function normalizarNomeColuna(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

/**
 * Conjunto de variações conhecidas para cada coluna importante
 */
const VARIACOES_COLUNAS: Record<string, string[]> = {
  NR_CNPJ: ['CNPJ', 'NR CNPJ', 'CPF/CNPJ', 'DOCUMENTO', 'CNPJ CLIENTE'],
  NM_CLIENTE: ['CLIENTE', 'NOME CLIENTE', 'RAZAO SOCIAL', 'NOME'],
  TP_SOLICITACAO: ['TP SOLICITACAO', 'TIPO SOLICITACAO', 'TIPO DA SOLICITACAO', 'TIPO DE SOLICITACAO'],
  PEDIDO_SN: ['PEDIDO SN', 'PEDIDO', 'NUMERO PEDIDO', 'NR PEDIDO SN', 'PEDIDOSN', 'PEDIDO SERVICE NOW'],
  TP_PRODUTO: ['TP PRODUTO', 'TIPO PRODUTO', 'FAMILIA PRODUTO'],
  DS_PRODUTO: ['PRODUTO', 'DESCRICAO PRODUTO', 'DESCRIÇÃO PRODUTO', 'NOME PRODUTO'],
  DT_RFB: ['DT RFB', 'DATA RFB', 'DATA ATIVACAO', 'DATA ATIVAÇÃO', 'DT ATIVACAO', 'DATA RFB ATIVACAO'],
  NM_REDE: ['NM REDE', 'REDE', 'NOME REDE', 'PARCEIRO', 'NOME PARCEIRO', 'CANAL'],
  VL_BRUTO_SN: ['VALOR BRUTO SN', 'VALOR BRUTO', 'VL BRUTO SN', 'VL BRUTO', 'VALOR VENDA', 'VALOR TOTAL', 'VL PROPOSTA', 'VALOR PROPOSTA', 'VALOR LIQUIDO'],
  VL_LIQUIDO_SN: ['VALOR LIQUIDO SN', 'VALOR LIQUIDO', 'VL LIQUIDO', 'VALOR NET', 'VALOR LIQUIDO TOTAL'],
  DS_STATUS_SIMULACAO: ['STATUS SIMULACAO', 'STATUS SIMULAÇÃO'],
  DS_SEGMENTO: ['SEGMENTO', 'DS SEGMENTO'],
  DT_PEDIDO_SN: ['DATA PEDIDO', 'DATA PEDIDO SN', 'DT PEDIDO SN'],
  DT_CONCLUSAO_SIMULACAO: ['DATA CONCLUSAO', 'DATA CONCLUSÃO', 'DT CONCLUSAO', 'DT CONCLUSAO SIMULACAO'],
  TP_RESULTADO: ['RESULTADO', 'TIPO RESULTADO', 'TP RESULTADO'],
  STATUS_PEDIDO_SN: ['STATUS PEDIDO', 'STATUS PEDIDO SN'],
  DS_STATUS_PEDIDO_REAL_SIMPLIFICADO: ['STATUS PEDIDO REAL', 'STATUS PEDIDO REAL SIMPLIFICADO', 'STATUS SIMPLIFICADO']
};

const CAMPOS_VALOR_PRIORIDADE = [
  'VL_BRUTO_SN',
  'VALOR_BRUTO_SN',
  'VL_BRUTO',
  'VALOR_BRUTO',
  'VL_LIQUIDO_SN',
  'VALOR_LIQUIDO_SN',
  'VL_LIQUIDO',
  'VALOR_LIQUIDO',
  'VALOR_TOTAL',
  'VALOR',
  'VALOR_PROPOSTA',
  'VL_PROPOSTA',
  'VL_PROPOSTA_LIQUIDO',
  'VALOR_VENDA',
  'VALOR_PEDIDO'
];

function tentarConverterData(data: any): Date | null {
  if (data === null || data === undefined || data === '') {
    return null;
  }

  if (data instanceof Date) {
    return Number.isNaN(data.getTime()) ? null : data;
  }

  if (typeof data === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    const resultado = new Date(excelEpoch.getTime() + data * msPerDay);
    return Number.isNaN(resultado.getTime()) ? null : resultado;
  }

  if (typeof data === 'string') {
    const texto = data.trim();

    if (!texto || /^(null|nulo)$/i.test(texto)) {
      return null;
    }

    const regexBR = /(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/;
    const matchBR = texto.match(regexBR);
    if (matchBR) {
      const [, dia, mes, ano, hora = '0', minuto = '0', segundo = '0'] = matchBR;
      const resultado = new Date(
        parseInt(ano, 10),
        parseInt(mes, 10) - 1,
        parseInt(dia, 10),
        parseInt(hora, 10),
        parseInt(minuto, 10),
        parseInt(segundo, 10)
      );
      return Number.isNaN(resultado.getTime()) ? null : resultado;
    }

    const regexISO = /(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/;
    const matchISO = texto.match(regexISO);
    if (matchISO) {
      const [, ano, mes, dia, hora = '0', minuto = '0', segundo = '0'] = matchISO;
      const resultado = new Date(
        parseInt(ano, 10),
        parseInt(mes, 10) - 1,
        parseInt(dia, 10),
        parseInt(hora, 10),
        parseInt(minuto, 10),
        parseInt(segundo, 10)
      );
      return Number.isNaN(resultado.getTime()) ? null : resultado;
    }

    const timestamp = Date.parse(texto);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp);
    }
  }

  return null;
}

function normalizarDataOpcional(data: any): Date | null {
  return tentarConverterData(data);
}

function obterTextoCampo(valor: any): string | undefined {
  if (valor === null || valor === undefined) {
    return undefined;
  }

  if (typeof valor === 'string') {
    const texto = valor.trim();
    if (!texto || /^(null|nulo)$/i.test(texto)) {
      return undefined;
    }
    return texto;
  }

  if (typeof valor === 'number') {
    if (Number.isNaN(valor)) return undefined;
    return valor.toString();
  }

  return String(valor);
}

function mapearColunasLinha(linha: LinhaRawPlanilha): LinhaRawPlanilha {
  const linhaNormalizada: LinhaRawPlanilha = { ...linha };
  const mapaOriginais: Record<string, string> = {};

  Object.keys(linha).forEach(chave => {
    mapaOriginais[normalizarNomeColuna(chave)] = chave;
  });

  Object.entries(VARIACOES_COLUNAS).forEach(([colunaPadrao, variacoes]) => {
    if (linhaNormalizada[colunaPadrao] !== undefined && linhaNormalizada[colunaPadrao] !== null) {
      return;
    }

    for (const variacao of [colunaPadrao, ...variacoes]) {
      const chaveNormalizada = normalizarNomeColuna(variacao);
      const chaveOriginal = mapaOriginais[chaveNormalizada];

      if (chaveOriginal !== undefined) {
        const valorOriginal = linha[chaveOriginal];
        linhaNormalizada[colunaPadrao] = typeof valorOriginal === 'string'
          ? valorOriginal.trim()
          : valorOriginal;
        break;
      }
    }
  });

  return linhaNormalizada;
}

function normalizarLinhasPlanilha(linhas: LinhaRawPlanilha[]): LinhaRawPlanilha[] {
  return linhas.map(linha => {
    const normalizada = mapearColunasLinha(linha);
    Object.keys(normalizada).forEach(chave => {
      const valor = normalizada[chave];
      if (typeof valor === 'string') {
        normalizada[chave] = valor.trim();
      }
    });
    return normalizada;
  });
}

function obterValorMonetarioLinha(linha: LinhaRawPlanilha): number {
  for (const campo of CAMPOS_VALOR_PRIORIDADE) {
    const valorCampo = linha[campo];
    if (valorCampo !== undefined && valorCampo !== null && valorCampo !== '') {
      const valorNormalizado = normalizarValor(valorCampo);
      if (valorNormalizado !== 0) {
        return valorNormalizado;
      }
      const textoCampo = obterTextoCampo(valorCampo);
      if (textoCampo !== undefined) {
        return 0;
      }
    }
  }

  return 0;
}

function detectarSeparadorCSV(conteudo: string): string {
  const primeiraLinha = conteudo.split(/\r?\n/)[0] || '';
  const candidatos = [';', ',', '	'];
  let melhorSeparador = ',';
  let maiorContagem = 0;

  for (const candidato of candidatos) {
    const contagem = primeiraLinha.split(candidato).length - 1;
    if (contagem > maiorContagem) {
      maiorContagem = contagem;
      melhorSeparador = candidato;
    }
  }

  return melhorSeparador;
}

function extrairMetadadosPedido(linha: LinhaRawPlanilha) {
  return {
    statusSimulacao: obterTextoCampo(linha.DS_STATUS_SIMULACAO),
    statusPedidoSN: obterTextoCampo(linha.STATUS_PEDIDO_SN),
    resultadoSimplifique: obterTextoCampo(linha.TP_RESULTADO),
    statusPedidoSimplificado: obterTextoCampo(linha.DS_STATUS_PEDIDO_REAL_SIMPLIFICADO),
    segmento: obterTextoCampo(linha.DS_SEGMENTO),
    dataPedidoSN: normalizarDataOpcional(linha.DT_PEDIDO_SN),
    dataConclusaoSimulacao: normalizarDataOpcional(linha.DT_CONCLUSAO_SIMULACAO)
  };
}

/**
 * Interface para linha bruta da planilha
 */
interface LinhaRawPlanilha {
  NR_CNPJ?: string;
  NM_CLIENTE?: string;
  TP_SOLICITACAO?: string;
  PEDIDO_SN?: string | number;
  TP_PRODUTO?: string;
  DS_PRODUTO?: string;
  DT_RFB?: any;
  NM_REDE?: string;
  VL_BRUTO_SN?: any;
  VL_LIQUIDO_SN?: any;
  VALOR?: any;
  DS_STATUS_SIMULACAO?: string;
  DS_SEGMENTO?: string;
  DT_PEDIDO_SN?: any;
  DT_CONCLUSAO_SIMULACAO?: any;
  TP_RESULTADO?: string;
  STATUS_PEDIDO_SN?: string;
  DS_STATUS_PEDIDO_REAL_SIMPLIFICADO?: string;
  [key: string]: any; // Permite outras colunas
}

/**
 * Interface para grupo de pedidos IP Dedicado
 */
interface GrupoIPDedicado {
  pedidoSN: string;
  cnpj: string;
  cnpjNormalizado: string;
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
    const produto = obterTextoCampo(linha.DS_PRODUTO)?.toLowerCase() || '';
    const pedidoSN = obterTextoCampo(linha.PEDIDO_SN) || '';
    const cnpjOriginal = obterTextoCampo(linha.NR_CNPJ) || '';
    const cnpjNormalizado = cnpjOriginal.replace(/\D/g, '');

    if (!produto || !pedidoSN || !cnpjOriginal) return;

    if (produto.includes('ip dedicado')) {
      const valorLinha = obterValorMonetarioLinha(linha);
      grupos.set(pedidoSN, {
        pedidoSN,
        cnpj: cnpjOriginal,
        cnpjNormalizado,
        cliente: obterTextoCampo(linha.NM_CLIENTE) || '',
        pedidosRelacionados: [{
          pedidoSN,
          produto: obterTextoCampo(linha.DS_PRODUTO) || '',
          valor: valorLinha
        }],
        valorTotal: valorLinha,
        dataAtivacao: normalizarData(linha.DT_RFB),
        tipoSolicitacao: obterTextoCampo(linha.TP_SOLICITACAO) || '',
        nomeRede: obterTextoCampo(linha.NM_REDE)
      });
    }
  });

  // Agrupa produtos relacionados (Monitora Dados e IP Internet)
  linhas.forEach(linha => {
    const produto = obterTextoCampo(linha.DS_PRODUTO)?.toLowerCase() || '';
    const cnpjOriginal = obterTextoCampo(linha.NR_CNPJ) || '';
    const pedidoSN = obterTextoCampo(linha.PEDIDO_SN) || '';

    if (!produto || !cnpjOriginal || !pedidoSN) return;

    if (produto.includes('monitora dados') || produto.includes('ip internet')) {
      // Procura o grupo correspondente pelo CNPJ
      const cnpjNormalizado = cnpjOriginal.replace(/\D/g, '');
      for (const [, grupo] of grupos.entries()) {
        if (grupo.cnpjNormalizado === cnpjNormalizado) {
          // Adiciona o pedido relacionado
          const valorLinha = obterValorMonetarioLinha(linha);
          grupo.pedidosRelacionados.push({
            pedidoSN,
            produto: obterTextoCampo(linha.DS_PRODUTO) || '',
            valor: valorLinha
          });
          grupo.valorTotal += valorLinha;
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
    const isCSV = arquivo.name.toLowerCase().endsWith('.csv');

    reader.onload = (e) => {
      try {
        const data = e.target?.result;

        if (!data) {
          throw new Error('Arquivo vazio');
        }

        let workbook: XLSX.WorkBook;

        if (isCSV) {
          const conteudo = data as string;
          const separador = detectarSeparadorCSV(conteudo);
          workbook = XLSX.read(conteudo, { type: 'string', raw: false, FS: separador });
        } else {
          const arrayBuffer = data as ArrayBuffer;
          workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
        }

        // Pega a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Converte para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: '',
          raw: false
        }) as LinhaRawPlanilha[];

        const linhasNormalizadas = normalizarLinhasPlanilha(jsonData);

        // Agrupa pedidos de IP Dedicado
        const gruposIPDedicado = agruparPedidosIPDedicado(linhasNormalizadas);

        // IDs de pedidos já processados
        const pedidosProcessados = new Set<string>();

        // Processa cada linha aplicando as regras corretas
        const vendas: RegistroVenda[] = [];

        linhasNormalizadas.forEach((row, index) => {
          const pedidoSN = obterTextoCampo(row.PEDIDO_SN) || '';
          const produto = obterTextoCampo(row.DS_PRODUTO) || '';
          const tipoSolicitacao = obterTextoCampo(row.TP_SOLICITACAO) || '';

          // Se não houver produto ou pedido, ignora
          if (!produto || !pedidoSN) return;

          // Se já foi processado como parte de um grupo, pula
          if (pedidosProcessados.has(pedidoSN)) return;

          // Verifica se é IP Dedicado (pedido principal)
          if (gruposIPDedicado.has(pedidoSN)) {
            const grupo = gruposIPDedicado.get(pedidoSN)!;
            const metadados = extrairMetadadosPedido(row);

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
              pedidosAgrupados: grupo.pedidosRelacionados.map(p => p.pedidoSN),
              ...metadados
            });
          } else if (!isProdutoIPDedicado(produto)) {
            // Processa produtos normais (não relacionados a IP Dedicado)

            // REGRA: Só considera VENDA (não MIGRAÇÃOVENDA)
            if (!tipoSolicitacao.toLowerCase().includes('venda') ||
                tipoSolicitacao.toLowerCase().includes('migra')) {
              return; // Pula migrações
            }

            const metadados = extrairMetadadosPedido(row);
            const valorBruto = obterValorMonetarioLinha(row);

            vendas.push({
              id: `venda-${mapeamento.torre}-${Date.now()}-${index}`,
              pedidoSN,
              dataAtivacao: normalizarData(row.DT_RFB),
              valorBrutoSN: valorBruto,
              tipoVenda: identificarTipoVenda(tipoSolicitacao),
              tipoSolicitacao,
              parceiro: identificarParceiro(row.NM_REDE || ''),
              produto,
              tipoProduto: row.TP_PRODUTO || '',
              categoria: identificarCategoriaProduto(produto),
              cnpj: obterTextoCampo(row.NR_CNPJ) || '',
              nomeCliente: obterTextoCampo(row.NM_CLIENTE) || '',
              nomeRede: obterTextoCampo(row.NM_REDE),
              areaAtuacao: 'DENTRO',
              torre: mapeamento.torre,
              ...metadados
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

    if (isCSV) {
      reader.readAsText(arquivo, 'utf-8');
    } else {
      reader.readAsArrayBuffer(arquivo);
    }
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
