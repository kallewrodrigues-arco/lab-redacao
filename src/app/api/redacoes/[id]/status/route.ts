import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/data/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  const redacao = db.redacoes.find((r) => r.id === id);
  if (!redacao) {
    return NextResponse.json({ error: 'Redação não encontrada' }, { status: 404 });
  }

  return NextResponse.json(
    {
      id: redacao.id,
      status: redacao.status,
      modoCorrecaoAplicado: redacao.modoCorrecaoAplicado,
      dataEnvio: redacao.dataEnvio,
    },
    { headers: { 'Content-Type': 'application/json' } }
  );
}
