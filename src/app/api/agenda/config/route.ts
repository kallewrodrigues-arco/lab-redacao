import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const turmaId = searchParams.get('turmaId');

  if (turmaId) {
    const config = db.agendasConfig.find((c) => c.turmaId === turmaId);
    if (!config) {
      return NextResponse.json({ error: 'Configuração não encontrada' }, { status: 404 });
    }
    return NextResponse.json(config, { headers: { 'Content-Type': 'application/json' } });
  }

  return NextResponse.json(db.agendasConfig, { headers: { 'Content-Type': 'application/json' } });
}

export async function PUT(request: NextRequest) {
  const db = getDb();
  const body = await request.json() as {
    turmaId: string;
    liberacaoGradual: boolean;
    autonomiaAluno: boolean;
  };

  if (!body.turmaId) {
    return NextResponse.json({ error: 'turmaId é obrigatório' }, { status: 400 });
  }

  const idx = db.agendasConfig.findIndex((c) => c.turmaId === body.turmaId);
  if (idx === -1) {
    db.agendasConfig.push(body);
  } else {
    db.agendasConfig[idx] = body;
  }

  return NextResponse.json(body, { headers: { 'Content-Type': 'application/json' } });
}
