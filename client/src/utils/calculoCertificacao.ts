import {
  Classificacao,
  CLASSIFICACOES,
  FaixaReceita,
  FAIXAS_DADOS_AVANCADOS,
  FAIXAS_VOZ_AVANCADA,
  FAIXAS_DIGITAL_TI,
  FAIXAS_NOVOS_PRODUTOS,
  FAIXAS_LOCACAO_EQUIPAMENTOS,
  FAIXAS_LICENCAS,
  RegistroVenda,
  ResultadoMensal,
  ResultadoCiclo,
  SimuladorParametros,
  SimuladorResultado
} from '../types/certification';

/**
 * Calcula os pontos baseado na receita e faixa correspondente
 */
export function calcularPontosPorFaixa(receita: number, faixas: FaixaReceita[]): number {
  // Se receita for 0 ou negativa, retorna 0
  if (receita <= 0) return 0;

  // Encontra a faixa correspondente
  for (const faixa of faixas) {
    if (receita >= faixa.receitaMinima && receita < faixa.receitaMaxima) {
      return faixa.pontos;
    }
  }

  // Se não encontrou, retorna a última faixa (maior)
  return faixas[faixas.length - 1].pontos;
}

/**
 * Aplica o redutor de 50% para vendas fora da área de atuação
 */
export function aplicarRedutorAreaAtuacao(receita: number, areaAtuacao: 'DENTRO' | 'FORA'): number {
  if (areaAtuacao === 'FORA') {
    return receita * 0.5; // Redutor de 50%
  }
  return receita;
}

/**
 * Filtra apenas vendas (exclui migrações)
 */
export function filtrarVendas(vendas: RegistroVenda[]): RegistroVenda[] {
  return vendas.filter(venda => venda.tipoVenda === 'VENDA');
}

/**
 * Agrupa vendas por mês
 */
export function agruparVendasPorMes(vendas: RegistroVenda[]): Map<string, RegistroVenda[]> {
  const vendasPorMes = new Map<string, RegistroVenda[]>();

  for (const venda of vendas) {
    const mes = venda.dataAtivacao.getMonth() + 1;
    const ano = venda.dataAtivacao.getFullYear();
    const chave = `${ano}-${mes.toString().padStart(2, '0')}`;

    if (!vendasPorMes.has(chave)) {
      vendasPorMes.set(chave, []);
    }
    vendasPorMes.get(chave)!.push(venda);
  }

  return vendasPorMes;
}

/**
 * Calcula receita total por categoria para um mês específico
 */
export function calcularReceitaMensal(vendasMes: RegistroVenda[]): {
  dadosAvancados: number;
  vozAvancada: number;
  digitalTI: number;
  novosProdutos: number;
  locacaoEquipamentos: number;
  licencas: number;
} {
  const receitas = {
    dadosAvancados: 0,
    vozAvancada: 0,
    digitalTI: 0,
    novosProdutos: 0,
    locacaoEquipamentos: 0,
    licencas: 0
  };

  for (const venda of vendasMes) {
    // Aplica redutor se for fora da área
    let receita = aplicarRedutorAreaAtuacao(venda.valorBrutoSN, venda.areaAtuacao);

    // Categoriza a receita
    switch (venda.categoria) {
      case 'DADOS_AVANCADOS':
        receitas.dadosAvancados += receita;
        break;
      case 'VOZ_AVANCADA':
        receitas.vozAvancada += receita;
        break;
      case 'DIGITAL_TI':
        receitas.digitalTI += receita;
        break;
      case 'NOVOS_PRODUTOS':
        receitas.novosProdutos += receita;
        break;
      case 'LOCACAO_EQUIPAMENTOS':
        receitas.locacaoEquipamentos += receita;
        break;
      case 'LICENCAS':
        receitas.licencas += receita;
        break;
    }
  }

  return receitas;
}

/**
 * Calcula pontuação mensal baseado nas receitas
 */
