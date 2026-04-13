import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { TagDesempenho } from '@/types';

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

  // Devolutivas dos alunos filtrados
  const redacoesAlunos = db.redacoes.filter((r) => alunosIds.includes(r.alunoId));
  const redacaoIds = redacoesAlunos.map((r) => r.id);
  const devolutivas = db.devolutivas.filter((d) => redacaoIds.includes(d.redacaoId));

  // Participação
  const total = alunosIds.length;
  const alunosComDevolutiva = new Set(
    devolutivas.map((d) => {
      const r = db.redacoes.find((r) => r.id === d.redacaoId);
      return r?.alunoId;
    })
  );
  const participaram = alunosComDevolutiva.size;
  const percentual = total > 0 ? Math.round((participaram / total) * 100) : 0;

  // Desempenho médio
  const notas = devolutivas.map((d) => d.notaFinal);
  const desempenhoMedio = notas.length > 0 ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;

  // Por competência
  const competencias = ['C1', 'C2', 'C3', 'C4', 'C5'];
  const porCompetencia: Record<string, { media: number; tag: TagDesempenho }> = {};

  for (const cod of competencias) {
    const notas = devolutivas
      .flatMap((d) => d.competencias)
      .filter((c) => c.codigo === cod)
      .map((c) => c.nota);
    const media = notas.length > 0 ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : 0;
    porCompetencia[cod] = { media, tag: getTag(media) };
  }

  // Evolução últimos 60 dias
  const sessenta = Date.now() - 60 * 24 * 60 * 60 * 1000;
  const evolucaoMap = new Map<string, number[]>();
  for (const evolucao of db.evolucoes) {
    if (!alunosIds.includes(evolucao.alunoId)) continue;
    for (const ponto of evolucao.historico) {
      const ts = new Date(ponto.data).getTime();
      if (ts < sessenta) continue;
      const arr = evolucaoMap.get(ponto.data) ?? [];
      arr.push(ponto.notaFinal);
      evolucaoMap.set(ponto.data, arr);
    }
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
    const redTurma = db.redacoes.filter((r) => alunosTurma.includes(r.alunoId)).map((r) => r.id);
    const devTurma = db.devolutivas.filter((d) => redTurma.includes(d.redacaoId));
    const notasTurma = devTurma.map((d) => d.notaFinal);
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
