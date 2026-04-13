import { NextResponse } from 'next/server';
import { getDb } from '@/data/store';

function getMondayOf(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

export async function GET() {
  const db = getDb();
  const { redacoes, alunos, propostas, evolucoes } = db;

  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const propostasComAtrasada = new Set(
    redacoes
      .filter(
        (r) =>
          r.status !== 'corrigida' &&
          r.status !== 'rejeitada' &&
          r.dataEnvio &&
          now - new Date(r.dataEnvio).getTime() > SEVEN_DAYS
      )
      .map((r) => r.propostaId)
  ).size;

  const propostasComPendente = new Set(
    redacoes.filter((r) => r.status === 'aguardando_liberacao').map((r) => r.propostaId)
  ).size;

  const propostasCorrigidas = new Set(
    redacoes.filter((r) => r.status === 'corrigida').map((r) => r.propostaId)
  ).size;

  const propostasRejeitadas = propostas.filter((p) => p.status === 'descartada').length;

  const atrasadas = propostasComAtrasada;
  const pendentes = propostasComPendente;
  const corrigidas = propostasCorrigidas;
  const rejeitadas = propostasRejeitadas;

  const totalAlunos = alunos.length;

  const esperadas = alunos.length;
  const alunosComEnvio = new Set(
    redacoes.filter((r) => r.status !== 'pendente_envio').map((r) => r.alunoId)
  ).size;
  const participacaoMedia = esperadas > 0 ? Math.round((alunosComEnvio / esperadas) * 100) : 0;

  // ── Desempenho semanal (a partir de evolucoes.historico) ──────────────────────
  const todosPontos = evolucoes.flatMap((e) => e.historico);
  const porSemana = new Map<string, number[]>();
  for (const ponto of todosPontos) {
    const monday = getMondayOf(ponto.data);
    if (!porSemana.has(monday)) porSemana.set(monday, []);
    porSemana.get(monday)!.push(ponto.notaFinal);
  }
  const semanas = Array.from(porSemana.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const desempenhoAtual = semanas.length >= 1
    ? Math.round(avg(semanas[semanas.length - 1][1]) / 10)
    : 0;
  const desempenhoAnterior = semanas.length >= 2
    ? Math.round(avg(semanas[semanas.length - 2][1]) / 10)
    : 0;
  const delta = desempenhoAtual - desempenhoAnterior;

  return NextResponse.json(
    { atrasadas, pendentes, corrigidas, rejeitadas, totalAlunos, participacaoMedia, desempenhoAtual, desempenhoAnterior, delta },
    { headers: { 'Content-Type': 'application/json' } }
  );
}