export function calcularPontuacaoMensal(
  receitaDadosAvancados: number,
  receitaVozAvancada: number,
  receitaDigitalTI: number,
  receitaNovoProdutos: number,
  receitaLocacaoEquipamentos: number,
  receitaLicencas: number
): {
  pontosDadosAvancados: number;
  pontosVozAvancada: number;
  pontosDigitalTI: number;
  pontosNovos Produtos: number;
  pontosLocacaoEquipamentos: number;
  pontosLicencas: number;
  pontosTotal: number;
} {
  const pontosDadosAvancados = calcularPontosPorFaixa(receitaDadosAvancados, FAIXAS_DADOS_AVANCADOS);
  const pontosVozAvancada = calcularPontosPorFaixa(receitaVozAvancada, FAIXAS_VOZ_AVANCADA);
  const pontosDigitalTI = calcularPontosPorFaixa(receitaDigitalTI, FAIXAS_DIGITAL_TI);
  const pontosNovosProdutos = calcularPontosPorFaixa(receitaNovoProdutos, FAIXAS_NOVOS_PRODUTOS);
  const pontosLocacaoEquipamentos = calcularPontosPorFaixa(receitaLocacaoEquipamentos, FAIXAS_LOCACAO_EQUIPAMENTOS);
  const pontosLicencas = calcularPontosPorFaixa(receitaLicencas, FAIXAS_LICENCAS);

  const pontosTotal =
    pontosDadosAvancados +
    pontosVozAvancada +
    pontosDigitalTI +
    pontosNovosProdutos +
    pontosLocacaoEquipamentos +
    pontosLicencas;

  return {
    pontosDadosAvancados,
    pontosVozAvancada,
    pontosDigitalTI,
    pontosNovosProdutos,
    pontosLocacaoEquipamentos,
    pontosLicencas,
    pontosTotal
  };
}

/**
 * Calcula resultado mensal completo
 */
export function calcularResultadoMensal(mes: number, ano: number, vendasMes: RegistroVenda[]): ResultadoMensal {
  // Filtra apenas vendas (exclui migrações)
  const vendas = filtrarVendas(vendasMes);

  // Calcula receitas por categoria
  const receitas = calcularReceitaMensal(vendas);

  // Calcula pontuação
  const pontuacao = calcularPontuacaoMensal(
    receitas.dadosAvancados,
    receitas.vozAvancada,
    receitas.digitalTI,
    receitas.novosProdutos,
    receitas.locacaoEquipamentos,
    receitas.licencas
  );

  return {
    mes,
    ano,
    receitaDadosAvancados: receitas.dadosAvancados,
    receitaVozAvancada: receitas.vozAvancada,
    receitaDigitalTI: receitas.digitalTI,
    receitaNovosProdutos: receitas.novosProdutos,
    receitaLocacaoEquipamentos: receitas.locacaoEquipamentos,
    receitaLicencas: receitas.licencas,
    pontosDadosAvancados: pontuacao.pontosDadosAvancados,
    pontosVozAvancada: pontuacao.pontosVozAvancada,
    pontosDigitalTI: pontuacao.pontosDigitalTI,
    pontosNovosProdutos: pontuacao.pontosNovosProdutos,
    pontosLocacaoEquipamentos: pontuacao.pontosLocacaoEquipamentos,
    pontosLicencas: pontuacao.pontosLicencas,
    pontosTotal: pontuacao.pontosTotal
  };
}

/**
 * Determina a classificação baseado na pontuação média do ciclo
 */
export function determinarClassificacao(pontuacaoMedia: number): {
  classificacao: Classificacao;
  bonusPercentual: number;
} {
  // Arredonda para baixo sem casas decimais conforme regra
  const pontuacaoArredondada = Math.floor(pontuacaoMedia);

  for (const config of CLASSIFICACOES) {
    if (pontuacaoArredondada >= config.pontuacaoMinima && pontuacaoArredondada <= config.pontuacaoMaxima) {
      return {
        classificacao: config.classificacao,
        bonusPercentual: config.bonusPercentual
      };
    }
  }

  return {
    classificacao: 'NAO_CERTIFICADO',
    bonusPercentual: 0
  };
}

/**
 * Calcula o resultado completo do ciclo de certificação
 */
