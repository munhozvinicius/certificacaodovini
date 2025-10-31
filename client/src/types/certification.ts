// Tipos baseados no Manual de Certificação Especialistas Vivo
// Julho/2025 a Dezembro/2025

export type Classificacao =
  | 'NAO_CERTIFICADO'
  | 'BRONZE'
  | 'PRATA'
  | 'OURO'
  | 'DIAMANTE'
  | 'PLATINUM';

export type TipoVenda = 'VENDA' | 'MIGRACAO';

export type ParceiroVivo = 'JCL' | 'TECH' | 'SAFE_TI';

export type AreaAtuacao = 'DENTRO' | 'FORA';

export interface ConfiguracaoClassificacao {
  classificacao: Classificacao;
  pontuacaoMinima: number;
  pontuacaoMaxima: number;
  bonusPercentual: number;
}

export const CLASSIFICACOES: ConfiguracaoClassificacao[] = [
  { classificacao: 'NAO_CERTIFICADO', pontuacaoMinima: 0, pontuacaoMaxima: 1499, bonusPercentual: 0 },
  { classificacao: 'BRONZE', pontuacaoMinima: 1500, pontuacaoMaxima: 3499, bonusPercentual: 0 },
  { classificacao: 'PRATA', pontuacaoMinima: 3500, pontuacaoMaxima: 5499, bonusPercentual: 2.5 },
  { classificacao: 'OURO', pontuacaoMinima: 5500, pontuacaoMaxima: 7499, bonusPercentual: 5.0 },
  { classificacao: 'DIAMANTE', pontuacaoMinima: 7500, pontuacaoMaxima: 9499, bonusPercentual: 7.5 },
  { classificacao: 'PLATINUM', pontuacaoMinima: 9500, pontuacaoMaxima: Infinity, bonusPercentual: 10.0 }
];

// Faixas de receita para Dados Avançados
export interface FaixaReceita {
  faixa: number;
  receitaMinima: number;
  receitaMaxima: number;
  pontos: number;
}

export const FAIXAS_DADOS_AVANCADOS: FaixaReceita[] = [
  { faixa: 1, receitaMinima: 0, receitaMaxima: 300, pontos: 800 },
  { faixa: 2, receitaMinima: 300, receitaMaxima: 1000, pontos: 1600 },
  { faixa: 3, receitaMinima: 1000, receitaMaxima: 2000, pontos: 2400 },
  { faixa: 4, receitaMinima: 2000, receitaMaxima: 3500, pontos: 3200 },
  { faixa: 5, receitaMinima: 3500, receitaMaxima: Infinity, pontos: 4000 }
];

// Faixas de receita para Voz Avançada + VVN
export const FAIXAS_VOZ_AVANCADA: FaixaReceita[] = [
  { faixa: 1, receitaMinima: 0, receitaMaxima: 300, pontos: 800 },
  { faixa: 2, receitaMinima: 300, receitaMaxima: 1000, pontos: 1600 },
  { faixa: 3, receitaMinima: 1000, receitaMaxima: 2000, pontos: 2400 },
  { faixa: 4, receitaMinima: 2000, receitaMaxima: 3500, pontos: 3200 },
  { faixa: 5, receitaMinima: 3500, receitaMaxima: Infinity, pontos: 4000 }
];

// Faixas de receita para Digital/TI
export const FAIXAS_DIGITAL_TI: FaixaReceita[] = [
  { faixa: 1, receitaMinima: 0, receitaMaxima: 1200, pontos: 400 },
  { faixa: 2, receitaMinima: 1200, receitaMaxima: 2100, pontos: 800 },
  { faixa: 3, receitaMinima: 2100, receitaMaxima: 3000, pontos: 1200 },
  { faixa: 4, receitaMinima: 3000, receitaMaxima: 4200, pontos: 1600 },
  { faixa: 5, receitaMinima: 4200, receitaMaxima: Infinity, pontos: 2000 }
];

