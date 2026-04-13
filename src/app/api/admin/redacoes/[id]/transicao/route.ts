import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';
import { StatusRedacao } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const redacao = db.redacoes.find((r) => r.id === id);
  if (!redacao) {
    return NextResponse.json({ error: 'Redação não encontrada' }, { status: 404 });
  }

  const body = await request.json() as { status: StatusRedacao };
  if (!body.status) {
    return NextResponse.json({ error: 'status é obrigatório' }, { status: 400 });
  }

  redacao.status = body.status;

  return NextResponse.json(redacao, { headers: { 'Content-Type': 'application/json' } });
}