export function calcularResultadoCiclo(
  vendas: RegistroVenda[],
  periodoInicio: Date,
  periodoFim: Date
): ResultadoCiclo {
  // Agrupa vendas por mês
  const vendasPorMes = agruparVendasPorMes(vendas);

  // Calcula resultado para cada mês
  const resultadosMensais: ResultadoMensal[] = [];

  const dataAtual = new Date(periodoInicio);
  while (dataAtual <= periodoFim) {
    const mes = dataAtual.getMonth() + 1;
    const ano = dataAtual.getFullYear();
    const chave = `${ano}-${mes.toString().padStart(2, '0')}`;

    const vendasMes = vendasPorMes.get(chave) || [];
    const resultado = calcularResultadoMensal(mes, ano, vendasMes);
    resultadosMensais.push(resultado);

    // Avança para próximo mês
    dataAtual.setMonth(dataAtual.getMonth() + 1);
  }

  // Calcula pontuação média do ciclo (com 2 casas decimais antes do arredondamento)
  const somaPontos = resultadosMensais.reduce((acc, r) => acc + r.pontosTotal, 0);
  const mesesComReceita = resultadosMensais.filter(r =>
    r.receitaDadosAvancados > 0 ||
    r.receitaVozAvancada > 0 ||
    r.receitaDigitalTI > 0 ||
    r.receitaNovosProdutos > 0 ||
    r.receitaLocacaoEquipamentos > 0 ||
    r.receitaLicencas > 0
  ).length;

  // Se não houver meses com receita, usa quantidade de meses total (regra: mínimo 6 meses)
  const divisor = mesesComReceita > 0 ? mesesComReceita : resultadosMensais.length;
  const pontuacaoMedia = parseFloat((somaPontos / divisor).toFixed(2));

  // Determina classificação
  const { classificacao, bonusPercentual } = determinarClassificacao(pontuacaoMedia);

  return {
    periodoInicio,
    periodoFim,
    resultadosMensais,
    pontuacaoMedia,
    classificacao,
    bonusPercentual,
    vendas: filtrarVendas(vendas)
  };
}

/**
 * Simula cenários para atingir meta de certificação
 */
export function simularMeta(parametros: SimuladorParametros): SimuladorResultado {
  const { metaPontuacao, mesesRestantes, mediaMensalAtual, receitaMediaMensal } = parametros;

  // Calcula pontos necessários
  const pontosNecessarios = Math.max(0, metaPontuacao - mediaMensalAtual);

  // Calcula pontos necessários por mês
  const pontosPorMes = mesesRestantes > 0 ? pontosNecessarios / mesesRestantes : 0;

  // Estima receita necessária mensal (baseado em proporção)
  const receitaNecessariaMensal = receitaMediaMensal > 0 && mediaMensalAtual > 0
    ? (pontosPorMes / mediaMensalAtual) * receitaMediaMensal
    : 0;

  // Calcula probabilidade de sucesso (simples)
  // Baseado na performance atual vs necessária
  let probabilidadeSucesso = 0;
  if (pontosNecessarios <= 0) {
    probabilidadeSucesso = 100;
  } else if (mediaMensalAtual >= pontosPorMes) {
    probabilidadeSucesso = 90;
  } else {
    const ratio = mediaMensalAtual / pontosPorMes;
    probabilidadeSucesso = Math.min(90, Math.max(10, ratio * 100));
  }

  // Projeta classificação
  const pontuacaoProjetada = mediaMensalAtual + (pontosPorMes * mesesRestantes);
  const { classificacao: classificacaoProjetada } = determinarClassificacao(pontuacaoProjetada);

  return {
    metaPontuacao,
    pontuacaoAtual: mediaMensalAtual,
    pontosNecessarios,
    pontosPorMes,
    receitaNecessariaMensal,
    probabilidadeSucesso,
    classificacaoProjetada
  };
}

/**
 * Formata valores monetários em Real brasileiro
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata pontuação com separador de milhares
 */
export function formatarPontuacao(pontos: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0
  }).format(pontos);
}

/**
 * Retorna cor associada à classificação
 */
export function getCorClassificacao(classificacao: Classificacao): string {
  const cores: Record<Classificacao, string> = {
    'NAO_CERTIFICADO': '#6B7280',
    'BRONZE': '#CD7F32',
    'PRATA': '#C0C0C0',
    'OURO': '#FFD700',
    'DIAMANTE': '#B9F2FF',
    'PLATINUM': '#E5E4E2'
  };
  return cores[classificacao];
}

/**
 * Retorna nome formatado da classificação
 */
export function getNomeClassificacao(classificacao: Classificacao): string {
  const nomes: Record<Classificacao, string> = {
    'NAO_CERTIFICADO': 'Não Certificado',
    'BRONZE': 'Bronze',
    'PRATA': 'Prata',
    'OURO': 'Ouro',
    'DIAMANTE': 'Diamante',
    'PLATINUM': 'Platinum'
  };
  return nomes[classificacao];
}
