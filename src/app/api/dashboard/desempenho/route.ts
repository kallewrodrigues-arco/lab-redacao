import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { TagDesempenho } from '@/types';
import { redacaoToPonto } from '@/lib/redacao-evolucao';

function getTag(media: number): TagDesempenho {
  if (media >= 160) return 'Desafiar';
  if (media >= 100) return 'Acompanhar';
  return 'Intervir';
}

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const turmaId = searchParams.get('turmaId');
  const escolaId = searchParams.get('escolaId');

  // Filtrar alunos por turma ou escola
  let alunosIds: string[];
  if (turmaId) {
    alunosIds = db.alunos.filter((a) => a.turmaId === turmaId).map((a) => a.id);
  } else if (escolaId) {
    const turmasEscola = db.turmas.filter((t) => t.escolaId === escolaId).map((t) => t.id);
    alunosIds = db.alunos.filter((a) => turmasEscola.includes(a.turmaId)).map((a) => a.id);
  } else {
    alunosIds = db.alunos.map((a) => a.id);
  }

  // Redações corrigidas dos alunos filtrados
  const redacoesCorrigidas = db.redacoes.filter(
    (r) => alunosIds.includes(r.alunoId) && r.status === 'corrigida' && r.notaFinal !== undefined
  );

  // Participação
  const total = alunosIds.length;
  const alunosComScore = new Set(redacoesCorrigidas.map((r) => r.alunoId));
  const participaram = alunosComScore.size;
  const percentual = total > 0 ? Math.round((participaram / total) * 100) : 0;

  // Desempenho médio
  const notas = redacoesCorrigidas.map((r) => r.notaFinal as number);
  const desempenhoMedio = notas.length > 0 ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;

  // Por competência
  const competencias = ['C1', 'C2', 'C3', 'C4', 'C5'];
  const porCompetencia: Record<string, { media: number; tag: TagDesempenho }> = {};

  for (const cod of competencias) {
    const notasCod = redacoesCorrigidas
      .map((r) => r[cod as 'C1' | 'C2' | 'C3' | 'C4' | 'C5'])
      .filter((n): n is number => n !== undefined);
    const media = notasCod.length > 0 ? Math.round(notasCod.reduce((a, b) => a + b, 0) / notasCod.length) : 0;
    porCompetencia[cod] = { media, tag: getTag(media) };
  }

  // Mapa propostaId → dataAgendada
  const propostaMap: Record<string, string> = {};
  for (const p of db.propostas) propostaMap[p.id] = p.dataAgendada;

  // Evolução últimos 60 dias
  const sessentaIso = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const evolucaoMap = new Map<string, number[]>();
  for (const r of db.redacoes) {
    if (r.status !== 'corrigida') continue;
    if (!alunosIds.includes(r.alunoId)) continue;
    const ponto = redacaoToPonto(r, propostaMap[r.propostaId]);
    if (ponto.data < sessentaIso) continue;
    const arr = evolucaoMap.get(ponto.data) ?? [];
    arr.push(ponto.notaFinal);
    evolucaoMap.set(ponto.data, arr);
  }

  const evolucao = Array.from(evolucaoMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, notas]) => ({
      data,
      media: Math.round(notas.reduce((a, b) => a + b, 0) / notas.length),
    }));

  // Por turma
  const turmasFiltradas = turmaId
    ? db.turmas.filter((t) => t.id === turmaId)
    : escolaId
    ? db.turmas.filter((t) => t.escolaId === escolaId)
    : db.turmas;

  const porTurma = turmasFiltradas.map((turma) => {
    const alunosTurma = db.alunos.filter((a) => a.turmaId === turma.id).map((a) => a.id);
    const notasTurma = db.redacoes
      .filter((r) => alunosTurma.includes(r.alunoId) && r.status === 'corrigida' && r.notaFinal !== undefined)
      .map((r) => r.notaFinal as number);
    const media = notasTurma.length > 0
      ? Math.round(notasTurma.reduce((a, b) => a + b, 0) / notasTurma.length)
      : 0;
    return { turmaId: turma.id, nome: turma.nome, media };
  });

  return NextResponse.json(
    { participacao: { total, participaram, percentual }, desempenhoMedio, porCompetencia, evolucao, porTurma },
    { headers: { 'Content-Type': 'application/json' } }
  );
}
