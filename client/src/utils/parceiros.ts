import type { ParceiroVivo } from '../types/certification';
import { PARCEIRO_LABELS, PARCEIROS_VIVO } from '../types/certification';

export type VisaoParceiro = 'TODOS' | ParceiroVivo;

export const VISAO_PARCEIRO_OPCOES: { valor: VisaoParceiro; label: string }[] = [
  { valor: 'TODOS', label: 'Todos' },
  ...PARCEIROS_VIVO.map((parceiro) => ({ valor: parceiro, label: PARCEIRO_LABELS[parceiro] }))
];

export function normalizarParceiroValor(parceiro: unknown): ParceiroVivo {
  if (typeof parceiro === 'string') {
    const texto = parceiro.trim().toLowerCase();

    if (texto.includes('safe')) {
      return 'SAFE_TI';
    }

    if (texto.includes('ti') && texto.includes('safe')) {
      return 'SAFE_TI';
    }

    if (texto.includes('jl') || texto.includes('tech')) {
      return 'JLC_TECH';
    }
  }

  if (parceiro && typeof parceiro === 'object' && 'toString' in parceiro) {
    return normalizarParceiroValor(String(parceiro));
  }

  return 'JLC_TECH';
}

export function obterRotuloParceiro(parceiro: ParceiroVivo): string {
  return PARCEIRO_LABELS[parceiro];
}

export const CORES_PARCEIROS: Record<ParceiroVivo, string> = {
  JLC_TECH: '#8b5cf6',
  SAFE_TI: '#22d3ee'
};
