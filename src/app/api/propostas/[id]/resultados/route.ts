import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { TagDesempenho } from '@/types';

const FAIXAS = [
  { label: '0–200',    min: 0,   max: 200  },
  { label: '201–400',  min: 201, max: 400  },
  { label: '401–600',  min: 401, max: 600  },
  { label: '601–800',  min: 601, max: 800  },
  { label: '801–1000', min: 801, max: 1000 },
];

const FAIXAS_COMP = [
  { label: '0',   min: 0,   max: 0   },
  { label: '40',  min: 40,  max: 40  },
  { label: '80',  min: 80,  max: 80  },
  { label: '120', min: 120, max: 120 },
  { label: '160', min: 160, max: 160 },
  { label: '200', min: 200, max: 200 },
];

function tagFromMedia(notaMedia: number, max = 200): TagDesempenho {
  const pct = notaMedia / max;
  if (pct >= 0.8) return 'Desafiar';
  if (pct >= 0.4) return 'Acompanhar';
  return 'Intervir';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: propostaId } = await params;
  const db = getDb();

  const proposta = db.propostas.find(p => p.id === propostaId);
  if (!proposta) {
    return NextResponse.json({ error: 'Proposta não encontrada' }, { status: 404 });
  }

  // ── Todos os alunos das turmas desta proposta ────────────────────────────────
  const turmaIds = proposta.turmaIds;
  const alunosDaTurma = db.alunos.filter(a => turmaIds.includes(a.turmaId));
  const totalAlunos = alunosDaTurma.length;

  // ── Redações desta proposta ──────────────────────────────────────────────────
  const redacoes = db.redacoes.filter(r => r.propostaId === propostaId);

  // ── Score por redação: lê direto de Redacao.notaFinal/C1-C5 ─────────────────
  interface AlunoScore {
    alunoId: string;
    turmaId: string;
    redacaoId: string;
    status: string;
    dataEnvio: string | undefined;
    notaFinal: number;
    competencias: Record<string, number>;
  }

  const scores: AlunoScore[] = [];

  for (const red of redacoes) {
    if (!['corrigida', 'aguardando_liberacao'].includes(red.status)) continue;
    if (red.notaFinal === undefined || red.C1 === undefined) continue;

    scores.push({
      alunoId: red.alunoId,
      turmaId: red.turmaId,
      redacaoId: red.id,
      status: red.status,
      dataEnvio: red.dataEnvio,
      notaFinal: red.notaFinal,
      competencias: { C1: red.C1, C2: red.C2!, C3: red.C3!, C4: red.C4!, C5: red.C5! },
    });
  }

  // ── Participação ─────────────────────────────────────────────────────────────
  const submetidas = redacoes.filter(r => r.status !== 'pendente_envio').length;
  const comScore = scores.length;
  const percentualParticipacao = totalAlunos > 0
    ? Math.round((submetidas / totalAlunos) * 100) : 0;

  // ── Desempenho médio ─────────────────────────────────────────────────────────
  const desempenhoMedio = comScore > 0
    ? Math.round(scores.reduce((s, r) => s + r.notaFinal, 0) / comScore * 10) / 10
    : 0;

  // ── Médias por competência ───────────────────────────────────────────────────
  const COMP_TITULOS: Record<string, string> = {
    C1: 'Dominar a escrita formal',
    C2: 'Compreender o tema',
    C3: 'Interpretar e organizar ideias',
    C4: 'Dominar a argumentação',
    C5: 'Propor solução respeitosa',
  };

  const competenciasResult = ['C1','C2','C3','C4','C5'].map(cod => {
    const notas = scores.map(s => s.competencias[cod]).filter(n => n !== undefined);
    const media = notas.length > 0
      ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length * 10) / 10
      : 0;
    return {
      codigo: cod,
      titulo: COMP_TITULOS[cod],
      notaMedia: media,
      tag: tagFromMedia(media, 200),
    };
  });

  // ── Histograma nota final ─────────────────────────────────────────────────────
  const histogramaFinal = FAIXAS.map(f => ({
    faixa: f.label,
    count: scores.filter(s => s.notaFinal >= f.min && s.notaFinal <= f.max).length,
  }));

  // ── Histograma por competência ────────────────────────────────────────────────
  const histogramaCompetencias: Record<string, { faixa: string; count: number }[]> = {};
  for (const cod of ['C1','C2','C3','C4','C5']) {
    histogramaCompetencias[cod] = FAIXAS_COMP.map(f => ({
      faixa: f.label,
      count: scores.filter(s => s.competencias[cod] === f.min).length,
    }));
  }

  // ── Tabela de alunos ──────────────────────────────────────────────────────────
  const alunosTable = alunosDaTurma.map(aluno => {
    const turma = db.turmas.find(t => t.id === aluno.turmaId);
    const redacao = redacoes.find(r => r.alunoId === aluno.id);
    const score = scores.find(s => s.alunoId === aluno.id);

    return {
      id: aluno.id,
      nome: aluno.nome,
      turma: turma?.nome ?? aluno.turmaId,
      status: redacao?.status ?? 'pendente_envio',
      notaFinal: score?.notaFinal ?? null,
      competencias: score?.competencias ?? null,
    };
  });

  // Ordenar por nota (desc), sem nota por último
  alunosTable.sort((a, b) => {
    if (a.notaFinal === null && b.notaFinal === null) return 0;
    if (a.notaFinal === null) return 1;
    if (b.notaFinal === null) return -1;
    return b.notaFinal - a.notaFinal;
  });

  // ── Evolução da proposta (todos os corrigidos agrupados na dataAgendada) ─────
  const evolucao = scores
    .filter(s => s.status === 'corrigida')
    .map(s => ({ data: proposta.dataAgendada, notaFinal: s.notaFinal }));

  return NextResponse.json({
    participacao: {
      total: totalAlunos,
      submetidas,
      comScore,
      percentual: percentualParticipacao,
    },
    desempenhoMedio,
    competencias: competenciasResult,
    histogramaFinal,
    histogramaCompetencias,
    alunos: alunosTable,
    evolucao,
  });
}