// Faixas de receita para Novos Produtos (EXTRA)
export const FAIXAS_NOVOS_PRODUTOS: FaixaReceita[] = [
  { faixa: 1, receitaMinima: 0, receitaMaxima: 2000, pontos: 100 },
  { faixa: 2, receitaMinima: 2000, receitaMaxima: 4000, pontos: 200 },
  { faixa: 3, receitaMinima: 4000, receitaMaxima: 6000, pontos: 300 },
  { faixa: 4, receitaMinima: 6000, receitaMaxima: 8000, pontos: 400 },
  { faixa: 5, receitaMinima: 8000, receitaMaxima: Infinity, pontos: 500 }
];

// Faixas de receita para Locação de Equipamentos (EXTRA)
export const FAIXAS_LOCACAO_EQUIPAMENTOS: FaixaReceita[] = [
  { faixa: 1, receitaMinima: 0, receitaMaxima: 400, pontos: 200 },
  { faixa: 2, receitaMinima: 400, receitaMaxima: 800, pontos: 400 },
  { faixa: 3, receitaMinima: 800, receitaMaxima: 1200, pontos: 600 },
  { faixa: 4, receitaMinima: 1200, receitaMaxima: 1600, pontos: 800 },
  { faixa: 5, receitaMinima: 1600, receitaMaxima: Infinity, pontos: 1000 }
];

// Faixas de receita para Licenças (EXTRA)
export const FAIXAS_LICENCAS: FaixaReceita[] = [
  { faixa: 1, receitaMinima: 0, receitaMaxima: 400, pontos: 100 },
  { faixa: 2, receitaMinima: 400, receitaMaxima: 800, pontos: 200 },
  { faixa: 3, receitaMinima: 800, receitaMaxima: 1200, pontos: 300 },
  { faixa: 4, receitaMinima: 1200, receitaMaxima: 1600, pontos: 400 },
  { faixa: 5, receitaMinima: 1600, receitaMaxima: Infinity, pontos: 500 }
];

export interface PesosIndicadores {
  dadosAvancados: number; // 40%
  vozAvancada: number; // 40%
  digitalTI: number; // 20%
}

export const PESOS_RECEITA_ALTAS: PesosIndicadores = {
  dadosAvancados: 0.40,
  vozAvancada: 0.40,
  digitalTI: 0.20
};

// Registro de venda/ativação
export interface RegistroVenda {
  id: string;
  dataAtivacao: Date;
  valorBrutoSN: number;
  tipoVenda: TipoVenda;
  parceiro: ParceiroVivo;
  areaAtuacao: AreaAtuacao;
  categoria: 'DADOS_AVANCADOS' | 'VOZ_AVANCADA' | 'DIGITAL_TI' | 'NOVOS_PRODUTOS' | 'LOCACAO_EQUIPAMENTOS' | 'LICENCAS';
  produto: string;
  cnpj: string;
  nomeCliente: string;
}

// Resultado de cálculo mensal
export interface ResultadoMensal {
  mes: number; // 1-12
  ano: number;
  receitaDadosAvancados: number;
  receitaVozAvancada: number;
  receitaDigitalTI: number;
  receitaNovosProdutos: number;
  receitaLocacaoEquipamentos: number;
  receitaLicencas: number;
  pontosDadosAvancados: number;
  pontosVozAvancada: number;
  pontosDigitalTI: number;
  pontosNovosProdutos: number;
  pontosLocacaoEquipamentos: number;
  pontosLicencas: number;
  pontosTotal: number;
}

// Resultado do ciclo completo
export interface ResultadoCiclo {
  periodoInicio: Date;
  periodoFim: Date;
  resultadosMensais: ResultadoMensal[];
  pontuacaoMedia: number;
  classificacao: Classificacao;
  bonusPercentual: number;
  vendas: RegistroVenda[];
}

// Dados para simulador
export interface SimuladorParametros {
  metaPontuacao: number;
  mesesRestantes: number;
  mediaMensalAtual: number;
  receitaMediaMensal: number;
}

export interface SimuladorResultado {
  metaPontuacao: number;
  pontuacaoAtual: number;
  pontosNecessarios: number;
  pontosPorMes: number;
  receitaNecessariaMensal: number;
  probabilidadeSucesso: number;
  classificacaoProjetada: Classificacao;
}
