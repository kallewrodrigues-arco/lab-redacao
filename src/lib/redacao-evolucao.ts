import { Redacao, PontoEvolucao } from '@/types';

/**
 * Converte uma Redacao em PontoEvolucao.
 * @param data - data do ponto (padrão: dataAgendada da proposta, deve ser passada pelo chamador)
 */
export function redacaoToPonto(r: Redacao, data?: string): PontoEvolucao {
  return {
    data: (data ?? r.dataEnvio ?? '').slice(0, 10),
    notaFinal: r.notaFinal!,
    competencias: { C1: r.C1!, C2: r.C2!, C3: r.C3!, C4: r.C4!, C5: r.C5! },
  };
}

export function getHistoricoAluno(
  redacoes: Redacao[],
  alunoId: string,
  propostaMap?: Record<string, string>,
): PontoEvolucao[] {
  return redacoes
    .filter((r) => r.alunoId === alunoId && r.status === 'corrigida')
    .sort((a, b) => {
      const da = propostaMap?.[a.propostaId] ?? a.dataEnvio ?? '';
      const db = propostaMap?.[b.propostaId] ?? b.dataEnvio ?? '';
      return da.localeCompare(db);
    })
    .map((r) => redacaoToPonto(r, propostaMap?.[r.propostaId]));
}
