import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { redacaoToPonto } from '@/lib/redacao-evolucao';

const COMP_TITULOS: Record<string, string> = {
  C1: 'Dominar a escrita formal',
  C2: 'Compreender o tema',
  C3: 'Interpretar e organizar ideias',
  C4: 'Dominar a argumentação',
  C5: 'Propor solução respeitosa',
};

function tagFromMedia(notaMedia: number): 'Desafiar' | 'Acompanhar' | 'Intervir' {
  const pct = notaMedia / 200;
  if (pct >= 0.8) return 'Desafiar';
  if (pct >= 0.4) return 'Acompanhar';
  return 'Intervir';
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function getMondayOf(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function periodoLimite(dias: number): string {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

const PT_MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatSemana(mondayStr: string): string {
  const d = new Date(mondayStr + 'T00:00:00');
  const day = String(d.getDate()).padStart(2, '0');
  const month = PT_MONTHS_SHORT[d.getMonth()];
  return `${day} ${month}`;
}

export async function GET(req: NextRequest) {
  const db = getDb();
  const { redacoes, alunos, turmas, propostas } = db;

  // Mapa propostaId → dataAgendada (eixo X do gráfico = data da proposta)
  const propostaMap: Record<string, string> = {};
  for (const p of propostas) propostaMap[p.id] = p.dataAgendada;

  const { searchParams } = new URL(req.url);
  const turmaId = searchParams.get('turmaId') ?? '';
  const periodoDias = parseInt(searchParams.get('periodo') ?? '0', 10); // 0 = desde o início

  // ── Filtrar alunos pela turma selecionada ──────────────────────────────────
  const alunosFiltrados = turmaId
    ? alunos.filter((a) => a.turmaId === turmaId)
    : alunos;
  const alunoIdsFiltrados = new Set(alunosFiltrados.map((a) => a.id));

  // ── 1. Participação ────────────────────────────────────────────────────────
  const alunosComEnvio = new Set(
    redacoes
      .filter((r) => r.status !== 'pendente_envio' && alunoIdsFiltrados.has(r.alunoId))
      .map((r) => r.alunoId)
  ).size;
  const participacaoMedia = alunosFiltrados.length > 0
    ? Math.round((alunosComEnvio / alunosFiltrados.length) * 100)
    : 0;

  // ── 2. Pontos de evolução (filtrados por aluno e período) ──────────────────
  const limiteData = periodoDias > 0 ? periodoLimite(periodoDias) : '';

  const corrigidasFiltradas = redacoes.filter(
    (r) => r.status === 'corrigida' && alunoIdsFiltrados.has(r.alunoId)
  );
  const todosPontos = corrigidasFiltradas
    .map((r) => redacaoToPonto(r, propostaMap[r.propostaId]))
    .filter((p) => !limiteData || p.data >= limiteData);

  // ── 3. Desempenho médio (últimos 30 dias, respeitando filtros) ─────────────
  const limite30 = periodoLimite(30);
  const pontosRecentes = todosPontos.filter((p) => p.data >= limite30);
  const desempenhoMedio = avg(
    pontosRecentes.length > 0
      ? pontosRecentes.map((p) => p.notaFinal)
      : todosPontos.map((p) => p.notaFinal)
  );

  // ── 4. Resultado por competência ───────────────────────────────────────────
  const competencias = ['C1', 'C2', 'C3', 'C4', 'C5'].map((cod) => {
    const notas = todosPontos
      .map((p) => p.competencias[cod])
      .filter((n) => n !== undefined);
    const notaMedia = avg(notas);
    return {
      codigo: cod,
      titulo: COMP_TITULOS[cod],
      notaMedia,
      tag: tagFromMedia(notaMedia),
    };
  });

  // ── 5. Evolução semanal (últimas 9 semanas com dados) ─────────────────────
  // Janela máxima: 60 dias (a menos que o período filtrado seja menor)
  const limite60 = periodoLimite(60);
  const limiteEvolucao = limiteData && limiteData > limite60 ? limiteData : limite60;

  const porSemana = new Map<string, number[]>();
  for (const ponto of corrigidasFiltradas.map((r) => redacaoToPonto(r, propostaMap[r.propostaId]))) {
    if (ponto.data < limiteEvolucao) continue;
    const monday = getMondayOf(ponto.data);
    if (!porSemana.has(monday)) porSemana.set(monday, []);
    porSemana.get(monday)!.push(ponto.notaFinal);
  }

  const evolucao = Array.from(porSemana.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-9)
    .map(([monday, notas]) => ({
      semana: formatSemana(monday),
      media: Math.round(avg(notas) / 10),
    }));

  // ── 6. Pontos brutos (para re-agregação client-side) ──────────────────────
  const pontos = todosPontos.map((p) => ({
    data: p.data,
    notaFinal: p.notaFinal,
    competencias: p.competencias,
  }));

  // ── 7. Lista de turmas (para popular o filtro no front) ───────────────────
  const turmasList = turmas.map((t) => ({ id: t.id, nome: t.nome }));

  return NextResponse.json(
    { participacaoMedia, desempenhoMedio, competencias, evolucao, pontos, turmas: turmasList },
    { headers: { 'Content-Type': 'application/json' } }
  );
}
