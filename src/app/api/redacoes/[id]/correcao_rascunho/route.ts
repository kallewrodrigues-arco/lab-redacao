import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const correcao = db.correcoes.find((c) => c.redacaoId === id);
  if (!correcao) {
    return NextResponse.json({ error: 'Correção não encontrada' }, { status: 404 });
  }

  return NextResponse.json(correcao, { headers: { 'Content-Type': 'application/json' } });
}
