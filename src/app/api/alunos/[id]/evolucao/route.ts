import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const evolucao = db.evolucoes.find((e) => e.alunoId === id);
  if (!evolucao) {
    return NextResponse.json({ alunoId: id, historico: [] }, { headers: { 'Content-Type': 'application/json' } });
  }

  return NextResponse.json(evolucao, { headers: { 'Content-Type': 'application/json' } });
}
