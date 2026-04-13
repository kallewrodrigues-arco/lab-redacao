import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { ModoCorrecao } from '@/types';

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json() as { turmaId: string; modoCorrecao: ModoCorrecao };

  if (!body.turmaId || !body.modoCorrecao) {
    return NextResponse.json({ error: 'turmaId e modoCorrecao são obrigatórios' }, { status: 400 });
  }

  const turma = db.turmas.find((t) => t.id === body.turmaId);
  if (!turma) {
    return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
  }

  turma.modoCorrecao = body.modoCorrecao;

  const config = db.configuracoes.find((c) => c.turmaId === body.turmaId);
  if (config) {
    config.modoCorrecao = body.modoCorrecao;
  }

  return NextResponse.json({ turmaId: body.turmaId, modoCorrecao: body.modoCorrecao }, { headers: { 'Content-Type': 'application/json' } });
}
