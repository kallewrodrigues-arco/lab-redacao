import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { ConfiguracaoLab } from '@/types';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const turmaId = searchParams.get('turmaId');

  if (turmaId) {
    const config = db.configuracoes.find((c) => c.turmaId === turmaId);
    if (!config) {
      return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 });
    }
    return NextResponse.json(config, { headers: { 'Content-Type': 'application/json' } });
  }

  return NextResponse.json(db.configuracoes, { headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json() as ConfiguracaoLab;

  if (!body.turmaId) {
    return NextResponse.json({ error: 'turmaId é obrigatório' }, { status: 400 });
  }

  const idx = db.configuracoes.findIndex((c) => c.turmaId === body.turmaId);
  if (idx === -1) {
    db.configuracoes.push(body);
  } else {
    db.configuracoes[idx] = body;
  }

  // Sync turma modoCorrecao
  const turma = db.turmas.find((t) => t.id === body.turmaId);
  if (turma && body.modoCorrecao) {
    turma.modoCorrecao = body.modoCorrecao;
  }

  return NextResponse.json(body, { headers: { 'Content-Type': 'application/json' } });
}
