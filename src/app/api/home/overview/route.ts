import { NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { redacaoToPonto } from '@/lib/redacao-evolucao';

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
  const { redacoes, alunos, propostas } = db;

  // Mapa propostaId → dataAgendada
  const propostaMap: Record<string, string> = {};
  for (const p of propostas) propostaMap[p.id] = p.dataAgendada;

  const hoje = new Date().toISOString().slice(0, 10);
  const propostasComAtrasada = new Set(
    redacoes
      .filter((r) => r.status === 'aguardando_liberacao')
      .map((r) => r.propostaId)
      .filter((pid) => {
        const p = propostas.find((p) => p.id === pid);
        return p && p.dataAgendada <= hoje;
      })
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

  // ── Desempenho semanal (a partir de redacoes corrigidas) ──────────────────────
  const todosPontos = redacoes
    .filter((r) => r.status === 'corrigida')
    .map((r) => redacaoToPonto(r, propostaMap[r.propostaId]));
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
