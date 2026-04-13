import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { StatusRedacao } from '@/types';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const turmaId = searchParams.get('turmaId');
  const alunoId = searchParams.get('alunoId');
  const propostaId = searchParams.get('propostaId');

  let redacoes = db.redacoes;

  if (status) redacoes = redacoes.filter((r) => r.status === status);
  if (turmaId) redacoes = redacoes.filter((r) => r.turmaId === turmaId);
  if (alunoId) redacoes = redacoes.filter((r) => r.alunoId === alunoId);
  if (propostaId) redacoes = redacoes.filter((r) => r.propostaId === propostaId);

  const result = redacoes.map((r) => ({
    ...r,
    aluno: db.alunos.find((a) => a.id === r.alunoId) ?? null,
    proposta: db.propostas.find((p) => p.id === r.propostaId) ?? null,
    turma: db.turmas.find((t) => t.id === r.turmaId) ?? null,
  }));

  return NextResponse.json(result, { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json() as {
    alunoId: string;
    propostaId: string;
    turmaId: string;
    arquivoUrl?: string;
  };

  if (!body.alunoId || !body.propostaId || !body.turmaId) {
    return NextResponse.json({ error: 'alunoId, propostaId e turmaId são obrigatórios' }, { status: 400 });
  }

  const turma = db.turmas.find((t) => t.id === body.turmaId);
  if (!turma) {
    return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
  }

  const status: StatusRedacao = 'enviada';

  const novaRedacao = {
    id: crypto.randomUUID(),
    alunoId: body.alunoId,
    propostaId: body.propostaId,
    turmaId: body.turmaId,
    status,
    dataEnvio: new Date().toISOString(),
    arquivoUrl: body.arquivoUrl,
    modoCorrecaoAplicado: turma.modoCorrecao,
  };

  db.redacoes.push(novaRedacao);

  return NextResponse.json(novaRedacao, { status: 201, headers: { 'Content-Type': 'application/json' } });
}
