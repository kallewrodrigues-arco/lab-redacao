import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const redacao = db.redacoes.find((r) => r.id === id);
  if (!redacao) {
    return NextResponse.json({ error: 'Redação não encontrada' }, { status: 404 });
  }

  redacao.status = 'pendente_envio';
  redacao.dataEnvio = undefined;
  redacao.arquivoUrl = undefined;

  return NextResponse.json(redacao, { headers: { 'Content-Type': 'application/json' } });
}
